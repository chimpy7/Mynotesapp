import type { FormEvent } from "react";

import { DropZone } from "@/components/categories/DropZone";
import { ErrorAlert } from "@/components/categories/ErrorAlert";
import { ModalDocumentCard } from "@/components/categories/OrganizationDocumentCards";
import type {
  CreateSubcategoryHandler,
  DragOverHandler,
  DragStartHandler,
  DropHandler,
  OrganizationCategory,
  OrganizationDocument,
  PendingDocumentAction,
} from "@/components/categories/organizationTypes";

type CategoryContentModalProps = {
  activeDropTarget: string;
  category: OrganizationCategory;
  creatingSubcategoryId: string | null;
  deletingSubcategoryId: string | null;
  directDocuments: OrganizationDocument[];
  documentsBySubcategory: Map<string, OrganizationDocument[]>;
  draggedDocumentId: string | null;
  errorMessage: string;
  isDeletingCategory: boolean;
  onClose: () => void;
  onCreateSubcategory: CreateSubcategoryHandler;
  onDeleteCategory: (categoryId: string, name: string) => Promise<void>;
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
};

export function CategoryContentModal({
  activeDropTarget,
  category,
  creatingSubcategoryId,
  deletingSubcategoryId,
  directDocuments,
  documentsBySubcategory,
  draggedDocumentId,
  errorMessage,
  isDeletingCategory,
  onClose,
  onCreateSubcategory,
  onDeleteCategory,
  onDeleteDocument,
  onDeleteSubcategory,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onRemoveDocumentFromCategory,
  pendingDocumentAction,
}: CategoryContentModalProps) {
  const documentCount =
    directDocuments.length +
    category.subcategories.reduce(
      (count, subcategory) =>
        count + (documentsBySubcategory.get(subcategory.id)?.length ?? 0),
      0,
    );
  const categoryTargetKey = `modal-category:${category.id}`;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c1b]/30 px-4"
      role="dialog"
    >
      <div className="max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#c3c8c0]/30 bg-[#faf9f7] p-5 shadow-[0_20px_60px_rgba(26,28,27,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#c3c8c0]/30 pb-4">
          <div>
            <h2 className="font-[Georgia,serif] text-3xl font-medium leading-9 tracking-normal text-[#1a1c1b]">
              {category.name}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#434842]">
              {documentCount} {documentCount === 1 ? "note" : "notes"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
              disabled={isDeletingCategory}
              onClick={() => onDeleteCategory(category.id, category.name)}
              type="button"
            >
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </button>
            <button
              aria-label="Close"
              className="rounded-lg px-2 py-1 text-xl leading-none text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#506051]"
              onClick={onClose}
              type="button"
            >
              x
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <ErrorAlert message={errorMessage} />

          <DropZone
            active={activeDropTarget === categoryTargetKey}
            className="rounded-xl border border-[#c3c8c0]/30 bg-white p-4"
            onDragOver={(event) => onDragOver(event, categoryTargetKey)}
            onDrop={(event) =>
              onDrop(event, {
                categoryId: category.id,
                subcategoryId: null,
              })
            }
          >
            <h3 className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]">
              Notes in category
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {directDocuments.length > 0 ? (
                directDocuments.map((document) => (
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
                ))
              ) : (
                <p className="text-sm leading-6 text-[#747872]">
                  Drop a note here to keep it directly in this category.
                </p>
              )}
            </div>
          </DropZone>

          <CreateSubcategoryForm
            categoryId={category.id}
            isCreating={creatingSubcategoryId === category.id}
            onSubmit={onCreateSubcategory}
          />

          <div className="flex flex-col gap-3">
            {category.subcategories.length > 0 ? (
              category.subcategories.map((subcategory) => (
                <SubcategoryDropZone
                  activeDropTarget={activeDropTarget}
                  categoryId={category.id}
                  deletingSubcategoryId={deletingSubcategoryId}
                  documentList={documentsBySubcategory.get(subcategory.id) ?? []}
                  draggedDocumentId={draggedDocumentId}
                  key={subcategory.id}
                  onDeleteDocument={onDeleteDocument}
                  onDeleteSubcategory={onDeleteSubcategory}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                  onRemoveDocumentFromCategory={onRemoveDocumentFromCategory}
                  pendingDocumentAction={pendingDocumentAction}
                  subcategory={subcategory}
                />
              ))
            ) : (
              <div className="rounded-xl border border-[#c3c8c0]/20 bg-white p-4">
                <p className="text-sm leading-6 text-[#434842]">
                  No subcategories yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateSubcategoryForm({
  categoryId,
  isCreating,
  onSubmit,
}: {
  categoryId: string;
  isCreating: boolean;
  onSubmit: CreateSubcategoryHandler;
}) {
  return (
    <form
      className="flex gap-2"
      onSubmit={(event: FormEvent<HTMLFormElement>) =>
        onSubmit(event, categoryId)
      }
    >
      <label className="sr-only" htmlFor={`modal-subcategory-${categoryId}`}>
        Subcategory name
      </label>
      <input
        className="min-w-0 flex-1 rounded-lg border border-[#c3c8c0]/50 bg-white px-3 py-2 text-sm text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051]"
        id={`modal-subcategory-${categoryId}`}
        maxLength={80}
        name="name"
        placeholder="New subcategory"
        type="text"
      />
      <button
        className="shrink-0 rounded-lg border border-[#c3c8c0] bg-white px-3 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec] disabled:cursor-not-allowed disabled:text-[#9aa198]"
        disabled={isCreating}
        type="submit"
      >
        Add
      </button>
    </form>
  );
}

function SubcategoryDropZone({
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
}: {
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
}) {
  const subcategoryTargetKey = `modal-subcategory:${subcategory.id}`;

  return (
    <DropZone
      active={activeDropTarget === subcategoryTargetKey}
      className="rounded-xl border border-[#c3c8c0]/30 bg-[#efeeec] p-4"
      onDragOver={(event) => onDragOver(event, subcategoryTargetKey)}
      onDrop={(event) =>
        onDrop(event, {
          categoryId,
          subcategoryId: subcategory.id,
        })
      }
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]">
          {subcategory.name}
        </h3>
        <button
          className="shrink-0 rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
          disabled={deletingSubcategoryId === subcategory.id}
          onClick={() =>
            onDeleteSubcategory(categoryId, subcategory.id, subcategory.name)
          }
          type="button"
        >
          {deletingSubcategoryId === subcategory.id ? "Deleting..." : "Delete"}
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {documentList.length > 0 ? (
          documentList.map((document) => (
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
          ))
        ) : (
          <p className="text-sm leading-6 text-[#747872]">Drop a note here.</p>
        )}
      </div>
    </DropZone>
  );
}
