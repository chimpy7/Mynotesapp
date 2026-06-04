import { DropZone } from "@/components/categories/DropZone";
import { PaginatedModalDocumentList } from "@/components/categories/PaginatedModalDocumentList";
import type {
  DragOverHandler,
  DragStartHandler,
  DropHandler,
  OrganizationCategory,
  OrganizationDocument,
  PendingDocumentAction,
} from "@/components/categories/organizationTypes";

type SubcategoryDropZoneProps = {
  activeDropTarget: string;
  categoryId: string;
  deletingSubcategoryId: string | null;
  documentList: OrganizationDocument[];
  draggedDocumentId: string | null;
  onDeleteDocument: (documentId: string, title: string) => Promise<void>;
  onDeleteSubcategory: (
    categoryId: string,
    subcategoryId: string,
    name: string,
  ) => Promise<void>;
  onDragEnd: () => void;
  onDragOver: DragOverHandler;
  onDragStart: DragStartHandler;
  onDrop: DropHandler;
  onRemoveDocumentFromCategory: (documentId: string) => Promise<void>;
  pendingDocumentAction: PendingDocumentAction;
  subcategory: OrganizationCategory["subcategories"][number];
};

/**
 * Drop target and document list for a single subcategory inside the modal.
 * Documents dropped here are assigned to both the parent category and this subcategory.
 */
export function SubcategoryDropZone({
  activeDropTarget,
  categoryId,
  deletingSubcategoryId,
  documentList,
  draggedDocumentId,
  onDeleteDocument,
  onDeleteSubcategory,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onRemoveDocumentFromCategory,
  pendingDocumentAction,
  subcategory,
}: SubcategoryDropZoneProps) {
  const subcategoryTargetKey = `modal-subcategory:${subcategory.id}`;

  return (
    <DropZone
      active={activeDropTarget === subcategoryTargetKey}
      className="min-h-[220px] rounded-2xl border border-[#aeb9ab]/45 bg-[#e8f0e3] p-5 shadow-[0_8px_28px_rgba(80,96,81,0.05)]"
      onDragOver={(event) => onDragOver(event, subcategoryTargetKey)}
      onDrop={(event) =>
        onDrop(event, {
          categoryId,
          subcategoryId: subcategory.id,
        })
      }
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#c3c8c0]/25 pb-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-[Georgia,serif] text-[15px] font-bold uppercase leading-4 tracking-normal text-[#1a1c1b]">
            {subcategory.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#747872]">
            {documentList.length} {documentList.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <button
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
          disabled={deletingSubcategoryId === subcategory.id}
          onClick={() =>
            onDeleteSubcategory(categoryId, subcategory.id, subcategory.name)
          }
          type="button"
        >
          {deletingSubcategoryId === subcategory.id ? "Deleting..." : "Delete"}
        </button>
      </div>
      <div className="mt-4">
        {documentList.length > 0 ? (
          <PaginatedModalDocumentList
            documents={documentList}
            draggedDocumentId={draggedDocumentId}
            listId={`subcategory-${subcategory.id}`}
            onDeleteDocument={onDeleteDocument}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onRemoveDocumentFromCategory={onRemoveDocumentFromCategory}
            pendingDocumentAction={pendingDocumentAction}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-[#aeb9ab]/70 bg-[#f8fbf5] px-4 py-5">
            <p className="text-sm leading-6 text-[#747872]">
              Drop a note here.
            </p>
          </div>
        )}
      </div>
    </DropZone>
  );
}
