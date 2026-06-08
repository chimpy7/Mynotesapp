import { NewDocumentLink } from "@/components/documents/NewDocumentLink";
import type { SaveStatus } from "@/components/documents/useDocumentDraftAutosave";

type DocumentDraftStatusBarProps = {
  characterCount: number;
  isAtDocumentLimit: boolean;
  maxCharacterCount: number;
  onSave: () => void;
  status: SaveStatus;
  statusMessage: string;
  wordCount: number;
};

export function DocumentDraftStatusBar({
  characterCount,
  isAtDocumentLimit,
  maxCharacterCount,
  onSave,
  status,
  statusMessage,
  wordCount,
}: DocumentDraftStatusBarProps) {
  const statusLabel = getStatusLabel(status, statusMessage, isAtDocumentLimit);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf9f7]/90 px-5 py-4 backdrop-blur-sm md:px-8">
      <div className="mx-auto flex w-full max-w-[840px] items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
          <span>{wordCount} words</span>
          <span className="h-1 w-1 rounded-full bg-[#c3c8c0]" />
          <span
            className={isAtDocumentLimit ? "text-[#8a5a00]" : undefined}
          >
            {Math.min(characterCount, maxCharacterCount)} / {maxCharacterCount}{" "}
            characters
          </span>
          <span className="h-1 w-1 rounded-full bg-[#c3c8c0]" />
          <span
            className={
              status === "error"
                ? "truncate text-[#ba1a1a]"
                : "truncate text-[#506051]"
            }
            role={status === "error" ? "alert" : "status"}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#c3c8c0] bg-white px-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#434842] transition-colors hover:border-[#506051] hover:text-[#506051] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "saving"}
            onClick={onSave}
            type="button"
          >
            {status === "saving" ? "Saving" : "Save"}
          </button>
          <NewDocumentLink
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#506051] px-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253]"
          >
            New Note
          </NewDocumentLink>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(
  status: SaveStatus,
  statusMessage: string,
  isAtDocumentLimit: boolean,
) {
  if (status === "saving") {
    return "Saving";
  }

  if (status === "error") {
    return statusMessage || "Could not save";
  }

  if (status === "saved") {
    return statusMessage || "Saved";
  }

  if (isAtDocumentLimit) {
    return "Page limit reached";
  }

  return "Draft";
}
