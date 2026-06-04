"use client";

import { useState } from "react";

import { ModalDocumentCard } from "@/components/categories/OrganizationDocumentCards";
import type {
  DragStartHandler,
  OrganizationDocument,
  PendingDocumentAction,
} from "@/components/categories/organizationTypes";
import { PaginationControls } from "@/components/ui/PaginationControls";

const documentsPerPage = 3;

type PaginatedModalDocumentListProps = {
  documents: OrganizationDocument[];
  draggedDocumentId: string | null;
  listId: string;
  onDeleteDocument: (documentId: string, title: string) => Promise<void>;
  onDragEnd: () => void;
  onDragStart: DragStartHandler;
  onRemoveDocumentFromCategory: (documentId: string) => Promise<void>;
  pendingDocumentAction: PendingDocumentAction;
};

/**
 * Shows a small paginated list of modal document cards.
 * Pagination keeps subcategory panels compact when a category contains many notes.
 */
export function PaginatedModalDocumentList({
  documents,
  draggedDocumentId,
  listId,
  onDeleteDocument,
  onDragEnd,
  onDragStart,
  onRemoveDocumentFromCategory,
  pendingDocumentAction,
}: PaginatedModalDocumentListProps) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(documents.length / documentsPerPage));
  // Keep the current page valid if a document is removed from the active page.
  const safePage = Math.min(page, pageCount - 1);
  const pageStart = safePage * documentsPerPage;
  const visibleDocuments = documents.slice(
    pageStart,
    pageStart + documentsPerPage,
  );

  return (
    <div className="flex flex-col gap-3">
      {visibleDocuments.map((document) => (
        <ModalDocumentCard
          document={document}
          isDragging={draggedDocumentId === document.id}
          key={document.id}
          onDelete={onDeleteDocument}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onRemoveFromCategory={onRemoveDocumentFromCategory}
          pendingAction={
            pendingDocumentAction?.documentId === document.id
              ? pendingDocumentAction.action
              : null
          }
        />
      ))}

      <div className="mt-1">
        <PaginationControls
          currentPage={safePage}
          itemLabel={listId}
          itemsPerPage={documentsPerPage}
          onPageChange={setPage}
          totalItems={documents.length}
        />
      </div>
    </div>
  );
}
