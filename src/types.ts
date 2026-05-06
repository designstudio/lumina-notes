export type FolderKey = string;

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
  createdAt: string;
  updatedAt: string;
  checklist: { id: string; label: string; done: boolean }[];
};
