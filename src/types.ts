export type FolderKey =
  | "get-started"
  | "all"
  | "work"
  | "personal"
  | "ideas"
  | "archive"
  | "favorites";

export type Note = {
  id: string;
  title: string;
  preview: string;
  body: string;
  folder: FolderKey;
  tags: string[];
  pinned?: boolean;
  sortOrder?: number;
  color: string;
  updatedAt: string;
  checklist: { id: string; label: string; done: boolean }[];
};
