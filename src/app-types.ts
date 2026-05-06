import { type LanguagePreference } from "./i18n";
import { type FolderKey, type Note } from "./types";

export type CustomFolder = {
  key: FolderKey;
  label: string;
};

export type FolderSettings = {
  labels: Partial<Record<FolderKey, string>>;
  customFolders: CustomFolder[];
  hiddenFixedFolders: FolderKey[];
};

export type ToolbarMenu = "heading" | "list" | "table" | "highlight" | "link" | "text-align" | null;

export type UiState = {
  sidebarCollapsed: boolean;
  expandedSections: Record<string, boolean>;
  activeFolder: FolderKey;
  selectedNoteId: string;
};

export type WorkspaceView = "notes" | "settings";
export type ModalKey = "search" | "clear-data" | "create-folder" | "delete-folder" | "delete-note";

export type AppTheme =
  | "cloudy-day"
  | "blue-lagoon"
  | "green-forest"
  | "orange-soda"
  | "catpuccin"
  | "purple-haze"
  | "fuchsia"
  | "can-can";
export type NoteLayoutSize = "medium" | "full";
export type ToolbarVisibilityKey = "history" | "headings" | "quote" | "lists" | "tables" | "bold" | "italic" | "strikethrough" | "code" | "underline" | "highlight" | "links" | "superscript" | "subscript" | "separator" | "textAlign" | "image";
export type ToolbarVisibilityPreferences = Record<ToolbarVisibilityKey, boolean>;

export type AppPreferences = {
  language: LanguagePreference;
  appearance: "light" | "dark" | "system";
  theme: AppTheme;
  noteLayoutSize: NoteLayoutSize;
  toolbarVisibility: ToolbarVisibilityPreferences;
};

export type AppExportData = {
  version: number;
  exportedAt: string;
  notes: Note[];
  folderSettings: FolderSettings;
  appPreferences: AppPreferences;
  uiState: UiState;
};

export type ThemeOption = { value: AppTheme; label: string; swatches: [string, string, string] };







