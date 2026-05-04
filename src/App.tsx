import {
  Bold01,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code01,
  CornerDownLeft,
  Edit02,
  Edit05,
  Folder,
  Heading01,
  ImagePlus,
  Italic01,
  LayoutLeft,
  Link01,
  LinkExternal01,
  List,
  MagicWand02,
  Microphone01,
  PenTool02,
  Pin02,
  Plus,
  ReverseLeft,
  ReverseRight,
  SearchMd,
  Settings01,
  SlashCircle01,
  Strikethrough01,
  Trash03,
  Underline01,
  VolumeMax
} from "@untitledui/icons";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import SubscriptExtension from "@tiptap/extension-subscript";
import SuperscriptExtension from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { demoNotes } from "./data";
import { FolderKey, Note } from "./types";

const sections = [
  { key: "get-started", label: "Get Started" },
  { key: "work", label: "Morning Pages" },
  { key: "personal", label: "Meetings" },
  { key: "all", label: "All notes" }
] as const;

const storageKey = "lumina-notes-state";
const folderSettingsKey = "lumina-notes-folder-settings";

type NoteContextMenuState = {
  noteId: string;
  x: number;
  y: number;
} | null;

type FolderContextMenuState = {
  folderKey: FolderKey;
  x: number;
  y: number;
} | null;

type FolderSettings = {
  labels: Partial<Record<FolderKey, string>>;
  hidden: FolderKey[];
};

type ToolbarMenu = "heading" | "list" | "highlight" | "link" | null;

const highlightColors = [
  { label: "Yellow", value: "#fff2a8" },
  { label: "Green", value: "#d7f8d1" },
  { label: "Blue", value: "#dbeafe" },
  { label: "Pink", value: "#ffe0ef" },
  { label: "Purple", value: "#eadcff" }
];

function createNote(sortOrder: number): Note {
  return {
    id: crypto.randomUUID(),
    title: "New Notes",
    preview: "Start writing...",
    body: "",
    folder: "all",
    tags: ["draft"],
    color: "#2fd582",
    updatedAt: "Just now",
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

function BlockquoteIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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

function withSortOrder(notes: Note[]) {
  return notes.map((note, index) => ({
    ...note,
    sortOrder: note.sortOrder ?? index
  }));
}

function sortNotes(notes: Note[]) {
  return [...notes].sort((left, right) => {
    if (Boolean(left.pinned) !== Boolean(right.pinned)) {
      return left.pinned ? -1 : 1;
    }

    return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
  });
}

function notesFromLocalStorage() {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    return ensureDefaultNotes(withSortOrder(JSON.parse(raw) as Note[]));
  } catch {
    return null;
  }
}

function ensureDefaultNotes(notes: Note[]) {
  const defaultNotes = withSortOrder(demoNotes);
  const hasGetStarted = notes.some((note) => note.id === "get-started");

  if (hasGetStarted) {
    return notes;
  }

  return withSortOrder([defaultNotes[0], ...notes]);
}

function folderSettingsFromLocalStorage(): FolderSettings {
  const raw = window.localStorage.getItem(folderSettingsKey);
  if (!raw) {
    return { labels: {}, hidden: [] };
  }

  try {
    const settings = JSON.parse(raw) as Partial<FolderSettings>;
    return {
      labels: settings.labels ?? {},
      hidden: settings.hidden ?? []
    };
  } catch {
    return { labels: {}, hidden: [] };
  }
}

function noteBodyToEditorContent(body: string) {
  if (!body.trim()) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(body)) {
    return body;
  }

  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function isEditorActive(editor: Editor | null, name: string, attributes?: Record<string, unknown>) {
  return editor?.isActive(name, attributes) ? "active" : "";
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
  const [notes, setNotes] = useState<Note[]>(() => notesFromLocalStorage() ?? ensureDefaultNotes(withSortOrder(demoNotes)));
  const [storageReady, setStorageReady] = useState(!window.lumina?.notes);
  const [activeFolder, setActiveFolder] = useState<FolderKey>("get-started");
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toolbarMenu, setToolbarMenu] = useState<ToolbarMenu>(null);
  const [linkInput, setLinkInput] = useState("");
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [folderSettings, setFolderSettings] = useState<FolderSettings>(() => folderSettingsFromLocalStorage());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "get-started": true,
    work: true,
    personal: true,
    all: true
  });
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const [noteContextMenu, setNoteContextMenu] = useState<NoteContextMenuState>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<FolderContextMenuState>(null);
  const selectedNoteRef = useRef<Note | undefined>(undefined);

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

        const nextNotes = storedNotes?.length ? ensureDefaultNotes(withSortOrder(storedNotes)) : notesFromLocalStorage() ?? ensureDefaultNotes(withSortOrder(demoNotes));
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
    if (!storageReady) {
      return;
    }

    if (window.lumina?.notes) {
      void window.lumina.notes.save(notes).catch((error) => {
        console.error("Could not save local notes", error);
      });
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageReady]);

  useEffect(() => {
    window.localStorage.setItem(folderSettingsKey, JSON.stringify(folderSettings));
  }, [folderSettings]);

  const filteredNotes = useMemo(() => {
    return sortNotes(
      notes.filter((note) => {
        const matchesFolder = noteMatchesFolder(note, activeFolder);
        return matchesFolder;
      })
    );
  }, [activeFolder, notes]);

  const visibleSections = useMemo(() => {
    return sections
      .filter((section) => !folderSettings.hidden.includes(section.key as FolderKey))
      .map((section) => ({
        ...section,
        label: folderSettings.labels[section.key as FolderKey] ?? section.label
      }));
  }, [folderSettings]);

  const selectedNote = filteredNotes.find((note) => note.id === selectedId) ?? filteredNotes[0] ?? notes[0];
  selectedNoteRef.current = selectedNote;

  const editor = useEditor({
    extensions: [
      StarterKit,
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
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Image.configure({
        allowBase64: true
      }),
      Highlight.configure({
        multicolor: true
      }),
      Placeholder.configure({
        placeholder: "Start writing..."
      })
    ],
    content: noteBodyToEditorContent(selectedNote?.body ?? ""),
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        "aria-label": "Note body"
      }
    },
    onUpdate: ({ editor: activeEditor }) => {
      const activeNote = selectedNoteRef.current;
      if (!activeNote) {
        return;
      }

      const body = activeEditor.getHTML();
      const preview = activeEditor.getText().split("\n").find(Boolean)?.trim() || activeNote.title.trim() || "Empty note";

      setNotes((current) =>
        current.map((note) =>
          note.id === activeNote.id
            ? {
                ...note,
                body,
                preview,
                updatedAt: "Just now"
              }
            : note
        )
      );
    }
  });

  useEffect(() => {
    if (selectedNote && selectedNote.id !== selectedId) {
      setSelectedId(selectedNote.id);
    }
  }, [selectedId, selectedNote]);

  useEffect(() => {
    const textarea = titleRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [selectedNote?.title]);

  useEffect(() => {
    if (!editor || !selectedNote) {
      return;
    }

    const nextContent = noteBodyToEditorContent(selectedNote.body);
    if (editor.getHTML() === nextContent) {
      return;
    }

    editor.commands.setContent(nextContent, { emitUpdate: false });
  }, [editor, selectedNote?.id]);

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
    function handlePointerDown() {
      setNoteContextMenu(null);
      setFolderContextMenu(null);
      setToolbarMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNoteContextMenu(null);
        setFolderContextMenu(null);
        setToolbarMenu(null);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
              preview: (patch.body ?? note.body).split("\n").find(Boolean) || (patch.title ?? note.title).trim() || "Empty note",
              updatedAt: "Just now"
            }
          : note
      )
    );
  }

  function addNewNote() {
    const nextSortOrder = notes.reduce((highest, note) => Math.max(highest, note.sortOrder ?? 0), -1) + 1;
    const note = createNote(nextSortOrder);
    setNotes((current) => [...current, note]);
    setSelectedId(note.id);
    setActiveFolder("all");
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
    setFolderContextMenu(null);
    setActiveFolder(folderKey);
    setSelectedId(noteId);
    setNoteContextMenu({
      noteId,
      x: event.clientX,
      y: event.clientY
    });
  }

  function openFolderContextMenu(event: MouseEvent<HTMLButtonElement>, folderKey: FolderKey) {
    event.preventDefault();
    event.stopPropagation();
    setNoteContextMenu(null);
    setActiveFolder(folderKey);
    setFolderContextMenu({
      folderKey,
      x: event.clientX,
      y: event.clientY
    });
  }

  function folderLabel(folderKey: FolderKey) {
    return folderSettings.labels[folderKey] ?? sections.find((section) => section.key === folderKey)?.label ?? "Folder";
  }

  function renameFolder(folderKey: FolderKey) {
    const currentLabel = folderLabel(folderKey);
    const nextLabel = window.prompt("Rename folder", currentLabel);
    setFolderContextMenu(null);

    if (!nextLabel) {
      return;
    }

    const trimmedLabel = nextLabel.trim();
    if (!trimmedLabel) {
      return;
    }

    setFolderSettings((current) => ({
      ...current,
      labels: {
        ...current.labels,
        [folderKey]: trimmedLabel
      }
    }));
  }

  function deleteFolder(folderKey: FolderKey) {
    setFolderContextMenu(null);

    if (folderKey === "all") {
      window.alert("All notes cannot be deleted.");
      return;
    }

    const label = folderLabel(folderKey);
    const confirmed = window.confirm(`Delete "${label}"? Notes in this folder will move to All notes.`);

    if (!confirmed) {
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.folder === folderKey
          ? {
              ...note,
              folder: "all",
              updatedAt: "Just now"
            }
          : note
      )
    );

    setFolderSettings((current) => ({
      labels: current.labels,
      hidden: current.hidden.includes(folderKey) ? current.hidden : [...current.hidden, folderKey]
    }));

    if (activeFolder === folderKey) {
      setActiveFolder("all");
    }
  }

  function renameNote(noteId: string) {
    const targetNote = notes.find((note) => note.id === noteId);
    if (!targetNote) {
      return;
    }

    const nextTitle = window.prompt("Rename note", targetNote.title);
    setNoteContextMenu(null);

    if (!nextTitle) {
      return;
    }

    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              title: trimmedTitle,
              preview: note.preview || trimmedTitle,
              updatedAt: "Just now"
            }
          : note
      )
    );
  }

  function togglePinnedNote(noteId: string) {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: "Just now"
            }
          : note
      )
    );
    setNoteContextMenu(null);
  }

  function moveNoteToFolder(noteId: string, folder: FolderKey) {
    setNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              folder,
              updatedAt: "Just now"
            }
          : note
      )
    );
    setActiveFolder(folder);
    setNoteContextMenu(null);
  }

  function deleteNote(noteId: string) {
    const targetNote = notes.find((note) => note.id === noteId);
    if (!targetNote) {
      return;
    }

    const confirmed = window.confirm(`Delete "${targetNote.title}"?`);
    setNoteContextMenu(null);

    if (!confirmed) {
      return;
    }

    const remainingNotes = notes.filter((note) => note.id !== noteId);

    if (remainingNotes.length === 0) {
      const replacementNote = createNote(0);
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

  function addImage() {
    if (!editor) {
      return;
    }

    const url = window.prompt("Image URL");
    if (!url?.trim()) {
      return;
    }

    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  return (
    <div className={sidebarCollapsed ? "app-shell collapsed" : "app-shell"}>
      <aside className={sidebarCollapsed ? "sidebar collapsed" : "sidebar"}>
        <button
          className="sidebar-collapse"
          aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
          onClick={() => setSidebarCollapsed((current) => !current)}
        >
          <LayoutLeft size={18} />
        </button>

        {!sidebarCollapsed ? (
          <>
            <div className="sidebar-main-menu">
              <button className="sidebar-action">
            <Folder size={16} />
            <span>New folder</span>
          </button>
          <button className="sidebar-action" onClick={addNewNote}>
            <Edit05 size={16} />
            <span>New note</span>
          </button>
          <button className="sidebar-action">
            <SearchMd size={16} />
            <span>Search</span>
          </button>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-disclosure-list">
          {visibleSections.map((section) => {
            const sectionNotes = notesForSection(section.key as FolderKey);
            const expanded = expandedSections[section.key];

            return (
              <section key={section.key} className="sidebar-section">
                <button
                  className="sidebar-section-trigger"
                  onClick={() => {
                    setActiveFolder(section.key as FolderKey);
                    toggleSection(section.key);
                  }}
                  onContextMenu={(event) => openFolderContextMenu(event, section.key as FolderKey)}
                >
                  <span className="sidebar-section-title">
                    {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {section.label}
                  </span>
                </button>

                {expanded ? (
                  <div className="note-tree">
                    {sectionNotes.map((note) => (
                      <button
                        key={note.id}
                        className={selectedNote?.id === note.id ? "tree-note active" : "tree-note"}
                        onClick={() => {
                          setActiveFolder(section.key as FolderKey);
                          setSelectedId(note.id);
                        }}
                        onContextMenu={(event) => openNoteContextMenu(event, note.id, section.key as FolderKey)}
                      >
                        <span className="tree-bullet" style={{ backgroundColor: note.color }} />
                        <span className="tree-note-label">{note.title}</span>
                        {note.pinned ? (
                          <span className="tree-note-pin" aria-label="Pinned note">
                            <PinFilledIcon />
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <button className="sidebar-settings">
          <Settings01 size={16} />
          <span>Settings</span>
        </button>
          </>
        ) : null}
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="tabs-row">
            <button className="chip chip-muted">Career Notes</button>
            <button className="chip chip-active">{selectedNote?.title ?? "Welcome"}</button>
            <button className="chip chip-icon" aria-label="Voice">
              <Microphone01 size={14} />
            </button>
            <button className="chip chip-icon" aria-label="Read aloud">
              <VolumeMax size={14} />
            </button>
            <button className="chip chip-icon" aria-label="Magic">
              <MagicWand02 size={14} />
            </button>
            <button className="chip chip-icon" aria-label="New note" onClick={addNewNote}>
              <Plus size={14} />
            </button>
          </div>
        </header>

        <div className="workspace-scroll">
          {selectedNote ? (
            <section className="editor-surface">
              <textarea
                ref={titleRef}
                className="editor-title"
                value={selectedNote.title}
                onChange={(event) => updateNote({ title: event.target.value })}
                rows={1}
              />

              <div className="editor-tags">
                {selectedNote.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
                <button aria-label="Add tag">+</button>
              </div>

              <div
                className="markdown-toolbar"
                aria-label="Markdown tools"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => {
                  if (event.target instanceof HTMLInputElement) {
                    return;
                  }

                  event.preventDefault();
                }}
              >
                <div className="toolbar-group">
                  <button type="button" aria-label="Undo" disabled={!historyState.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
                    <ReverseLeft size={16} />
                  </button>
                  <button type="button" aria-label="Redo" disabled={!historyState.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
                    <ReverseRight size={16} />
                  </button>
                </div>
                <div className="toolbar-group">
                  <div className="toolbar-menu-shell">
                    <button
                      type="button"
                      className={toolbarMenu === "heading" ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                      aria-label="Heading"
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
                          <span>Heading 1</span>
                        </button>
                        <button type="button" onClick={() => chooseBlockType("heading-2")}>
                          <strong>
                            H<sub>2</sub>
                          </strong>
                          <span>Heading 2</span>
                        </button>
                        <button type="button" onClick={() => chooseBlockType("heading-3")}>
                          <strong>
                            H<sub>3</sub>
                          </strong>
                          <span>Heading 3</span>
                        </button>
                        <button type="button" onClick={() => chooseBlockType("heading-4")}>
                          <strong>
                            H<sub>4</sub>
                          </strong>
                          <span>Heading 4</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={isEditorActive(editor, "blockquote")}
                    aria-label="Quote"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  >
                    <BlockquoteIcon />
                  </button>
                </div>
                <div className="toolbar-group">
                  <div className="toolbar-menu-shell">
                    <button
                      type="button"
                      className={toolbarMenu === "list" || editor?.isActive("bulletList") || editor?.isActive("orderedList") || editor?.isActive("taskList") ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                      aria-label="List"
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
                          <span>Bullet List</span>
                        </button>
                        <button type="button" onClick={() => chooseListType("ordered")}>
                          <NumberedListIcon />
                          <span>Ordered List</span>
                        </button>
                        <button type="button" onClick={() => chooseListType("task")}>
                          <CheckSquare size={16} />
                          <span>Task List</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="toolbar-group">
                <button
                  type="button"
                  className={isEditorActive(editor, "bold")}
                  aria-label="Bold"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold01 size={16} />
                </button>
                <button
                  type="button"
                  className={isEditorActive(editor, "italic")}
                  aria-label="Italic"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic01 size={16} />
                </button>
                <button
                  type="button"
                  className={isEditorActive(editor, "strike")}
                  aria-label="Strikethrough"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough01 size={16} />
                </button>
                <button
                  type="button"
                  className={isEditorActive(editor, "code")}
                  aria-label="Code"
                  onClick={() => editor?.chain().focus().toggleCode().run()}
                >
                  <Code01 size={16} />
                </button>
                <button
                  type="button"
                  className={isEditorActive(editor, "underline")}
                  aria-label="Underline"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                >
                  <Underline01 size={16} />
                </button>
                <div className="toolbar-menu-shell">
                  <button
                    type="button"
                    className={toolbarMenu === "highlight" || editor?.isActive("highlight") ? "active" : ""}
                    aria-label="Highlight"
                    aria-expanded={toolbarMenu === "highlight"}
                    onClick={() => setToolbarMenu((current) => (current === "highlight" ? null : "highlight"))}
                  >
                    <PenTool02 size={16} />
                  </button>
                  {toolbarMenu === "highlight" ? (
                    <div className="toolbar-popover highlight-popover">
                      {highlightColors.map((color) => (
                        <button type="button" key={color.value} aria-label={color.label} onClick={() => setHighlightColor(color.value)}>
                          <span className="highlight-swatch" style={{ backgroundColor: color.value }} />
                        </button>
                      ))}
                      <button type="button" className="highlight-clear" aria-label="Clear highlight" onClick={() => setHighlightColor(null)}>
                        <SlashCircle01 size={19} />
                      </button>
                    </div>
                  ) : null}
                </div>
                </div>
                <div className="toolbar-group">
                  <div className="toolbar-menu-shell">
                    <button
                      type="button"
                      className={toolbarMenu === "link" || editor?.isActive("link") ? "active" : ""}
                      aria-label="Link"
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
                          placeholder="Paste a link..."
                          autoFocus
                        />
                        <button type="submit" aria-label="Apply link">
                          <CornerDownLeft size={16} />
                        </button>
                        <span className="link-popover-divider" aria-hidden="true" />
                        <button type="button" aria-label="Open link" onClick={openCurrentLink}>
                          <LinkExternal01 size={16} />
                        </button>
                        <button type="button" aria-label="Remove link" onClick={removeLink}>
                          <Trash03 size={16} />
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={isEditorActive(editor, "superscript")}
                    aria-label="Superscript"
                    onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                  >
                    <SuperscriptIcon />
                  </button>
                  <button
                    type="button"
                    className={isEditorActive(editor, "subscript")}
                    aria-label="Subscript"
                    onClick={() => editor?.chain().focus().toggleSubscript().run()}
                  >
                    <SubscriptIcon />
                  </button>
                </div>
                <div className="toolbar-group">
                  <button type="button" aria-label="Add image" onClick={addImage}>
                    <ImagePlus size={16} />
                  </button>
                </div>
              </div>

              <div className="editor-body">
                <EditorContent editor={editor} />
              </div>
            </section>
          ) : null}
        </div>

        {noteContextMenu ? (
          <div
            className="note-context-menu"
            style={{ left: noteContextMenu.x, top: noteContextMenu.y }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button className="note-context-menu-item" onClick={() => renameNote(noteContextMenu.noteId)}>
              <Edit02 size={16} />
              <span>Rename</span>
            </button>
            <button className="note-context-menu-item" onClick={() => togglePinnedNote(noteContextMenu.noteId)}>
              <Pin02 size={16} />
              <span>{notes.find((note) => note.id === noteContextMenu.noteId)?.pinned ? "Unpin note" : "Pin note"}</span>
            </button>
            <div className="note-context-menu-group move-group">
              <button className="note-context-menu-item has-submenu">
                <span className="note-context-menu-item-copy">
                  <Folder size={16} />
                  <span>Move to</span>
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
              <span>Delete</span>
            </button>
          </div>
        ) : null}

        {folderContextMenu ? (
          <div
            className="note-context-menu"
            style={{ left: folderContextMenu.x, top: folderContextMenu.y }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button className="note-context-menu-item" onClick={() => renameFolder(folderContextMenu.folderKey)}>
              <Edit02 size={16} />
              <span>Rename folder</span>
            </button>
            <button
              className="note-context-menu-item danger"
              disabled={folderContextMenu.folderKey === "all"}
              onClick={() => deleteFolder(folderContextMenu.folderKey)}
            >
              <Trash03 size={16} />
              <span>Delete folder</span>
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
