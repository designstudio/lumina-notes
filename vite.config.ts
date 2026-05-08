import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
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
    rollupOptions: {
      input: "index.html",
      output: {
        manualChunks(id) {
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
});
