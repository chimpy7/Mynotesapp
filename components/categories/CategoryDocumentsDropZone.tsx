import { PaginatedModalDocumentList } from "@/components/categories/PaginatedModalDocumentList";
import type {
  DragOverHandler,
  DragStartHandler,
  DropHandler,
  OrganizationDocument,
  PendingDocumentAction,
} from "@/components/categories/organizationTypes";
import { DropZone } from "@/components/ui/DropZone";

type CategoryDocumentsDropZoneProps = {
  activeDropTarget: string;
  categoryId: string;
  directDocuments: OrganizationDocument[];
  draggedDocumentId: string | null;
  onDeleteDocument: (documentId: string, title: string) => Promise<void>;
  onDragEnd: () => void;
  onDragOver: DragOverHandler;
  onDragStart: DragStartHandler;
  onDrop: DropHandler;
  onRemoveDocumentFromCategory: (documentId: string) => Promise<void>;
  pendingDocumentAction: PendingDocumentAction;
};

/**
 * Drop target for documents that should belong directly to a category.
 * Documents dropped here keep the category id and clear any subcategory id.
 */
export function CategoryDocumentsDropZone({
  activeDropTarget,
  categoryId,
  directDocuments,
  draggedDocumentId,
  onDeleteDocument,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onRemoveDocumentFromCategory,
  pendingDocumentAction,
}: CategoryDocumentsDropZoneProps) {
  const categoryTargetKey = `modal-category:${categoryId}`;

  return (
    <DropZone
      active={activeDropTarget === categoryTargetKey}
      className="min-h-[260px] rounded-2xl border border-[#aeb9ab]/45 bg-[#f8fbf5] p-5 shadow-[0_8px_28px_rgba(80,96,81,0.06)]"
      onDragOver={(event) => onDragOver(event, categoryTargetKey)}
      onDrop={(event) =>
        onDrop(event, {
          categoryId,
          subcategoryId: null,
        })
      }
    >
      <div className="border-b border-[#c3c8c0]/20 pb-3">
        <h3 className="text-[15px] font-bold uppercase leading-4 tracking-wide text-[#506051]">
          Notes in category
        </h3>
        <p className="mt-1 text-sm leading-6 text-[#747872]">
          Notes that belong to the main category.
        </p>
      </div>
      <div className="mt-4">
        {directDocuments.length > 0 ? (
          <PaginatedModalDocumentList
            documents={directDocuments}
            draggedDocumentId={draggedDocumentId}
            listId={`category-${categoryId}`}
            onDeleteDocument={onDeleteDocument}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onRemoveDocumentFromCategory={onRemoveDocumentFromCategory}
            pendingDocumentAction={pendingDocumentAction}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-[#aeb9ab]/70 bg-[#edf3e9] px-4 py-6">
            <p className="text-sm leading-6 text-[#747872]">
              Drop a note here to keep it directly in this category.
            </p>
          </div>
        )}
      </div>
    </DropZone>
  );
}
