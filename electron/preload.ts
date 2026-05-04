import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumina", {
  platform: process.platform,
  notes: {
    load: () => ipcRenderer.invoke("notes:load"),
    save: (notes: unknown[]) => ipcRenderer.invoke("notes:save", notes)
  }
});
