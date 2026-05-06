import { XClose } from "@untitledui/icons";
import { type TranslationDictionary } from "../../i18n";

type DeleteFolderModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  t: TranslationDictionary;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteFolderModal({
  isOpen,
  isClosing,
  t,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onClose,
  onConfirm
}: DeleteFolderModalProps) {
  if (!isOpen && !isClosing) {
    return null;
  }

  return (
    <div className={isClosing ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={onClose}>
      <div
        className={isClosing ? "app-modal closing" : "app-modal"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-folder-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-modal-header">
          <div>
            <h2 id="delete-folder-title">{title}</h2>
            <p>{description}</p>
          </div>
          <button type="button" className="app-modal-close" aria-label={t.modalClose} onClick={onClose}>
            <XClose size={18} />
          </button>
        </div>
        <div className="app-modal-actions">
          <button type="button" className="app-modal-button secondary" onClick={onClose}>
            {cancelLabel}
          </button>
          <button type="button" className="app-modal-button danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
