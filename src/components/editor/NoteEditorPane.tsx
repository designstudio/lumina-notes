import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold01,
  Calendar,
  ChevronDown,
  Code01,
  DotsHorizontal,
  Italic01,
  LayoutGrid02,
  Strikethrough01,
  Trash03,
  Underline01
} from "@untitledui/icons";
import { EditorContent, type Editor } from "@tiptap/react";
import { useRef, useState, type Dispatch, type MouseEvent, type PointerEvent as ReactPointerEvent, type RefObject, type SetStateAction } from "react";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { ImageAligner } from "./image-tiptap";
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
  runTableCommand: (command: () => void) => void;
};

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

function BlockquoteIcon() {
  return (
    <svg className="tiptap-button-icon blockquote-toolbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="m6.2 18 2.35-4.05c-.08335.01665-.175.02915-.275.0375-.1.00835-.19165.0125-.275.0125-1.1 0-2.04165-.39165-2.825-1.175C4.391665 12.04165 4 11.1 4 10s.391665-2.04165 1.175-2.825C5.95835 6.39165 6.9 6 8 6s2.04165.39165 2.825 1.175S12 8.9 12 10c0 .35-.04585.69315-.1375 1.0295-.09165.3365-.22915.66-.4125.9705L8 18H6.2Zm9 0 2.35-4.05c-.08335.01665-.175.02915-.275.0375-.1.00835-.19165.0125-.275.0125-1.1 0-2.04165-.39165-2.825-1.175S13 11.1 13 10s.39165-2.04165 1.175-2.825S15.9 6 17 6s2.04165.39165 2.825 1.175S21 8.9 21 10c0 .35-.04585.69315-.1375 1.0295-.09165.3365-.22915.66-.4125.9705L17 18h-1.8ZM7.994 12c.554 0 1.02685-.19385 1.4185-.5815.39165-.38785.5875-.85865.5875-1.4125 0-.554-.19385-1.02685-.5815-1.4185C9.03115 8.19585 8.56035 8 8.006 8c-.554 0-1.02685.19385-1.4185.5815C6.19585 8.96935 6 9.44015 6 9.994c0 .554.19385 1.02685.5815 1.4185.38785.39165.85865.5875 1.4125.5875Zm9 0c.554 0 1.02685-.19385 1.4185-.5815.39165-.38785.5875-.85865.5875-1.4125 0-.554-.19385-1.02685-.5815-1.4185C18.03115 8.19585 17.56035 8 17.006 8c-.554 0-1.02685.19385-1.4185.5815C15.19585 8.96935 15 9.44015 15 9.994c0 .554.19385 1.02685.5815 1.4185.38785.39165.85865.5875 1.4125.5875Z"
      />
    </svg>
  );
}

export function NoteEditorPane({
  selectedNote,
  resolvedLanguage,
  t,
  toolbarVisibility,
  toolbarMenu,
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
  runTableCommand
}: NoteEditorPaneProps) {
  const toolbarScrollRef = useRef<HTMLDivElement | null>(null);
  const toolbarDragStateRef = useRef<{ pointerId: number; startX: number; startScrollLeft: number; moved: boolean } | null>(null);
  const toolbarSuppressClickRef = useRef(false);
  const [toolbarTooltip, setToolbarTooltip] = useState<{ label: string; x: number; y: number } | null>(null);

  function handleToolbarPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const container = toolbarScrollRef.current;
    if (!container || event.pointerType === "touch" || event.button !== 0 || container.scrollWidth <= container.clientWidth + 2) {
      return;
    }

    toolbarSuppressClickRef.current = false;
    toolbarDragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      moved: false
    };

    setToolbarTooltip(null);
    container.setPointerCapture(event.pointerId);
    container.classList.add("dragging");
  }

  function handleToolbarPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const container = toolbarScrollRef.current;
    const dragState = toolbarDragStateRef.current;
    if (!container || !dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    if (Math.abs(deltaX) > 3) {
      dragState.moved = true;
      toolbarSuppressClickRef.current = true;
      setToolbarTooltip(null);
    }

    container.scrollLeft = dragState.startScrollLeft - deltaX;
  }

  function endToolbarPointerDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const container = toolbarScrollRef.current;
    const dragState = toolbarDragStateRef.current;
    if (!container || !dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }

    container.classList.remove("dragging");
    toolbarDragStateRef.current = null;
  }

  function handleToolbarClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (toolbarSuppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      toolbarSuppressClickRef.current = false;
    }
  }

  function handleToolbarMouseMove(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[aria-label]");
    if (!button || button.disabled) {
      setToolbarTooltip(null);
      return;
    }

    const label = button.getAttribute("aria-label");
    if (!label) {
      setToolbarTooltip(null);
      return;
    }

    const rect = button.getBoundingClientRect();
    setToolbarTooltip({
      label,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  }

  function hideToolbarTooltip() {
    setToolbarTooltip(null);
  }

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
          ref={toolbarScrollRef}
          className="markdown-toolbar-scroll"
          onPointerDown={handleToolbarPointerDown}
          onPointerMove={handleToolbarPointerMove}
          onPointerUp={endToolbarPointerDrag}
          onPointerCancel={endToolbarPointerDrag}
          onClickCapture={handleToolbarClickCapture}
          onMouseMove={handleToolbarMouseMove}
          onMouseLeave={hideToolbarTooltip}
        >
          <div
            className="markdown-toolbar"
            aria-label={t.markdownTools}
          >
          {toolbarVisibility.history ? (
            <div className="toolbar-group">
              <UndoRedoButton editor={editor} action="undo" hideWhenUnavailable={false} showTooltip={false} aria-label={t.toolbarUndo} tooltip={t.toolbarUndo} />
              <UndoRedoButton editor={editor} action="redo" hideWhenUnavailable={false} showTooltip={false} aria-label={t.toolbarRedo} tooltip={t.toolbarRedo} />
            </div>
          ) : null}
          {toolbarVisibility.headings || toolbarVisibility.quote ? (
            <div className="toolbar-group">
              {toolbarVisibility.headings ? (
                <HeadingDropdownMenu
                  editor={editor}
                  levels={[1, 2, 3, 4]}
                  hideWhenUnavailable={false}
                  modal={false}
                  showTooltip={false}
                  aria-label={t.toolbarHeading}
                  tooltip={t.toolbarHeading}
                />
              ) : null}
              {toolbarVisibility.quote ? (
                <BlockquoteButton editor={editor} hideWhenUnavailable={false} showTooltip={false} aria-label={t.toolbarQuote} tooltip={t.toolbarQuote}>
                  <BlockquoteIcon />
                </BlockquoteButton>
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
                <>
                  <TextAlignButton editor={editor} align="left" hideWhenUnavailable={false} showTooltip={false} aria-label={t.toolbarAlignLeft} tooltip={t.toolbarAlignLeft} />
                  <TextAlignButton editor={editor} align="center" hideWhenUnavailable={false} showTooltip={false} aria-label={t.toolbarAlignCenter} tooltip={t.toolbarAlignCenter} />
                  <TextAlignButton editor={editor} align="right" hideWhenUnavailable={false} showTooltip={false} aria-label={t.toolbarAlignRight} tooltip={t.toolbarAlignRight} />
                </>
              ) : null}
            </div>
          ) : null}
          {toolbarVisibility.lists || toolbarVisibility.tables ? (
            <div className="toolbar-group">
              {toolbarVisibility.lists ? (
                <ListDropdownMenu
                  editor={editor}
                  types={["bulletList", "orderedList", "taskList"]}
                  hideWhenUnavailable={false}
                  modal={false}
                  showTooltip={false}
                  aria-label={t.toolbarList}
                  tooltip={t.toolbarList}
                />
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
                <ColorHighlightPopover
                  editor={editor}
                  hideWhenUnavailable={false}
                  showTooltip={false}
                  aria-label={t.toolbarHighlight}
                  tooltip={t.toolbarHighlight}
                />
              ) : null}
            </div>
          ) : null}
          {toolbarVisibility.links || toolbarVisibility.superscript || toolbarVisibility.subscript ? (
            <div className="toolbar-group">
              {toolbarVisibility.links ? (
                <LinkPopover editor={editor} hideWhenUnavailable={false} autoOpenOnLinkActive={false} showTooltip={false} aria-label={t.toolbarLink} tooltip={t.toolbarLink} />
              ) : null}
              {toolbarVisibility.superscript ? <button type="button" className={editorUiState.isSuperscript ? "active" : ""} aria-label={t.toolbarSuperscript} onClick={() => editor?.chain().focus().toggleSuperscript().run()}><SuperscriptIcon /></button> : null}
              {toolbarVisibility.subscript ? <button type="button" className={editorUiState.isSubscript ? "active" : ""} aria-label={t.toolbarSubscript} onClick={() => editor?.chain().focus().toggleSubscript().run()}><SubscriptIcon /></button> : null}
            </div>
          ) : null}
          {toolbarVisibility.image ? (
            <div className="toolbar-group">
              <ImageUploadButton
                editor={editor}
                hideWhenUnavailable={false}
                showTooltip={false}
                aria-label={t.toolbarAddImage}
                tooltip={t.toolbarAddImage}
              />
            </div>
          ) : null}
          </div>
        </div>
      </div>

      {toolbarTooltip ? (
        <div className="toolbar-floating-tooltip" style={{ left: toolbarTooltip.x, top: toolbarTooltip.y }}>
          {toolbarTooltip.label}
        </div>
      ) : null}

      <div className="editor-body">
        <ImageAligner.Root editor={editor}>
          <ImageAligner.AlignMenu>
            <ImageAligner.Items className="image-aligner-menu">
              <ImageAligner.Item alignment="left" className="image-aligner-button" aria-label={resolvedLanguage === "pt-BR" ? "Alinhar imagem à esquerda" : "Align image left"}>
                <AlignLeft size={16} />
              </ImageAligner.Item>
              <ImageAligner.Item alignment="center" className="image-aligner-button" aria-label={resolvedLanguage === "pt-BR" ? "Centralizar imagem" : "Center image"}>
                <AlignCenter size={16} />
              </ImageAligner.Item>
              <ImageAligner.Item alignment="right" className="image-aligner-button" aria-label={resolvedLanguage === "pt-BR" ? "Alinhar imagem à direita" : "Align image right"}>
                <AlignRight size={16} />
              </ImageAligner.Item>
            </ImageAligner.Items>
          </ImageAligner.AlignMenu>
          <EditorContent editor={editor} />
        </ImageAligner.Root>
      </div>
    </section>
  );
}










