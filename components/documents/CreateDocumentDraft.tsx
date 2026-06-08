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
import { maxDocumentPlainTextLength } from "@/lib/documentLimits";

type CreateDocumentDraftProps = {
  draftKey: string;
  initialDocument?: InitialDocument;
};

export function CreateDocumentDraft({
  draftKey,
  initialDocument,
}: CreateDocumentDraftProps) {
  const draft = useDocumentDraftAutosave({ initialDocument });
  const [characterCount, setCharacterCount] = useState(0);
  const [isAtDocumentLimit, setIsAtDocumentLimit] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const updateDocumentStats = useCallback((plainText: string) => {
    const words = plainText.trim().split(/\s+/).filter(Boolean);

    setCharacterCount(plainText.length);
    setIsAtDocumentLimit(plainText.length >= maxDocumentPlainTextLength);
    setWordCount(words.length);
  }, []);

  return (
    <>
      <section
        aria-label="Document editor"
        className="mx-auto flex min-h-0 w-full max-w-[870px] flex-1 px-5 pb-28 pt-8 md:px-10 md:pb-32 md:pt-10"
      >
        <div className="relative flex h-[calc(100vh-165px)] max-h-[1090px] min-h-[620px] w-full flex-col gap-8 overflow-hidden rounded-xl border border-[#e3e2e0] bg-white px-8 py-8 shadow-[0_4px_40px_-10px_rgba(80,96,81,0.08)] transition-shadow hover:shadow-[0_8px_50px_-12px_rgba(80,96,81,0.12)] md:px-16 md:py-12">
          <DocumentDraftTitleInput
            onTitleChange={draft.updateTitle}
            placeholder={defaultDraftTitle}
            title={draft.title}
          />
          <RichTextEditor
            initialEditorState={initialDocument?.serializedContent ?? undefined}
            key={draftKey}
            maxPlainTextLength={maxDocumentPlainTextLength}
            onLimitChange={setIsAtDocumentLimit}
            onPlainTextChange={updateDocumentStats}
            onSerializedChange={draft.updateSerializedContent}
            placeholder="Write your masterpiece here..."
          />
        </div>
      </section>

      <DocumentDraftStatusBar
        characterCount={characterCount}
        isAtDocumentLimit={isAtDocumentLimit}
        maxCharacterCount={maxDocumentPlainTextLength}
        onSave={() => void draft.saveDraft()}
        status={draft.status}
        statusMessage={draft.statusMessage}
        wordCount={wordCount}
      />
    </>
  );
}
