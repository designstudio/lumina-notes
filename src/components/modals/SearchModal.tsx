import { Edit05, SearchMd, XClose } from "@untitledui/icons";
import { type RefObject } from "react";
import { type EffectiveLanguage, type TranslationDictionary } from "../../i18n";
import { type Note } from "../../types";

type SearchModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  searchQuery: string;
  searchResults: Note[];
  resolvedLanguage: EffectiveLanguage;
  t: TranslationDictionary;
  onSearchQueryChange: (value: string) => void;
  onClose: () => void;
  onAddNote: () => void;
  onOpenResult: (noteId: string, folder: string) => void;
  folderLabel: (folder: string) => string;
  formatCreatedAtLabel: (createdAt: string, locale: EffectiveLanguage) => string;
};

export function SearchModal({
  isOpen,
  isClosing,
  searchInputRef,
  searchQuery,
  searchResults,
  resolvedLanguage,
  t,
  onSearchQueryChange,
  onClose,
  onAddNote,
  onOpenResult,
  folderLabel,
  formatCreatedAtLabel
}: SearchModalProps) {
  if (!isOpen && !isClosing) {
    return null;
  }

  return (
    <div className={isClosing ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={onClose}>
      <div
        className={isClosing ? "app-modal search-modal closing" : "app-modal search-modal"}
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
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAria}
          />
          <button type="button" className="search-modal-close" aria-label={t.searchClose} onClick={onClose}>
            <XClose size={18} />
          </button>
        </div>
        <div className="search-modal-results">
          <button type="button" className="search-result search-result-action" onClick={onAddNote}>
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
                  onClick={() => onOpenResult(note.id, note.folder)}
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
  );
}
