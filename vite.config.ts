import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isWatchDevMode = mode === "development";

  return {
    base: "./",
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    },
    resolve: {
      dedupe: [
        "react",
        "react-dom",
        "@tiptap/react",
        "@tiptap/core",
        "@tiptap/pm",
        "@tiptap/suggestion"
      ],
      alias: {
        "@": path.resolve(__dirname, "@")
      }
    },
    server: {
      port: 5173,
      strictPort: true
    },
    build: {
      outDir: isWatchDevMode ? "dist-dev" : "dist",
      assetsDir: "assets",
      emptyOutDir: !isWatchDevMode,
      minify: isWatchDevMode ? false : "esbuild",
      cssMinify: isWatchDevMode ? false : undefined,
      reportCompressedSize: !isWatchDevMode,
      target: isWatchDevMode ? "esnext" : undefined,
      rollupOptions: {
        input: "index.html",
        output: {
          entryFileNames: isWatchDevMode ? "assets/[name].js" : undefined,
          chunkFileNames: isWatchDevMode ? "assets/[name].js" : undefined,
          assetFileNames: isWatchDevMode ? "assets/[name][extname]" : undefined,
          manualChunks: isWatchDevMode
            ? undefined
            : (id) => {
                if (!id.includes("node_modules")) {
                  return;
                }

                if (id.includes("@tiptap")) {
                  return "tiptap-vendor";
                }

                if (
                  id.includes("react") ||
                  id.includes("scheduler") ||
                  id.includes("@untitledui/icons") ||
                  id.includes("simplebar-react")
                ) {
                  return "react-vendor";
                }

                if (id.includes("simplebar")) {
                  return "ui-vendor";
                }

                if (id.includes("turndown")) {
                  return "export-vendor";
                }
              }
        }
      }
    }
  };
});
