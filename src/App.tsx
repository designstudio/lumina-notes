import {
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
  Link01,
  LinkExternal01,
  List,
  Pin02,
  ReverseLeft,
  ReverseRight,
  SlashCircle01,
  Strikethrough01,
  Trash03,
  Underline01,
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
import { lazy, Suspense, type DragEvent, type MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Underline from "@tiptap/extension-underline";
import { useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import {
  applyNoteDraftPatch,
  areNotesEqual,
  defaultAppPreferences,
  defaultExpandedSections,
  defaultFolderSettings,
  defaultToolbarVisibility,
  formatCreatedAtLabel,
  mergeNoteIntoCollection,
  themeOptions,
  toolbarVisibilityFromPartial,
  sortNotes,
  withSortOrder,
  type AppExportData,
  type AppPreferences,
  type AppTheme,
  type CustomFolder,
  type FolderSettings,
  type ModalKey,
  type ToolbarMenu,
  type ToolbarVisibilityKey,
  type ToolbarVisibilityPreferences,
  type UiState,
  type WorkspaceView
} from "./app-model";
import { getDefaultGetStartedNote, getDemoNotes, isDefaultGetStartedNote } from "./data";
import { type EffectiveLanguage, type LanguagePreference, getLanguageOptions, resolveLanguage, translations } from "./i18n";
import { FolderKey, Note } from "./types";
import lophosNotesNaming from "../assets/lophos-notes-naming.svg";
import appIcon from "../assets/icon.png";
import { NoteEditorPane } from "./components/editor/NoteEditorPane";
import { SettingsPage } from "./components/settings/SettingsPage";
import { SidebarPane } from "./components/sidebar/SidebarPane";

const SearchModal = lazy(() => import("./components/modals/SearchModal").then((module) => ({ default: module.SearchModal })));
const ClearDataModal = lazy(() => import("./components/modals/ClearDataModal").then((module) => ({ default: module.ClearDataModal })));
const CreateFolderModal = lazy(() => import("./components/modals/CreateFolderModal").then((module) => ({ default: module.CreateFolderModal })));


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
const AUTOSAVE_DELAY_MS = 350;

type NotesStorageInfo = {
  filePath: string;
  directoryPath: string;
};

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

function BlockquoteIcon() {
  return (
    <svg width="19" height="19" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="m6.2 18 2.35 -4.05c-0.08335 0.01665 -0.175 0.02915 -0.275 0.0375 -0.1 0.00835 -0.19165 0.0125 -0.275 0.0125 -1.1 0 -2.04165 -0.39165 -2.825 -1.175C4.391665 12.04165 4 11.1 4 10s0.391665 -2.04165 1.175 -2.825C5.95835 6.39165 6.9 6 8 6s2.04165 0.39165 2.825 1.175S12 8.9 12 10c0 0.35 -0.04585 0.69315 -0.1375 1.0295 -0.09165 0.3365 -0.22915 0.66 -0.4125 0.9705L8 18h-1.8Zm9 0 2.35 -4.05c-0.08335 0.01665 -0.175 0.02915 -0.275 0.0375 -0.1 0.00835 -0.19165 0.0125 -0.275 0.0125 -1.1 0 -2.04165 -0.39165 -2.825 -1.175S13 11.1 13 10s0.39165 -2.04165 1.175 -2.825S15.9 6 17 6s2.04165 0.39165 2.825 1.175S21 8.9 21 10c0 0.35 -0.04585 0.69315 -0.1375 1.0295 -0.09165 0.3365 -0.22915 0.66 -0.4125 0.9705L17 18h-1.8ZM7.994 12c0.554 0 1.02685 -0.19385 1.4185 -0.5815 0.39165 -0.38785 0.5875 -0.85865 0.5875 -1.4125 0 -0.554 -0.19385 -1.02685 -0.5815 -1.4185 -0.38785 -0.39165 -0.85865 -0.5875 -1.4125 -0.5875 -0.554 0 -1.02685 0.19385 -1.4185 0.5815 -0.39165 0.38785 -0.5875 0.85865 -0.5875 1.4125 0 0.554 0.19385 1.02685 0.5815 1.4185 0.38785 0.39165 0.85865 0.5875 1.4125 0.5875Zm9 0c0.554 0 1.02685 -0.19385 1.4185 -0.5815 0.39165 -0.38785 0.5875 -0.85865 0.5875 -1.4125 0 -0.554 -0.19385 -1.02685 -0.5815 -1.4185 -0.38785 -0.39165 -0.85865 -0.5875 -1.4125 -0.5875 -0.554 0 -1.02685 0.19385 -1.4185 0.5815 -0.39165 0.38785 -0.5875 0.85865 -0.5875 1.4125 0 0.554 0.19385 1.02685 0.5815 1.4185 0.38785 0.39165 0.85865 0.5875 1.4125 0.5875Z" />
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g clipPath="url(#highlight-icon-clip-app)">
        <path d="M23.7806 9.96936C23.711 9.89961 23.6283 9.8443 23.5372 9.80661C23.4461 9.76883 23.3485 9.74942 23.25 9.74942C23.1515 9.74942 23.0539 9.76883 22.9628 9.80661C22.8717 9.8443 22.789 9.89961 22.7194 9.96936L18 14.6897L10.2806 6.96936L10.0603 6.74999L14.7806 2.03062C14.8503 1.96093 14.9056 1.87821 14.9433 1.78716C14.981 1.69612 15.0005 1.59853 15.0005 1.49999C15.0005 1.40144 14.981 1.30386 14.9433 1.21282C14.9056 1.12177 14.8503 1.03904 14.7806 0.969369C14.711 0.899682 14.6282 0.844406 14.5371 0.806695C14.4461 0.768983 14.3485 0.749573 14.25 0.749573C14.1515 0.749573 14.0539 0.768983 13.9628 0.806695C13.8718 0.844406 13.789 0.899682 13.7194 0.969369L8.99999 5.68968C8.77306 5.91665 8.62492 6.21043 8.57733 6.52784C8.52974 6.84526 8.58522 7.16957 8.73562 7.45312L6.74999 9.43967C6.4689 9.72092 6.31101 10.1023 6.31101 10.5C6.31101 10.8977 6.4689 11.279 6.74999 11.5603L7.18968 12L1.71937 17.4694C1.6289 17.5597 1.56305 17.6719 1.52808 17.7949C1.49311 17.9179 1.4902 18.0478 1.5196 18.1723C1.549 18.2968 1.60975 18.4116 1.69608 18.506C1.78241 18.6005 1.89144 18.6711 2.0128 18.7115L8.76281 20.9615C8.83924 20.9872 8.91937 21.0002 8.99999 21C9.09851 21.0001 9.19609 20.9808 9.28713 20.9431C9.37818 20.9055 9.46096 20.8503 9.53062 20.7806L12.75 17.5603L13.1897 18C13.4709 18.281 13.8523 18.439 14.25 18.439C14.6477 18.439 15.0291 18.281 15.3103 18L17.2959 16.0144C17.5796 16.165 17.9041 16.2206 18.2217 16.173C18.5393 16.1255 18.8332 15.9771 19.0603 15.75L23.7806 11.0306C23.8504 10.961 23.9057 10.8783 23.9435 10.7872C23.9812 10.6961 24.0006 10.5985 24.0006 10.5C24.0006 10.4015 23.9812 10.3039 23.9435 10.2128C23.9057 10.1217 23.8504 10.039 23.7806 9.96936ZM8.79749 19.3922L3.64124 17.6719L8.24999 13.0603L11.6897 16.5L8.79749 19.3922ZM14.25 16.9397L13.2806 15.9694L8.78062 11.4694L7.81031 10.5L9.74999 8.56031L16.1897 15L14.25 16.9397Z" fill="currentColor" stroke="currentColor" strokeWidth="0.65" />
      </g>
      <defs><clipPath id="highlight-icon-clip-app"><rect width="24" height="24" fill="white" /></clipPath></defs>
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

function getContextMenuPosition(x: number, y: number, width: number, height: number) {
  return {
    x: Math.min(Math.max(CONTEXT_MENU_VIEWPORT_GAP, x), window.innerWidth - width - CONTEXT_MENU_VIEWPORT_GAP),
    y: Math.min(Math.max(CONTEXT_MENU_VIEWPORT_GAP, y), window.innerHeight - height - CONTEXT_MENU_VIEWPORT_GAP)
  };
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
  const notesRef = useRef(notes);
  const [sidebarScrolled, setSidebarScrolled] = useState(false);
  const [notesStorageInfo, setNotesStorageInfo] = useState<NotesStorageInfo | null>(null);
  const [isNotesStorageLoading, setIsNotesStorageLoading] = useState(Boolean(window.lumina?.notes?.getStorageInfo));
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  const [appVersion, setAppVersion] = useState("0.1.0");
  const [activeNoteDraft, setActiveNoteDraft] = useState<Note | null>(notes[0] ?? null);
  const [isActiveNoteDirty, setIsActiveNoteDirty] = useState(false);
  const selectedNoteRef = useRef<Note | undefined>(undefined);
  const draftNoteRef = useRef<Note | null>(notes[0] ?? null);
  const dirtyDraftRef = useRef(false);
  const previousSelectedIdRef = useRef(selectedId);
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

  const sortedNotes = useMemo(() => sortNotes(notes), [notes]);

  const notesByFolder = useMemo(() => {
    const groupedNotes = new Map<FolderKey, Note[]>();
    groupedNotes.set("all", sortedNotes);

    for (const note of sortedNotes) {
      const bucket = groupedNotes.get(note.folder);
      if (bucket) {
        bucket.push(note);
      } else {
        groupedNotes.set(note.folder, [note]);
      }
    }

    return groupedNotes;
  }, [sortedNotes]);

  const filteredNotes = useMemo(() => {
    return activeFolder === "all" ? sortedNotes : notesByFolder.get(activeFolder) ?? [];
  }, [activeFolder, notesByFolder, sortedNotes]);

  const searchIndex = useMemo(() => {
    if (!isSearchModalOpen) {
      return [];
    }

    return sortedNotes.map((note) => ({
      note,
      haystack: [note.title, note.preview, noteBodyToPlainText(note.body), folderLabel(note.folder)].join(" ").toLowerCase()
    }));
  }, [folderSettings, isSearchModalOpen, sortedNotes, t.fixedFolderAllNotes, t.fixedFolderGetStarted]);

  const searchResults = useMemo(() => {
    if (!isSearchModalOpen) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return sortedNotes;
    }

    return searchIndex.filter((entry) => entry.haystack.includes(query)).map((entry) => entry.note);
  }, [isSearchModalOpen, searchIndex, searchQuery, sortedNotes]);

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

  const selectedNoteSource = filteredNotes.find((note) => note.id === selectedId) ?? filteredNotes[0] ?? notes[0];
  const currentDraftNote = isActiveNoteDirty && draftNoteRef.current?.id === selectedNoteSource?.id
    ? draftNoteRef.current
    : activeNoteDraft;
  const selectedNote = isActiveNoteDirty && currentDraftNote && currentDraftNote.id === selectedNoteSource?.id ? currentDraftNote : selectedNoteSource;
  selectedNoteRef.current = selectedNote;
  notesRef.current = notes;
  draftNoteRef.current = currentDraftNote;
  dirtyDraftRef.current = isActiveNoteDirty;

  function getCurrentSelectedNote() {
    if (dirtyDraftRef.current && draftNoteRef.current) {
      return draftNoteRef.current;
    }

    return selectedNoteRef.current;
  }

  function persistNotes(nextNotes: Note[]) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextNotes));

    if (window.lumina?.notes) {
      void window.lumina.notes.save(nextNotes).catch((error) => {
        console.error("Could not save local notes", error);
      });
    }
  }

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      persistNotes(notes);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notes, storageReady]);

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
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        "aria-label": t.editorBodyAria
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      const activeNote = draftNoteRef.current?.id === selectedNoteRef.current?.id ? draftNoteRef.current : selectedNoteRef.current;
      if (!activeNote) {
        return;
      }

      const nextDraft = applyNoteDraftPatch(activeNote, {
        body: activeEditor.getHTML(),
        preview: activeEditor.getText().split("\n").find(Boolean)?.trim() || activeNote.title.trim() || t.emptyNote
      }, t.emptyNote);

      draftNoteRef.current = nextDraft;
      selectedNoteRef.current = nextDraft;
      setIsActiveNoteDirty(true);
    }
  }, [selectedNote?.id, resolvedLanguage]);

  const editorUiState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return {
          canUndo: false,
          canRedo: false,
          currentTextAlign: "left" as "left" | "center" | "right",
          isBlockquote: false,
          isBulletList: false,
          isOrderedList: false,
          isTaskList: false,
          isTable: false,
          isBold: false,
          isItalic: false,
          isStrike: false,
          isCode: false,
          isUnderline: false,
          isHighlight: false,
          isLink: false,
          isSuperscript: false,
          isSubscript: false
        };
      }

      const headingAttributes = currentEditor.getAttributes("heading") as { textAlign?: string } | undefined;
      const paragraphAttributes = currentEditor.getAttributes("paragraph") as { textAlign?: string } | undefined;

      return {
        canUndo: currentEditor.can().undo(),
        canRedo: currentEditor.can().redo(),
        currentTextAlign: (headingAttributes?.textAlign ?? paragraphAttributes?.textAlign ?? "left") as "left" | "center" | "right",
        isBlockquote: currentEditor.isActive("blockquote"),
        isBulletList: currentEditor.isActive("bulletList"),
        isOrderedList: currentEditor.isActive("orderedList"),
        isTaskList: currentEditor.isActive("taskList"),
        isTable: currentEditor.isActive("table"),
        isBold: currentEditor.isActive("bold"),
        isItalic: currentEditor.isActive("italic"),
        isStrike: currentEditor.isActive("strike"),
        isCode: currentEditor.isActive("code"),
        isUnderline: currentEditor.isActive("underline"),
        isHighlight: currentEditor.isActive("highlight"),
        isLink: currentEditor.isActive("link"),
        isSuperscript: currentEditor.isActive("superscript"),
        isSubscript: currentEditor.isActive("subscript")
      };
    }
  });
  const currentTextAlign = editorUiState.currentTextAlign;

  useEffect(() => {
    if (selectedNote && selectedNote.id !== selectedId) {
      setSelectedId(selectedNote.id);
    }
  }, [selectedId, selectedNote]);

  useEffect(() => {
    const previousSelectedId = previousSelectedIdRef.current;
    if (previousSelectedId !== selectedId && draftNoteRef.current?.id === previousSelectedId && dirtyDraftRef.current) {
      setNotes((current) => mergeNoteIntoCollection(current, draftNoteRef.current));
      setIsActiveNoteDirty(false);
    }

    previousSelectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!selectedNoteSource) {
      setActiveNoteDraft(null);
      draftNoteRef.current = null;
      selectedNoteRef.current = undefined;
      dirtyDraftRef.current = false;
      setIsActiveNoteDirty(false);
      return;
    }

    if (activeNoteDraft?.id !== selectedNoteSource.id) {
      setActiveNoteDraft(selectedNoteSource);
      draftNoteRef.current = selectedNoteSource;
      selectedNoteRef.current = selectedNoteSource;
      dirtyDraftRef.current = false;
      setIsActiveNoteDirty(false);
      return;
    }

    if (!isActiveNoteDirty && !areNotesEqual(activeNoteDraft, selectedNoteSource)) {
      setActiveNoteDraft(selectedNoteSource);
      draftNoteRef.current = selectedNoteSource;
      selectedNoteRef.current = selectedNoteSource;
    }
  }, [activeNoteDraft, isActiveNoteDirty, selectedNoteSource]);

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
    if (!isActiveNoteDirty || !draftNoteRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const pendingDraft = draftNoteRef.current;
      if (!pendingDraft) {
        return;
      }

      setNotes((current) => mergeNoteIntoCollection(current, pendingDraft));
      setActiveNoteDraft(pendingDraft);
      dirtyDraftRef.current = false;
      setIsActiveNoteDirty(false);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isActiveNoteDirty, selectedId]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    const flushPendingDraft = () => {
      const pendingNotes = dirtyDraftRef.current ? mergeNoteIntoCollection(notesRef.current, draftNoteRef.current) : notesRef.current;
      persistNotes(pendingNotes);
    };

    window.addEventListener("beforeunload", flushPendingDraft);

    return () => {
      window.removeEventListener("beforeunload", flushPendingDraft);
      flushPendingDraft();
    };
  }, [storageReady]);

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
    if (!selectedNoteRef.current) {
      return;
    }

    const nextDraft = applyNoteDraftPatch(selectedNoteRef.current, patch, t.emptyNote);
    selectedNoteRef.current = nextDraft;
    draftNoteRef.current = nextDraft;
    setActiveNoteDraft(nextDraft);
    setIsActiveNoteDirty(true);
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
    const note = getCurrentSelectedNote();
    if (!note) {
      return;
    }

    setIsNoteActionsMenuOpen(false);
    const markdown = ["# " + note.title, noteBodyToMarkdown(note.body)].filter(Boolean).join("\n\n");

    try {
      if (window.lumina?.notes?.exportMarkdown) {
        await window.lumina.notes.exportMarkdown(note.title, markdown);
        return;
      }
    } catch (error) {
      console.error("Could not export note as Markdown", error);
    }

    const blob = new Blob(["\uFEFF", markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = note.title + ".md";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function exportSelectedNoteAsPdf() {
    const note = getCurrentSelectedNote();
    if (!note) {
      return;
    }

    setIsNoteActionsMenuOpen(false);

    await new Promise((resolve) => {
      window.requestAnimationFrame(() => resolve(null));
    });

    try {
      if (window.lumina?.notes?.exportPdf) {
        await window.lumina.notes.exportPdf(note.title, await noteBodyToPdfHtml(note.body));
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
      <SidebarPane
        sidebarCollapsed={sidebarCollapsed}
        sidebarScrolled={sidebarScrolled}
        t={t}
        sidebarCollapseRef={sidebarCollapseRef}
        renameInputRef={renameInputRef}
        visibleSections={visibleSections}
        notesByFolder={notesByFolder}
        expandedSections={expandedSections}
        selectedNoteId={selectedNote?.id}
        renamingFolderKey={renamingFolderKey}
        renamingFolderLabel={renamingFolderLabel}
        renamingNoteId={renamingNoteId}
        renamingSectionKey={renamingSectionKey}
        renamingNoteTitle={renamingNoteTitle}
        draggedNoteId={draggedNoteId}
        dropTargetFolder={dropTargetFolder}
        onShowSidebarTooltip={showSidebarTooltipFor}
        onHideSidebarTooltip={hideSidebarTooltip}
        onToggleSidebarCollapse={() => {
          hideSidebarTooltip();
          setSidebarCollapsed((current) => !current);
        }}
        onAddNewNote={addNewNote}
        onOpenCreateFolderModal={openCreateFolderModal}
        onOpenSearchModal={openSearchModal}
        onToggleSection={toggleSection}
        onOpenFolderContextMenu={openFolderContextMenu}
        onSetRenamingFolderLabel={setRenamingFolderLabel}
        onCommitRenamingFolder={commitRenamingFolder}
        onCancelRenamingFolder={cancelRenamingFolder}
        onHandleFolderDragOver={handleFolderDragOver}
        onHandleFolderDrop={handleFolderDrop}
        onSetRenamingNoteTitle={setRenamingNoteTitle}
        onCommitRenamingNote={commitRenamingNote}
        onCancelRenamingNote={cancelRenamingNote}
        onHandleNoteDragStart={handleNoteDragStart}
        onClearNoteDrag={clearNoteDrag}
        onSelectNote={(noteId, folderKey) => {
          setWorkspaceView("notes");
          setActiveFolder(folderKey);
          setSelectedId(noteId);
        }}
        onOpenNoteContextMenu={openNoteContextMenu}
        onHandleSidebarScroll={handleSidebarScroll}
        onOpenSettings={() => {
          setWorkspaceView("settings");
          void refreshNotesStorageInfo();
        }}
      />
      ) : null}

      <main className={workspaceView === "settings" ? "workspace settings-workspace" : "workspace"}>
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

        <SimpleBar className="workspace-scroll" autoHide={false} scrollableNodeProps={{ ref: workspaceScrollRef }}>
          {workspaceView === "settings" ? (
            <SettingsPage
              t={t}
              appVersion={appVersion}
              appPreferences={appPreferences}
              languageOptions={languageOptions}
              selectedLanguageLabel={selectedLanguageLabel}
              isLanguageMenuOpen={isLanguageMenuOpen}
              isThemeMenuOpen={isThemeMenuOpen}
              selectedTheme={selectedTheme}
              themeOptions={themeOptions}
              toolbarVisibilityOptions={toolbarVisibilityOptions}
              visibleToolbarGroupsCount={visibleToolbarGroupsCount}
              notesLocationLabel={notesLocationLabel}
              canOpenNotesStorageDirectory={canOpenNotesStorageDirectory}
              canChooseNotesStorageDirectory={canChooseNotesStorageDirectory}
              isNotesStorageLoading={isNotesStorageLoading}
              onBack={() => setWorkspaceView("notes")}
              closeFloatingMenus={closeFloatingMenus}
              setIsLanguageMenuOpen={setIsLanguageMenuOpen}
              setIsThemeMenuOpen={setIsThemeMenuOpen}
              onLanguageChange={(value) => setAppPreferences((current) => ({ ...current, language: value }))}
              onAppearanceChange={(value) => setAppPreferences((current) => ({ ...current, appearance: value }))}
              onThemeChange={(value) => setAppPreferences((current) => ({ ...current, theme: value }))}
              onToggleToolbarVisibility={toggleToolbarVisibilityPreference}
              onOpenNotesStorageDirectory={openNotesStorageDirectory}
              onChooseNotesStorageDirectory={chooseNotesStorageDirectory}
              onExportAppData={exportAppData}
              onOpenClearDataModal={openClearDataModal}
            />
          ) : selectedNote ? (
            <NoteEditorPane
              selectedNote={selectedNote}
              resolvedLanguage={resolvedLanguage}
              t={t}
              toolbarVisibility={appPreferences.toolbarVisibility}
              toolbarMenu={toolbarMenu}
              linkInput={linkInput}
              editor={editor}
              editorUiState={editorUiState}
              titleRef={titleRef}
              noteHeaderMenuButtonRef={noteHeaderMenuButtonRef}
              isNoteActionsMenuOpen={isNoteActionsMenuOpen}
              folderLabel={folderLabel}
              formatCreatedAtLabel={formatCreatedAtLabel}
              setToolbarMenu={setToolbarMenu}
              onToggleNoteActionsMenu={(event) => {
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
              onTitleChange={(value) => updateNote({ title: value })}
              onLinkInputChange={setLinkInput}
              chooseBlockType={chooseBlockType}
              setTextAlignValue={setTextAlignValue}
              chooseListType={chooseListType}
              runTableCommand={runTableCommand}
              setHighlightColor={setHighlightColor}
              openLinkMenu={openLinkMenu}
              setLink={setLink}
              openCurrentLink={openCurrentLink}
              removeLink={removeLink}
              addImage={addImage}
            />
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

        <Suspense fallback={null}>
          <SearchModal
            isOpen={isSearchModalOpen}
            isClosing={closingModals.search}
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            searchResults={searchResults}
            resolvedLanguage={resolvedLanguage}
            t={t}
            onSearchQueryChange={setSearchQuery}
            onClose={closeSearchModal}
            onAddNote={() => {
              addNewNote();
              closeSearchModal();
            }}
            onOpenResult={openSearchResult}
            folderLabel={folderLabel}
            formatCreatedAtLabel={formatCreatedAtLabel}
          />
          <ClearDataModal
            isOpen={isClearDataModalOpen}
            isClosing={closingModals["clear-data"]}
            t={t}
            onClose={closeClearDataModal}
            onConfirm={() => void clearAppData()}
          />
          <CreateFolderModal
            isOpen={isCreateFolderModalOpen}
            isClosing={closingModals["create-folder"]}
            newFolderInputRef={newFolderInputRef}
            newFolderName={newFolderName}
            t={t}
            onFolderNameChange={setNewFolderName}
            onClose={closeCreateFolderModal}
            onCreate={createFolder}
          />
        </Suspense>
      </main>
      </div>
    </>
  );
}

