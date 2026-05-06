import { XClose } from "@untitledui/icons";
import { type RefObject } from "react";
import { type TranslationDictionary } from "../../i18n";

type CreateFolderModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  newFolderInputRef: RefObject<HTMLInputElement | null>;
  newFolderName: string;
  t: TranslationDictionary;
  onFolderNameChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
};

export function CreateFolderModal({
  isOpen,
  isClosing,
  newFolderInputRef,
  newFolderName,
  t,
  onFolderNameChange,
  onClose,
  onCreate
}: CreateFolderModalProps) {
  if (!isOpen && !isClosing) {
    return null;
  }

  return (
    <div className={isClosing ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={onClose}>
      <div
        className={isClosing ? "app-modal closing" : "app-modal"}
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
          <button type="button" className="app-modal-close" aria-label={t.modalClose} onClick={onClose}>
            <XClose size={18} />
          </button>
        </div>
        <form
          className="app-modal-form"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate();
          }}
        >
          <input
            ref={newFolderInputRef}
            className="app-modal-input"
            value={newFolderName}
            onChange={(event) => onFolderNameChange(event.target.value)}
            placeholder={t.folderNamePlaceholder}
          />
          <div className="app-modal-actions">
            <button type="button" className="app-modal-button secondary" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="app-modal-button primary" disabled={!newFolderName.trim()}>
              {t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
