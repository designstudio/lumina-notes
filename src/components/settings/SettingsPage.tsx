import { ArrowNarrowLeft, ChevronDown, Laptop01, Moon02, Sun } from "@untitledui/icons";
import { type ReactNode } from "react";
import { type AppPreferences, type AppTheme, type NoteLayoutSize, type ThemeOption, type ToolbarVisibilityKey } from "../../app-model";
import { type LanguagePreference, type TranslationDictionary } from "../../i18n";

type LanguageOption = { value: LanguagePreference; label: string };
type ToolbarVisibilityOption = { value: ToolbarVisibilityKey; label: string; icon: ReactNode };
type NoteLayoutOption = { value: NoteLayoutSize; label: string };

type SettingsPageProps = {
  t: TranslationDictionary;
  appVersion: string;
  appPreferences: AppPreferences;
  languageOptions: LanguageOption[];
  selectedLanguageLabel: string;
  selectedNoteLayoutLabel: string;
  isLanguageMenuOpen: boolean;
  isThemeMenuOpen: boolean;
  isLayoutMenuOpen: boolean;
  selectedTheme: ThemeOption;
  themeOptions: ThemeOption[];
  noteLayoutOptions: NoteLayoutOption[];
  toolbarVisibilityOptions: ToolbarVisibilityOption[];
  visibleToolbarGroupsCount: number;
  notesLocationLabel: string;
  canOpenNotesStorageDirectory: boolean;
  canChooseNotesStorageDirectory: boolean;
  isNotesStorageLoading: boolean;
  onBack: () => void;
  closeFloatingMenus: () => void;
  setIsLanguageMenuOpen: (open: boolean) => void;
  setIsThemeMenuOpen: (open: boolean) => void;
  setIsLayoutMenuOpen: (open: boolean) => void;
  onLanguageChange: (value: LanguagePreference) => void;
  onAppearanceChange: (value: "light" | "dark" | "system") => void;
  onThemeChange: (value: AppTheme) => void;
  onNoteLayoutChange: (value: NoteLayoutSize) => void;
  onToggleToolbarVisibility: (value: ToolbarVisibilityKey) => void;
  onOpenNotesStorageDirectory: () => void | Promise<void>;
  onChooseNotesStorageDirectory: () => void | Promise<void>;
  onExportAppData: () => void | Promise<void>;
  onOpenClearDataModal: () => void;
};

export function SettingsPage({
  t,
  appVersion,
  appPreferences,
  languageOptions,
  selectedLanguageLabel,
  selectedNoteLayoutLabel,
  isLanguageMenuOpen,
  isThemeMenuOpen,
  isLayoutMenuOpen,
  selectedTheme,
  themeOptions,
  noteLayoutOptions,
  toolbarVisibilityOptions,
  visibleToolbarGroupsCount,
  notesLocationLabel,
  canOpenNotesStorageDirectory,
  canChooseNotesStorageDirectory,
  isNotesStorageLoading,
  onBack,
  closeFloatingMenus,
  setIsLanguageMenuOpen,
  setIsThemeMenuOpen,
  setIsLayoutMenuOpen,
  onLanguageChange,
  onAppearanceChange,
  onThemeChange,
  onNoteLayoutChange,
  onToggleToolbarVisibility,
  onOpenNotesStorageDirectory,
  onChooseNotesStorageDirectory,
  onExportAppData,
  onOpenClearDataModal
}: SettingsPageProps) {
  return (
    <section className="settings-page">
      <div className="settings-topbar">
        <div className="settings-topbar-inner">
          <button type="button" className="settings-back-button" aria-label={t.settingsBack} onClick={onBack}>
            <ArrowNarrowLeft size={16} />
          </button>
          <h1 className="settings-page-title">{t.settingsTitle}</h1>
        </div>
      </div>

      <div className="settings-surface">
        <div className="settings-panel">
          <section className="settings-row">
            <div className="settings-row-copy">
              <h2>{t.settingsLanguageTitle}</h2>
              <p>{t.settingsLanguageDescription}</p>
            </div>
            <div className="settings-row-control">
              <div className="settings-select-shell" onPointerDown={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className={isLanguageMenuOpen ? "settings-select-trigger open" : "settings-select-trigger"}
                  aria-haspopup="menu"
                  aria-expanded={isLanguageMenuOpen}
                  onClick={() => {
                    const nextOpen = !isLanguageMenuOpen;
                    closeFloatingMenus();
                    setIsLanguageMenuOpen(nextOpen);
                  }}
                >
                  <span>{selectedLanguageLabel}</span>
                </button>
                <ChevronDown size={14} />
                {isLanguageMenuOpen ? (
                  <div className="settings-select-popover" role="menu" aria-label={t.languageOptionsAria}>
                    {languageOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={appPreferences.language === option.value}
                        className={appPreferences.language === option.value ? "settings-select-option active" : "settings-select-option"}
                        onClick={() => {
                          onLanguageChange(option.value);
                          setIsLanguageMenuOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="settings-row">
            <div className="settings-row-copy">
              <h2>{t.settingsAppearanceTitle}</h2>
              <p>{t.settingsAppearanceDescription}</p>
            </div>
            <div className="settings-row-control">
              <div className="settings-segmented-control settings-segmented-control-compact">
                <button type="button" className={appPreferences.appearance === "light" ? "settings-segment active" : "settings-segment"} onClick={() => onAppearanceChange("light")}><Sun size={14} /><span>{t.appearanceLight}</span></button>
                <button type="button" className={appPreferences.appearance === "dark" ? "settings-segment active" : "settings-segment"} onClick={() => onAppearanceChange("dark")}><Moon02 size={14} /><span>{t.appearanceDark}</span></button>
                <button type="button" className={appPreferences.appearance === "system" ? "settings-segment active" : "settings-segment"} onClick={() => onAppearanceChange("system")}><Laptop01 size={14} /><span>{t.appearanceSystem}</span></button>
              </div>
            </div>
          </section>

          <section className="settings-row">
            <div className="settings-row-copy">
              <h2>{t.settingsNoteLayoutTitle}</h2>
              <p>{t.settingsNoteLayoutDescription}</p>
            </div>
            <div className="settings-row-control">
              <div className="settings-select-shell settings-select-shell-auto" onPointerDown={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className={isLayoutMenuOpen ? "settings-select-trigger settings-select-trigger-auto open" : "settings-select-trigger settings-select-trigger-auto"}
                  aria-haspopup="menu"
                  aria-expanded={isLayoutMenuOpen}
                  onClick={() => {
                    const nextOpen = !isLayoutMenuOpen;
                    closeFloatingMenus();
                    setIsLayoutMenuOpen(nextOpen);
                  }}
                >
                  <span>{selectedNoteLayoutLabel}</span>
                </button>
                <ChevronDown size={14} />
                {isLayoutMenuOpen ? (
                  <div className="settings-select-popover" role="menu" aria-label={t.settingsNoteLayoutTitle}>
                    {noteLayoutOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={appPreferences.noteLayoutSize === option.value}
                        className={appPreferences.noteLayoutSize === option.value ? "settings-select-option active" : "settings-select-option"}
                        onClick={() => {
                          onNoteLayoutChange(option.value);
                          setIsLayoutMenuOpen(false);
                        }}
                      >
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="settings-row settings-row-theme">
            <div className="settings-row-copy">
              <h2>{t.settingsThemeTitle}</h2>
              <p>{t.settingsThemeDescription}</p>
            </div>
            <div className="settings-row-control">
              <div className="settings-select-shell" onPointerDown={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className={isThemeMenuOpen ? "settings-select-trigger settings-theme-trigger open" : "settings-select-trigger settings-theme-trigger"}
                  aria-haspopup="menu"
                  aria-expanded={isThemeMenuOpen}
                  onClick={() => {
                    const nextOpen = !isThemeMenuOpen;
                    closeFloatingMenus();
                    setIsThemeMenuOpen(nextOpen);
                  }}
                >
                  <span className="settings-theme-trigger-content">
                    <span className="settings-theme-swatches" aria-hidden="true">
                      {selectedTheme.swatches.map((swatch) => (
                        <span key={swatch} className="settings-theme-swatch" style={{ background: swatch }} />
                      ))}
                    </span>
                    <span className="settings-theme-label">{selectedTheme.label}</span>
                  </span>
                </button>
                <ChevronDown size={14} />
                {isThemeMenuOpen ? (
                  <div className="settings-select-popover settings-theme-popover" role="menu" aria-label={t.settingsThemeTitle}>
                    {themeOptions.map((themeOption) => (
                      <button
                        key={themeOption.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={appPreferences.theme === themeOption.value}
                        className={appPreferences.theme === themeOption.value ? "settings-select-option settings-theme-menu-option active" : "settings-select-option settings-theme-menu-option"}
                        onClick={() => {
                          onThemeChange(themeOption.value);
                          setIsThemeMenuOpen(false);
                        }}
                      >
                        <span className="settings-theme-trigger-content">
                          <span className="settings-theme-swatches" aria-hidden="true">
                            {themeOption.swatches.map((swatch) => (
                              <span key={swatch} className="settings-theme-swatch" style={{ background: swatch }} />
                            ))}
                          </span>
                          <span className="settings-theme-label">{themeOption.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="settings-row settings-row-theme">
            <div className="settings-row-copy">
              <h2>{t.settingsToolbarTitle}</h2>
              <p>{t.settingsToolbarDescription}</p>
            </div>
            <div className="settings-row-control">
              <div className="settings-toolbar-grid" onPointerDown={(event) => event.stopPropagation()}>
                {toolbarVisibilityOptions.map((option) => {
                  const checked = appPreferences.toolbarVisibility[option.value];
                  const isOnlyVisibleOption = checked && visibleToolbarGroupsCount === 1;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-label={option.label}
                      title={option.label}
                      disabled={isOnlyVisibleOption}
                      className={checked ? "settings-toolbar-toggle active" : "settings-toolbar-toggle"}
                      onClick={() => onToggleToolbarVisibility(option.value)}
                    >
                      <span className="settings-toolbar-toggle-icon" aria-hidden="true">{option.icon}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="settings-row settings-row-stack">
            <div className="settings-row-copy">
              <h2>{t.settingsNotesLocationTitle}</h2>
              <p>{t.settingsNotesLocationDescription}</p>
            </div>
            <div className="settings-storage-controls">
              <div className="settings-path-field">
                <code className="settings-path-value">{notesLocationLabel}</code>
              </div>
              <div className="settings-actions-row">
                <button type="button" className="settings-action-button secondary" onClick={() => void onOpenNotesStorageDirectory()} disabled={!canOpenNotesStorageDirectory}>{t.openFolder}</button>
                <button type="button" className="settings-action-button secondary" onClick={() => void onChooseNotesStorageDirectory()} disabled={!canChooseNotesStorageDirectory || isNotesStorageLoading}>{t.browse}</button>
              </div>
            </div>
          </section>

          <section className="settings-row settings-row-stack">
            <div className="settings-row-copy">
              <h2>{t.settingsDataTitle}</h2>
              <p>{t.settingsDataDescription}</p>
            </div>
            <div className="settings-row-control settings-row-control-end">
              <div className="settings-actions-row settings-actions-row-end">
                <button type="button" className="settings-action-button secondary" onClick={() => void onExportAppData()}>{t.exportData}</button>
                <button type="button" className="settings-action-button danger" onClick={onOpenClearDataModal}>{t.clearData}</button>
              </div>
            </div>
          </section>

          <section className="settings-row">
            <div className="settings-row-copy">
              <h2>{t.settingsVersionTitle}</h2>
              <p>{t.settingsVersionDescription}</p>
            </div>
            <div className="settings-row-control settings-row-control-end">
              <div className="settings-actions-row settings-actions-row-end">
                <span className="settings-badge">{t.betaBadge} v{appVersion}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}




