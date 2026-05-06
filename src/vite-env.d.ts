/// <reference types="vite/client" />

import { Note } from "./types";

type LuminaApi = {
  platform: NodeJS.Platform;
  app?: {
    getVersion: () => Promise<string>;
  };
  window?: {
    setAppearance: (appearance: "light" | "dark") => Promise<void>;
  };
  notes?: {
    load: () => Promise<Note[] | null>;
    save: (notes: Note[]) => Promise<void>;
    getStorageInfo: () => Promise<{ filePath: string; directoryPath: string }>;
    openStorageDirectory: () => Promise<string>;
    chooseStorageDirectory: () => Promise<{ filePath: string; directoryPath: string }>;
    exportData: (data: unknown) => Promise<string | null>;
    exportMarkdown: (title: string, markdown: string) => Promise<string | null>;
    exportPdf: (title: string, html: string) => Promise<string | null>;
  };
  images?: {
    pick: () => Promise<string | null>;
  };
};

declare global {
  interface Window {
    lumina?: LuminaApi;
  }
}




