import { type EffectiveLanguage } from "./i18n";
import {
  type AppPreferences,
  type FolderSettings,
  type ThemeOption,
  type ToolbarVisibilityPreferences
} from "./app-types";

export const themeOptions: ThemeOption[] = [
  { value: "blue-lagoon", label: "Blue Lagoon", swatches: ["#2563eb", "#60a5fa", "#bfdbfe"] },
  { value: "green-forest", label: "Green Forest", swatches: ["#2f6f4f", "#4aa46f", "#cfead8"] },
  { value: "rose-pine", label: "Rose Pine", swatches: ["#b24f7b", "#e38db0", "#f7d6e3"] },
  { value: "orange-soda", label: "Orange Soda", swatches: ["#dd6b20", "#fb923c", "#fed7aa"] },
  { value: "catpuccin", label: "Catppuccino", swatches: ["#8b6b5c", "#c4a484", "#ead8c8"] },
  { value: "purple-haze", label: "Purple Haze", swatches: ["#7c3aed", "#a78bfa", "#ddd6fe"] }
];

export function defaultToolbarVisibility(): ToolbarVisibilityPreferences {
  return {
    history: true,
    headings: true,
    quote: true,
    bold: true,
    italic: true,
    strikethrough: true,
    code: true,
    lists: true,
    tables: true,
    underline: true,
    highlight: true,
    links: true,
    superscript: true,
    subscript: true,
    separator: false,
    textAlign: false,
    image: true
  };
}

export function toolbarVisibilityFromPartial(parsed?: Partial<ToolbarVisibilityPreferences>): ToolbarVisibilityPreferences {
  const defaults = defaultToolbarVisibility();
  return {
    history: parsed?.history ?? defaults.history,
    headings: parsed?.headings ?? defaults.headings,
    quote: parsed?.quote ?? defaults.quote,
    bold: parsed?.bold ?? defaults.bold,
    italic: parsed?.italic ?? defaults.italic,
    strikethrough: parsed?.strikethrough ?? defaults.strikethrough,
    code: parsed?.code ?? defaults.code,
    lists: parsed?.lists ?? defaults.lists,
    tables: parsed?.tables ?? defaults.tables,
    underline: parsed?.underline ?? defaults.underline,
    highlight: parsed?.highlight ?? defaults.highlight,
    links: parsed?.links ?? defaults.links,
    superscript: parsed?.superscript ?? defaults.superscript,
    subscript: parsed?.subscript ?? defaults.subscript,
    separator: parsed?.separator ?? defaults.separator,
    textAlign: parsed?.textAlign ?? defaults.textAlign,
    image: parsed?.image ?? defaults.image
  };
}

export function defaultFolderSettings(): FolderSettings {
  return { labels: {}, customFolders: [], hiddenFixedFolders: [] };
}

export function defaultAppPreferences(): AppPreferences {
  return {
    language: "system",
    appearance: "system",
    theme: "blue-lagoon",
    toolbarVisibility: defaultToolbarVisibility()
  };
}

export function formatCreatedAtLabel(createdAt: string, locale: EffectiveLanguage) {
  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(parsedDate);
  const year = new Intl.DateTimeFormat(locale, { year: "numeric" }).format(parsedDate);
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(parsedDate);
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return capitalizedMonth + " " + day + ", " + year;
}
