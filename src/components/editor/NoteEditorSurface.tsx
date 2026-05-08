import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import SubscriptExtension from "@tiptap/extension-subscript";
import SuperscriptExtension from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { type Dispatch, type MouseEvent, type RefObject, type SetStateAction, useCallback, useEffect } from "react";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node";
import { type ToolbarMenu, type ToolbarVisibilityPreferences } from "../../app-model";
import { type EffectiveLanguage, type TranslationDictionary } from "../../i18n";
import { type Note } from "../../types";
import { ImageExtension } from "./image-tiptap";
import { NoteEditorPane } from "./NoteEditorPane";
import {
  MAX_TIPTAP_UPLOAD_SIZE,
  areNoteBodiesEquivalent,
  noteBodyToEditorContent,
  uploadImageAsDataUrl
} from "./note-editor-helpers";

type EditorUiState = {
  canUndo: boolean;
  canRedo: boolean;
  isBlockquote: boolean;
  isBulletList: boolean;
  isOrderedList: boolean;
  isTaskList: boolean;
  isTable: boolean;
  isBold: boolean;
  isItalic: boolean;
  isStrike: boolean;
  isCodeBlock: boolean;
  isUnderline: boolean;
  isHighlight: boolean;
  isLink: boolean;
  isSuperscript: boolean;
  isSubscript: boolean;
};

const emptyEditorUiState: EditorUiState = {
  canUndo: false,
  canRedo: false,
  isBlockquote: false,
  isBulletList: false,
  isOrderedList: false,
  isTaskList: false,
  isTable: false,
  isBold: false,
  isItalic: false,
  isStrike: false,
  isCodeBlock: false,
  isUnderline: false,
  isHighlight: false,
  isLink: false,
  isSuperscript: false,
  isSubscript: false
};

type NoteEditorSurfaceProps = {
  selectedNote: Note;
  resolvedLanguage: EffectiveLanguage;
  t: TranslationDictionary;
  toolbarVisibility: ToolbarVisibilityPreferences;
  toolbarMenu: ToolbarMenu;
  storageReady: boolean;
  hasLoadedInitialNotes: boolean;
  titleRef: RefObject<HTMLTextAreaElement | null>;
  noteHeaderMenuButtonRef: RefObject<HTMLButtonElement | null>;
  isNoteActionsMenuOpen: boolean;
  folderLabel: (folder: string) => string;
  formatCreatedAtLabel: (createdAt: string, locale: EffectiveLanguage) => string;
  setToolbarMenu: Dispatch<SetStateAction<ToolbarMenu>>;
  onToggleNoteActionsMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onTitleChange: (value: string) => void;
  onBodyChange: (body: string, preview: string) => void;
};

export function NoteEditorSurface({
  selectedNote,
  resolvedLanguage,
  t,
  toolbarVisibility,
  toolbarMenu,
  storageReady,
  hasLoadedInitialNotes,
  titleRef,
  noteHeaderMenuButtonRef,
  isNoteActionsMenuOpen,
  folderLabel,
  formatCreatedAtLabel,
  setToolbarMenu,
  onToggleNoteActionsMenu,
  onTitleChange,
  onBodyChange
}: NoteEditorSurfaceProps) {
  const handleEditorUpdate = useCallback(({ editor: activeEditor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) => {
    if (activeEditor.isDestroyed || !storageReady || !hasLoadedInitialNotes) {
      return;
    }

    const nextBody = activeEditor.getHTML();
    const nextPreview = activeEditor.getText().split("\n").find(Boolean)?.trim() || selectedNote.title.trim() || t.emptyNote;
    onBodyChange(nextBody, nextPreview);
  }, [hasLoadedInitialNotes, onBodyChange, selectedNote.title, storageReady, t.emptyNote]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false
      }),
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
        openOnClick: false,
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
      ImageExtension.configure({
        allowBase64: true
      }),
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_TIPTAP_UPLOAD_SIZE,
        limit: 1,
        upload: uploadImageAsDataUrl,
        onError: (error) => {
          console.error("Could not upload image", error);
        }
      }),
      HorizontalRule,
      Highlight.configure({
        multicolor: true
      }),
      Placeholder.configure({
        placeholder: t.newNotePreview
      })
    ],
    editable: true,
    content: noteBodyToEditorContent(selectedNote.body),
    editorProps: {
      handleClick(_view, _pos, event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return false;
        }

        const anchor = target.closest("a[href]");
        const href = anchor?.getAttribute("href");
        if (!anchor || !href) {
          return false;
        }

        event.preventDefault();

        if (window.lumina?.system?.openExternal) {
          void window.lumina.system.openExternal(href);
          return true;
        }

        window.open(href, "_blank", "noopener,noreferrer");
        return true;
      },
      attributes: {
        class: "tiptap-editor",
        "aria-label": t.editorBodyAria
      }
    },
    onUpdate: handleEditorUpdate
  }, [selectedNote.id]);

  const editorUiState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor || currentEditor.isDestroyed) {
        return emptyEditorUiState;
      }

      try {
        return {
          canUndo: currentEditor.can().undo(),
          canRedo: currentEditor.can().redo(),
          isBlockquote: currentEditor.isActive("blockquote"),
          isBulletList: currentEditor.isActive("bulletList"),
          isOrderedList: currentEditor.isActive("orderedList"),
          isTaskList: currentEditor.isActive("taskList"),
          isTable: currentEditor.isActive("table"),
          isBold: currentEditor.isActive("bold"),
          isItalic: currentEditor.isActive("italic"),
          isStrike: currentEditor.isActive("strike"),
          isCodeBlock: currentEditor.isActive("codeBlock"),
          isUnderline: currentEditor.isActive("underline"),
          isHighlight: currentEditor.isActive("highlight"),
          isLink: currentEditor.isActive("link"),
          isSuperscript: currentEditor.isActive("superscript"),
          isSubscript: currentEditor.isActive("subscript")
        };
      } catch {
        return emptyEditorUiState;
      }
    }
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    const nextContent = noteBodyToEditorContent(selectedNote.body);
    const currentContent = editor.getHTML();
    if (currentContent === nextContent || areNoteBodiesEquivalent(currentContent, nextContent)) {
      return;
    }

    try {
      editor.chain().setMeta("addToHistory", false).setContent(nextContent, { emitUpdate: false }).run();
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
        editor.chain().setMeta("addToHistory", false).setContent(fallbackContent, { emitUpdate: false }).run();
      } catch (fallbackError) {
        console.error("Could not hydrate fallback editor content", fallbackError);
        editor.chain().setMeta("addToHistory", false).clearContent(false).run();
      }
    }
  }, [editor, selectedNote.body, selectedNote.id]);

  function runTableCommand(command: () => void) {
    command();
    setToolbarMenu(null);
  }

  return (
    <NoteEditorPane
      selectedNote={selectedNote}
      resolvedLanguage={resolvedLanguage}
      t={t}
      toolbarVisibility={toolbarVisibility}
      toolbarMenu={toolbarMenu}
      editor={editor}
      editorUiState={editorUiState}
      titleRef={titleRef}
      noteHeaderMenuButtonRef={noteHeaderMenuButtonRef}
      isNoteActionsMenuOpen={isNoteActionsMenuOpen}
      folderLabel={folderLabel}
      formatCreatedAtLabel={formatCreatedAtLabel}
      setToolbarMenu={setToolbarMenu}
      onToggleNoteActionsMenu={onToggleNoteActionsMenu}
      onTitleChange={onTitleChange}
      runTableCommand={runTableCommand}
    />
  );
}
