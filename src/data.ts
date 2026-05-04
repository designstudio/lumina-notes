import { Note } from "./types";

export const demoNotes: Note[] = [
  {
    id: "welcome",
    title: "Welcome to Soba",
    preview: "Local-first markdown notes, smart folders, and AI help in one workspace.",
    body: `What this is?

? Local-first Markdown notes
Your writing stays on your machine in portable Markdown files.

? Customizable Interface
Fully customizable fonts, icons, and colors.

? Smart folders
Virtual folders powered by tags, so notes can appear in useful groups without moving files.

? AI assistant with flexible context
Bring the right notes, folders, or writing into the conversation, and have AI directly edit your notes files.

? Speech to text / Text to speech
Dictate notes with post processing clean up, and have Soba read your writing or AI responses back to you.

? Morning Pages
A dedicated space for daily freewriting, reflection, and mental clearing.

? Automatic Granola import
Pull meeting notes from Granola into your local writing system.

? Bring your own API key
Use your preferred AI provider/account and keep control over usage.`,
    folder: "all",
    tags: ["welcom", "features"],
    pinned: true,
    color: "#2fd582",
    updatedAt: "Today",
    checklist: []
  },
  {
    id: "career-thoughts",
    title: "Career Thoughts",
    preview: "Ways to shape the app into a calmer local-first notes tool.",
    body: "Notes about product direction, the writing experience, and what deserves to stay lightweight.",
    folder: "work",
    tags: ["career"],
    color: "#2fd582",
    updatedAt: "Yesterday",
    checklist: []
  },
  {
    id: "headroom",
    title: "Headroom",
    preview: "Small design notes about whitespace, calmness, and readability.",
    body: "Quiet products feel faster. The chrome should disappear and let the writing take the lead.",
    folder: "ideas",
    tags: ["design"],
    color: "#2fd582",
    updatedAt: "Yesterday",
    checklist: []
  },
  {
    id: "new-ui-syntax",
    title: "New UI Syntax",
    preview: "A sketch for how editing, tags, and prompts could live together.",
    body: "Try a minimal top bar, tiny chips, and a bottom-right assistant field that stays out of the writing flow.",
    folder: "personal",
    tags: ["ui"],
    color: "#2fd582",
    updatedAt: "Sun",
    checklist: []
  }
];
