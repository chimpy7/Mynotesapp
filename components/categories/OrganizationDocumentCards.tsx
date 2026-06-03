import Link from "next/link";
import type { MouseEvent } from "react";

import type {
  DocumentAction,
  DragStartHandler,
  OrganizationDocument,
} from "@/components/categories/organizationTypes";

type DocumentCardProps = {
  document: OrganizationDocument;
  isDragging: boolean;
  onDelete: (documentId: string, title: string) => Promise<void>;
  onDragEnd: () => void;
  onDragStart: DragStartHandler;
  pendingAction: DocumentAction | null;
};

export function OrganizationDocumentCard({
  document,
  isDragging,
  onDelete,
  onDragEnd,
  onDragStart,
  pendingAction,
}: DocumentCardProps) {
  const isPending = Boolean(pendingAction);

  return (
    <article
      className={`group relative flex cursor-grab flex-col overflow-hidden rounded-xl border border-[#c3c8c0]/20 bg-white p-5 shadow-[0_4px_20px_rgba(80,96,81,0.04)] transition-all duration-300 hover:border-[#506051]/50 active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(event, document.id)}
    >
      <div className="mb-2 flex items-start justify-between gap-4">
        <DocumentTitleLink document={document} isDragging={isDragging} />
        <span className="shrink-0 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#c3c8c0] opacity-0 transition-opacity group-hover:opacity-100">
          drag
        </span>
      </div>
      <p className="mb-3 line-clamp-2 text-base leading-[26px] text-[#434842]">
        {document.preview}
      </p>
      <div className="mt-auto flex items-center justify-between border-t border-[#c3c8c0]/10 pt-3">
        <span className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
          {document.updatedAtLabel}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <ViewDocumentLink documentId={document.id} isDragging={isDragging} />
          <button
            className=" border-red-100 bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
            disabled={isPending}
            onClick={() => onDelete(document.id, document.title)}
            type="button"
          >
            {pendingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

type ModalDocumentProps = {
  document: OrganizationDocument;
  isDragging: boolean;
  onDelete: (documentId: string, title: string) => Promise<void>;
  onDragEnd: () => void;
  onDragStart: DragStartHandler;
  onRemoveFromCategory: (documentId: string) => Promise<void>;
  pendingAction: DocumentAction | null;
};

export function ModalDocumentCard({
  document,
  isDragging,
  onDelete,
  onDragEnd,
  onDragStart,
  onRemoveFromCategory,
  pendingAction,
}: ModalDocumentProps) {
  const isPending = Boolean(pendingAction);

  return (
    <article
      className={`cursor-grab rounded-xl border border-[#c3c8c0]/30 bg-white p-5 text-left shadow-[0_6px_20px_rgba(80,96,81,0.06)] transition-all duration-200 hover:border-[#506051]/35 hover:shadow-[0_10px_28px_rgba(80,96,81,0.1)] active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(event, document.id)}
    >
      <DocumentTitleLink compact document={document} isDragging={isDragging} />
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#434842]">
        {document.preview}
      </p>
      <p className="mt-2 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {document.updatedAtLabel}
      </p>
      <div className="mt-4 flex min-w-5 flex-wrap items-center justify-between gap-2 border-t border-[#c3c8c0]/15 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <ViewDocumentLink documentId={document.id} isDragging={isDragging} />
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#506051] bg-[#506051] px-4 text-[11px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#3f5140] disabled:cursor-not-allowed disabled:border-[#9aa198] disabled:bg-[#9aa198]"
            disabled={isPending}
            onClick={() => onRemoveFromCategory(document.id)}
            type="button"
          >
            {pendingAction === "remove" ? "Removing..." : "Remove"}
          </button>
        </div>
        <button
          className="ml-8 inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-red-200 bg-white px-4 text-[11px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
          disabled={isPending}
          onClick={() => onDelete(document.id, document.title)}
          type="button"
        >
          {pendingAction === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}

function DocumentTitleLink({
  compact = false,
  document,
  isDragging,
}: {
  compact?: boolean;
  document: OrganizationDocument;
  isDragging: boolean;
}) {
  return (
    <Link
      className={
        compact
          ? "line-clamp-1 text-sm font-semibold leading-5 text-[#1a1c1b] transition-colors hover:text-[#506051]"
          : "line-clamp-1 font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b] transition-colors group-hover:text-[#506051]"
      }
      href={`/write?documentId=${document.id}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (isDragging) {
          event.preventDefault();
        }
      }}
    >
      {document.title}
    </Link>
  );
}

function ViewDocumentLink({
  documentId,
  isDragging,
}: {
  documentId: string;
  isDragging: boolean;
}) {
  return (
    <Link
      className="inline-flex h-9 w-fit shrink-0 items-center justify-center rounded-full border border-[#506051] bg-[#506051] px-4 text-[11px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#3f5140]"
      href={`/write?documentId=${documentId}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (isDragging) {
          event.preventDefault();
        }
      }}
    >
      View
    </Link>
  );
}
