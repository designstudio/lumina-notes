import { XClose } from "@untitledui/icons";
import { type TranslationDictionary } from "../../i18n";

type ClearDataModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  t: TranslationDictionary;
  onClose: () => void;
  onConfirm: () => void;
};

export function ClearDataModal({ isOpen, isClosing, t, onClose, onConfirm }: ClearDataModalProps) {
  if (!isOpen && !isClosing) {
    return null;
  }

  return (
    <div className={isClosing ? "app-modal-backdrop closing" : "app-modal-backdrop"} onClick={onClose}>
      <div
        className={isClosing ? "app-modal closing" : "app-modal"}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-data-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-modal-header">
          <div>
            <h2 id="clear-data-title">{t.clearDataModalTitle}</h2>
            <p>{t.clearDataModalDescription}</p>
          </div>
          <button type="button" className="app-modal-close" aria-label={t.modalClose} onClick={onClose}>
            <XClose size={18} />
          </button>
        </div>
        <div className="app-modal-actions">
          <button type="button" className="app-modal-button secondary" onClick={onClose}>
            {t.clearDataModalCancel}
          </button>
          <button type="button" className="app-modal-button danger" onClick={onConfirm}>
            {t.clearDataModalConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
