"use client";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import {
  defaultDraftTitle,
  useDocumentDraftAutosave,
  type InitialDocument,
  type SaveStatus,
} from "@/components/documents/useDocumentDraftAutosave";

type CreateDocumentDraftProps = {
  initialDocument?: InitialDocument;
};

export function CreateDocumentDraft({ initialDocument }: CreateDocumentDraftProps) {
  const draft = useDocumentDraftAutosave({ initialDocument });

  return (
    <>
      <DocumentDraftHeader
        documentId={draft.documentId}
        onSave={() => void draft.saveDraft()}
        onTitleChange={draft.updateTitle}
        status={draft.status}
        statusMessage={draft.statusMessage}
        title={draft.title}
      />

      <section aria-label="Document editor">
        <RichTextEditor
          initialEditorState={initialDocument?.serializedContent ?? undefined}
          onSerializedChange={draft.updateSerializedContent}
        />
      </section>
    </>
  );
}

type DocumentDraftHeaderProps = {
  documentId: string | null;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  status: SaveStatus;
  statusMessage: string;
  title: string;
};

function DocumentDraftHeader({
  documentId,
  onSave,
  onTitleChange,
  status,
  statusMessage,
  title,
}: DocumentDraftHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="document-title">
          Document title
        </label>
        <input
          className="w-full rounded-md border border-transparent bg-transparent px-0 py-1 text-3xl font-semibold tracking-normal text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white focus:px-3"
          id="document-title"
          maxLength={120}
          onChange={(event) => onTitleChange(event.target.value)}
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
          onClick={onSave}
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
  );
}
