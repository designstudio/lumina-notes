import { ChevronDown, ChevronRight, Mic, Plus, Sparkles, Volume2 } from "lucide-react";
import { Edit02, Edit05, Folder, LayoutLeft, Pin02, SearchMd, Settings01, Trash03 } from "@untitledui/icons";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { demoNotes } from "./data";
import { FolderKey, Note } from "./types";

const sections = [
  { key: "work", label: "Morning Pages" },
  { key: "personal", label: "Meetings" },
  { key: "all", label: "All notes" }
] as const;

const storageKey = "lumina-notes-state";

type NoteContextMenuState = {
  noteId: string;
  x: number;
  y: number;
} | null;

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

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return withSortOrder(demoNotes);
    }

    try {
      return withSortOrder(JSON.parse(raw) as Note[]);
    } catch {
      return withSortOrder(demoNotes);
    }
  });
  const [activeFolder, setActiveFolder] = useState<FolderKey>("all");
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? "");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    work: true,
    personal: true,
    all: true
  });
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const [noteContextMenu, setNoteContextMenu] = useState<NoteContextMenuState>(null);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return sortNotes(
      notes.filter((note) => {
        const matchesFolder = noteMatchesFolder(note, activeFolder);
        return matchesFolder;
      })
    );
  }, [activeFolder, notes]);

  const selectedNote = filteredNotes.find((note) => note.id === selectedId) ?? filteredNotes[0] ?? notes[0];

  useEffect(() => {
    if (selectedNote && selectedNote.id !== selectedId) {
      setSelectedId(selectedNote.id);
    }
  }, [selectedId, selectedNote]);

  useEffect(() => {
    const textarea = bodyRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [selectedNote?.body]);

  useEffect(() => {
    const textarea = titleRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [selectedNote?.title]);

  useEffect(() => {
    function handlePointerDown() {
      setNoteContextMenu(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNoteContextMenu(null);
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
    setActiveFolder(folderKey);
    setSelectedId(noteId);
    setNoteContextMenu({
      noteId,
      x: event.clientX,
      y: event.clientY
    });
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
          {sections.map((section) => {
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
              <Mic size={14} />
            </button>
            <button className="chip chip-icon" aria-label="Read aloud">
              <Volume2 size={14} />
            </button>
            <button className="chip chip-icon" aria-label="Magic">
              <Sparkles size={14} />
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

              <div className="editor-body">
                <textarea
                  ref={bodyRef}
                  value={selectedNote.body}
                  onChange={(event) => updateNote({ body: event.target.value })}
                  placeholder="Start writing..."
                />
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
              <span>{notes.find((note) => note.id === noteContextMenu.noteId)?.pinned ? "Desafixar nota" : "Fixar nota"}</span>
            </button>
            <div className="note-context-menu-group move-group">
              <button className="note-context-menu-item has-submenu">
                <span className="note-context-menu-item-copy">
                  <Folder size={16} />
                  <span>Mover para</span>
                </span>
                <ChevronRight size={14} />
              </button>
              <div className="note-context-submenu">
                <button className="note-context-menu-item" onClick={() => moveNoteToFolder(noteContextMenu.noteId, "work")}>
                  Morning Pages
                </button>
                <button className="note-context-menu-item" onClick={() => moveNoteToFolder(noteContextMenu.noteId, "personal")}>
                  Meetings
                </button>
                <button className="note-context-menu-item" onClick={() => moveNoteToFolder(noteContextMenu.noteId, "all")}>
                  All notes
                </button>
              </div>
            </div>
            <button className="note-context-menu-item danger" onClick={() => deleteNote(noteContextMenu.noteId)}>
              <Trash03 size={16} />
              <span>Delete</span>
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
