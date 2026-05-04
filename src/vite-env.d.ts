/// <reference types="vite/client" />

import { Note } from "./types";

type LuminaApi = {
  platform: NodeJS.Platform;
  notes?: {
    load: () => Promise<Note[] | null>;
    save: (notes: Note[]) => Promise<void>;
  };
};

declare global {
  interface Window {
    lumina?: LuminaApi;
  }
}
