import getStartedPlaceholderImage from "../assets/42026204254.png";
export type EffectiveLanguage = "pt-BR" | "en-US";
export type LanguagePreference = "system" | EffectiveLanguage;

export type TranslationDictionary = {
  appName: string;
  fixedFolderGetStarted: string;
  fixedFolderAllNotes: string;
  untitledFolder: string;
  welcomeNoteFallback: string;
  emptyNote: string;
  newNoteTitle: string;
  newNotePreview: string;
  sidebarOpen: string;
  sidebarClose: string;
  sidebarNewNote: string;
  sidebarNewFolder: string;
  sidebarSearch: string;
  sidebarSettings: string;
  pinnedNote: string;
  settingsBack: string;
  settingsTitle: string;
  settingsLanguageTitle: string;
  settingsLanguageDescription: string;
  languageOptionSystem: string;
  languageOptionPortugueseBrazil: string;
  languageOptionEnglish: string;
  languageOptionsAria: string;
  settingsAppearanceTitle: string;
  settingsAppearanceDescription: string;
  appearanceLight: string;
  appearanceDark: string;
  appearanceSystem: string;
  settingsThemeTitle: string;
  settingsThemeDescription: string;
  settingsNoteLayoutTitle: string;
  settingsNoteLayoutDescription: string;
  layoutSizeMedium: string;
  layoutSizeFull: string;
  settingsToolbarTitle: string;
  settingsToolbarDescription: string;
  settingsToolbarAllGroups: string;
  settingsToolbarSelectedCount: (selected: number, total: number) => string;
  settingsNotesLocationTitle: string;
  settingsNotesLocationDescription: string;
  settingsDataTitle: string;
  settingsDataDescription: string;
  settingsVersionTitle: string;
  settingsVersionDescription: string;
  betaBadge: string;
  exportData: string;
  clearData: string;
  clearDataModalTitle: string;
  clearDataModalDescription: string;
  clearDataModalConfirm: string;
  clearDataModalCancel: string;
  confirmClearData: string;
  notesLocationBrowser: string;
  notesLocationLoading: string;
  notesLocationRestart: string;
  openFolder: string;
  browse: string;
  breadcrumbAria: string;
  markdownTools: string;
  editorBodyAria: string;
  toolbarUndo: string;
  toolbarRedo: string;
  toolbarHeading: string;
  toolbarHeading1: string;
  toolbarHeading2: string;
  toolbarHeading3: string;
  toolbarHeading4: string;
  toolbarQuote: string;
  toolbarList: string;
  toolbarBulletList: string;
  toolbarOrderedList: string;
  toolbarTaskList: string;
  toolbarTable: string;
  toolbarInsertTable: string;
  toolbarAddRow: string;
  toolbarAddColumn: string;
  toolbarToggleHeaderRow: string;
  toolbarDeleteRow: string;
  toolbarDeleteColumn: string;
  toolbarDeleteTable: string;
  toolbarSeparator: string;
  toolbarTextAlign: string;
  toolbarAlignLeft: string;
  toolbarAlignCenter: string;
  toolbarAlignRight: string;
  toolbarBold: string;
  toolbarItalic: string;
  toolbarStrikethrough: string;
  toolbarCode: string;
  toolbarUnderline: string;
  toolbarHighlight: string;
  toolbarClearHighlight: string;
  toolbarLink: string;
  toolbarLinkPlaceholder: string;
  toolbarApplyLink: string;
  toolbarOpenLink: string;
  toolbarRemoveLink: string;
  toolbarSuperscript: string;
  toolbarSubscript: string;
  toolbarAddImage: string;
  toolbarVisibilityHistory: string;
  toolbarVisibilityHeadings: string;
  toolbarVisibilityQuote: string;
  toolbarVisibilityLists: string;
  toolbarVisibilityTables: string;
  toolbarVisibilityBold: string;
  toolbarVisibilityItalic: string;
  toolbarVisibilityStrikethrough: string;
  toolbarVisibilityCode: string;
  toolbarVisibilityUnderline: string;
  toolbarVisibilityHighlight: string;
  toolbarVisibilityLinks: string;
  toolbarVisibilitySuperscript: string;
  toolbarVisibilitySubscript: string;
  toolbarVisibilitySeparator: string;
  toolbarVisibilityTextAlign: string;
  toolbarVisibilityImage: string;
  noteActionsMore: string;
  exportAsPdf: string;
  exportAsMarkdown: string;
  contextRename: string;
  contextPinNote: string;
  contextUnpinNote: string;
  contextMoveTo: string;
  contextDelete: string;
  contextNewNote: string;
  contextRenameFolder: string;
  contextDeleteFolder: string;
  searchPlaceholder: string;
  searchAria: string;
  searchClose: string;
  searchNoResults: string;
  modalNewFolderTitle: string;
  modalNewFolderDescription: string;
  modalClose: string;
  folderNamePlaceholder: string;
  cancel: string;
  create: string;
  promptRenameFolder: string;
  alertFolderCannotDelete: string;
  confirmDeleteFolder: (label: string, destinationLabel: string) => string;
  confirmDeleteNote: (title: string) => string;
  getStartedTitle: string;
  getStartedPreview: string;
  getStartedBody: string;
  highlightYellow: string;
  highlightGreen: string;
  highlightBlue: string;
  highlightPink: string;
  highlightPurple: string;
};

export const translations: Record<EffectiveLanguage, TranslationDictionary> = {
  "en-US": {
    appName: "Lophos Notes",
    fixedFolderGetStarted: "Get Started",
    fixedFolderAllNotes: "All notes",
    untitledFolder: "Folder",
    welcomeNoteFallback: "Welcome",
    emptyNote: "Empty note",
    newNoteTitle: "New Note",
    newNotePreview: "Start writing...",
    sidebarOpen: "Open sidebar",
    sidebarClose: "Close sidebar",
    sidebarNewNote: "New note",
    sidebarNewFolder: "New folder",
    sidebarSearch: "Search",
    sidebarSettings: "Settings",
    pinnedNote: "Pinned note",
    settingsBack: "Back to app",
    settingsTitle: "Settings",
    settingsLanguageTitle: "Language",
    settingsLanguageDescription: "Choose the interface language for the app.",
    languageOptionSystem: "System",
    languageOptionPortugueseBrazil: "Portuguese (Brazil)",
    languageOptionEnglish: "English",
    languageOptionsAria: "Language options",
    settingsAppearanceTitle: "Appearance",
    settingsAppearanceDescription: "Use light, dark, or follow the system setting.",
    appearanceLight: "Light",
    appearanceDark: "Dark",
    appearanceSystem: "System",
    settingsThemeTitle: "Theme",
    settingsThemeDescription: "Pick a color mood for the interface.",
    settingsNoteLayoutTitle: "Note layout",
    settingsNoteLayoutDescription: "Choose how wide notes feel while you write.",
    layoutSizeMedium: "Médio",
    layoutSizeFull: "Completo",
    settingsToolbarTitle: "Editor toolbar",
    settingsToolbarDescription: "Choose which groups appear in the editor toolbar.",
    settingsToolbarAllGroups: "All groups",
    settingsToolbarSelectedCount: (selected, total) => `${selected} of ${total} groups`,
    settingsNotesLocationTitle: "Notes location",
    settingsNotesLocationDescription: "Where your local notes are stored.",
    settingsDataTitle: "Data",
    settingsDataDescription: "Export a backup of your notes and settings, or clear all local app data.",
    settingsVersionTitle: "Version",
    settingsVersionDescription: "Current app build and release channel.",
    betaBadge: "Beta",
    exportData: "Export data",
    clearData: "Clear data",
    clearDataModalTitle: "Clear data",
    clearDataModalDescription: "If you continue, all notes, folders, and local app data will be removed. This action cannot be undone.",
    clearDataModalConfirm: "Yes, clear",
    clearDataModalCancel: "No, wait!",
    confirmClearData: "Clear all notes, folders, and local app data? This action cannot be undone.",
    notesLocationBrowser: "Browser localStorage",
    notesLocationLoading: "Loading local path...",
    notesLocationRestart: "Restart app to load notes path",
    openFolder: "Open folder",
    browse: "Browse",
    breadcrumbAria: "NavegaÃƒÂ§ÃƒÂ£o",
    markdownTools: "Markdown tools",
    editorBodyAria: "Note body",
    toolbarUndo: "Undo",
    toolbarRedo: "Redo",
    toolbarHeading: "TÃƒÂ­tulo",
    toolbarHeading1: "TÃƒÂ­tulo 1",
    toolbarHeading2: "TÃƒÂ­tulo 2",
    toolbarHeading3: "TÃƒÂ­tulo 3",
    toolbarHeading4: "TÃƒÂ­tulo 4",
    toolbarQuote: "CitaÃƒÂ§ÃƒÂ£o",
    toolbarList: "List",
    toolbarBulletList: "Bullet List",
    toolbarOrderedList: "Ordered List",
    toolbarTaskList: "Task List",
    toolbarTable: "Table",
    toolbarInsertTable: "Insert table",
    toolbarAddRow: "Add row",
    toolbarAddColumn: "Add column",
    toolbarToggleHeaderRow: "Toggle header row",
    toolbarDeleteRow: "Delete row",
    toolbarDeleteColumn: "Delete column",
    toolbarDeleteTable: "Delete table",
    toolbarSeparator: "Separator",
    toolbarTextAlign: "Text align",
    toolbarAlignLeft: "Align left",
    toolbarAlignCenter: "Align center",
    toolbarAlignRight: "Align right",
    toolbarBold: "Bold",
    toolbarItalic: "ItÃƒÂ¡lico",
    toolbarStrikethrough: "Strikethrough",
    toolbarCode: "CÃƒÂ³digo",
    toolbarUnderline: "Underline",
    toolbarHighlight: "Highlight",
    toolbarClearHighlight: "Clear highlight",
    toolbarLink: "Link",
    toolbarLinkPlaceholder: "Paste a link...",
    toolbarApplyLink: "Apply link",
    toolbarOpenLink: "Open link",
    toolbarRemoveLink: "Remove link",
    toolbarSuperscript: "Superscript",
    toolbarSubscript: "Subscript",
    toolbarAddImage: "Add image",
    toolbarVisibilityHistory: "History",
    toolbarVisibilityHeadings: "Headings",
    toolbarVisibilityQuote: "Quote",
    toolbarVisibilityLists: "Lists",
    toolbarVisibilityTables: "Tables",
    toolbarVisibilityBold: "Bold",
    toolbarVisibilityItalic: "Italic",
    toolbarVisibilityStrikethrough: "Strikethrough",
    toolbarVisibilityCode: "Code",
    toolbarVisibilityUnderline: "Underline",
    toolbarVisibilityHighlight: "Highlight",
    toolbarVisibilityLinks: "Links",
    toolbarVisibilitySuperscript: "Superscript",
    toolbarVisibilitySubscript: "Subscript",
    toolbarVisibilitySeparator: "Separator",
    toolbarVisibilityTextAlign: "Text align",
    toolbarVisibilityImage: "Image",
    noteActionsMore: "More",
    exportAsPdf: "Export as PDF",
    exportAsMarkdown: "Export as Markdown",
    contextRename: "Rename",
    contextPinNote: "Pin note",
    contextUnpinNote: "Unpin note",
    contextMoveTo: "Move to",
    contextDelete: "Delete",
    contextNewNote: "New note",
    contextRenameFolder: "Rename folder",
    contextDeleteFolder: "Delete folder",
    searchPlaceholder: "Search notes...",
    searchAria: "Search notes",
    searchClose: "Close search",
    searchNoResults: "No notes found.",
    modalNewFolderTitle: "New folder",
    modalNewFolderDescription: "Create a folder to organize your notes.",
    modalClose: "Close modal",
    folderNamePlaceholder: "Folder name",
    cancel: "Cancel",
    create: "Create",
    promptRenameFolder: "Rename folder",
    alertFolderCannotDelete: "Esta pasta n\u00e3o pode ser exclu\u00edda.",
    confirmDeleteFolder: (label, destinationLabel) => `Excluir "${label}"? As notas dessa pasta ser\u00e3o movidas para ${destinationLabel}.`,
    confirmDeleteNote: (title) => `Delete "${title}"?`,
    getStartedTitle: "Getting started",
    getStartedPreview: "Welcome to Lophos Notes, a calm local-first editor built for focused writing.",
    getStartedBody: `<h1>Welcome to Lophos Notes</h1>
<p>Lophos is a calm, local-first notes app for writing, organizing, and polishing your thoughts without getting pulled out of flow.</p>
<p>Use the editor toolbar for <strong>bold</strong>, <em>italic</em>, <s>strikethrough</s>, <code>inline code</code>, links, highlights, headings, lists, images, and task lists.</p>
<blockquote><p>A good note should feel light to start and sturdy enough to grow.</p></blockquote>
<h2>Try the editor</h2>
<p>Select any text and use the toolbar above, or try familiar shortcuts like <strong>Ctrl+B</strong> for bold and <strong>Ctrl+I</strong> for italic.</p>
<ul>
  <li><p><strong>Headings</strong> keep longer notes scannable.</p></li>
  <li><p><strong>Highlights</strong> help important details stand out.</p></li>
  <li><p><strong>Links</strong> keep references close to the thought they support.</p></li>
</ul>
<h3>A tiny checklist</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Open your first note</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Create a new note</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Move it into the right folder</p></div></li>
</ul>
<h3>A simple table</h3>
<table><tbody><tr><th>Section</th><th>What it helps with</th></tr><tr><td>Ideas</td><td>Capture fragments before they disappear.</td></tr><tr><td>Projects</td><td>Track the next step and key links.</td></tr><tr><td>Review</td><td>Turn rough notes into something clearer.</td></tr></tbody></table>
<h3>An image example</h3>
<p>Add references, moodboards, screenshots, and visuals right inside the note.</p>
<p><img src="${getStartedPlaceholderImage}" alt="Lophos Notes placeholder example" /></p>
<h2>Make it yours</h2>
<p>Write meeting notes, morning pages, drafts, research, plans, and small fragments before they become bigger ideas.</p>
<p>You can also use precise formatting like x<sup>2</sup> and H<sub>2</sub>O when a note needs it.</p>
<p><mark data-color="#fff2a8" style="background-color: #fff2a8; color: inherit;">Tip:</mark> start messy, then shape the note later. The editor is here when you need structure.</p>`,
    highlightYellow: "Yellow",
    highlightGreen: "Green",
    highlightBlue: "Blue",
    highlightPink: "Pink",
    highlightPurple: "Purple"
  },
  "pt-BR": {
    appName: "Lophos Notes",
    fixedFolderGetStarted: "Primeiros passos",
    fixedFolderAllNotes: "Todas as notas",
    untitledFolder: "Pasta",
    welcomeNoteFallback: "Boas-vindas",
    emptyNote: "Nota vazia",
    newNoteTitle: "Nova nota",
    newNotePreview: "Comece a escrever...",
    sidebarOpen: "Abrir barra lateral",
    sidebarClose: "Fechar barra lateral",
    sidebarNewNote: "Nova nota",
    sidebarNewFolder: "Nova pasta",
    sidebarSearch: "Buscar",
    sidebarSettings: "Configura\u00e7\u00f5es",
    pinnedNote: "Nota fixada",
    settingsBack: "Voltar ao aplicativo",
    settingsTitle: "Configura\u00e7\u00f5es",
    settingsLanguageTitle: "Idioma",
    settingsLanguageDescription: "Escolha o idioma da interface do aplicativo.",
    languageOptionSystem: "Sistema",
    languageOptionPortugueseBrazil: "Portugu\u00eas (Brasil)",
    languageOptionEnglish: "English",
    languageOptionsAria: "Op\u00e7\u00f5es de idioma",
    settingsAppearanceTitle: "Apar\u00eancia",
    settingsAppearanceDescription: "Use o tema claro, escuro ou siga a configura\u00e7\u00e3o do sistema.",
    appearanceLight: "Claro",
    appearanceDark: "Escuro",
    appearanceSystem: "Sistema",
    settingsThemeTitle: "Temas",
    settingsThemeDescription: "Escolha uma paleta de cor para a interface.",
    settingsNoteLayoutTitle: "Layout das notas",
    settingsNoteLayoutDescription: "Escolha quão larga a nota fica durante a escrita.",
    layoutSizeMedium: "Médio",
    layoutSizeFull: "Completo",
    settingsToolbarTitle: "Barra do editor",
    settingsToolbarDescription: "Escolha quais grupos aparecem na barra do editor.",
    settingsToolbarAllGroups: "Todos os grupos",
    settingsToolbarSelectedCount: (selected, total) => `${selected} de ${total} grupos`,
    settingsNotesLocationTitle: "Local das notas",
    settingsNotesLocationDescription: "Local onde suas notas locais s\u00e3o armazenadas.",
    settingsDataTitle: "Dados",
    settingsDataDescription: "Exporte um backup das suas notas e configura\u00e7\u00f5es, ou limpe todos os dados locais do app.",
    settingsVersionTitle: "Vers\u00e3o",
    settingsVersionDescription: "Build atual do app e canal de lan\u00e7amento.",
    betaBadge: "Beta",
    exportData: "Exportar dados",
    clearData: "Limpar dados",
    clearDataModalTitle: "Limpar dados",
    clearDataModalDescription: "Se voc\u00ea continuar, todas as notas, pastas e dados locais do app ser\u00e3o removidos. Essa a\u00e7\u00e3o n\u00e3o pode ser desfeita.",
    clearDataModalConfirm: "Sim, limpar",
    clearDataModalCancel: "N\u00e3o, espera a\u00ed!",
    confirmClearData: "Limpar todas as notas, pastas e dados locais do app? Essa a\u00e7\u00e3o n\u00e3o pode ser desfeita.",
    notesLocationBrowser: "localStorage do navegador",
    notesLocationLoading: "Carregando caminho local...",
    notesLocationRestart: "Reinicie o app para carregar o caminho das notas",
    openFolder: "Abrir pasta",
    browse: "Procurar",
    breadcrumbAria: "Navega\u00e7\u00e3o",
    markdownTools: "Ferramentas de markdown",
    editorBodyAria: "Corpo da nota",
    toolbarUndo: "Desfazer",
    toolbarRedo: "Refazer",
    toolbarHeading: "T\u00edtulo",
    toolbarHeading1: "T\u00edtulo 1",
    toolbarHeading2: "T\u00edtulo 2",
    toolbarHeading3: "T\u00edtulo 3",
    toolbarHeading4: "T\u00edtulo 4",
    toolbarQuote: "Cita\u00e7\u00e3o",
    toolbarList: "Lista",
    toolbarBulletList: "Lista com marcadores",
    toolbarOrderedList: "Lista numerada",
    toolbarTaskList: "Lista de tarefas",
    toolbarTable: "Tabela",
    toolbarInsertTable: "Inserir tabela",
    toolbarAddRow: "Adicionar linha",
    toolbarAddColumn: "Adicionar coluna",
    toolbarToggleHeaderRow: "Alternar linha de cabeÃƒÂ§alho",
    toolbarDeleteRow: "Excluir linha",
    toolbarDeleteColumn: "Excluir coluna",
    toolbarDeleteTable: "Excluir tabela",
    toolbarSeparator: "Separador",
    toolbarTextAlign: "Alinhamento",
    toolbarAlignLeft: "Alinhar \u00e0 esquerda",
    toolbarAlignCenter: "Centralizar",
    toolbarAlignRight: "Alinhar \u00e0 direita",
    toolbarBold: "Negrito",
    toolbarItalic: "It\u00e1lico",
    toolbarStrikethrough: "Tachado",
    toolbarCode: "C\u00f3digo",
    toolbarUnderline: "Sublinhado",
    toolbarHighlight: "Destaque",
    toolbarClearHighlight: "Remover destaque",
    toolbarLink: "Link",
    toolbarLinkPlaceholder: "Cole um link...",
    toolbarApplyLink: "Aplicar link",
    toolbarOpenLink: "Abrir link",
    toolbarRemoveLink: "Remover link",
    toolbarSuperscript: "Sobrescrito",
    toolbarSubscript: "Subscrito",
    toolbarAddImage: "Adicionar imagem",
    toolbarVisibilityHistory: "Hist\u00f3rico",
    toolbarVisibilityHeadings: "T\u00edtulos",
    toolbarVisibilityQuote: "Cita\u00e7\u00e3o",
    toolbarVisibilityLists: "Listas",
    toolbarVisibilityTables: "Tabelas",
    toolbarVisibilityBold: "Negrito",
    toolbarVisibilityItalic: "It\u00e1lico",
    toolbarVisibilityStrikethrough: "Tachado",
    toolbarVisibilityCode: "C\u00f3digo",
    toolbarVisibilityUnderline: "Sublinhado",
    toolbarVisibilityHighlight: "Destaque",
    toolbarVisibilityLinks: "Links",
    toolbarVisibilitySuperscript: "Sobrescrito",
    toolbarVisibilitySubscript: "Subscrito",
    toolbarVisibilitySeparator: "Separador",
    toolbarVisibilityTextAlign: "Alinhamento",
    toolbarVisibilityImage: "Imagem",
    noteActionsMore: "Mais",
    exportAsPdf: "Exportar como PDF",
    exportAsMarkdown: "Exportar como Markdown",
    contextRename: "Renomear",
    contextPinNote: "Fixar nota",
    contextUnpinNote: "Desafixar nota",
    contextMoveTo: "Mover para",
    contextDelete: "Excluir",
    contextNewNote: "Nova nota",
    contextRenameFolder: "Renomear pasta",
    contextDeleteFolder: "Excluir pasta",
    searchPlaceholder: "Buscar notas...",
    searchAria: "Buscar notas",
    searchClose: "Fechar busca",
    searchNoResults: "Nenhuma nota encontrada.",
    modalNewFolderTitle: "Nova pasta",
    modalNewFolderDescription: "Crie uma pasta para organizar suas notas.",
    modalClose: "Fechar modal",
    folderNamePlaceholder: "Nome da pasta",
    cancel: "Cancelar",
    create: "Criar",
    promptRenameFolder: "Renomear pasta",
    alertFolderCannotDelete: "Esta pasta n\u00e3o pode ser exclu\u00edda.",
    confirmDeleteFolder: (label, destinationLabel) => `Excluir "${label}"? As notas dessa pasta ser\u00e3o movidas para ${destinationLabel}.`,
    confirmDeleteNote: (title) => `Excluir "${title}"?`,
    getStartedTitle: "Boas-vindas",
    getStartedPreview: "Boas-vindas ao Lophos Notes, um editor local-first tranquilo para escrita focada.",
    getStartedBody: `<h1>Boas-vindas ao Lophos Notes</h1>
<p>O Lophos ÃƒÂ© um app de notas local-first e tranquilo para escrever, organizar e lapidar suas ideias sem quebrar o seu fluxo.</p>
<p>Use a barra de ferramentas do editor para <strong>negrito</strong>, <em>itÃƒÂ¡lico</em>, <s>tachado</s>, <code>cÃƒÂ³digo inline</code>, links, destaques, tÃƒÂ­tulos, listas, imagens e listas de tarefas.</p>
<blockquote><p>Uma boa nota deve ser leve para comeÃƒÂ§ar e firme o bastante para crescer.</p></blockquote>
<h2>Experimente o editor</h2>
<p>Selecione qualquer texto e use a barra de ferramentas acima, ou teste atalhos conhecidos como <strong>Ctrl+B</strong> para negrito e <strong>Ctrl+I</strong> para itÃƒÂ¡lico.</p>
<ul>
  <li><p><strong>TÃƒÂ­tulos</strong> deixam notas longas mais fÃƒÂ¡ceis de escanear.</p></li>
  <li><p><strong>Destaques</strong> ajudam detalhes importantes a se sobressaÃƒÂ­rem.</p></li>
  <li><p><strong>Links</strong> mantÃƒÂªm referÃƒÂªncias perto da ideia que elas apoiam.</p></li>
</ul>
<h3>Uma checklist pequena</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Abra sua primeira nota</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Crie uma nova nota</p></div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Mova a nota para a pasta certa</p></div></li>
</ul>
<h3>Uma tabela simples</h3>
<table><tbody><tr><th>SeÃƒÂ§ÃƒÂ£o</th><th>Como ajuda</th></tr><tr><td>Ideias</td><td>Guarda fragmentos antes que eles sumam.</td></tr><tr><td>Projetos</td><td>Organiza o prÃƒÂ³ximo passo e links importantes.</td></tr><tr><td>RevisÃƒÂ£o</td><td>Transforma notas brutas em algo mais claro.</td></tr></tbody></table>
<h3>Um exemplo de imagem</h3>
<p>Adicione referÃƒÂªncias, moodboards, capturas e visuais direto dentro da nota.</p>
<p><img src="${getStartedPlaceholderImage}" alt="Exemplo de imagem no Lophos Notes" /></p>
<h2>Deixe com a sua cara</h2>
<p>Escreva atas, pÃƒÂ¡ginas matinais, rascunhos, pesquisas, planos e pequenos fragmentos antes que eles virem ideias maiores.</p>
<p>VocÃƒÂª tambÃƒÂ©m pode usar formataÃƒÂ§ÃƒÂ£o precisa como x<sup>2</sup> e H<sub>2</sub>O quando uma nota precisar disso.</p>
<p><mark data-color="#fff2a8" style="background-color: #fff2a8; color: inherit;">Dica:</mark> comece bagunÃƒÂ§ado e organize a nota depois. O editor estÃƒÂ¡ aqui quando vocÃƒÂª precisar de estrutura.</p>`,
    highlightYellow: "Amarelo",
    highlightGreen: "Verde",
    highlightBlue: "Azul",
    highlightPink: "Rosa",
    highlightPurple: "Roxo"
  }
};

export function resolveLanguage(preference: LanguagePreference, systemLanguage?: string): EffectiveLanguage {
  if (preference === "pt-BR" || preference === "en-US") {
    return preference;
  }

  const normalizedSystemLanguage = (systemLanguage ?? "en-US").toLowerCase();
  return normalizedSystemLanguage.startsWith("pt") ? "pt-BR" : "en-US";
}

export function getLanguageOptions(locale: EffectiveLanguage) {
  const t = translations[locale];
  return [
    { value: "system" as const, label: t.languageOptionSystem },
    { value: "pt-BR" as const, label: t.languageOptionPortugueseBrazil },
    { value: "en-US" as const, label: t.languageOptionEnglish }
  ];
}










