import { BrowserWindow, app, ipcMain } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

const isDev = !app.isPackaged;
const rendererEntry = process.env.ELECTRON_RENDERER_ENTRY;
const notesFileName = "notes.json";

type StoredNote = {
  id: string;
  title: string;
  preview: string;
  body: string;
  folder: string;
  tags: string[];
  pinned?: boolean;
  sortOrder?: number;
  color: string;
  updatedAt: string;
  checklist: { id: string; label: string; done: boolean }[];
};

function getNotesFilePath() {
  return path.join(app.getPath("userData"), notesFileName);
}

async function loadNotes() {
  try {
    const raw = await fs.readFile(getNotesFilePath(), "utf8");
    const parsed = JSON.parse(raw) as { notes?: StoredNote[] } | StoredNote[];
    return Array.isArray(parsed) ? parsed : parsed.notes ?? [];
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function saveNotes(notes: StoredNote[]) {
  const filePath = getNotesFilePath();
  const tempPath = `${filePath}.tmp`;
  const payload = JSON.stringify(
    {
      version: 1,
      notes
    },
    null,
    2
  );

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tempPath, payload, "utf8");
  await fs.rename(tempPath, filePath);
}

async function waitForFile(filePath: string) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  return false;
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 818,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#f4efe7",
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (isDev && rendererEntry) {
    const isReady = await waitForFile(rendererEntry);
    if (!isReady) {
      await window.loadURL("data:text/html,<html><body style='font-family:Segoe UI,sans-serif;padding:24px;background:#f4efe7;color:#3a2f23'>Renderer build still starting. Save a file or restart the dev command.</body></html>");
      return;
    }

    await window.loadFile(rendererEntry);
    return;
  }

  await window.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("notes:load", loadNotes);
  ipcMain.handle("notes:save", (_event, notes: StoredNote[]) => saveNotes(notes));

  void createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
