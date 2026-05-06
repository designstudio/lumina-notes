import { type Note } from "./types";

export function defaultExpandedSections() {
  return {
    "get-started": true,
    work: true,
    personal: true,
    ideas: true,
    archive: true,
    favorites: true,
    all: true
  };
}

export function withSortOrder(notes: Note[]) {
  return notes.map((note, index) => {
    const createdAt = note.createdAt ?? new Date().toISOString();
    const updatedAt = !Number.isNaN(new Date(note.updatedAt).getTime()) ? note.updatedAt : createdAt;

    return {
      ...note,
      createdAt,
      updatedAt,
      sortOrder: note.sortOrder ?? index
    };
  });
}

export function sortNotes(notes: Note[]) {
  return [...notes].sort((left, right) => {
    if (Boolean(left.pinned) !== Boolean(right.pinned)) {
      return left.pinned ? -1 : 1;
    }

    const rightUpdatedAt = new Date(right.updatedAt).getTime();
    const leftUpdatedAt = new Date(left.updatedAt).getTime();
    const updatedAtDelta = rightUpdatedAt - leftUpdatedAt;

    if (updatedAtDelta !== 0) {
      return updatedAtDelta;
    }

    return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
  });
}

export function areNotesEqual(left: Note | null | undefined, right: Note | null | undefined) {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.id === right.id &&
    left.title === right.title &&
    left.preview === right.preview &&
    left.body === right.body &&
    left.folder === right.folder &&
    left.pinned === right.pinned &&
    left.sortOrder === right.sortOrder &&
    left.color === right.color &&
    left.createdAt === right.createdAt &&
    left.updatedAt === right.updatedAt &&
    left.tags.length === right.tags.length &&
    left.tags.every((tag, index) => tag === right.tags[index]) &&
    left.checklist.length === right.checklist.length &&
    left.checklist.every(
      (item, index) =>
        item.id === right.checklist[index]?.id &&
        item.label === right.checklist[index]?.label &&
        item.done === right.checklist[index]?.done
    )
  );
}

export function mergeNoteIntoCollection(notes: Note[], draftNote: Note | null) {
  if (!draftNote) {
    return notes;
  }

  let hasChanges = false;
  const nextNotes = notes.map((note) => {
    if (note.id !== draftNote.id) {
      return note;
    }

    if (areNotesEqual(note, draftNote)) {
      return note;
    }

    hasChanges = true;
    return draftNote;
  });

  return hasChanges ? nextNotes : notes;
}

export function applyNoteDraftPatch(note: Note, patch: Partial<Note>, fallbackPreview: string) {
  const nextTitle = patch.title ?? note.title;
  const nextBody = patch.body ?? note.body;
  const nextPreview = patch.preview ?? (patch.body !== undefined
    ? nextBody.split("\n").find(Boolean)?.trim() || nextTitle.trim() || fallbackPreview
    : note.preview || nextTitle.trim() || fallbackPreview);

  return {
    ...note,
    ...patch,
    title: nextTitle,
    body: nextBody,
    preview: nextPreview,
    updatedAt: patch.updatedAt ?? new Date().toISOString()
  };
}
