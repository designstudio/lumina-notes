import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("lumina", {
  platform: process.platform
});
