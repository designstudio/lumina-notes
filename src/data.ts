import { Note } from "./types";

export const demoNotes: Note[] = [
  {
    id: "get-started",
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
<p><mark data-color="#fff2a8" style="background-color: #fff2a8; color: inherit;">Tip:</mark> start messy, then shape the note later. The editor is here when you need structure.</p>`,
    folder: "get-started",
    tags: ["welcome", "editor"],
    pinned: true,
    color: "#2fd582",
    updatedAt: "Today",
    sortOrder: 0,
    checklist: []
  },
  {
    id: "career-thoughts",
    title: "Career Thoughts",
    preview: "Ways to shape the app into a calmer local-first notes tool.",
    body: "<p>Notes about product direction, the writing experience, and what deserves to stay lightweight.</p>",
    folder: "work",
    tags: ["career"],
    color: "#2fd582",
    updatedAt: "Yesterday",
    sortOrder: 1,
    checklist: []
  },
  {
    id: "headroom",
    title: "Headroom",
    preview: "Small design notes about whitespace, calmness, and readability.",
    body: "<p>Quiet products feel faster. The chrome should disappear and let the writing take the lead.</p>",
    folder: "ideas",
    tags: ["design"],
    color: "#2fd582",
    updatedAt: "Yesterday",
    sortOrder: 2,
    checklist: []
  },
  {
    id: "new-ui-syntax",
    title: "New UI Syntax",
    preview: "A sketch for how editing, tags, and prompts could live together.",
    body: "<p>Try a minimal top bar, tiny chips, and a bottom-right assistant field that stays out of the writing flow.</p>",
    folder: "personal",
    tags: ["ui"],
    color: "#2fd582",
    updatedAt: "Sun",
    sortOrder: 3,
    checklist: []
  }
];
