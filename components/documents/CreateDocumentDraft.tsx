"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RichTextEditor } from "@/components/editor/RichTextEditor";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type SaveDocumentResponse = {
  document?: {
    id: string;
    updatedAt: string;
  };
  error?: string;
};

type InitialDocument = {
  id: string;
  title: string;
  serializedContent: string | null;
};

type CreateDocumentDraftProps = {
  initialDocument?: InitialDocument;
};

const defaultDraftTitle = "Untitled document";
const autoSaveDelayMs = 4000;

export function CreateDocumentDraft({ initialDocument }: CreateDocumentDraftProps) {
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
          categoryId: null,
          subcategoryId: null,
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

  const handleSerializedChange = useCallback(
    (nextSerializedContent: string) => {
      if (serializedContent === nextSerializedContent) {
        return;
      }

      setSerializedContent(nextSerializedContent);
      markDraftDirty();
    },
    [markDraftDirty, serializedContent],
  );

  return (
    <>
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="document-title">
            Document title
          </label>
          <input
            className="w-full rounded-md border border-transparent bg-transparent px-0 py-1 text-3xl font-semibold tracking-normal text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:px-3"
            id="document-title"
            maxLength={120}
            onChange={(event) => {
              setTitle(event.target.value);
              markDraftDirty();
            }}
            placeholder={defaultDraftTitle}
            type="text"
            value={title}
          />
          <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
            {documentId
              ? "Edit your saved document and save changes."
              : "Draft first, organize into categories later."}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={status === "saving"}
            onClick={() => void saveDraft()}
            type="button"
          >
            {status === "saving" ? "Saving..." : "Save draft"}
          </button>
          {statusMessage ? (
            <p
              className={`text-sm ${
                status === "error" ? "text-red-600" : "text-zinc-500"
              }`}
              role={status === "error" ? "alert" : "status"}
            >
              {statusMessage}
            </p>
          ) : null}
        </div>
      </header>

      <section aria-label="Document editor">
        <RichTextEditor
          initialEditorState={initialDocument?.serializedContent ?? undefined}
          onSerializedChange={handleSerializedChange}
        />
      </section>
    </>
  );
}
