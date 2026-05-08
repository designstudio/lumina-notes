export const MAX_TIPTAP_UPLOAD_SIZE = 5 * 1024 * 1024;

export function noteBodyToEditorContent(body: string) {
  if (!body.trim()) {
    return "";
  }

  if (/<[a-z][\s\S]*>/i.test(body)) {
    const documentFragment = new DOMParser().parseFromString(body, "text/html");

    documentFragment.body.querySelectorAll("div").forEach((element) => {
      const parent = element.parentNode;
      if (!parent) {
        return;
      }

      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }

      parent.removeChild(element);
    });

    return documentFragment.body.innerHTML;
  }

  return body
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function normalizeRenderedNoteBody(body: string) {
  const normalizedBody = noteBodyToEditorContent(body);
  if (!normalizedBody.trim()) {
    return "";
  }

  const documentFragment = new DOMParser().parseFromString(normalizedBody, "text/html");
  return documentFragment.body.innerHTML.trim();
}

export function areNoteBodiesEquivalent(left: string, right: string) {
  return normalizeRenderedNoteBody(left) === normalizeRenderedNoteBody(right);
}

export function uploadImageAsDataUrl(
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_TIPTAP_UPLOAD_SIZE) {
      reject(new Error(`Image exceeds ${MAX_TIPTAP_UPLOAD_SIZE / 1024 / 1024}MB limit`));
      return;
    }

    const reader = new FileReader();
    let settled = false;

    const cleanup = () => {
      abortSignal?.removeEventListener("abort", handleAbort);
    };

    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback();
    };

    const handleAbort = () => {
      try {
        reader.abort();
      } catch {
      }

      settle(() => reject(new Error("Image upload cancelled")));
    };

    reader.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress?.({ progress: Math.round((event.loaded / event.total) * 100) });
    };

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        settle(() => reject(new Error("Could not read selected image")));
        return;
      }

      onProgress?.({ progress: 100 });
      settle(() => resolve(result));
    };

    reader.onerror = () => {
      settle(() => reject(reader.error ?? new Error("Could not read selected image")));
    };

    if (abortSignal?.aborted) {
      handleAbort();
      return;
    }

    abortSignal?.addEventListener("abort", handleAbort, { once: true });
    reader.readAsDataURL(file);
  });
}
