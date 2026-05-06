import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold01,
  Calendar,
  CheckSquare,
  ChevronDown,
  Code01,
  CornerDownLeft,
  DotsHorizontal,
  Heading01,
  ImagePlus,
  Italic01,
  LayoutGrid02,
  Link01,
  LinkExternal01,
  List,
  ReverseLeft,
  ReverseRight,
  SlashCircle01,
  Strikethrough01,
  Trash03,
  Underline01
} from "@untitledui/icons";
import { EditorContent, type Editor } from "@tiptap/react";
import { type Dispatch, type MouseEvent, type RefObject, type SetStateAction } from "react";
import { type ToolbarMenu, type ToolbarVisibilityPreferences } from "../../app-model";
import { type EffectiveLanguage, type TranslationDictionary } from "../../i18n";
import { type Note } from "../../types";

type EditorUiState = {
  canUndo: boolean;
  canRedo: boolean;
  currentTextAlign: "left" | "center" | "right";
  isBlockquote: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isTaskList: boolean;
  isTable: boolean;
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isCode: boolean;
  isUnderline: boolean;
  isHighlight: boolean;
  isLink: boolean;
  isSuperscript: boolean;
  isSubscript: boolean;
};

type NoteEditorPaneProps = {
  selectedNote: Note;
  resolvedLanguage: EffectiveLanguage;
  t: TranslationDictionary;
  toolbarVisibility: ToolbarVisibilityPreferences;
  toolbarMenu: ToolbarMenu;
  linkInput: string;
  editor: Editor | null;
  editorUiState: EditorUiState;
  titleRef: RefObject<HTMLTextAreaElement | null>;
  noteHeaderMenuButtonRef: RefObject<HTMLButtonElement | null>;
  isNoteActionsMenuOpen: boolean;
  folderLabel: (folder: string) => string;
  formatCreatedAtLabel: (createdAt: string, locale: EffectiveLanguage) => string;
  setToolbarMenu: Dispatch<SetStateAction<ToolbarMenu>>;
  onToggleNoteActionsMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onTitleChange: (value: string) => void;
  onLinkInputChange: (value: string) => void;
  chooseBlockType: (blockType: string) => void;
  setTextAlignValue: (alignment: "left" | "center" | "right") => void;
  chooseListType: (listType: "bullet" | "ordered" | "task") => void;
  runTableCommand: (command: () => void) => void;
  setHighlightColor: (color: string | null) => void;
  openLinkMenu: () => void;
  setLink: () => void;
  openCurrentLink: () => void;
  removeLink: () => void;
  addImage: () => void | Promise<void>;
};

const highlightColors = [
  { key: "highlightYellow", value: "#fff2a8" },
  { key: "highlightGreen", value: "#d7f8d1" },
  { key: "highlightBlue", value: "#dbeafe" },
  { key: "highlightPink", value: "#ffe0ef" },
  { key: "highlightPurple", value: "#eadcff" }
] as const;

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
      <path d="M3 19L10 12M10 19L3 12M14.5 7.5L18 4M18 4V8M18 4H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubscriptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 8L10 15M10 8L3 15M14 18H20M20 18V14M20 18L14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NoteEditorPane({
  selectedNote,
  resolvedLanguage,
  t,
  toolbarVisibility,
  toolbarMenu,
  linkInput,
  editor,
  editorUiState,
  titleRef,
  noteHeaderMenuButtonRef,
  isNoteActionsMenuOpen,
  folderLabel,
  formatCreatedAtLabel,
  setToolbarMenu,
  onToggleNoteActionsMenu,
  onTitleChange,
  onLinkInputChange,
  chooseBlockType,
  setTextAlignValue,
  chooseListType,
  runTableCommand,
  setHighlightColor,
  openLinkMenu,
  setLink,
  openCurrentLink,
  removeLink,
  addImage
}: NoteEditorPaneProps) {
  return (
    <section className="editor-surface">
      <nav className="breadcrumb" aria-label={t.breadcrumbAria}>
        <span className="breadcrumb-path">
          <span className="breadcrumb-folder">{folderLabel(selectedNote.folder)}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-note">{selectedNote.title ?? t.welcomeNoteFallback}</span>
        </span>
        <div className="note-header-meta">
          <span className="note-created-at"><Calendar size={14} /><span>{formatCreatedAtLabel(selectedNote.createdAt, resolvedLanguage)}</span></span>
          <div className="note-header-menu-anchor" onPointerDown={(event) => event.stopPropagation()}>
            <button
              ref={noteHeaderMenuButtonRef}
              type="button"
              className={isNoteActionsMenuOpen ? "note-header-menu-button active" : "note-header-menu-button"}
              aria-label={t.noteActionsMore}
              onClick={onToggleNoteActionsMenu}
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
          onChange={(event) => onTitleChange(event.target.value)}
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
          {toolbarVisibility.history ? (
            <div className="toolbar-group">
              <button type="button" aria-label={t.toolbarUndo} disabled={!editorUiState.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
                <ReverseLeft size={16} />
              </button>
              <button type="button" aria-label={t.toolbarRedo} disabled={!editorUiState.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
                <ReverseRight size={16} />
              </button>
            </div>
          ) : null}
          {toolbarVisibility.headings || toolbarVisibility.quote ? (
            <div className="toolbar-group">
              {toolbarVisibility.headings ? (
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
                      <button type="button" onClick={() => chooseBlockType("heading-1")}><strong>H<sub>1</sub></strong><span>{t.toolbarHeading1}</span></button>
                      <button type="button" onClick={() => chooseBlockType("heading-2")}><strong>H<sub>2</sub></strong><span>{t.toolbarHeading2}</span></button>
                      <button type="button" onClick={() => chooseBlockType("heading-3")}><strong>H<sub>3</sub></strong><span>{t.toolbarHeading3}</span></button>
                      <button type="button" onClick={() => chooseBlockType("heading-4")}><strong>H<sub>4</sub></strong><span>{t.toolbarHeading4}</span></button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {toolbarVisibility.quote ? (
                <button type="button" className={editorUiState.isBlockquote ? "active" : ""} aria-label={t.toolbarQuote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
                  <BlockquoteIcon />
                </button>
              ) : null}
            </div>
          ) : null}
          {toolbarVisibility.separator || toolbarVisibility.textAlign ? (
            <div className="toolbar-group">
              {toolbarVisibility.separator ? (
                <button type="button" aria-label={t.toolbarSeparator} onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
                  <SeparatorIcon />
                </button>
              ) : null}
              {toolbarVisibility.textAlign ? (
                <div className="toolbar-menu-shell">
                  <button
                    type="button"
                    className={toolbarMenu === "text-align" ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                    aria-label={t.toolbarTextAlign}
                    aria-expanded={toolbarMenu === "text-align"}
                    onClick={() => setToolbarMenu((current) => (current === "text-align" ? null : "text-align"))}
                  >
                    {editorUiState.currentTextAlign === "center" ? <AlignCenter size={16} /> : editorUiState.currentTextAlign === "right" ? <AlignRight size={16} /> : <AlignLeft size={16} />}
                    <ChevronDown size={13} />
                  </button>
                  {toolbarMenu === "text-align" ? (
                    <div className="toolbar-popover heading-popover">
                      <button type="button" onClick={() => setTextAlignValue("left")}><AlignLeft size={16} /><span>{t.toolbarAlignLeft}</span></button>
                      <button type="button" onClick={() => setTextAlignValue("center")}><AlignCenter size={16} /><span>{t.toolbarAlignCenter}</span></button>
                      <button type="button" onClick={() => setTextAlignValue("right")}><AlignRight size={16} /><span>{t.toolbarAlignRight}</span></button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {toolbarVisibility.lists || toolbarVisibility.tables ? (
            <div className="toolbar-group">
              {toolbarVisibility.lists ? (
                <div className="toolbar-menu-shell">
                  <button
                    type="button"
                    className={toolbarMenu === "list" || editorUiState.isBulletList || editorUiState.isOrderedList || editorUiState.isTaskList ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                    aria-label={t.toolbarList}
                    aria-expanded={toolbarMenu === "list"}
                    onClick={() => setToolbarMenu((current) => (current === "list" ? null : "list"))}
                  >
                    <List size={16} />
                    <ChevronDown size={13} />
                  </button>
                  {toolbarMenu === "list" ? (
                    <div className="toolbar-popover list-popover">
                      <button type="button" onClick={() => chooseListType("bullet")}><List size={16} /><span>{t.toolbarBulletList}</span></button>
                      <button type="button" onClick={() => chooseListType("ordered")}><NumberedListIcon /><span>{t.toolbarOrderedList}</span></button>
                      <button type="button" onClick={() => chooseListType("task")}><CheckSquare size={16} /><span>{t.toolbarTaskList}</span></button>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {toolbarVisibility.tables ? (
                <div className="toolbar-menu-shell">
                  <button
                    type="button"
                    className={toolbarMenu === "table" || editorUiState.isTable ? "toolbar-menu-trigger active" : "toolbar-menu-trigger"}
                    aria-label={t.toolbarTable}
                    aria-expanded={toolbarMenu === "table"}
                    onClick={() => setToolbarMenu((current) => (current === "table" ? null : "table"))}
                  >
                    <LayoutGrid02 size={16} />
                    <ChevronDown size={13} />
                  </button>
                  {toolbarMenu === "table" ? (
                    <div className="toolbar-popover table-popover">
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}><LayoutGrid02 size={16} /><span>{t.toolbarInsertTable}</span></button>
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().addRowAfter().run())}><LayoutGrid02 size={16} /><span>{t.toolbarAddRow}</span></button>
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().addColumnAfter().run())}><LayoutGrid02 size={16} /><span>{t.toolbarAddColumn}</span></button>
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().toggleHeaderRow().run())}><LayoutGrid02 size={16} /><span>{t.toolbarToggleHeaderRow}</span></button>
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().deleteRow().run())}><Trash03 size={16} /><span>{t.toolbarDeleteRow}</span></button>
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().deleteColumn().run())}><Trash03 size={16} /><span>{t.toolbarDeleteColumn}</span></button>
                      <button type="button" onClick={() => runTableCommand(() => editor?.chain().focus().deleteTable().run())}><Trash03 size={16} /><span>{t.toolbarDeleteTable}</span></button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
          {toolbarVisibility.bold || toolbarVisibility.italic || toolbarVisibility.strikethrough || toolbarVisibility.code || toolbarVisibility.underline || toolbarVisibility.highlight ? (
            <div className="toolbar-group">
              {toolbarVisibility.bold || toolbarVisibility.italic || toolbarVisibility.strikethrough || toolbarVisibility.code || toolbarVisibility.underline ? (
                <>
                  {toolbarVisibility.bold ? <button type="button" className={editorUiState.isBold ? "active" : ""} aria-label={t.toolbarBold} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold01 size={16} /></button> : null}
                  {toolbarVisibility.italic ? <button type="button" className={editorUiState.isItalic ? "active" : ""} aria-label={t.toolbarItalic} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic01 size={16} /></button> : null}
                  {toolbarVisibility.strikethrough ? <button type="button" className={editorUiState.isStrike ? "active" : ""} aria-label={t.toolbarStrikethrough} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough01 size={16} /></button> : null}
                  {toolbarVisibility.code ? <button type="button" className={editorUiState.isCode ? "active" : ""} aria-label={t.toolbarCode} onClick={() => editor?.chain().focus().toggleCode().run()}><Code01 size={16} /></button> : null}
                  {toolbarVisibility.underline ? <button type="button" className={editorUiState.isUnderline ? "active" : ""} aria-label={t.toolbarUnderline} onClick={() => editor?.chain().focus().toggleUnderline().run()}><Underline01 size={16} /></button> : null}
                </>
              ) : null}
              {toolbarVisibility.highlight ? (
                <div className="toolbar-menu-shell">
                  <button type="button" className={toolbarMenu === "highlight" || editorUiState.isHighlight ? "active" : ""} aria-label={t.toolbarHighlight} aria-expanded={toolbarMenu === "highlight"} onClick={() => setToolbarMenu((current) => (current === "highlight" ? null : "highlight"))}>
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
          {toolbarVisibility.links || toolbarVisibility.superscript || toolbarVisibility.subscript ? (
            <div className="toolbar-group">
              {toolbarVisibility.links ? (
                <div className="toolbar-menu-shell">
                  <button type="button" className={toolbarMenu === "link" || editorUiState.isLink ? "active" : ""} aria-label={t.toolbarLink} aria-expanded={toolbarMenu === "link"} onClick={openLinkMenu}>
                    <Link01 size={16} />
                  </button>
                  {toolbarMenu === "link" ? (
                    <form className="toolbar-popover link-popover" onSubmit={(event) => { event.preventDefault(); setLink(); }}>
                      <input value={linkInput} onChange={(event) => onLinkInputChange(event.target.value)} placeholder={t.toolbarLinkPlaceholder} autoFocus />
                      <button type="submit" aria-label={t.toolbarApplyLink}><CornerDownLeft size={16} /></button>
                      <span className="link-popover-divider" aria-hidden="true" />
                      <button type="button" aria-label={t.toolbarOpenLink} onClick={openCurrentLink}><LinkExternal01 size={16} /></button>
                      <button type="button" aria-label={t.toolbarRemoveLink} onClick={removeLink}><Trash03 size={16} /></button>
                    </form>
                  ) : null}
                </div>
              ) : null}
              {toolbarVisibility.superscript ? <button type="button" className={editorUiState.isSuperscript ? "active" : ""} aria-label={t.toolbarSuperscript} onClick={() => editor?.chain().focus().toggleSuperscript().run()}><SuperscriptIcon /></button> : null}
              {toolbarVisibility.subscript ? <button type="button" className={editorUiState.isSubscript ? "active" : ""} aria-label={t.toolbarSubscript} onClick={() => editor?.chain().focus().toggleSubscript().run()}><SubscriptIcon /></button> : null}
            </div>
          ) : null}
          {toolbarVisibility.image ? (
            <div className="toolbar-group">
              <button type="button" aria-label={t.toolbarAddImage} onClick={() => void addImage()}>
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
  );
}

