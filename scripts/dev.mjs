import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import process from "node:process";
import path from "node:path";
import waitOn from "wait-on";

const children = [];
const rendererEntry = path.resolve("dist-dev/index.html");
const electronMainEntry = path.resolve("dist-electron/main.js");

function run(label, command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ELECTRON_RENDERER_ENTRY: rendererEntry
    }
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error("[" + label + "] exited with code " + code);
    }
  });

  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

async function waitForRendererFile() {
  await waitOn({
    resources: ["file:" + rendererEntry, "file:" + electronMainEntry],
    timeout: 30000
  });

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const stats = await fs.stat(rendererEntry);
      if (stats.size > 0) {
        return;
      }
    } catch {
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

run("tsc", "npx", ["tsc", "-p", "tsconfig.electron.json", "--watch"]);
await fs.rm(path.dirname(rendererEntry), { recursive: true, force: true });
run("vite", "npx", ["vite", "build", "--watch", "--mode", "development"]);
await waitForRendererFile();
const electronProcess = run("electron", "npx", ["electron", "."]);

electronProcess.on("exit", () => {
  shutdown();
  process.exit(0);
});
