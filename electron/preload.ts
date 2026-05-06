import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("lumina", {
  platform: process.platform,
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion") as Promise<string>
  },
  window: {
    setAppearance: (appearance: "light" | "dark") => ipcRenderer.invoke("window:setAppearance", appearance) as Promise<void>
  },
  notes: {
    load: () => ipcRenderer.invoke("notes:load"),
    save: (notes: unknown[]) => ipcRenderer.invoke("notes:save", notes),
    getStorageInfo: () => ipcRenderer.invoke("notes:getStorageInfo") as Promise<{ filePath: string; directoryPath: string }>,
    openStorageDirectory: () => ipcRenderer.invoke("notes:openStorageDirectory") as Promise<string>,
    chooseStorageDirectory: () => ipcRenderer.invoke("notes:chooseStorageDirectory") as Promise<{ filePath: string; directoryPath: string }>,
    exportData: (data: unknown) => ipcRenderer.invoke("notes:exportData", data) as Promise<string | null>,
    exportMarkdown: (title: string, markdown: string) => ipcRenderer.invoke("notes:exportMarkdown", title, markdown) as Promise<string | null>,
    exportPdf: (title: string, html: string) => ipcRenderer.invoke("notes:exportPdf", title, html) as Promise<string | null>
  },
  images: {
    pick: () => ipcRenderer.invoke("images:pick") as Promise<string | null>
  }
});




