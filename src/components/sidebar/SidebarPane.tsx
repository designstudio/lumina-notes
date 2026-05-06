import { ChevronDown, ChevronRight, Edit05, Folder, LayoutLeft, SearchMd, Settings01 } from "@untitledui/icons";
import SimpleBar from "simplebar-react";
import { type DragEvent, type RefObject } from "react";
import { type TranslationDictionary } from "../../i18n";
import { type FolderKey, type Note } from "../../types";

type Section = {
  key: string;
  label: string;
};

type SidebarPaneProps = {
  sidebarCollapsed: boolean;
  sidebarScrolled: boolean;
  t: TranslationDictionary;
  sidebarCollapseRef: RefObject<HTMLButtonElement | null>;
  renameInputRef: RefObject<HTMLInputElement | null>;
  visibleSections: Section[];
  notesByFolder: Map<FolderKey, Note[]>;
  expandedSections: Record<string, boolean>;
  selectedNoteId?: string;
  renamingFolderKey: FolderKey | null;
  renamingFolderLabel: string;
  renamingNoteId: string | null;
  renamingSectionKey: FolderKey | null;
  renamingNoteTitle: string;
  draggedNoteId: string | null;
  dropTargetFolder: FolderKey | null;
  onShowSidebarTooltip: (label: string, button: HTMLElement | null) => void;
  onHideSidebarTooltip: () => void;
  onToggleSidebarCollapse: () => void;
  onAddNewNote: () => void;
  onOpenCreateFolderModal: () => void;
  onOpenSearchModal: () => void;
  onToggleSection: (sectionKey: string) => void;
  onOpenFolderContextMenu: (event: React.MouseEvent<HTMLButtonElement>, folderKey: FolderKey) => void;
  onSetRenamingFolderLabel: (value: string) => void;
  onCommitRenamingFolder: (folderKey: FolderKey) => void;
  onCancelRenamingFolder: () => void;
  onHandleFolderDragOver: (event: DragEvent<HTMLElement>, folderKey: FolderKey) => void;
  onHandleFolderDrop: (event: DragEvent<HTMLElement>, folderKey: FolderKey) => void;
  onSetRenamingNoteTitle: (value: string) => void;
  onCommitRenamingNote: (noteId: string) => void;
  onCancelRenamingNote: () => void;
  onHandleNoteDragStart: (event: DragEvent<HTMLButtonElement>, noteId: string) => void;
  onClearNoteDrag: () => void;
  onSelectNote: (noteId: string, folderKey: FolderKey) => void;
  onOpenNoteContextMenu: (event: React.MouseEvent<HTMLButtonElement>, noteId: string, folderKey: FolderKey) => void;
  onHandleSidebarScroll: (event: Event) => void;
  onOpenSettings: () => void;
};

function PinFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13.1028 3.64642C13.4147 2.91872 13.5706 2.55487 13.8226 2.38959C14.0429 2.24506 14.3114 2.19335 14.5697 2.24571C14.865 2.30558 15.145 2.58549 15.7048 3.14532L20.8479 8.28846C21.4077 8.84828 21.6877 9.12819 21.7475 9.42354C21.7999 9.68181 21.7482 9.95031 21.6037 10.1707C21.4384 10.4227 21.0745 10.5786 20.3468 10.8905L17.8525 11.9595C17.7466 12.0048 17.6937 12.0275 17.6441 12.0558C17.6001 12.081 17.558 12.1095 17.5182 12.1411C17.4735 12.1766 17.4328 12.2173 17.3514 12.2987L15.7905 13.8596C15.6632 13.9869 15.5995 14.0506 15.5489 14.1231C15.504 14.1875 15.4668 14.257 15.4382 14.33C15.4059 14.4124 15.3882 14.5006 15.3529 14.6772L14.62 18.3417C14.4296 19.294 14.3343 19.7701 14.0833 19.9929C13.8646 20.1869 13.5719 20.2756 13.2823 20.2354C12.9498 20.1893 12.6064 19.846 11.9197 19.1593L4.83399 12.0735C4.14728 11.3868 3.80392 11.0434 3.75783 10.711C3.71768 10.4214 3.80629 10.1287 4.00036 9.90996C4.22312 9.6589 4.69927 9.56367 5.65158 9.37321L9.31604 8.64032C9.49261 8.60501 9.58089 8.58735 9.66321 8.55506C9.73629 8.5264 9.80573 8.48923 9.87011 8.44433C9.94264 8.39375 10.0063 8.33009 10.1336 8.20276L11.6945 6.64188C11.7759 6.56047 11.8166 6.51977 11.8522 6.47503C11.8837 6.43528 11.9122 6.39319 11.9374 6.34911C11.9657 6.2995 11.9884 6.24659 12.0338 6.14078L13.1028 3.64642Z" fill="currentColor"/>
      <path d="M8.37682 15.6164L2.71997 21.2732M11.6945 6.64188L10.1336 8.20276C10.0063 8.33009 9.94264 8.39375 9.87011 8.44433C9.80573 8.48923 9.73629 8.5264 9.66321 8.55506C9.58089 8.58735 9.49261 8.60501 9.31604 8.64032L5.65158 9.37321C4.69927 9.56367 4.22312 9.6589 4.00036 9.90996C3.80629 10.1287 3.71768 10.4214 3.75783 10.711C3.80392 11.0434 4.14728 11.3868 4.83399 12.0735L11.9197 19.1593C12.6064 19.846 12.9498 20.1893 13.2823 20.2354C13.5719 20.2756 13.8646 20.1869 14.0833 19.9929C14.3343 19.7701 14.4296 19.294 14.62 18.3417L15.3529 14.6772C15.3882 14.5006 15.4059 14.4124 15.4382 14.33C15.4668 14.257 15.504 14.1875 15.5489 14.1231C15.5995 14.0506 15.6632 13.9869 15.7905 13.8596L17.3514 12.2987C17.4328 12.2173 17.4735 12.1766 17.5182 12.1411C17.558 12.1095 17.6001 12.081 17.6441 12.0558C17.6937 12.0275 17.7466 12.0048 17.8525 11.9595L20.3468 10.8905C21.0745 10.5786 21.4384 10.4227 21.6037 10.1707C21.7482 9.95031 21.7999 9.68181 21.7475 9.42354C21.6877 9.12819 21.4077 8.84828 20.8479 8.28846L15.7048 3.14532C15.145 2.58549 14.865 2.30558 14.5697 2.24571C14.3114 2.19335 14.0429 2.24506 13.8226 2.38959C13.5706 2.55487 13.4147 2.91872 13.1028 3.64642L12.0338 6.14078C11.9884 6.24659 11.9657 6.2995 11.9374 6.34911C11.9122 6.39319 11.8837 6.43528 11.8522 6.47503C11.8166 6.51977 11.7759 6.56047 11.6945 6.64188Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function SidebarPane({
  sidebarCollapsed,
  sidebarScrolled,
  t,
  sidebarCollapseRef,
  renameInputRef,
  visibleSections,
  notesByFolder,
  expandedSections,
  selectedNoteId,
  renamingFolderKey,
  renamingFolderLabel,
  renamingNoteId,
  renamingSectionKey,
  renamingNoteTitle,
  draggedNoteId,
  dropTargetFolder,
  onShowSidebarTooltip,
  onHideSidebarTooltip,
  onToggleSidebarCollapse,
  onAddNewNote,
  onOpenCreateFolderModal,
  onOpenSearchModal,
  onToggleSection,
  onOpenFolderContextMenu,
  onSetRenamingFolderLabel,
  onCommitRenamingFolder,
  onCancelRenamingFolder,
  onHandleFolderDragOver,
  onHandleFolderDrop,
  onSetRenamingNoteTitle,
  onCommitRenamingNote,
  onCancelRenamingNote,
  onHandleNoteDragStart,
  onClearNoteDrag,
  onSelectNote,
  onOpenNoteContextMenu,
  onHandleSidebarScroll,
  onOpenSettings
}: SidebarPaneProps) {
  return (
    <aside className={sidebarCollapsed ? "sidebar collapsed" : "sidebar"}>
      <div className={sidebarCollapsed ? "sidebar-topbar collapsed" : "sidebar-topbar"}>
        <button
          ref={sidebarCollapseRef}
          className="sidebar-collapse"
          aria-label={sidebarCollapsed ? t.sidebarOpen : t.sidebarClose}
          onMouseEnter={(event) => onShowSidebarTooltip(sidebarCollapsed ? t.sidebarOpen : t.sidebarClose, event.currentTarget)}
          onMouseLeave={onHideSidebarTooltip}
          onFocus={(event) => onShowSidebarTooltip(sidebarCollapsed ? t.sidebarOpen : t.sidebarClose, event.currentTarget)}
          onBlur={onHideSidebarTooltip}
          onClick={onToggleSidebarCollapse}
        >
          <LayoutLeft size={18} />
        </button>
        <button
          className={sidebarCollapsed ? "sidebar-quick-action visible" : "sidebar-quick-action"}
          aria-label={t.sidebarNewNote}
          onMouseEnter={(event) => onShowSidebarTooltip(t.sidebarNewNote, event.currentTarget)}
          onMouseLeave={onHideSidebarTooltip}
          onFocus={(event) => onShowSidebarTooltip(t.sidebarNewNote, event.currentTarget)}
          onBlur={onHideSidebarTooltip}
          onClick={onAddNewNote}
        >
          <Edit05 size={16} />
        </button>
      </div>

      {!sidebarCollapsed ? (
        <>
          <div className="sidebar-main-menu">
            <button className="sidebar-action" onClick={onAddNewNote}>
              <Edit05 size={16} />
              <span className="sidebar-item-label">{t.sidebarNewNote}</span>
            </button>
            <button className="sidebar-action" onClick={onOpenCreateFolderModal}>
              <Folder size={16} />
              <span className="sidebar-item-label">{t.sidebarNewFolder}</span>
            </button>
            <button className="sidebar-action" onClick={onOpenSearchModal}>
              <SearchMd size={16} />
              <span className="sidebar-item-label">{t.sidebarSearch}</span>
            </button>
          </div>

          <div className="sidebar-divider" />

          <SimpleBar
            className={sidebarScrolled ? "sidebar-disclosure-scroll has-top-fade" : "sidebar-disclosure-scroll"}
            autoHide={false}
            scrollableNodeProps={{ onScroll: onHandleSidebarScroll }}
          >
            <div className="sidebar-disclosure-list">
              {visibleSections.map((section) => {
                const folderKey = section.key as FolderKey;
                const sectionNotes = notesByFolder.get(folderKey) ?? [];
                const expanded = expandedSections[section.key];

                return (
                  <section
                    key={section.key}
                    className={dropTargetFolder === folderKey ? "sidebar-section sidebar-section-drop-target" : "sidebar-section"}
                    onDragOver={(event) => onHandleFolderDragOver(event, folderKey)}
                    onDrop={(event) => onHandleFolderDrop(event, folderKey)}
                  >
                    {renamingFolderKey === folderKey ? (
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
                            onChange={(event) => onSetRenamingFolderLabel(event.target.value)}
                            onBlur={onCancelRenamingFolder}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                onCommitRenamingFolder(folderKey);
                              }

                              if (event.key === "Escape") {
                                event.preventDefault();
                                onCancelRenamingFolder();
                              }
                            }}
                            onPointerDown={(event) => event.stopPropagation()}
                          />
                        </span>
                      </div>
                    ) : (
                      <button
                        className="sidebar-section-trigger"
                        onClick={() => onToggleSection(section.key)}
                        onContextMenu={(event) => {
                          if (section.key === "all") {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                          }

                          onOpenFolderContextMenu(event, folderKey);
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
                          if (renamingNoteId === note.id && renamingSectionKey === folderKey) {
                            return (
                              <div
                                key={note.id}
                                className={selectedNoteId === note.id ? "tree-note active renaming" : "tree-note renaming"}
                                onContextMenu={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                              >
                                <input
                                  ref={renameInputRef}
                                  className="tree-note-input"
                                  value={renamingNoteTitle}
                                  onChange={(event) => onSetRenamingNoteTitle(event.target.value)}
                                  onBlur={() => onCommitRenamingNote(note.id)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      onCommitRenamingNote(note.id);
                                    }

                                    if (event.key === "Escape") {
                                      event.preventDefault();
                                      onCancelRenamingNote();
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
                                selectedNoteId === note.id ? "tree-note active" : "tree-note",
                                draggedNoteId === note.id ? "dragging" : ""
                              ].filter(Boolean).join(" ")}
                              draggable={renamingNoteId !== note.id}
                              onDragStart={(event) => onHandleNoteDragStart(event, note.id)}
                              onDragEnd={onClearNoteDrag}
                              onClick={() => onSelectNote(note.id, folderKey)}
                              onContextMenu={(event) => onOpenNoteContextMenu(event, note.id, folderKey)}
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

          <button className="sidebar-settings" onClick={onOpenSettings}>
            <Settings01 size={16} />
            <span className="sidebar-item-label">{t.sidebarSettings}</span>
          </button>
        </>
      ) : null}
    </aside>
  );
}
