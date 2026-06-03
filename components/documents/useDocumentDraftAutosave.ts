import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type InitialDocument = {
  id: string;
  title: string;
  serializedContent: string | null;
};

type SaveDocumentResponse = {
  document?: {
    id: string;
    updatedAt: string;
  };
  error?: string;
};

type UseDocumentDraftAutosaveOptions = {
  initialDocument?: InitialDocument;
};

export const defaultDraftTitle = "Untitled document";
const autoSaveDelayMs = 4000;

export function useDocumentDraftAutosave({
  initialDocument,
}: UseDocumentDraftAutosaveOptions) {
  const [documentId, setDocumentId] = useState<string | null>(
    initialDocument?.id ?? null,
  );
  const [title, setTitle] = useState(
    initialDocument?.title ?? defaultDraftTitle,
  );
  const [serializedContent, setSerializedContent] = useState<string | null>(
    initialDocument?.serializedContent ?? null,
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [draftRevision, setDraftRevision] = useState(0);
  const [savedRevision, setSavedRevision] = useState(0);
  const draftRevisionRef = useRef(0);
  const isSavingRef = useRef(false);

  const markDraftDirty = useCallback(() => {
    draftRevisionRef.current += 1;
    setDraftRevision(draftRevisionRef.current);

    if (status !== "saving") {
      setStatus("idle");
      setStatusMessage("");
    }
  }, [status]);

  const updateTitle = useCallback(
    (nextTitle: string) => {
      setTitle(nextTitle);
      markDraftDirty();
    },
    [markDraftDirty],
  );

  const updateSerializedContent = useCallback(
    (nextSerializedContent: string) => {
      if (serializedContent === nextSerializedContent) {
        return;
      }

      setSerializedContent(nextSerializedContent);
      markDraftDirty();
    },
    [markDraftDirty, serializedContent],
  );

  const saveDraft = useCallback(async (revisionToSave = draftRevision) => {
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");
    setStatusMessage("");

    try {
      const titleToSave = title.trim() || defaultDraftTitle;
      const content = serializedContent ? JSON.parse(serializedContent) : null;
      const endpoint = documentId
        ? `/api/documents/${documentId}`
        : "/api/documents";
      const method = documentId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: titleToSave,
          content,
        }),
      });

      const data = (await response.json()) as SaveDocumentResponse;

      if (!response.ok || !data.document) {
        throw new Error(data.error ?? "Could not save draft.");
      }

      setDocumentId(data.document.id);
      setSavedRevision((currentRevision) =>
        Math.max(currentRevision, revisionToSave),
      );

      if (draftRevisionRef.current > revisionToSave) {
        setStatus("idle");
        setStatusMessage("");
      } else {
        setStatus("saved");
        setStatusMessage("Draft saved");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save draft.";

      setStatus("error");
      setStatusMessage(message);
    } finally {
      isSavingRef.current = false;
    }
  }, [documentId, draftRevision, serializedContent, title]);

  useEffect(() => {
    if (
      draftRevision <= savedRevision ||
      status === "saving" ||
      status === "error"
    ) {
      return;
    }

    const revisionToSave = draftRevision;
    const timeoutId = window.setTimeout(() => {
      void saveDraft(revisionToSave);
    }, autoSaveDelayMs);

    return () => window.clearTimeout(timeoutId);
  }, [draftRevision, saveDraft, savedRevision, status]);

  return {
    documentId,
    saveDraft,
    status,
    statusMessage,
    title,
    updateSerializedContent,
    updateTitle,
  };
}
