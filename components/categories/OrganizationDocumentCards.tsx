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
            className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
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
      className={`cursor-grab rounded-lg border border-[#c3c8c0]/30 bg-white p-3 text-left shadow-[0_4px_14px_rgba(80,96,81,0.04)] transition-opacity active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(event, document.id)}
    >
      <DocumentTitleLink compact document={document} isDragging={isDragging} />
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#434842]">
        {document.preview}
      </p>
      <p className="mt-2 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {document.updatedAtLabel}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <ViewDocumentLink documentId={document.id} isDragging={isDragging} />
        <button
          className="rounded-full border border-[#c3c8c0] bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec] disabled:cursor-not-allowed disabled:text-[#9aa198]"
          disabled={isPending}
          onClick={() => onRemoveFromCategory(document.id)}
          type="button"
        >
          {pendingAction === "remove" ? "Removing..." : "Remove from category"}
        </button>
        <button
          className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
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
      className="inline-flex w-fit rounded-full border border-[#c3c8c0] bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec]"
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
