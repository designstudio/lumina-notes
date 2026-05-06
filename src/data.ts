import type { EffectiveLanguage } from "./i18n";
import { translations } from "./i18n";
import type { Note } from "./types";

const legacyGetStartedTemplates = [
  {
    title: "Getting started",
    preview: "Welcome to Lumina Notes, a calm local-first editor built for focused writing.",
    body: `<h1>Welcome to Lumina Notes</h1>
<p>Lumina is a calm, local-first notes app for writing, organizing, and polishing your thoughts without getting pulled out of flow.</p>
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
<h2>Make it yours</h2>
<p>Write meeting notes, morning pages, drafts, research, plans, and small fragments before they become bigger ideas.</p>
<p>You can also use precise formatting like x<sup>2</sup> and H<sub>2</sub>O when a note needs it.</p>
<p><mark data-color="#fff2a8" style="background-color: #fff2a8; color: inherit;">Tip:</mark> start messy, then shape the note later. The editor is here when you need structure.</p>`
  },
  {
    title: "Getting started",
    preview: "Welcome to Lophos Notes, a calm local-first editor built for focused writing.",
    body: `<h1>Welcome to Lophos Notes</h1>
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
<h2>Make it yours</h2>
<p>Write meeting notes, morning pages, drafts, research, plans, and small fragments before they become bigger ideas.</p>
<p>You can also use precise formatting like x<sup>2</sup> and H<sub>2</sub>O when a note needs it.</p>
<p><mark data-color="#fff2a8" style="background-color: #fff2a8; color: inherit;">Tip:</mark> start messy, then shape the note later. The editor is here when you need structure.</p>`
  }
] as const;

const getStartedTitles = new Set(["Getting started", "Primeiros passos", "Boas-vindas"]);
const getStartedBrandMarkers = [
  "Lumina Notes",
  "Lophos Notes",
  "Lumina is a calm, local-first notes app",
  "Lophos is a calm, local-first notes app",
  "Boas-vindas ao Lumina Notes",
  "Boas-vindas ao Lophos Notes",
  "Uma tabela simples",
  "A simple table",
  "Um exemplo de imagem",
  "An image example"
] as const;

function createGetStartedNote(locale: EffectiveLanguage): Note {
  const t = translations[locale];

  return {
    id: "get-started",
    title: t.getStartedTitle,
    preview: t.getStartedPreview,
    body: t.getStartedBody,
    folder: "get-started",
    tags: ["welcome", "editor"],
    pinned: true,
    color: "#2fd582",
    createdAt: "2026-05-04T00:00:00.000Z",
    updatedAt: "2026-05-04T00:00:00.000Z",
    sortOrder: 0,
    checklist: []
  };
}

export function getDemoNotes(locale: EffectiveLanguage): Note[] {
  return [createGetStartedNote(locale)];
}

export function isDefaultGetStartedNote(note: Note): boolean {
  if (note.id !== "get-started") {
    return false;
  }

  const matchesCurrentLocalizedTemplate = (["en-US", "pt-BR"] as const).some((locale) => {
    const template = createGetStartedNote(locale);
    return note.title === template.title && note.preview === template.preview && note.body === template.body;
  });

  if (matchesCurrentLocalizedTemplate) {
    return true;
  }

  const matchesLegacyTemplate = legacyGetStartedTemplates.some((template) => {
    return note.title === template.title && note.preview === template.preview && note.body === template.body;
  });

  if (matchesLegacyTemplate) {
    return true;
  }

  const combinedContent = [note.title, note.preview, note.body].join("\n");
  const hasKnownTitle = getStartedTitles.has(note.title);
  const hasKnownBrandMarker = getStartedBrandMarkers.some((marker) => combinedContent.includes(marker));

  return hasKnownTitle && hasKnownBrandMarker;
}

export function getDefaultGetStartedNote(locale: EffectiveLanguage): Note {
  return createGetStartedNote(locale);
}
