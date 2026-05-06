import {
  ArrowNarrowLeft,
  Bold01,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code01,
  CornerDownLeft,
  DotsHorizontal,
  Edit02,
  Edit05,
  FileDownload02,
  Folder,
  Heading01,
  ImagePlus,
  Italic01,
  LayoutGrid02,
  LayoutLeft,
  Link01,
  LinkExternal01,
  Laptop01,
  List,
  Moon02,
  Pin02,
  ReverseLeft,
  ReverseRight,
  SearchMd,
  Sun,
  Settings01,
  SlashCircle01,
  Strikethrough01,
  Trash03,
  Underline01,
  XClose,
} from "@untitledui/icons";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import SubscriptExtension from "@tiptap/extension-subscript";
import SuperscriptExtension from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { type DragEvent, type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { getDefaultGetStartedNote, getDemoNotes, isDefaultGetStartedNote } from "./data";
import { type EffectiveLanguage, type LanguagePreference, getLanguageOptions, resolveLanguage, translations } from "./i18n";
import { FolderKey, Note } from "./types";
import lophosNotesNaming from "../assets/lophos-notes-naming.svg";
import appIcon from "../assets/icon.png";


const fixedSections = [
  { key: "get-started", label: "Get Started" },
  { key: "all", label: "All notes" }
] as const;

const storageKey = "lumina-notes-state";
const folderSettingsKey = "lumina-notes-folder-settings";
const uiStateKey = "lumina-notes-ui-state";
const appPreferencesKey = "lumina-notes-preferences";

const markdownConverter = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**"
});
markdownConverter.use(gfm);

type NoteContextMenuState = {
  noteId: string;
  folderKey: FolderKey;
  x: number;
  y: number;
} | null;

type FolderContextMenuState = {
  folderKey: FolderKey;
  x: number;
  y: number;
} | null;

const CONTEXT_MENU_VIEWPORT_GAP = 12;
const NOTE_CONTEXT_MENU_WIDTH = 148;
const NOTE_CONTEXT_MENU_HEIGHT = 186;
const FOLDER_CONTEXT_MENU_WIDTH = 148;
const FOLDER_CONTEXT_MENU_HEIGHT = 138;
const MODAL_EXIT_DURATION_MS = 180;

type CustomFolder = {
  key: FolderKey;
  label: string;
};

type FolderSettings = {
  labels: Partial<Record<FolderKey, string>>;
  customFolders: CustomFolder[];
  hiddenFixedFolders: FolderKey[];
};

type ToolbarMenu = "heading" | "list" | "table" | "highlight" | "link" | "text-align" | null;

type UiState = {
  sidebarCollapsed: boolean;
  expandedSections: Record<string, boolean>;
};

type WorkspaceView = "notes" | "settings";
type ModalKey = "search" | "clear-data" | "create-folder";

type AppTheme = "blue-lagoon" | "green-forest" | "rose-pine" | "orange-soda" | "catpuccin" | "purple-haze";
type ToolbarVisibilityKey = "history" | "headings" | "quote" | "lists" | "tables" | "bold" | "italic" | "strikethrough" | "code" | "underline" | "highlight" | "links" | "superscript" | "subscript" | "separator" | "textAlign" | "image";
type ToolbarVisibilityPreferences = Record<ToolbarVisibilityKey, boolean>;

type AppPreferences = {
  language: LanguagePreference;
  appearance: "light" | "dark" | "system";
  theme: AppTheme;
  toolbarVisibility: ToolbarVisibilityPreferences;
};

type AppExportData = {
  version: number;
  exportedAt: string;
  notes: Note[];
  folderSettings: FolderSettings;
  appPreferences: AppPreferences;
  uiState: UiState;
};

const themeOptions: Array<{ value: AppTheme; label: string; swatches: [string, string, string] }> = [
  { value: "blue-lagoon", label: "Blue Lagoon", swatches: ["#2563eb", "#60a5fa", "#bfdbfe"] },
  { value: "green-forest", label: "Green Forest", swatches: ["#2f6f4f", "#4aa46f", "#cfead8"] },
  { value: "rose-pine", label: "Rose Pine", swatches: ["#b24f7b", "#e38db0", "#f7d6e3"] },
  { value: "orange-soda", label: "Orange Soda", swatches: ["#dd6b20", "#fb923c", "#fed7aa"] },
  { value: "catpuccin", label: "Catppuccino", swatches: ["#8b6b5c", "#c4a484", "#ead8c8"] },
  { value: "purple-haze", label: "Purple Haze", swatches: ["#7c3aed", "#a78bfa", "#ddd6fe"] }
];

const highlightColors = [
  { key: "highlightYellow", value: "#fff2a8" },
  { key: "highlightGreen", value: "#d7f8d1" },
  { key: "highlightBlue", value: "#dbeafe" },
  { key: "highlightPink", value: "#ffe0ef" },
  { key: "highlightPurple", value: "#eadcff" }
] as const;

function defaultToolbarVisibility(): ToolbarVisibilityPreferences {
  return {
    history: true,
    headings: true,
    quote: true,
    bold: true,
    italic: true,
    strikethrough: true,
    code: true,
    lists: true,
    tables: true,
    underline: true,
    highlight: true,
    links: true,
    superscript: true,
    subscript: true,
    separator: false,
    textAlign: false,
    image: true
  };
}
function toolbarVisibilityFromPartial(parsed?: Partial<ToolbarVisibilityPreferences>): ToolbarVisibilityPreferences {
  const defaults = defaultToolbarVisibility();
  return {
    history: parsed?.history ?? defaults.history,
    headings: parsed?.headings ?? defaults.headings,
    quote: parsed?.quote ?? defaults.quote,
    bold: parsed?.bold ?? defaults.bold,
    italic: parsed?.italic ?? defaults.italic,
    strikethrough: parsed?.strikethrough ?? defaults.strikethrough,
    code: parsed?.code ?? defaults.code,
      lists: parsed?.lists ?? defaults.lists,
      tables: parsed?.tables ?? defaults.tables,
    underline: parsed?.underline ?? defaults.underline,
    highlight: parsed?.highlight ?? defaults.highlight,
    links: parsed?.links ?? defaults.links,
    superscript: parsed?.superscript ?? defaults.superscript,
    subscript: parsed?.subscript ?? defaults.subscript,
    separator: parsed?.separator ?? defaults.separator,
    textAlign: parsed?.textAlign ?? defaults.textAlign,
    image: parsed?.image ?? defaults.image
  };
}

function formatCreatedAtLabel(createdAt: string, locale: EffectiveLanguage) {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(parsedDate);
  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(parsedDate);
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(parsedDate);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return capitalizedMonth + " " + day + ", " + year;
}

function createNote(sortOrder: number, locale: EffectiveLanguage): Note {
  const createdAt = new Date().toISOString();
  const t = translations[locale];

  return {
    id: crypto.randomUUID(),
    title: t.newNoteTitle,
    preview: t.newNotePreview,
    body: "",
    folder: "all",
    tags: ["draft"],
    color: "#2fd582",
    createdAt,
    updatedAt: createdAt,
    sortOrder,
    checklist: []
  };
}

function PinFilledIcon() {


  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13.1028 3.64642C13.4147 2.91872 13.5706 2.55487 13.8226 2.38959C14.0429 2.24506 14.3114 2.19335 14.5697 2.24571C14.865 2.30558 15.145 2.58549 15.7048 3.14532L20.8479 8.28846C21.4077 8.84828 21.6877 9.12819 21.7475 9.42354C21.7999 9.68181 21.7482 9.95031 21.6037 10.1707C21.4384 10.4227 21.0745 10.5786 20.3468 10.8905L17.8525 11.9595C17.7466 12.0048 17.6937 12.0275 17.6441 12.0558C17.6001 12.081 17.558 12.1095 17.5182 12.1411C17.4735 12.1766 17.4328 12.2173 17.3514 12.2987L15.7905 13.8596C15.6632 13.9869 15.5995 14.0506 15.5489 14.1231C15.504 14.1875 15.4668 14.257 15.4382 14.33C15.4059 14.4124 15.3882 14.5006 15.3529 14.6772L14.62 18.3417C14.4296 19.294 14.3343 19.7701 14.0833 19.9929C13.8646 20.1869 13.5719 20.2756 13.2823 20.2354C12.9498 20.1893 12.6064 19.846 11.9197 19.1593L4.83399 12.0735C4.14728 11.3868 3.80392 11.0434 3.75783 10.711C3.71768 10.4214 3.80629 10.1287 4.00036 9.90996C4.22312 9.6589 4.69927 9.56367 5.65158 9.37321L9.31604 8.64032C9.49261 8.60501 9.58089 8.58735 9.66321 8.55506C9.73629 8.5264 9.80573 8.48923 9.87011 8.44433C9.94264 8.39375 10.0063 8.33009 10.1336 8.20276L11.6945 6.64188C11.7759 6.56047 11.8166 6.51977 11.8522 6.47503C11.8837 6.43528 11.9122 6.39319 11.9374 6.34911C11.9657 6.2995 11.9884 6.24659 12.0338 6.14078L13.1028 3.64642Z" fill="currentColor"/>
      <path d="M8.37682 15.6164L2.71997 21.2732M11.6945 6.64188L10.1336 8.20276C10.0063 8.33009 9.94264 8.39375 9.87011 8.44433C9.80573 8.48923 9.73629 8.5264 9.66321 8.55506C9.58089 8.58735 9.49261 8.60501 9.31604 8.64032L5.65158 9.37321C4.69927 9.56367 4.22312 9.6589 4.00036 9.90996C3.80629 10.1287 3.71768 10.4214 3.75783 10.711C3.80392 11.0434 4.14728 11.3868 4.83399 12.0735L11.9197 19.1593C12.6064 19.846 12.9498 20.1893 13.2823 20.2354C13.5719 20.2756 13.8646 20.1869 14.0833 19.9929C14.3343 19.7701 14.4296 19.294 14.62 18.3417L15.3529 14.6772C15.3882 14.5006 15.4059 14.4124 15.4382 14.33C15.4668 14.257 15.504 14.1875 15.5489 14.1231C15.5995 14.0506 15.6632 13.9869 15.7905 13.8596L17.3514 12.2987C17.4328 12.2173 17.4735 12.1766 17.5182 12.1411C17.558 12.1095 17.6001 12.081 17.6441 12.0558C17.6937 12.0275 17.7466 12.0048 17.8525 11.9595L20.3468 10.8905C21.0745 10.5786 21.4384 10.4227 21.6037 10.1707C21.7482 9.95031 21.7999 9.68181 21.7475 9.42354C21.6877 9.12819 21.4077 8.84828 20.8479 8.28846L15.7048 3.14532C15.145 2.58549 14.865 2.30558 14.5697 2.24571C14.3114 2.19335 14.0429 2.24506 13.8226 2.38959C13.5706 2.55487 13.4147 2.91872 13.1028 3.64642L12.0338 6.14078C11.9884 6.24659 11.9657 6.2995 11.9374 6.34911C11.9122 6.39319 11.8837 6.43528 11.8522 6.47503C11.8166 6.51977 11.7759 6.56047 11.6945 6.64188Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12L9 12M21 6L9 6M21 18L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10V5L3 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15.6667C3 15.2246 3.15804 14.8007 3.43934 14.4882C3.72064 14.1756 4.10218 14 4.5 14C4.89782 14 5.27936 14.1756 5.56066 14.4882C5.84196 14.8007 6 15.2246 6 15.6667C6 16.1592 5.625 16.5 5.25 16.9167L3 19H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g clipPath="url(#highlight-icon-clip)">
        <path d="M23.7806 9.96936C23.711 9.89961 23.6283 9.8443 23.5372 9.80661C23.4461 9.76883 23.3485 9.74942 23.25 9.74942C23.1515 9.74942 23.0539 9.76883 22.9628 9.80661C22.8717 9.8443 22.789 9.89961 22.7194 9.96936L18 14.6897L10.2806 6.96936L10.0603 6.74999L14.7806 2.03062C14.8503 1.96093 14.9056 1.87821 14.9433 1.78716C14.981 1.69612 15.0005 1.59853 15.0005 1.49999C15.0005 1.40144 14.981 1.30386 14.9433 1.21282C14.9056 1.12177 14.8503 1.03904 14.7806 0.969369C14.711 0.899682 14.6282 0.844406 14.5371 0.806695C14.4461 0.768983 14.3485 0.749573 14.25 0.749573C14.1515 0.749573 14.0539 0.768983 13.9628 0.806695C13.8718 0.844406 13.789 0.899682 13.7194 0.969369L8.99999 5.68968C8.77306 5.91665 8.62492 6.21043 8.57733 6.52784C8.52974 6.84526 8.58522 7.16957 8.73562 7.45312L6.74999 9.43967C6.4689 9.72092 6.31101 10.1023 6.31101 10.5C6.31101 10.8977 6.4689 11.279 6.74999 11.5603L7.18968 12L1.71937 17.4694C1.6289 17.5597 1.56305 17.6719 1.52808 17.7949C1.49311 17.9179 1.4902 18.0478 1.5196 18.1723C1.549 18.2968 1.60975 18.4116 1.69608 18.506C1.78241 18.6005 1.89144 18.6711 2.0128 18.7115L8.76281 20.9615C8.83924 20.9872 8.91937 21.0002 8.99999 21C9.09851 21.0001 9.19609 20.9808 9.28713 20.9431C9.37818 20.9055 9.46096 20.8503 9.53062 20.7806L12.75 17.5603L13.1897 18C13.4709 18.281 13.8523 18.439 14.25 18.439C14.6477 18.439 15.0291 18.281 15.3103 18L17.2959 16.0144C17.5796 16.165 17.9041 16.2206 18.2217 16.173C18.5393 16.1255 18.8332 15.9771 19.0603 15.75L23.7806 11.0306C23.8504 10.961 23.9057 10.8783 23.9435 10.7872C23.9812 10.6961 24.0006 10.5985 24.0006 10.5C24.0006 10.4015 23.9812 10.3039 23.9435 10.2128C23.9057 10.1217 23.8504 10.039 23.7806 9.96936ZM8.79749 19.3922L3.64124 17.6719L8.24999 13.0603L11.6897 16.5L8.79749 19.3922ZM14.25 16.9397L13.2806 15.9694L8.78062 11.4694L7.81031 10.5L9.74999 8.56031L16.1897 15L14.25 16.9397Z" fill="currentColor" stroke="currentColor" strokeWidth="0.65" />
      </g>
      <defs>
        <clipPath id="highlight-icon-clip">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
function SeparatorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.01 12H21.01H21M7.5 12H7.51M16.5 12H16.51M12 12H12.01M21 21V20.2C21 19.0799 21 18.5198 20.782 18.092C20.5903 17.7157 20.2843 17.4097 19.908 17.218C19.4802 17 18.9201 17 17.8 17H6.2C5.0799 17 4.51984 17 4.09202 17.218C3.7157 17.4097 3.40973 17.7157 3.21799 18.092C3 18.5198 3 19.0799 3 20.2V21M21 3V3.8C21 4.9201 21 5.48016 20.782 5.90798C20.5903 6.28431 20.2843 6.59027 19.908 6.78201C19.4802 7 18.9201 7 17.8 7H6.2C5.0799 7 4.51984 7 4.09202 6.78201C3.71569 6.59027 3.40973 6.28431 3.21799 5.90798C3 5.48016 3 4.92011 3 3.8V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BlockquoteIcon() {
  return (
    <svg width="19" height="19" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m6.2 18 2.35 -4.05c-0.08335 0.01665 -0.175 0.02915 -0.275 0.0375 -0.1 0.00835 -0.19165 0.0125 -0.275 0.0125 -1.1 0 -2.04165 -0.39165 -2.825 -1.175C4.391665 12.04165 4 11.1 4 10s0.391665 -2.04165 1.175 -2.825C5.95835 6.39165 6.9 6 8 6s2.04165 0.39165 2.825 1.175S12 8.9 12 10c0 0.35 -0.04585 0.69315 -0.1375 1.0295 -0.09165 0.3365 -0.22915 0.66 -0.4125 0.9705L8 18h-1.8Zm9 0 2.35 -4.05c-0.08335 0.01665 -0.175 0.02915 -0.275 0.0375 -0.1 0.00835 -0.19165 0.0125 -0.275 0.0125 -1.1 0 -2.04165 -0.39165 -2.825 -1.175S13 11.1 13 10s0.39165 -2.04165 1.175 -2.825S15.9 6 17 6s2.04165 0.39165 2.825 1.175S21 8.9 21 10c0 0.35 -0.04585 0.69315 -0.1375 1.0295 -0.09165 0.3365 -0.22915 0.66 -0.4125 0.9705L17 18h-1.8ZM7.994 12c0.554 0 1.02685 -0.19385 1.4185 -0.5815 0.39165 -0.38785 0.5875 -0.85865 0.5875 -1.4125 0 -0.554 -0.19385 -1.02685 -0.5815 -1.4185 -0.38785 -0.39165 -0.85865 -0.5875 -1.4125 -0.5875 -0.554 0 -1.02685 0.19385 -1.4185 0.5815 -0.39165 0.38785 -0.5875 0.85865 -0.5875 1.4125 0 0.554 0.19385 1.02685 0.5815 1.4185 0.38785 0.39165 0.85865 0.5875 1.4125 0.5875Zm9 0c0.554 0 1.02685 -0.19385 1.4185 -0.5815 0.39165 -0.38785 0.5875 -0.85865 0.5875 -1.4125 0 -0.554 -0.19385 -1.02685 -0.5815 -1.4185 -0.38785 -0.39165 -0.85865 -0.5875 -1.4125 -0.5875 -0.554 0 -1.02685 0.19385 -1.4185 0.5815 -0.39165 0.38785 -0.5875 0.85865 -0.5875 1.4125 0 0.554 0.19385 1.02685 0.5815 1.4185 0.38785 0.39165 0.85865 0.5875 1.4125 0.5875Z" />
    </svg>
  );
}


function SuperscriptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 7L4 17M4 7L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 5.66667C18 5.22464 18.158 4.80072 18.4393 4.48816C18.7206 4.17559 19.1022 4 19.5 4C19.8978 4 20.2794 4.17559 20.5607 4.48816C20.842 4.80072 21 5.22464 21 5.66667C21 6.15917 20.625 6.5 20.25 6.91667L18 9H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubscriptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 7L4 17M4 7L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 15.6667C18 15.2246 18.158 14.8007 18.4393 14.4882C18.7206 14.1756 19.1022 14 19.5 14C19.8978 14 20.2794 14.1756 20.5607 14.4882C20.842 14.8007 21 15.2246 21 15.6667C21 16.1592 20.625 16.5 20.25 16.9167L18 19H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function noteMatchesFolder(note: Note, folder: FolderKey) {
  if (folder === "all") {
    return true;
  }

  return note.folder === folder;
}

function defaultExpandedSections() {
  return {
    "get-started": true,
    work: true,
    personal: true,
    ideas: true,
    archive: true,
    favorites: true,
    all: true
  };
}

function withSortOrder(notes: Note[]) {
  return notes.map((note, index) => {
    const createdAt = note.createdAt ?? new Date().toISOString();
    const updatedAt = !Number.isNaN(new Date(note.updatedAt).getTime()) ? note.updatedAt : createdAt;

    return {
      ...note,
      createdAt,
      updatedAt,
      sortOrder: note.sortOrder ?? index
    };
  });
}

function sortNotes(notes: Note[]) {
  return [...notes].sort((left, right) => {
    if (Boolean(left.pinned) !== Boolean(right.pinned)) {
      return left.pinned ? -1 : 1;
    }

    const rightUpdatedAt = new Date(right.updatedAt).getTime();
    const leftUpdatedAt = new Date(left.updatedAt).getTime();
    const updatedAtDelta = rightUpdatedAt - leftUpdatedAt;

    if (updatedAtDelta !== 0) {
      return updatedAtDelta;
    }

    return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
  });
}

const legacySeedNoteIds = new Set(["welcome", "roadmap", "ideas", "journal"]);

function removeLegacySeedNotes(notes: Note[]) {
  return notes.filter((note) => !legacySeedNoteIds.has(note.id));
}

function notesFromLocalStorage() {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return ensureDefaultNotes(removeLegacySeedNotes(withSortOrder(JSON.parse(raw) as Note[])));
  } catch {
    return null;
  }
}


function ensureDefaultNotes(notes: Note[]) {
  const sanitizedNotes = removeLegacySeedNotes(notes);
  const defaultNotes = withSortOrder(getDemoNotes("en-US"));
  const hasGetStarted = sanitizedNotes.some((note) => note.id === "get-started");

  if (hasGetStarted) {
    return sanitizedNotes;
  }

  return withSortOrder([defaultNotes[0], ...sanitizedNotes]);
}

function normalizeDefaultNotes(notes: Note[], locale: EffectiveLanguage) {
  return notes.map((note) => {
    const isUntouchedDefaultNote = note.id === "get-started" && note.updatedAt === note.createdAt;

    if (!isUntouchedDefaultNote || !isDefaultGetStartedNote(note)) {
      return note;
    }

    const localized = getDefaultGetStartedNote(locale);
    return {
      ...note,
      title: localized.title,
      preview: localized.preview,
      body: localized.body
    };
  });
}
function uiStateFromLocalStorage(): UiState {
  const raw = window.localStorage.getItem(uiStateKey);
  const defaults = defaultExpandedSections();

  if (!raw) {
    return {
      sidebarCollapsed: false,
      expandedSections: defaults
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UiState>;
    return {
      sidebarCollapsed: parsed.sidebarCollapsed ?? false,
      expandedSections: {
        ...defaults,
        ...(parsed.expandedSections ?? {})
      }
    };
  } catch {
    return {
      sidebarCollapsed: false,
      expandedSections: defaults
    };
  }
}

function appPreferencesFromLocalStorage(): AppPreferences {
  const raw = window.localStorage.getItem(appPreferencesKey);
  if (!raw) {
    return defaultAppPreferences();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      language: parsed.language === "pt-BR" || parsed.language === "en-US" ? parsed.language : "system",
      appearance: parsed.appearance === "light" || parsed.appearance === "dark" ? parsed.appearance : "system",
      theme: parsed.theme === "blue-lagoon" || parsed.theme === "green-forest" || parsed.theme === "rose-pine" || parsed.theme === "orange-soda" || parsed.theme === "catpuccin" || parsed.theme === "purple-haze" ? parsed.theme : "blue-lagoon",
      toolbarVisibility: toolbarVisibilityFromPartial(parsed.toolbarVisibility)
    };
  } catch {
    return defaultAppPreferences();
  }
}

function defaultFolderSettings(): FolderSettings {
  return { labels: {}, customFolders: [], hiddenFixedFolders: [] };
}

function defaultAppPreferences(): AppPreferences {
  return {
    language: "system",
    appearance: "system",
    theme: "blue-lagoon",
    toolbarVisibility: defaultToolbarVisibility()
  };
}

function folderSettingsFromLocalStorage(): FolderSettings {
  const raw = window.localStorage.getItem(folderSettingsKey);
  if (!raw) {
    return defaultFolderSettings();
  }

  try {
    const settings = JSON.parse(raw) as Partial<FolderSettings & { hidden?: FolderKey[]; hiddenFixedFolders?: FolderKey[] }>;
    const labels = settings.labels ?? {};
    const hiddenFixedFolders = settings.hiddenFixedFolders ?? settings.hidden ?? [];
    const legacyFolderKeys: FolderKey[] = ["work", "personal", "ideas", "archive", "favorites"];
    const legacyCustomFolders = legacyFolderKeys
      .map((folderKey) => {
        const label = labels[folderKey];
        return label ? { key: folderKey, label } : null;
      })
      .filter((folder): folder is CustomFolder => Boolean(folder));

    return {
      labels,
      customFolders: settings.customFolders ?? legacyCustomFolders,
      hiddenFixedFolders
    };
  } catch {
    return defaultFolderSettings();
  }
}
function noteBodyToPlainText(body: string) {
  return body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function noteBodyToMarkdown(body: string) {
  const normalizedBody = noteBodyToEditorContent(body);

  if (!normalizedBody) {
    return "";
  }

  return markdownConverter.turndown(normalizedBody).trim();
}

async function blobToDataUrl(blob: Blob) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("Could not read blob"));
    reader.readAsDataURL(blob);
  });
}

const allowedPdfTags = new Set([
  "a",
  "blockquote",
  "br",
  "code",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "input",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
]);

const allowedPdfLinkProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
const allowedPdfImageProtocols = new Set(["http:", "https:", "file:"]);

function unwrapElement(element: Element) {
  const parent = element.parentNode;
  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
}

function sanitizePdfHref(rawHref: string | null) {
  if (!rawHref) {
    return null;
  }

  try {
    const url = new URL(rawHref, window.location.href);
    return allowedPdfLinkProtocols.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function hasAllowedPdfImageFileExtension(pathname: string) {
  return /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(pathname);
}

function normalizeFileUrlPath(pathname: string) {
  return decodeURIComponent(pathname).replace(/\\/g, "/").toLowerCase();
}

function isTrustedPdfImageUrl(url: URL) {
  if (url.protocol === "http:" || url.protocol === "https:") {
    return url.origin === window.location.origin;
  }

  if (url.protocol === "file:") {
    const currentDocument = new URL(window.location.href);
    const currentDirectory = normalizeFileUrlPath(currentDocument.pathname.replace(/\/[^/]*$/, "/"));
    const candidatePath = normalizeFileUrlPath(url.pathname);
    return candidatePath.startsWith(currentDirectory);
  }

  return false;
}

function sanitizePdfImageSource(rawSrc: string | null) {
  if (!rawSrc) {
    return null;
  }

  if (rawSrc.startsWith("data:")) {
    return rawSrc;
  }

  try {
    const url = new URL(rawSrc, window.location.href);
    if (!allowedPdfImageProtocols.has(url.protocol)) {
      return null;
    }

    if (!isTrustedPdfImageUrl(url)) {
      return null;
    }

    if (url.protocol === "file:" && !hasAllowedPdfImageFileExtension(url.pathname)) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function sanitizePdfDocument(document: Document) {
  const elements = Array.from(document.body.querySelectorAll("*"));

  elements.forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    if (!allowedPdfTags.has(tagName)) {
      unwrapElement(element);
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "srcset") {
        element.removeAttribute(attribute.name);
      }
    });

    if (tagName === "a") {
      const sanitizedHref = sanitizePdfHref(element.getAttribute("href"));
      if (sanitizedHref) {
        element.setAttribute("href", sanitizedHref);
      } else {
        element.removeAttribute("href");
      }

      element.removeAttribute("target");
      element.setAttribute("rel", "noreferrer noopener");
      return;
    }

    if (tagName === "img") {
      const sanitizedSrc = sanitizePdfImageSource(element.getAttribute("src"));
      if (sanitizedSrc) {
        element.setAttribute("src", sanitizedSrc);
      } else {
        element.removeAttribute("src");
      }

      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        if (!["src", "alt", "title", "width", "height"].includes(name)) {
          element.removeAttribute(attribute.name);
        }
      });
      return;
    }

    if (tagName === "input") {
      const inputType = element.getAttribute("type");
      if (inputType !== "checkbox") {
        unwrapElement(element);
        return;
      }

      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        if (!["type", "checked", "disabled"].includes(name)) {
          element.removeAttribute(attribute.name);
        }
      });
      element.setAttribute("disabled", "disabled");
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("data-") || name === "class") {
        element.removeAttribute(attribute.name);
      }
    });
  });
}

async function noteBodyToPdfHtml(body: string) {
  const normalizedBody = noteBodyToEditorContent(body);

  if (!normalizedBody) {
    return "";
  }

  const document = new DOMParser().parseFromString(normalizedBody, "text/html");
  sanitizePdfDocument(document);
  const images = Array.from(document.querySelectorAll("img"));

  await Promise.all(images.map(async (image) => {
    const rawSrc = image.getAttribute("src");
    if (!rawSrc || rawSrc.startsWith("data:")) {
      return;
    }

    try {
      const response = await fetch(rawSrc);
      if (!response.ok) {
        image.removeAttribute("src");
        return;
      }

      const dataUrl = await blobToDataUrl(await response.blob());
      if (dataUrl) {
        image.setAttribute("src", dataUrl);
      } else {
        image.removeAttribute("src");
      }
    } catch {
      image.removeAttribute("src");
    }
  }));

  return document.body.innerHTML;
}
function noteBodyToEditorContent(body: string) {
  if (!body.trim()) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(body)) {
    const documentFragment = new DOMParser().parseFromString(body, "text/html");

    documentFragment.body.querySelectorAll("div").forEach((element) => {
      const parent = element.parentNode;
      if (!parent) {
        return;
      }

      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }

      parent.removeChild(element);
    });

    return documentFragment.body.innerHTML;
  }

  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function isEditorActive(editor: Editor | null, name: string, attributes?: Record<string, unknown>) {
  return editor?.isActive(name, attributes) ? "active" : "";
}

function getContextMenuPosition(x: number, y: number, width: number, height: number) {
  const maxX = window.innerWidth - width - CONTEXT_MENU_VIEWPORT_GAP;
  const maxY = window.innerHeight - height - CONTEXT_MENU_VIEWPORT_GAP;

  return {
    x: Math.max(CONTEXT_MENU_VIEWPORT_GAP, Math.min(x, maxX)),
    y: Math.max(CONTEXT_MENU_VIEWPORT_GAP, Math.min(y, maxY))
  };
}

function currentBlockType(editor: Editor | null) {
  if (!editor) {
    return "paragraph";
  }

  if (editor.isActive("heading", { level: 1 })) {
    return "heading-1";
  }

  if (editor.isActive("heading", { level: 2 })) {
    return "heading-2";
  }

  if (editor.isActive("heading", { level: 3 })) {
    return "heading-3";
  }

  if (editor.isActive("heading", { level: 4 })) {
    return "heading-4";
  }

  return "paragraph";
}

export default function App() {
  const initialAppPreferences = appPreferencesFromLocalStorage();
  const initialUiState = uiStateFromLocalStorage();
  const initialLanguage = resolveLanguage(initialAppPreferences.language, window.navigator.language);
  const [notes, setNotes] = useState<Note[]>(() => normalizeDefaultNotes(notesFromLocalStorage() ?? ensureDefaultNotes(withSortOrder(getDemoNotes(initialLanguage))), initialLanguage));
  const [storageReady, setStorageReady] = useState(!window.lumina?.notes);
  const [activeFolder, setActiveFolder] = useState<FolderKey>("get-started");
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? "");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("notes");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialUiState.sidebarCollapsed);
  const [toolbarMenu, setToolbarMenu] = useState<ToolbarMenu>(null);
  const [linkInput, setLinkInput] = useState("");
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [folderSettings, setFolderSettings] = useState<FolderSettings>(() => folderSettingsFromLocalStorage());
  const [appPreferences, setAppPreferences] = useState<AppPreferences>(initialAppPreferences);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(initialUiState.expandedSections);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const newFolderInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceScrollRef = useRef<HTMLElement | null>(null);
  const sidebarCollapseRef = useRef<HTMLButtonElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const noteHeaderMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalCloseTimeoutsRef = useRef<Partial<Record<ModalKey, number>>>({});
  const modalVisibilityRef = useRef<Record<ModalKey, boolean>>({ search: false, "clear-data": false, "create-folder": false });
  const [noteContextMenu, setNoteContextMenu] = useState<NoteContextMenuState>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<FolderContextMenuState>(null);
  const [sidebarTooltip, setSidebarTooltip] = useState<{ label: string; top: number; left: number } | null>(null);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renamingNoteTitle, setRenamingNoteTitle] = useState("");
  const [renamingSectionKey, setRenamingSectionKey] = useState<FolderKey | null>(null);
  const [renamingFolderKey, setRenamingFolderKey] = useState<FolderKey | null>(null);
  const [renamingFolderLabel, setRenamingFolderLabel] = useState("");
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dropTargetFolder, setDropTargetFolder] = useState<FolderKey | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [closingModals, setClosingModals] = useState<Record<ModalKey, boolean>>({ search: false, "clear-data": false, "create-folder": false });
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNoteActionsMenuOpen, setIsNoteActionsMenuOpen] = useState(false);
  const [noteActionsMenuPosition, setNoteActionsMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [sidebarScrolled, setSidebarScrolled] = useState(false);
  const [notesStorageInfo, setNotesStorageInfo] = useState<NotesStorageInfo | null>(null);
  const [isNotesStorageLoading, setIsNotesStorageLoading] = useState(Boolean(window.lumina?.notes?.getStorageInfo));
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  const [appVersion, setAppVersion] = useState("0.1.0");
  const selectedNoteRef = useRef<Note | undefined>(undefined);
  const resolvedAppearance = appPreferences.appearance === "system" ? (systemPrefersDark ? "dark" : "light") : appPreferences.appearance;
  const resolvedLanguage = resolveLanguage(appPreferences.language, window.navigator.language);
  const selectedTheme = themeOptions.find((option) => option.value === appPreferences.theme) ?? themeOptions[0];
  const t = translations[resolvedLanguage];
  const languageOptions = getLanguageOptions(resolvedLanguage);
  const toolbarVisibilityOptions: Array<{ value: ToolbarVisibilityKey; label: string; icon: JSX.Element }> = [
    { value: "history", label: t.toolbarVisibilityHistory, icon: <ReverseLeft size={16} /> },
    { value: "headings", label: t.toolbarVisibilityHeadings, icon: <Heading01 size={16} /> },
    { value: "quote", label: t.toolbarVisibilityQuote, icon: <BlockquoteIcon /> },
    { value: "lists", label: t.toolbarVisibilityLists, icon: <List size={16} /> },
    { value: "tables", label: t.toolbarVisibilityTables, icon: <LayoutGrid02 size={16} /> },
    { value: "bold", label: t.toolbarVisibilityBold, icon: <Bold01 size={16} /> },
    { value: "italic", label: t.toolbarVisibilityItalic, icon: <Italic01 size={16} /> },
    { value: "strikethrough", label: t.toolbarVisibilityStrikethrough, icon: <Strikethrough01 size={16} /> },
    { value: "code", label: t.toolbarVisibilityCode, icon: <Code01 size={16} /> },
    { value: "underline", label: t.toolbarVisibilityUnderline, icon: <Underline01 size={16} /> },
    { value: "highlight", label: t.toolbarVisibilityHighlight, icon: <HighlightIcon /> },
    { value: "links", label: t.toolbarVisibilityLinks, icon: <Link01 size={16} /> },
    { value: "superscript", label: t.toolbarVisibilitySuperscript, icon: <SuperscriptIcon /> },
    { value: "subscript", label: t.toolbarVisibilitySubscript, icon: <SubscriptIcon /> },
    { value: "separator", label: t.toolbarVisibilitySeparator, icon: <SeparatorIcon /> },
    { value: "textAlign", label: t.toolbarVisibilityTextAlign, icon: <AlignCenter size={16} /> },
    { value: "image", label: t.toolbarVisibilityImage, icon: <ImagePlus size={16} /> }
  ];
  const visibleToolbarGroupsCount = toolbarVisibilityOptions.filter((option) => appPreferences.toolbarVisibility[option.value]).length;
  const selectedLanguageLabel = languageOptions.find((option) => option.value === appPreferences.language)?.label ?? t.languageOptionSystem;
  const notesLocationLabel = !window.lumina?.notes
    ? t.notesLocationBrowser
    : isNotesStorageLoading
      ? t.notesLocationLoading
      : notesStorageInfo?.directoryPath ?? t.notesLocationRestart;
  const canOpenNotesStorageDirectory = Boolean(window.lumina?.notes?.openStorageDirectory && notesStorageInfo);
  const canChooseNotesStorageDirectory = Boolean(window.lumina?.notes?.chooseStorageDirectory);

  const refreshNotesStorageInfo = useCallback(async () => {
    if (!window.lumina?.notes) {
      setIsNotesStorageLoading(false);
      return;
    }

    if (!window.lumina.notes.getStorageInfo) {
      setIsNotesStorageLoading(false);
      setNotesStorageInfo(null);
      return;
    }

    setIsNotesStorageLoading(true);

    try {
      const info = await window.lumina.notes.getStorageInfo();
      setNotesStorageInfo(info);
    } catch (error) {
      console.error("Could not load notes storage info", error);
      setNotesStorageInfo(null);
    } finally {
      setIsNotesStorageLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadNotes() {
      if (!window.lumina?.notes) {
        return;
      }

      try {
        const storedNotes = await window.lumina.notes.load();
        if (!isMounted) {
          return;
        }

        const nextNotes = normalizeDefaultNotes(
          storedNotes?.length ? ensureDefaultNotes(withSortOrder(storedNotes)) : notesFromLocalStorage() ?? ensureDefaultNotes(withSortOrder(getDemoNotes(initialLanguage))),
          resolveLanguage(appPreferencesFromLocalStorage().language, window.navigator.language)
        );
        setNotes(nextNotes);
        setSelectedId(nextNotes[0]?.id ?? "");
      } catch (error) {
        console.error("Could not load local notes", error);
      } finally {
        if (isMounted) {
          setStorageReady(true);
        }
      }
    }

    void loadNotes();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    void refreshNotesStorageInfo();
  }, [refreshNotesStorageInfo]);

  useEffect(() => {
    if (workspaceView === "settings") {
      void refreshNotesStorageInfo();
    }
  }, [refreshNotesStorageInfo, workspaceView]);

  useEffect(() => {
    let isMounted = true;

    if (!window.lumina?.app?.getVersion) {
      return () => {
        isMounted = false;
      };
    }

    void window.lumina.app.getVersion().then((version) => {
      if (isMounted && version) {
        setAppVersion(version);
      }
    }).catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isNoteActionsMenuOpen) {
      return;
    }

    setNoteContextMenu(null);
    setFolderContextMenu(null);
    setToolbarMenu(null);
    setIsLanguageMenuOpen(false);
    setIsThemeMenuOpen(false);
  }, [isNoteActionsMenuOpen]);

  useEffect(() => {
    if (folderContextMenu || noteContextMenu || toolbarMenu || isLanguageMenuOpen || isThemeMenuOpen) {
      setIsNoteActionsMenuOpen(false);
      setNoteActionsMenuPosition(null);
    }
  }, [folderContextMenu, isLanguageMenuOpen, isThemeMenuOpen, noteContextMenu, toolbarMenu]);


  useEffect(() => {
    window.localStorage.setItem(appPreferencesKey, JSON.stringify(appPreferences));
  }, [appPreferences]);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    setSystemPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedAppearance;
    document.documentElement.dataset.colorTheme = appPreferences.theme;
    document.documentElement.style.colorScheme = resolvedAppearance;
    document.documentElement.lang = resolvedLanguage;

    if (window.lumina?.window?.setAppearance) {
      void window.lumina.window.setAppearance(resolvedAppearance).catch((error) => {
        console.error("Could not sync window appearance", error);
      });
    }
  }, [appPreferences.theme, resolvedAppearance, resolvedLanguage]);

  useEffect(() => {
    setNotes((current) => normalizeDefaultNotes(current, resolvedLanguage));
  }, [resolvedLanguage]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(notes));

    if (window.lumina?.notes) {
      void window.lumina.notes.save(notes).catch((error) => {
        console.error("Could not save local notes", error);
      });
    }
  }, [notes, storageReady]);

  useEffect(() => {
    window.localStorage.setItem(folderSettingsKey, JSON.stringify(folderSettings));
  }, [folderSettings, t.fixedFolderAllNotes, t.fixedFolderGetStarted]);

  useEffect(() => {
    window.localStorage.setItem(
      uiStateKey,
      JSON.stringify({
        sidebarCollapsed,
        expandedSections
      })
    );
  }, [expandedSections, sidebarCollapsed]);

  useEffect(() => {
    if (folderSettings.customFolders.length === 0) {
      return;
    }

    setExpandedSections((current) => {
      const next = { ...current };

      for (const folder of folderSettings.customFolders) {
        if (!(folder.key in next)) {
          next[folder.key] = true;
        }
      }

      return next;
    });
  }, [folderSettings.customFolders]);

  const filteredNotes = useMemo(() => {
    return sortNotes(
      notes.filter((note) => {
        const matchesFolder = noteMatchesFolder(note, activeFolder);
        return matchesFolder;
      })
    );
  }, [activeFolder, notes]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const orderedNotes = sortNotes(notes);

    if (!query) {
      return orderedNotes;
    }

    return orderedNotes.filter((note) => {
      const haystack = [note.title, note.preview, noteBodyToPlainText(note.body), folderLabel(note.folder)].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [notes, searchQuery, folderSettings]);

  const visibleSections = useMemo(() => {
    const getStarted = {
      ...fixedSections[0],
      label: folderSettings.labels["get-started"] ?? t.fixedFolderGetStarted
    };
    const allNotes = {
      ...fixedSections[1],
      label: folderSettings.labels["all"] ?? t.fixedFolderAllNotes
    };

    return [
      ...(folderSettings.hiddenFixedFolders.includes("get-started") ? [] : [getStarted]),
      ...folderSettings.customFolders,
      allNotes
    ];
  }, [folderSettings, t.fixedFolderAllNotes, t.fixedFolderGetStarted]);

  const selectedNote = filteredNotes.find((note) => note.id === selectedId) ?? filteredNotes[0] ?? notes[0];
  selectedNoteRef.current = selectedNote;

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      TableKit.configure({
        table: {
          resizable: false,
          renderWrapper: true,
          HTMLAttributes: {
            class: "editor-table"
          }
        },
        tableHeader: {
          HTMLAttributes: {
            class: "editor-table-header"
          }
        },
        tableCell: {
          HTMLAttributes: {
            class: "editor-table-cell"
          }
        }
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          target: "_blank",
          rel: "noreferrer"
        }
      }),
      SuperscriptExtension,
      SubscriptExtension,
      TextAlign.configure({
        types: ["heading", "paragraph"]
      }),
      Image.configure({
        allowBase64: true
      }),
      Highlight.configure({
        multicolor: true
      }),
      Placeholder.configure({
        placeholder: t.newNotePreview
      })
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        "aria-label": t.editorBodyAria
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      const activeNote = selectedNoteRef.current;
      if (!activeNote) {
        return;
      }

      const body = activeEditor.getHTML();
      const preview = activeEditor.getText().split("\n").find(Boolean)?.trim() || activeNote.title.trim() || t.emptyNote;

      setNotes((current) =>
        current.map((note) =>
          note.id === activeNote.id
            ? {
                ...note,
                body,
                preview,
                updatedAt: new Date().toISOString()
              }
            : note
        )
      );
    }
  }, [selectedNote?.id, resolvedLanguage]);

  const currentHeadingAttributes = editor?.getAttributes("heading") as { textAlign?: string } | undefined;
  const currentParagraphAttributes = editor?.getAttributes("paragraph") as { textAlign?: string } | undefined;
  const currentTextAlign = (currentHeadingAttributes?.textAlign ?? currentParagraphAttributes?.textAlign ?? "left") as "left" | "center" | "right";

  useEffect(() => {
    if (selectedNote && selectedNote.id !== selectedId) {
      setSelectedId(selectedNote.id);
    }
  }, [selectedId, selectedNote]);


  useEffect(() => {
    if (workspaceView !== "notes" || !selectedNote?.id) {
      return;
    }

    const scrollElement = workspaceScrollRef.current;
    if (!scrollElement) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollElement.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [selectedNote?.id, workspaceView]);

  useEffect(() => {
    const textarea = titleRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight + 4}px`;
  }, [selectedNote?.title]);

  useEffect(() => {
    if (!renamingNoteId) {
      return;
    }

    const input = renameInputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }, [renamingNoteId]);

  useEffect(() => {
    if (!isCreateFolderModalOpen) {
      return;
    }

    const input = newFolderInputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    input.select();
  }, [isCreateFolderModalOpen]);

  useEffect(() => {
    if (!isSearchModalOpen) {
      return;
    }

    const input = searchInputRef.current;
    if (!input) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      input.focus();
      input.select();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isSearchModalOpen]);



  useEffect(() => {
    if (!renamingFolderKey) {
      return;
    }

    const input = renameInputRef.current;
    if (!input) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      input.focus();
      input.select();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [renamingFolderKey]);

  useEffect(() => {
    if (!editor || !selectedNote) {
      return;
    }

    const nextContent = noteBodyToEditorContent(selectedNote.body);
    if (editor.getHTML() === nextContent) {
      return;
    }

    try {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    } catch (error) {
      console.error("Could not hydrate editor content", error);

      const fallbackDocument = new DOMParser().parseFromString(nextContent, "text/html");
      const fallbackText = fallbackDocument.body.textContent?.trim() ?? "";
      const fallbackContent = fallbackText
        ? fallbackText
            .split(/\n{2,}/)
            .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
            .join("")
        : "";

      try {
        editor.commands.setContent(fallbackContent, { emitUpdate: false });
      } catch (fallbackError) {
        console.error("Could not hydrate fallback editor content", fallbackError);
        editor.commands.clearContent(false);
      }
    }
  }, [editor, selectedNote?.id, selectedNote?.body]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    function updateHistoryState() {
      setHistoryState({
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo()
      });
    }

    updateHistoryState();
    editor.on("transaction", updateHistoryState);

    return () => {
      editor.off("transaction", updateHistoryState);
    };
  }, [editor]);
  useEffect(() => {
    modalVisibilityRef.current = {
      search: isSearchModalOpen || closingModals.search,
      "clear-data": isClearDataModalOpen || closingModals["clear-data"],
      "create-folder": isCreateFolderModalOpen || closingModals["create-folder"]
    };
  }, [closingModals, isClearDataModalOpen, isCreateFolderModalOpen, isSearchModalOpen]);

  useEffect(() => {
    return () => {
      for (const timeoutId of Object.values(modalCloseTimeoutsRef.current)) {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
      }
    };
  }, []);

  useEffect(() => {
    function handlePointerDown() {
      closeFloatingMenus();
      cancelRenamingFolder();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeFloatingMenus();
        cancelRenamingNote();
        cancelRenamingFolder();

        if (modalVisibilityRef.current["create-folder"]) {
          closeCreateFolderModal();
        }

        if (modalVisibilityRef.current.search) {
          closeSearchModal();
        }

        if (modalVisibilityRef.current["clear-data"]) {
          closeClearDataModal();
        }
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function closeFloatingMenus() {
    setNoteContextMenu(null);
    setFolderContextMenu(null);
    setToolbarMenu(null);
    setIsLanguageMenuOpen(false);
    setIsThemeMenuOpen(false);
    setIsNoteActionsMenuOpen(false);
    setNoteActionsMenuPosition(null);
  }

  function closeMenusForNoteActionsOpen() {
    setNoteContextMenu(null);
    setFolderContextMenu(null);
    setToolbarMenu(null);
    setIsLanguageMenuOpen(false);
    setIsThemeMenuOpen(false);
  }

  function toggleToolbarVisibilityPreference(key: ToolbarVisibilityKey) {
    setAppPreferences((current) => {
      const currentlyVisible = Object.values(current.toolbarVisibility).filter(Boolean).length;
      if (current.toolbarVisibility[key] && currentlyVisible === 1) {
        return current;
      }

      return {
        ...current,
        toolbarVisibility: {
          ...current.toolbarVisibility,
          [key]: !current.toolbarVisibility[key]
        }
      };
    });
  }

  function cancelModalClose(key: ModalKey) {
    const timeoutId = modalCloseTimeoutsRef.current[key];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete modalCloseTimeoutsRef.current[key];
    }

    setClosingModals((current) => ({ ...current, [key]: false }));
  }

  function beginModalClose(key: ModalKey, onClosed: () => void) {
    if (closingModals[key]) {
      return;
    }

    setClosingModals((current) => ({ ...current, [key]: true }));
    const timeoutId = window.setTimeout(() => {
      delete modalCloseTimeoutsRef.current[key];
      setClosingModals((current) => ({ ...current, [key]: false }));
      onClosed();
    }, MODAL_EXIT_DURATION_MS);
    modalCloseTimeoutsRef.current[key] = timeoutId;
  }

  function openSearchModal() {
    cancelModalClose("search");
    setNoteContextMenu(null);
    setFolderContextMenu(null);
    setSearchQuery("");
    setIsSearchModalOpen(true);
  }

  function closeSearchModal() {
    beginModalClose("search", () => {
      setIsSearchModalOpen(false);
      setSearchQuery("");
    });
  }

  function openCreateFolderModal() {
    cancelModalClose("create-folder");
    setNoteContextMenu(null);
    setFolderContextMenu(null);
    setNewFolderName("");
    setIsCreateFolderModalOpen(true);
  }

  function closeCreateFolderModal() {
    beginModalClose("create-folder", () => {
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
    });
  }

  function openSearchResult(noteId: string, folderKey: FolderKey) {
    setWorkspaceView("notes");
    setActiveFolder(folderKey);
    setSelectedId(noteId);
    closeSearchModal();
  }

  function createFolder() {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      return;
    }

    const nextFolderKey = `folder-${crypto.randomUUID()}`;

    setFolderSettings((current) => ({
      ...current,
      customFolders: [...current.customFolders, { key: nextFolderKey, label: trimmedName }]
    }));

    setExpandedSections((current) => ({
      ...current,
      [nextFolderKey]: true
    }));

    setActiveFolder(nextFolderKey);
    closeCreateFolderModal();
  }
  function updateNote(patch: Partial<Note>) {
    if (!selectedNote) {
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              ...patch,
              preview: (patch.body ?? note.body).split("\n").find(Boolean) || (patch.title ?? note.title).trim() || t.emptyNote,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    );
  }

  function addNewNote() {
    setWorkspaceView("notes");
    const nextSortOrder = notes.reduce((highest, note) => Math.max(highest, note.sortOrder ?? 0), -1) + 1;
    const note = createNote(nextSortOrder, resolvedLanguage);
    setNotes((current) => [...current, note]);
    setSelectedId(note.id);
    setActiveFolder("all");
  }

  function addNewNoteToFolder(folderKey: FolderKey) {
    setWorkspaceView("notes");
    const nextSortOrder = notes.reduce((highest, note) => Math.max(highest, note.sortOrder ?? 0), -1) + 1;
    const note = {
      ...createNote(nextSortOrder, resolvedLanguage),
      folder: folderKey
    };
    setNotes((current) => [...current, note]);
    setExpandedSections((current) => ({
      ...current,
      [folderKey]: true
    }));
    setSelectedId(note.id);
    setActiveFolder(folderKey);
  }


  async function openNotesStorageDirectory() {
    if (!window.lumina?.notes?.openStorageDirectory) {
      return;
    }

    try {
      await window.lumina.notes.openStorageDirectory();
    } catch (error) {
      console.error("Could not open notes storage directory", error);
    }
  }

  function buildAppExportData(): AppExportData {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes,
      folderSettings,
      appPreferences,
      uiState: {
        sidebarCollapsed,
        expandedSections
      }
    };
  }

  async function exportAppData() {
    const payload = buildAppExportData();

    if (window.lumina?.notes?.exportData) {
      try {
        await window.lumina.notes.exportData(payload);
        return;
      } catch (error) {
        console.error("Could not export app data", error);
      }
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lumina-notes-export-2026-05-05-13-22-09.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function openClearDataModal() {
    cancelModalClose("clear-data");
    setIsClearDataModalOpen(true);
  }

  function closeClearDataModal() {
    beginModalClose("clear-data", () => {
      setIsClearDataModalOpen(false);
    });
  }

  async function clearAppData() {

    const nextPreferences = defaultAppPreferences();
    const nextResolvedLanguage = resolveLanguage(nextPreferences.language, window.navigator.language);
    const nextNotes = ensureDefaultNotes(withSortOrder(getDemoNotes(nextResolvedLanguage)));
    const nextFolderSettings = defaultFolderSettings();
    const nextUiState = {
      sidebarCollapsed: false,
      expandedSections: defaultExpandedSections()
    };

    setIsClearDataModalOpen(false);
    setToolbarMenu(null);
    setLinkInput("");
    setSearchQuery("");
    setIsSearchModalOpen(false);
    setIsCreateFolderModalOpen(false);
    setIsLanguageMenuOpen(false);
    setIsThemeMenuOpen(false);
    setNoteContextMenu(null);
    setFolderContextMenu(null);
    setRenamingNoteId(null);
    setRenamingSectionKey(null);
    setRenamingFolderKey(null);
    setRenamingFolderLabel("");
    setDraggedNoteId(null);
    setDropTargetFolder(null);
    setWorkspaceView("notes");
    setFolderSettings(nextFolderSettings);
    setAppPreferences(nextPreferences);
    setExpandedSections(nextUiState.expandedSections);
    setSidebarCollapsed(nextUiState.sidebarCollapsed);
    setActiveFolder("get-started");
    setNotes(nextNotes);
    setSelectedId(nextNotes[0]?.id ?? "");

    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(folderSettingsKey);
    window.localStorage.removeItem(uiStateKey);
    window.localStorage.removeItem(appPreferencesKey);

    if (window.lumina?.notes?.save) {
      try {
        await window.lumina.notes.save(nextNotes);
      } catch (error) {
        console.error("Could not clear app data", error);
      }
    }
  }

  async function chooseNotesStorageDirectory() {
    if (!window.lumina?.notes?.chooseStorageDirectory) {
      return;
    }

    try {
      setIsNotesStorageLoading(true);
      const info = await window.lumina.notes.chooseStorageDirectory();
      setNotesStorageInfo(info);
    } catch (error) {
      console.error("Could not choose notes storage directory", error);
    } finally {
      setIsNotesStorageLoading(false);
    }
  }
  function toggleSection(sectionKey: string) {
    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey]
    }));
  }

  function notesForSection(sectionKey: FolderKey) {
    return sortNotes(notes.filter((note) => noteMatchesFolder(note, sectionKey)));
  }

  function openNoteContextMenu(event: MouseEvent<HTMLButtonElement>, noteId: string, folderKey: FolderKey) {
    event.preventDefault();
    event.stopPropagation();
    const position = getContextMenuPosition(event.clientX, event.clientY, NOTE_CONTEXT_MENU_WIDTH, NOTE_CONTEXT_MENU_HEIGHT);
    closeFloatingMenus();
    setNoteContextMenu({
      noteId,
      folderKey,
      x: position.x,
      y: position.y
    });
  }

  function openFolderContextMenu(event: MouseEvent<HTMLButtonElement>, folderKey: FolderKey) {
    event.preventDefault();
    event.stopPropagation();
    const position = getContextMenuPosition(event.clientX, event.clientY, FOLDER_CONTEXT_MENU_WIDTH, FOLDER_CONTEXT_MENU_HEIGHT);
    closeFloatingMenus();
    setFolderContextMenu({
      folderKey,
      x: position.x,
      y: position.y
    });
  }

  function isFixedFolder(folderKey: FolderKey) {
    return fixedSections.some((section) => section.key === folderKey);
  }

  function canRenameFolder(folderKey: FolderKey) {
    return folderKey !== "all";
  }

  function canDeleteFolder(folderKey: FolderKey) {
    return folderKey !== "all";
  }

  function isCustomFolder(folderKey: FolderKey) {
    return folderSettings.customFolders.some((folder) => folder.key === folderKey);
  }

  function folderLabel(folderKey: FolderKey) {
    const fixedLabel = folderKey === "get-started" ? t.fixedFolderGetStarted : folderKey === "all" ? t.fixedFolderAllNotes : undefined;
    const customLabel = folderSettings.customFolders.find((folder) => folder.key === folderKey)?.label;
    return customLabel ?? folderSettings.labels[folderKey] ?? fixedLabel ?? t.untitledFolder;
  }

  function renameFolder(folderKey: FolderKey) {
    if (!canRenameFolder(folderKey)) {
      setFolderContextMenu(null);
      return;
    }

    setFolderContextMenu(null);
    setRenamingFolderKey(folderKey);
    setRenamingFolderLabel(folderLabel(folderKey));
  }

  function cancelRenamingFolder() {
    setRenamingFolderKey(null);
    setRenamingFolderLabel("");
  }

  function commitRenamingFolder(folderKey: FolderKey) {
    const trimmedLabel = renamingFolderLabel.trim();

    if (!trimmedLabel) {
      cancelRenamingFolder();
      return;
    }

    if (isFixedFolder(folderKey)) {
      setFolderSettings((current) => ({
        ...current,
        labels: {
          ...current.labels,
          [folderKey]: trimmedLabel
        }
      }));
      cancelRenamingFolder();
      return;
    }

    setFolderSettings((current) => ({
      ...current,
      customFolders: current.customFolders.map((folder) =>
        folder.key === folderKey ? { ...folder, label: trimmedLabel } : folder
      )
    }));

    cancelRenamingFolder();
  }

  function deleteFolder(folderKey: FolderKey) {
    setFolderContextMenu(null);

    if (!canDeleteFolder(folderKey)) {
      window.alert(t.alertFolderCannotDelete);
      return;
    }

    const label = folderLabel(folderKey);
    const confirmed = window.confirm(t.confirmDeleteFolder(label, t.fixedFolderAllNotes));

    if (!confirmed) {
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.folder === folderKey
          ? {
              ...note,
              folder: "all",
              updatedAt: new Date().toISOString()
            }
          : note
      )
    );

    setFolderSettings((current) => ({
      ...current,
      customFolders: current.customFolders.filter((folder) => folder.key !== folderKey),
      hiddenFixedFolders: isFixedFolder(folderKey)
        ? Array.from(new Set([...current.hiddenFixedFolders, folderKey]))
        : current.hiddenFixedFolders
    }));

    if (activeFolder === folderKey) {
      setActiveFolder("all");
    }
  }

  function renameNote(noteId: string, folderKey: FolderKey) {
    const targetNote = notes.find((note) => note.id === noteId);
    if (!targetNote) {
      return;
    }

    setNoteContextMenu(null);
    setSelectedId(noteId);
    setRenamingNoteId(noteId);
    setRenamingSectionKey(folderKey);
    setRenamingNoteTitle(targetNote.title);
  }

  function cancelRenamingNote() {
    setRenamingNoteId(null);
    setRenamingSectionKey(null);
    setRenamingNoteTitle("");
  }

  function commitRenamingNote(noteId: string) {
    const trimmedTitle = renamingNoteTitle.trim();

    if (!trimmedTitle) {
      cancelRenamingNote();
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title: trimmedTitle,
              preview: note.preview || trimmedTitle,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    );

    cancelRenamingNote();
  }

  function togglePinnedNote(noteId: string) {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    );
    setNoteContextMenu(null);
    setIsNoteActionsMenuOpen(false);
    setNoteActionsMenuPosition(null);
  }

  function moveNoteToFolder(noteId: string, folder: FolderKey) {
    const targetNote = notes.find((note) => note.id === noteId);
    if (!targetNote) {
      return;
    }

    if (targetNote.folder === folder) {
      setActiveFolder(folder);
      setNoteContextMenu(null);
      setIsNoteActionsMenuOpen(false);
      setNoteActionsMenuPosition(null);
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              folder,
              updatedAt: new Date().toISOString()
            }
          : note
      )
    );
    setActiveFolder(folder);
    setNoteContextMenu(null);
    setIsNoteActionsMenuOpen(false);
    setNoteActionsMenuPosition(null);
  }

  function clearNoteDrag() {
    setDraggedNoteId(null);
    setDropTargetFolder(null);
  }

  function handleNoteDragStart(event: DragEvent<HTMLButtonElement>, noteId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", noteId);
    setDraggedNoteId(noteId);
    setDropTargetFolder(null);
    setNoteContextMenu(null);
    setFolderContextMenu(null);
  }

  function handleFolderDragOver(event: DragEvent<HTMLElement>, folderKey: FolderKey) {
    if (!draggedNoteId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dropTargetFolder !== folderKey) {
      setDropTargetFolder(folderKey);
    }
  }

  function handleFolderDrop(event: DragEvent<HTMLElement>, folderKey: FolderKey) {
    event.preventDefault();

    const noteId = draggedNoteId ?? event.dataTransfer.getData("text/plain");
    clearNoteDrag();

    if (!noteId) {
      return;
    }

    moveNoteToFolder(noteId, folderKey);
  }

  async function exportSelectedNoteAsMarkdown() {
    if (!selectedNote) {
      return;
    }

    setIsNoteActionsMenuOpen(false);
    const markdown = ["# " + selectedNote.title, noteBodyToMarkdown(selectedNote.body)].filter(Boolean).join("\n\n");

    try {
      if (window.lumina?.notes?.exportMarkdown) {
        await window.lumina.notes.exportMarkdown(selectedNote.title, markdown);
        return;
      }
    } catch (error) {
      console.error("Could not export note as Markdown", error);
    }

    const blob = new Blob(["\uFEFF", markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = selectedNote.title + ".md";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function exportSelectedNoteAsPdf() {
    if (!selectedNote) {
      return;
    }

    setIsNoteActionsMenuOpen(false);

    await new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve(null));
    });

    try {
      if (window.lumina?.notes?.exportPdf) {
        await window.lumina.notes.exportPdf(selectedNote.title, await noteBodyToPdfHtml(selectedNote.body));
        return;
      }
    } catch (error) {
      console.error("Could not export note as PDF", error);
    }

    window.print();
  }

  function deleteNote(noteId: string) {
    const targetNote = notes.find((note) => note.id === noteId);
    if (!targetNote) {
      return;
    }

    const confirmed = window.confirm(t.confirmDeleteNote(targetNote.title));
    setNoteContextMenu(null);
    setIsNoteActionsMenuOpen(false);

    if (!confirmed) {
      return;
    }

    const remainingNotes = notes.filter((note) => note.id !== noteId);

    if (remainingNotes.length === 0) {
      const replacementNote = createNote(0, resolvedLanguage);
      setNotes([replacementNote]);
      setSelectedId(replacementNote.id);
      setActiveFolder("all");
      return;
    }

    setNotes(remainingNotes);
    if (selectedId === noteId) {
      setSelectedId(remainingNotes[0].id);
    }
  }

  function setBlockType(blockType: string) {
    if (!editor) {
      return;
    }

    if (blockType === "heading-1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      return;
    }

    if (blockType === "heading-2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }

    if (blockType === "heading-3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      return;
    }

    if (blockType === "heading-4") {
      editor.chain().focus().toggleHeading({ level: 4 }).run();
      return;
    }

    editor.chain().focus().setParagraph().run();
  }

  function setLink() {
    if (!editor) {
      return;
    }

    const url = linkInput.trim();

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setToolbarMenu(null);
      return;
    }

    const { empty } = editor.state.selection;

    if (empty) {
      editor.chain().focus().insertContent([{ type: "text", text: url, marks: [{ type: "link", attrs: { href: url } }] }]).run();
      setToolbarMenu(null);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setToolbarMenu(null);
  }

  function openLinkMenu() {
    if (!editor) {
      return;
    }

    setLinkInput((editor.getAttributes("link").href as string | undefined) ?? "");
    setToolbarMenu((current) => (current === "link" ? null : "link"));
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkInput("");
    setToolbarMenu(null);
  }

  function openCurrentLink() {
    const href = linkInput.trim() || (editor?.getAttributes("link").href as string | undefined);
    if (!href) {
      return;
    }

    window.open(href, "_blank", "noreferrer");
  }

  function setTextAlignValue(alignment: "left" | "center" | "right") {
    if (!editor) {
      return;
    }

    editor.chain().focus().setTextAlign(alignment).run();
    setToolbarMenu(null);
  }
  function chooseBlockType(blockType: string) {
    setBlockType(blockType);
    setToolbarMenu(null);
  }

  function chooseListType(listType: "bullet" | "ordered" | "task") {
    if (!editor) {
      return;
    }

    if (listType === "bullet") {
      editor.chain().focus().toggleBulletList().run();
    }

    if (listType === "ordered") {
      editor.chain().focus().toggleOrderedList().run();
    }

    if (listType === "task") {
      editor.chain().focus().toggleTaskList().run();
      window.requestAnimationFrame(() => {
        editor.chain().focus().run();
      });
    }

    setToolbarMenu(null);
  }

  function runTableCommand(command: () => void) {
    command();
    setToolbarMenu(null);
  }

  function setHighlightColor(color: string | null) {
    if (!editor) {
      return;
    }

    if (!color) {
      editor.chain().focus().unsetHighlight().run();
      setToolbarMenu(null);
      return;
    }

    editor.chain().focus().toggleHighlight({ color }).run();
    setToolbarMenu(null);
  }

  function pickImageFromDevice() {
    const input = imageInputRef.current;
    if (!input) {
      return Promise.resolve<string | null>(null);
    }

    return new Promise<string | null>((resolve) => {
      let settled = false;

      const cleanup = () => {
        input.value = "";
        input.onchange = null;
        input.oncancel = null;
      };

      const settle = (value: string | null) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        resolve(value);
      };

      input.oncancel = () => {
        settle(null);
      };

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          settle(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => settle(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => settle(null);
        reader.readAsDataURL(file);
      };

      input.click();
    });
  }

  async function addImage() {
    if (!editor) {
      return;
    }

    const selection = {
      from: editor.state.selection.from,
      to: editor.state.selection.to
    };

    const imageSource = await pickImageFromDevice();
    if (!imageSource) {
      return;
    }

    editor.chain().focus().setTextSelection(selection).setImage({ src: imageSource }).run();
  }

  function showSidebarTooltipFor(label: string, button: HTMLElement | null) {
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    setSidebarTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 10
    });
  }

  function hideSidebarTooltip() {
    setSidebarTooltip(null);
  }

  function handleSidebarScroll(event: Event) {
    const target = event.currentTarget as HTMLElement;
    setSidebarScrolled(target.scrollTop > 0);
  }

  return (
    <>
      <div className="window-titlebar" aria-hidden="true">
        <div className="window-titlebar-brand">
          <img className="window-titlebar-icon" src={appIcon} alt="" />
          <img className="window-titlebar-wordmark" src={lophosNotesNaming} alt="Lophos Notes" />
        </div>
      </div>
      <div className={["app-shell", sidebarCollapsed ? "collapsed" : "", workspaceView === "settings" ? "settings-mode" : ""].filter(Boolean).join(" ")}>
      {workspaceView !== "settings" ? (
      <aside className={sidebarCollapsed ? "sidebar collapsed" : "sidebar"}>
        <div className={sidebarCollapsed ? "sidebar-topbar collapsed" : "sidebar-topbar"}>
          <button
            ref={sidebarCollapseRef}
            className="sidebar-collapse"
            aria-label={sidebarCollapsed ? t.sidebarOpen : t.sidebarClose}
            onMouseEnter={(event) => showSidebarTooltipFor(sidebarCollapsed ? t.sidebarOpen : t.sidebarClose, event.currentTarget)}
            onMouseLeave={hideSidebarTooltip}
            onFocus={(event) => showSidebarTooltipFor(sidebarCollapsed ? t.sidebarOpen : t.sidebarClose, event.currentTarget)}
            onBlur={hideSidebarTooltip}
            onClick={() => {
              hideSidebarTooltip();
              setSidebarCollapsed((current) => !current);
            }}
          >
            <LayoutLeft size={18} />
          </button>
          <button className={sidebarCollapsed ? "sidebar-quick-action visible" : "sidebar-quick-action"} aria-label={t.sidebarNewNote} onMouseEnter={(event) => showSidebarTooltipFor(t.sidebarNewNote, event.currentTarget)} onMouseLeave={hideSidebarTooltip} onFocus={(event) => showSidebarTooltipFor(t.sidebarNewNote, event.currentTarget)} onBlur={hideSidebarTooltip} onClick={addNewNote}>
            <Edit05 size={16} />
          </button>
        </div>

        {!sidebarCollapsed ? (
          <>
            <div className="sidebar-main-menu">
              <button className="sidebar-action" onClick={addNewNote}>
                <Edit05 size={16} />
                <span className="sidebar-item-label">{t.sidebarNewNote}</span>
              </button>
              <button className="sidebar-action" onClick={openCreateFolderModal}>
                <Folder size={16} />
                <span className="sidebar-item-label">{t.sidebarNewFolder}</span>
              </button>
              <button className="sidebar-action" onClick={openSearchModal}>
                <SearchMd size={16} />
                <span className="sidebar-item-label">{t.sidebarSearch}</span>
              </button>
            </div>

            <div className="sidebar-divider" />

            <SimpleBar
              className={sidebarScrolled ? "sidebar-disclosure-scroll has-top-fade" : "sidebar-disclosure-scroll"}
              autoHide={false}
              scrollableNodeProps={{ onScroll: handleSidebarScroll }}
            >
              <div className="sidebar-disclosure-list">
                {visibleSections.map((section) => {
                  const sectionNotes = notesForSection(section.key as FolderKey);
                  const expanded = expandedSections[section.key];

                  return (
                    <section
                      key={section.key}
                      className={dropTargetFolder === (section.key as FolderKey) ? "sidebar-section sidebar-section-drop-target" : "sidebar-section"}
                      onDragOver={(event) => handleFolderDragOver(event, section.key as FolderKey)}
                      onDrop={(event) => handleFolderDrop(event, section.key as FolderKey)}
                    >
                      {renamingFolderKey === (section.key as FolderKey) ? (
                        <div
                          className="sidebar-section-trigger renaming"
                          onContextMenu={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                        >
                          <span className="sidebar-section-title">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <input
                              ref={renameInputRef}
                              className="sidebar-section-input"
                              value={renamingFolderLabel}
                              onChange={(event) => setRenamingFolderLabel(event.target.value)}
                              onBlur={cancelRenamingFolder}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  commitRenamingFolder(section.key as FolderKey);
                                }

                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelRenamingFolder();
                                }
                              }}
                              onPointerDown={(event) => event.stopPropagation()}
                            />
                          </span>
                        </div>
                      ) : (
                        <button
                          className="sidebar-section-trigger"
                          onClick={() => {
                            toggleSection(section.key);
                          }}
                          onContextMenu={(event) => {
                            if (section.key === "all") {
                              event.preventDefault();
                              event.stopPropagation();
                              return;
                            }

                            openFolderContextMenu(event, section.key as FolderKey);
                          }}
                        >
                          <span className="sidebar-section-title">
                            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span className="sidebar-section-label">{section.label}</span>
                          </span>
                        </button>
                      )}

                      {expanded ? (
                        <div className="note-tree">
                          {sectionNotes.map((note) => {
                            if (renamingNoteId === note.id && renamingSectionKey === (section.key as FolderKey)) {
                              return (
                                <div
                                  key={note.id}
                                  className={selectedNote?.id === note.id ? "tree-note active renaming" : "tree-note renaming"}
                                  onContextMenu={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                  }}
                                >
                                  <input
                                    ref={renameInputRef}
                                    className="tree-note-input"
                                    value={renamingNoteTitle}
                                    onChange={(event) => setRenamingNoteTitle(event.target.value)}
                                    onBlur={() => commitRenamingNote(note.id)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        commitRenamingNote(note.id);
                                      }

                                      if (event.key === "Escape") {
                                        event.preventDefault();
                                        cancelRenamingNote();
                                      }
                                    }}
                                    onPointerDown={(event) => event.stopPropagation()}
                                  />
                                  {note.pinned ? (
                                    <span className="tree-note-pin" aria-label={t.pinnedNote}>
                                      <PinFilledIcon />
                                    </span>
                                  ) : null}
                                </div>
                              );
                            }

                            return (
                              <button
                                key={note.id}
                                className={[
                                  selectedNote?.id === note.id ? "tree-note active" : "tree-note",
                                  draggedNoteId === note.id ? "dragging" : ""
                                ].filter(Boolean).join(" ")}
                                draggable={renamingNoteId !== note.id}
                                onDragStart={(event) => handleNoteDragStart(event, note.id)}
                                onDragEnd={clearNoteDrag}
                                onClick={() => {
                                  setWorkspaceView("notes");
                                  setActiveFolder(section.key as FolderKey);
                                  setSelectedId(note.id);
                                }}
                                onContextMenu={(event) => openNoteContextMenu(event, note.id, section.key as FolderKey)}
                              >
                                <span className="tree-note-label">{note.title}</span>
                                {note.pinned ? (
                                  <span className="tree-note-pin" aria-label={t.pinnedNote}>
                                    <PinFilledIcon />
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}

                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            </SimpleBar>

            <button className={workspaceView === "settings" ? "sidebar-settings active" : "sidebar-settings"} onClick={() => { setWorkspaceView("settings"); void refreshNotesStorageInfo(); }}>
              <Settings01 size={16} />
              <span className="sidebar-item-label">{t.sidebarSettings}</span>
            </button>
          </>
        ) : null}
      </aside>
      ) : null}

      <main className={workspaceView === "settings" ? "workspace settings-workspace" : "workspace"}>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

        <SimpleBar className="workspace-scroll" autoHide={false} scrollableNodeProps={{ ref: workspaceScrollRef }}>
          {workspaceView === "settings" ? (
            <section className="settings-page">
              <div className="settings-topbar">
                <div className="settings-topbar-inner">
                  <button type="button" className="settings-back-button" aria-label={t.settingsBack} onClick={() => setWorkspaceView("notes")}>
                    <ArrowNarrowLeft size={16} />
                  </button>
                  <h1 className="settings-page-title">{t.settingsTitle}</h1>
                </div>
              </div>

              <div className="settings-surface">
                <div className="settings-panel">
                <section className="settings-row">
                  <div className="settings-row-copy">
                    <h2>{t.settingsLanguageTitle}</h2>
                    <p>{t.settingsLanguageDescription}</p>
                  </div>
                  <div className="settings-row-control">
                    <div className="settings-select-shell" onPointerDown={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className={isLanguageMenuOpen ? "settings-select-trigger open" : "settings-select-trigger"}
                        aria-haspopup="menu"
                        aria-expanded={isLanguageMenuOpen}
                        onClick={() => {
                          const nextOpen = !isLanguageMenuOpen;
                          closeFloatingMenus();
                          setIsLanguageMenuOpen(nextOpen);
                        }}
                      >
                        <span>{selectedLanguageLabel}</span>
                      </button>
                      <ChevronDown size={14} />
                      {isLanguageMenuOpen ? (
                        <div className="settings-select-popover" role="menu" aria-label={t.languageOptionsAria}>
                          {languageOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              role="menuitemradio"
                              aria-checked={appPreferences.language === option.value}
                              className={appPreferences.language === option.value ? "settings-select-option active" : "settings-select-option"}
                              onClick={() => {
                                setAppPreferences((current) => ({ ...current, language: option.value }));
                                setIsLanguageMenuOpen(false);
                              }}
                            >
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="settings-row">
                  <div className="settings-row-copy">
                    <h2>{t.settingsAppearanceTitle}</h2>
                    <p>{t.settingsAppearanceDescription}</p>
                  </div>
                  <div className="settings-row-control">
                    <div className="settings-segmented-control settings-segmented-control-compact">
                      <button type="button" className={appPreferences.appearance === "light" ? "settings-segment active" : "settings-segment"} onClick={() => setAppPreferences((current) => ({ ...current, appearance: "light" }))}><Sun size={14} /><span>{t.appearanceLight}</span></button>
                      <button type="button" className={appPreferences.appearance === "dark" ? "settings-segment active" : "settings-segment"} onClick={() => setAppPreferences((current) => ({ ...current, appearance: "dark" }))}><Moon02 size={14} /><span>{t.appearanceDark}</span></button>
                      <button type="button" className={appPreferences.appearance === "system" ? "settings-segment active" : "settings-segment"} onClick={() => setAppPreferences((current) => ({ ...current, appearance: "system" }))}><Laptop01 size={14} /><span>{t.appearanceSystem}</span></button>
                    </div>
                  </div>
                </section>

                
                <section className="settings-row settings-row-theme">
                  <div className="settings-row-copy">
                    <h2>{t.settingsThemeTitle}</h2>
                    <p>{t.settingsThemeDescription}</p>
                  </div>
                  <div className="settings-row-control">
                    <div className="settings-select-shell" onPointerDown={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className={isThemeMenuOpen ? "settings-select-trigger settings-theme-trigger open" : "settings-select-trigger settings-theme-trigger"}
                        aria-haspopup="menu"
                        aria-expanded={isThemeMenuOpen}
                        onClick={() => {
                          const nextOpen = !isThemeMenuOpen;
                          closeFloatingMenus();
                          setIsThemeMenuOpen(nextOpen);
                        }}
                      >
                        <span className="settings-theme-trigger-content">
                          <span className="settings-theme-swatches" aria-hidden="true">
                            {selectedTheme.swatches.map((swatch) => (
                              <span key={swatch} className="settings-theme-swatch" style={{ background: swatch }} />
                            ))}
                          </span>
                          <span className="settings-theme-label">{selectedTheme.label}</span>
                        </span>
                      </button>
                      <ChevronDown size={14} />
                      {isThemeMenuOpen ? (
                        <div className="settings-select-popover settings-theme-popover" role="menu" aria-label={t.settingsThemeTitle}>
                          {themeOptions.map((themeOption) => (
                            <button
                              key={themeOption.value}
                              type="button"
                              role="menuitemradio"
                              aria-checked={appPreferences.theme === themeOption.value}
                              className={appPreferences.theme === themeOption.value ? "settings-select-option settings-theme-menu-option active" : "settings-select-option settings-theme-menu-option"}
                              onClick={() => {
                                setAppPreferences((current) => ({ ...current, theme: themeOption.value }));
                                setIsThemeMenuOpen(false);
                              }}
                            >
                              <span className="settings-theme-trigger-content">
                                <span className="settings-theme-swatches" aria-hidden="true">
                                  {themeOption.swatches.map((swatch) => (
                                    <span key={swatch} className="settings-theme-swatch" style={{ background: swatch }} />
                                  ))}
                                </span>
                                <span className="settings-theme-label">{themeOption.label}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="settings-row settings-row-theme">
                  <div className="settings-row-copy">
                    <h2>{t.settingsToolbarTitle}</h2>
                    <p>{t.settingsToolbarDescription}</p>
                  </div>
                  <div className="settings-row-control">
                    <div className="settings-toolbar-grid" onPointerDown={(event) => event.stopPropagation()}>
                      {toolbarVisibilityOptions.map((option) => {
                        const checked = appPreferences.toolbarVisibility[option.value];
                        const isOnlyVisibleOption = checked && visibleToolbarGroupsCount === 1;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-label={option.label}
                            title={option.label}
                            disabled={isOnlyVisibleOption}
                            className={checked ? "settings-toolbar-toggle active" : "settings-toolbar-toggle"}
                            onClick={() => toggleToolbarVisibilityPreference(option.value)}
                          >
                            <span className="settings-toolbar-toggle-icon" aria-hidden="true">{option.icon}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="settings-row settings-row-stack">
                  <div className="settings-row-copy">
                    <h2>{t.settingsNotesLocationTitle}</h2>
                    <p>{t.settingsNotesLocationDescription}</p>
                  </div>
                  <div className="settings-storage-controls">
                    <div className="settings-path-field">
                      <code className="settings-path-value">{notesLocationLabel}</code>
                    </div>
                    <div className="settings-actions-row">
                      <button type="button" className="settings-action-button secondary" onClick={() => void openNotesStorageDirectory()} disabled={!canOpenNotesStorageDirectory}>{t.openFolder}</button>
                      <button type="button" className="settings-action-button secondary" onClick={() => void chooseNotesStorageDirectory()} disabled={!canChooseNotesStorageDirectory || isNotesStorageLoading}>{t.browse}</button>
                    </div>
                  </div>
                </section>

                <section className="settings-row settings-row-stack">
                  <div className="settings-row-copy">
                    <h2>{t.settingsDataTitle}</h2>
                    <p>{t.settingsDataDescription}</p>
                  </div>
                  <div className="settings-row-control settings-row-control-end">
                    <div className="settings-actions-row settings-actions-row-end">
                      <button type="button" className="settings-action-button secondary" onClick={() => void exportAppData()}>{t.exportData}</button>
                      <button type="button" className="settings-action-button danger" onClick={openClearDataModal}>{t.clearData}</button>
                    </div>
                  </div>
                </section>

                <section className="settings-row">
                  <div className="settings-row-copy">
                    <h2>{t.settingsVersionTitle}</h2>
                    <p>{t.settingsVersionDescription}</p>
                  </div>
                  <div className="settings-row-control settings-row-control-end">
                    <div className="settings-actions-row settings-actions-row-end">
                        <span className="settings-badge">{t.betaBadge} v{appVersion}</span>
                    </div>
                  </div>
                </section>
                </div>
              </div>
            </section>
          ) : selectedNote ? (
            <section className="editor-surface">
              <nav className="breadcrumb" aria-label={t.breadcrumbAria}>
                <span className="breadcrumb-path">
                  <span className="breadcrumb-folder">{selectedNote ? folderLabel(selectedNote.folder) : t.fixedFolderAllNotes}</span>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-note">{selectedNote?.title ?? t.welcomeNoteFallback}</span>
                </span>
                <div className="note-header-meta">
                  <span className="note-created-at"><Calendar size={14} /><span>{formatCreatedAtLabel(selectedNote.createdAt, resolvedLanguage)}</span></span>
                  <div className="note-header-menu-anchor" onPointerDown={(event) => event.stopPropagation()}>
                    <button
                      ref={noteHeaderMenuButtonRef}
                      type="button"
                      className={isNoteActionsMenuOpen ? "note-header-menu-button active" : "note-header-menu-button"}
                      aria-label={t.noteActionsMore}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (isNoteActionsMenuOpen) {
                          setIsNoteActionsMenuOpen(false);
                          setNoteActionsMenuPosition(null);
                          return;
                        }

                        const buttonRect = noteHeaderMenuButtonRef.current?.getBoundingClientRect();
                        if (!buttonRect) {
                          return;
                        }

                        setIsNoteActionsMenuOpen(true);
                        setNoteActionsMenuPosition({
                          x: Math.max(CONTEXT_MENU_VIEWPORT_GAP, buttonRect.right - 188),
                          y: buttonRect.bottom + 8
                        });
                      }}
                    >
                      <DotsHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </nav>
              <div className="editor-header">
                <textarea
                ref={titleRef}
                className="editor-title"
                value={selectedNote.title}
                onChange={(event) => updateNote({ title: event.target.value })}
                rows={1}
              />


              <div
                className="markdown-toolbar"
                aria-label={t.markdownTools}
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => {
                  if (event.target instanceof HTMLInputElement) {
                    return;
                  }

                  event.preventDefault();
                }}
              >
                {appPreferences.toolbarVisibility.history ? (
                  <div className="toolbar-group">
                    <button type="button" aria-label={t.toolbarUndo} disabled={!historyState.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
                      <ReverseLeft size={16} />
                    </button>
                    <button type="button" aria-label={t.toolbarRedo} disabled={!historyState.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
                      <ReverseRight size={16} />
                    </button>
                  </div>
                ) : null}
                {appPreferences.toolbarVisibility.headings || appPreferences.toolbarVisibility.quote ? (
                  <div className="toolbar-group">
                    {appPreferences.toolbarVisibility.headings ? (
                      <div className="toolbar-menu-shell">
                        <button
                          type="button"
                          className={toolbarMenu === "heading" ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                          aria-label={t.toolbarHeading}
                          aria-expanded={toolbarMenu === "heading"}
                          onClick={() => setToolbarMenu((current) => (current === "heading" ? null : "heading"))}
                        >
                          <Heading01 size={16} />
                          <ChevronDown size={13} />
                        </button>
                        {toolbarMenu === "heading" ? (
                          <div className="toolbar-popover heading-popover">
                            <button type="button" onClick={() => chooseBlockType("heading-1")}>
                              <strong>
                                H<sub>1</sub>
                              </strong>
                              <span>{t.toolbarHeading1}</span>
                            </button>
                            <button type="button" onClick={() => chooseBlockType("heading-2")}>
                              <strong>
                                H<sub>2</sub>
                              </strong>
                              <span>{t.toolbarHeading2}</span>
                            </button>
                            <button type="button" onClick={() => chooseBlockType("heading-3")}>
                              <strong>
                                H<sub>3</sub>
                              </strong>
                              <span>{t.toolbarHeading3}</span>
                            </button>
                            <button type="button" onClick={() => chooseBlockType("heading-4")}>
                              <strong>
                                H<sub>4</sub>
                              </strong>
                              <span>{t.toolbarHeading4}</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {appPreferences.toolbarVisibility.quote ? (
                      <button
                        type="button"
                        className={isEditorActive(editor, "blockquote")}
                        aria-label={t.toolbarQuote}
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                      >
                        <BlockquoteIcon />
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {appPreferences.toolbarVisibility.separator || appPreferences.toolbarVisibility.textAlign ? (
                  <div className="toolbar-group">
                    {appPreferences.toolbarVisibility.separator ? (
                      <button
                        type="button"
                        aria-label={t.toolbarSeparator}
                        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                      >
                        <SeparatorIcon />
                      </button>
                    ) : null}
                    {appPreferences.toolbarVisibility.textAlign ? (
                      <div className="toolbar-menu-shell">
                        <button
                          type="button"
                          className={toolbarMenu === "text-align" ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                          aria-label={t.toolbarTextAlign}
                          aria-expanded={toolbarMenu === "text-align"}
                          onClick={() => setToolbarMenu((current) => (current === "text-align" ? null : "text-align"))}
                        >
                          {currentTextAlign === "center" ? <AlignCenter size={16} /> : currentTextAlign === "right" ? <AlignRight size={16} /> : <AlignLeft size={16} />}
                          <ChevronDown size={13} />
                        </button>
                        {toolbarMenu === "text-align" ? (
                          <div className="toolbar-popover heading-popover">
                            <button type="button" onClick={() => setTextAlignValue("left")}>
                              <AlignLeft size={16} />
                              <span>{t.toolbarAlignLeft}</span>
                            </button>
                            <button type="button" onClick={() => setTextAlignValue("center")}>
                              <AlignCenter size={16} />
                              <span>{t.toolbarAlignCenter}</span>
                            </button>
                            <button type="button" onClick={() => setTextAlignValue("right")}>
                              <AlignRight size={16} />
                              <span>{t.toolbarAlignRight}</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {appPreferences.toolbarVisibility.lists || appPreferences.toolbarVisibility.tables ? (
                  <div className="toolbar-group">
                    {appPreferences.toolbarVisibility.lists ? (
                      <div className="toolbar-menu-shell">
                        <button
                          type="button"
                          className={toolbarMenu === "list" || editor?.isActive("bulletList") || editor?.isActive("orderedList") || editor?.isActive("taskList") ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                          aria-label={t.toolbarList}
                          aria-expanded={toolbarMenu === "list"}
                          onClick={() => setToolbarMenu((current) => (current === "list" ? null : "list"))}
                        >
                          <List size={16} />
                          <ChevronDown size={13} />
                        </button>
                        {toolbarMenu === "list" ? (
                          <div className="toolbar-popover list-popover">
                            <button type="button" onClick={() => chooseListType("bullet")}>
                              <List size={16} />
                              <span>{t.toolbarBulletList}</span>
                            </button>
                            <button type="button" onClick={() => chooseListType("ordered")}>
                              <NumberedListIcon />
                              <span>{t.toolbarOrderedList}</span>
                            </button>
                            <button type="button" onClick={() => chooseListType("task")}>
                              <CheckSquare size={16} />
                              <span>{t.toolbarTaskList}</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {appPreferences.toolbarVisibility.tables ? (
                      <div className="toolbar-menu-shell">
                        <button
                          type="button"
                          className={toolbarMenu === "table" || editor?.isActive("table") ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                          aria-label={t.toolbarTable}
                          aria-expanded={toolbarMenu === "table"}
                          onClick={() => setToolbarMenu((current) => (current === "table" ? null : "table"))}
                        >
                          <LayoutGrid02 size={16} />
                          <ChevronDown size={13} />
                        </button>
                        {toolbarMenu === "table" ? (
                          <div className="toolbar-popover table-popover">
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}>
                              <LayoutGrid02 size={16} />
                              <span>{t.toolbarInsertTable}</span>
                            </button>
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().addRowAfter().run())}>
                              <LayoutGrid02 size={16} />
                              <span>{t.toolbarAddRow}</span>
                            </button>
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().addColumnAfter().run())}>
                              <LayoutGrid02 size={16} />
                              <span>{t.toolbarAddColumn}</span>
                            </button>
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().toggleHeaderRow().run())}>
                              <LayoutGrid02 size={16} />
                              <span>{t.toolbarToggleHeaderRow}</span>
                            </button>
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().deleteRow().run())}>
                              <Trash03 size={16} />
                              <span>{t.toolbarDeleteRow}</span>
                            </button>
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().deleteColumn().run())}>
                              <Trash03 size={16} />
                              <span>{t.toolbarDeleteColumn}</span>
                            </button>
                            <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().deleteTable().run())}>
                              <Trash03 size={16} />
                              <span>{t.toolbarDeleteTable}</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {appPreferences.toolbarVisibility.bold || appPreferences.toolbarVisibility.italic || appPreferences.toolbarVisibility.strikethrough || appPreferences.toolbarVisibility.code || appPreferences.toolbarVisibility.underline || appPreferences.toolbarVisibility.highlight ? (
                  <div className="toolbar-group">
                    {appPreferences.toolbarVisibility.bold || appPreferences.toolbarVisibility.italic || appPreferences.toolbarVisibility.strikethrough || appPreferences.toolbarVisibility.code || appPreferences.toolbarVisibility.underline ? (
                      <>
                        {appPreferences.toolbarVisibility.bold ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "bold")}
                            aria-label={t.toolbarBold}
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                          >
                            <Bold01 size={16} />
                          </button>
                        ) : null}
                        {appPreferences.toolbarVisibility.italic ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "italic")}
                            aria-label={t.toolbarItalic}
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                          >
                            <Italic01 size={16} />
                          </button>
                        ) : null}
                        {appPreferences.toolbarVisibility.strikethrough ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "strike")}
                            aria-label={t.toolbarStrikethrough}
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                          >
                            <Strikethrough01 size={16} />
                          </button>
                        ) : null}
                        {appPreferences.toolbarVisibility.code ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "code")}
                            aria-label={t.toolbarCode}
                            onClick={() => editor?.chain().focus().toggleCode().run()}
                          >
                            <Code01 size={16} />
                          </button>
                        ) : null}
                        {appPreferences.toolbarVisibility.underline ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "underline")}
                            aria-label={t.toolbarUnderline}
                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                          >
                            <Underline01 size={16} />
                          </button>
                        ) : null}
                      </>
                    ) : null}
                    {appPreferences.toolbarVisibility.highlight ? (
                      <div className="toolbar-menu-shell">
                        <button
                          type="button"
                          className={toolbarMenu === "highlight" || editor?.isActive("highlight") ? "active" : ""}
                          aria-label={t.toolbarHighlight}
                          aria-expanded={toolbarMenu === "highlight"}
                          onClick={() => setToolbarMenu((current) => (current === "highlight" ? null : "highlight"))}
                        >
                          <HighlightIcon />
                        </button>
                        {toolbarMenu === "highlight" ? (
                          <div className="toolbar-popover highlight-popover">
                            {highlightColors.map((color) => (
                              <button type="button" key={color.value} aria-label={t[color.key]} onClick={() => setHighlightColor(color.value)}>
                                <span className="highlight-swatch" style={{ backgroundColor: color.value }} />
                              </button>
                            ))}
                            <button type="button" className="highlight-clear" aria-label={t.toolbarClearHighlight} onClick={() => setHighlightColor(null)}>
                              <SlashCircle01 size={19} />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {appPreferences.toolbarVisibility.links || appPreferences.toolbarVisibility.superscript || appPreferences.toolbarVisibility.subscript ? (
                  <div className="toolbar-group">
                    {appPreferences.toolbarVisibility.links ? (
                      <div className="toolbar-menu-shell">
                        <button
                          type="button"
                          className={toolbarMenu === "link" || editor?.isActive("link") ? "active" : ""}
                          aria-label={t.toolbarLink}
                          aria-expanded={toolbarMenu === "link"}
                          onClick={openLinkMenu}
                        >
                          <Link01 size={16} />
                        </button>
                        {toolbarMenu === "link" ? (
                          <form
                            className="toolbar-popover link-popover"
                            onSubmit={(event) => {
                              event.preventDefault();
                              setLink();
                            }}
                          >
                            <input
                              value={linkInput}
                              onChange={(event) => setLinkInput(event.target.value)}
                              placeholder={t.toolbarLinkPlaceholder}
                              autoFocus
                            />
                            <button type="submit" aria-label={t.toolbarApplyLink}>
                              <CornerDownLeft size={16} />
                            </button>
                            <span className="link-popover-divider" aria-hidden="true" />
                            <button type="button" aria-label={t.toolbarOpenLink} onClick={openCurrentLink}>
                              <LinkExternal01 size={16} />
                            </button>
                            <button type="button" aria-label={t.toolbarRemoveLink} onClick={removeLink}>
                              <Trash03 size={16} />
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ) : null}
                    {appPreferences.toolbarVisibility.superscript || appPreferences.toolbarVisibility.subscript ? (
                      <>
                        {appPreferences.toolbarVisibility.superscript ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "superscript")}
                            aria-label={t.toolbarSuperscript}
                            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                          >
                            <SuperscriptIcon />
                          </button>
                        ) : null}
                        {appPreferences.toolbarVisibility.subscript ? (
                          <button
                            type="button"
                            className={isEditorActive(editor, "subscript")}
                            aria-label={t.toolbarSubscript}
                            onClick={() => editor?.chain().focus().toggleSubscript().run()}
                          >
                            <SubscriptIcon />
                          </button>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
                {appPreferences.toolbarVisibility.image ? (
                  <div className="toolbar-group">
                    <button type="button" aria-label={t.toolbarAddImage} onClick={addImage}>
                      <ImagePlus size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

              <div className="editor-body">
                <EditorContent editor={editor} />
              </div>
            </section>
          ) : null}
        </SimpleBar>

        {isNoteActionsMenuOpen && noteActionsMenuPosition && selectedNote ? (
          <div
            className="note-context-menu note-header-menu"
            style={{ left: noteActionsMenuPosition.x, top: noteActionsMenuPosition.y }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button className="note-context-menu-item" onClick={() => void exportSelectedNoteAsPdf()}>
              <FileDownload02 size={16} />
              <span>{t.exportAsPdf}</span>
            </button>
            <button className="note-context-menu-item" onClick={() => void exportSelectedNoteAsMarkdown()}>
              <Code01 size={16} />
              <span>{t.exportAsMarkdown}</span>
            </button>
            <button className="note-context-menu-item" onClick={() => togglePinnedNote(selectedNote.id)}>
              <Pin02 size={16} />
              <span>{selectedNote.pinned ? t.contextUnpinNote : t.contextPinNote}</span>
            </button>
            <div className="note-context-menu-group move-group">
              <button className="note-context-menu-item has-submenu">
                <span className="note-context-menu-item-copy">
                  <Folder size={16} />
                  <span>{t.contextMoveTo}</span>
                </span>
                <ChevronRight size={14} />
              </button>
              <div className="note-context-submenu">
                {visibleSections.map((section) => (
                  <button
                    key={section.key}
                    className="note-context-menu-item"
                    onClick={() => moveNoteToFolder(selectedNote.id, section.key as FolderKey)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="note-context-menu-item danger" onClick={() => deleteNote(selectedNote.id)}>
              <Trash03 size={16} />
              <span>{t.contextDelete}</span>
            </button>
          </div>
        ) : null}

        {noteContextMenu ? (
          <div
            className="note-context-menu"
            style={{ left: noteContextMenu.x, top: noteContextMenu.y }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button className="note-context-menu-item" onClick={() => renameNote(noteContextMenu.noteId, noteContextMenu.folderKey)}>
              <Edit02 size={16} />
              <span>{t.contextRename}</span>
            </button>
            <button className="note-context-menu-item" onClick={() => togglePinnedNote(noteContextMenu.noteId)}>
              <Pin02 size={16} />
              <span>{notes.find((note) => note.id === noteContextMenu.noteId)?.pinned ? t.contextUnpinNote : t.contextPinNote}</span>
            </button>
            <div className="note-context-menu-group move-group">
              <button className="note-context-menu-item has-submenu">
                <span className="note-context-menu-item-copy">
                  <Folder size={16} />
                  <span>{t.contextMoveTo}</span>
                </span>
                <ChevronRight size={14} />
              </button>
              <div className="note-context-submenu">
                {visibleSections.map((section) => (
                  <button
                    key={section.key}
                    className="note-context-menu-item"
                    onClick={() => moveNoteToFolder(noteContextMenu.noteId, section.key as FolderKey)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="note-context-menu-item danger" onClick={() => deleteNote(noteContextMenu.noteId)}>
              <Trash03 size={16} />
              <span>{t.contextDelete}</span>
            </button>
          </div>
        ) : null}

        {sidebarTooltip ? (
          <div className="sidebar-floating-tooltip" style={{ top: sidebarTooltip.top, left: sidebarTooltip.left }}>
            {sidebarTooltip.label}
          </div>
        ) : null}

        {folderContextMenu ? (
          <div
            className="note-context-menu"
            style={{ left: folderContextMenu.x, top: folderContextMenu.y }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {(isCustomFolder(folderContextMenu.folderKey) || folderContextMenu.folderKey === "get-started") ? (
              <button className="note-context-menu-item" onClick={() => addNewNoteToFolder(folderContextMenu.folderKey)}>
                <Edit05 size={16} />
                <span>{t.contextNewNote}</span>
              </button>
            ) : null}
            {canRenameFolder(folderContextMenu.folderKey) ? (
              <button className="note-context-menu-item" onClick={() => renameFolder(folderContextMenu.folderKey)}>
                <Edit02 size={16} />
                <span>{t.contextRenameFolder}</span>
              </button>
            ) : null}
            <button
              className="note-context-menu-item danger"
              disabled={!canDeleteFolder(folderContextMenu.folderKey)}
              onClick={() => deleteFolder(folderContextMenu.folderKey)}
            >
              <Trash03 size={16} />
              <span>{t.contextDeleteFolder}</span>
            </button>
          </div>
        ) : null}

        {(isSearchModalOpen || closingModals.search) ? (
          <div className={closingModals.search ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={closeSearchModal}>
            <div
              className={closingModals.search ? "app-modal search-modal closing" : "app-modal search-modal"}
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-notes-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="search-modal-top">
                <SearchMd size={18} />
                <input
                  ref={searchInputRef}
                  className="search-modal-input"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchAria}
                />
                <button type="button" className="search-modal-close" aria-label={t.searchClose} onClick={closeSearchModal}>
                  <XClose size={18} />
                </button>
              </div>
              <div className="search-modal-results">
                <button type="button" className="search-result search-result-action" onClick={() => {
                  addNewNote();
                  closeSearchModal();
                }}>
                  <Edit05 size={16} />
                  <span>{t.contextNewNote}</span>
                </button>
                {searchResults.length === 0 ? (
                  <div className="search-empty-state">{t.searchNoResults}</div>
                ) : (
                  <div className="search-result-list">
                    {searchResults.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        className="search-result"
                        onClick={() => openSearchResult(note.id, note.folder)}
                      >
                        <span className="search-result-main">
                          <span className="search-result-title">{note.title}</span>
                          <span className="search-result-folder">{folderLabel(note.folder)}</span>
                        </span>
                        <span className="search-result-date">{formatCreatedAtLabel(note.updatedAt, resolvedLanguage)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {(isClearDataModalOpen || closingModals["clear-data"]) ? (
          <div className={closingModals["clear-data"] ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={closeClearDataModal}>
            <div
              className={closingModals["clear-data"] ? "app-modal closing" : "app-modal"}
              role="dialog"
              aria-modal="true"
              aria-labelledby="clear-data-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="app-modal-header">
                <div>
                  <h2 id="clear-data-title">{t.clearDataModalTitle}</h2>
                  <p>{t.clearDataModalDescription}</p>
                </div>
                <button type="button" className="app-modal-close" aria-label={t.modalClose} onClick={closeClearDataModal}>
                  <XClose size={18} />
                </button>
              </div>
              <div className="app-modal-actions">
                <button type="button" className="app-modal-button secondary" onClick={closeClearDataModal}>
                  {t.clearDataModalCancel}
                </button>
                <button type="button" className="app-modal-button danger" onClick={() => void clearAppData()}>
                  {t.clearDataModalConfirm}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {(isCreateFolderModalOpen || closingModals["create-folder"]) ? (
          <div className={closingModals["create-folder"] ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={closeCreateFolderModal}>
            <div
              className={closingModals["create-folder"] ? "app-modal closing" : "app-modal"}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-folder-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="app-modal-header">
                <div>
                  <h2 id="create-folder-title">{t.modalNewFolderTitle}</h2>
                  <p>{t.modalNewFolderDescription}</p>
                </div>
                <button type="button" className="app-modal-close" aria-label={t.modalClose} onClick={closeCreateFolderModal}>
                  <XClose size={18} />
                </button>
              </div>
              <form
                className="app-modal-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  createFolder();
                }}
              >
                <input
                  ref={newFolderInputRef}
                  className="app-modal-input"
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  placeholder={t.folderNamePlaceholder}
                />
                <div className="app-modal-actions">
                  <button type="button" className="app-modal-button secondary" onClick={closeCreateFolderModal}>
                    {t.cancel}
                  </button>
                  <button type="submit" className="app-modal-button primary" disabled={!newFolderName.trim()}>
                    {t.create}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
      </div>
    </>
  );
}



























