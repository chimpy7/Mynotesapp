"use client";

import { useCallback, useState } from "react";

import { DocumentDraftStatusBar } from "@/components/documents/DocumentDraftStatusBar";
import { DocumentDraftTitleInput } from "@/components/documents/DocumentDraftTitleInput";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import {
  defaultDraftTitle,
  useDocumentDraftAutosave,
  type InitialDocument,
} from "@/components/documents/useDocumentDraftAutosave";

type CreateDocumentDraftProps = {
  initialDocument?: InitialDocument;
};

export function CreateDocumentDraft({ initialDocument }: CreateDocumentDraftProps) {
  const draft = useDocumentDraftAutosave({ initialDocument });
  const [wordCount, setWordCount] = useState(0);

  const updateWordCount = useCallback((plainText: string) => {
    const words = plainText.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, []);

  return (
    <>
      <section
        aria-label="Document editor"
        className="mx-auto flex w-full max-w-[840px] flex-1 px-5 pb-28 pt-8 md:px-16 md:pb-32 md:pt-12"
      >
        <div className="relative flex min-h-[calc(100vh-200px)] w-full flex-col gap-8 rounded-xl border border-[#e3e2e0] bg-white px-8 py-8 shadow-[0_4px_40px_-10px_rgba(80,96,81,0.08)] transition-shadow hover:shadow-[0_8px_50px_-12px_rgba(80,96,81,0.12)] md:px-16 md:py-12">
          <DocumentDraftTitleInput
            onTitleChange={draft.updateTitle}
            placeholder={defaultDraftTitle}
            title={draft.title}
          />
          <RichTextEditor
            initialEditorState={initialDocument?.serializedContent ?? undefined}
            onPlainTextChange={updateWordCount}
            onSerializedChange={draft.updateSerializedContent}
            placeholder="Write your masterpiece here..."
          />
        </div>
      </section>

      <DocumentDraftStatusBar
        onSave={() => void draft.saveDraft()}
        status={draft.status}
        statusMessage={draft.statusMessage}
        wordCount={wordCount}
      />
    </>
  );
}
