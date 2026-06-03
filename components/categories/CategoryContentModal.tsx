"use client";

import type { FormEvent } from "react";
import { useState } from "react";

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

const documentsPerPage = 3;
const subcategoriesPerPage = 2;

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
  const [subcategoryPage, setSubcategoryPage] = useState(0);
  const subcategoryPageCount = Math.max(
    1,
    Math.ceil(category.subcategories.length / subcategoriesPerPage),
  );
  const safeSubcategoryPage = Math.min(
    subcategoryPage,
    subcategoryPageCount - 1,
  );
  const subcategoryPageStart = safeSubcategoryPage * subcategoriesPerPage;
  const visibleSubcategories = category.subcategories.slice(
    subcategoryPageStart,
    subcategoryPageStart + subcategoriesPerPage,
  );

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c1b]/45 px-4 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-[#aeb9ab]/50 bg-[#f5f8f2] shadow-[0_28px_90px_rgba(26,28,27,0.28)]">
        <div className="border-b border-[#aeb9ab]/35 bg-[#edf3e9] px-6 py-5 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[12px] font-medium uppercase leading-4 tracking-wide text-[#486173]">
                Category workspace
              </p>
              <h2 className="mt-2 font-[Georgia,serif] text-4xl font-medium leading-[44px] tracking-normal text-[#1a1c1b]">
                {category.name}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-medium uppercase leading-4 tracking-wide">
                <span className="rounded-full border border-[#aeb9ab]/70 bg-[#f8fbf5] px-3 py-1.5 text-[#506051]">
                  {documentCount} {documentCount === 1 ? "note" : "notes"}
                </span>
                <span className="rounded-full border border-[#aeb9ab]/70 bg-[#f8fbf5] px-3 py-1.5 text-[#506051]">
                  {category.subcategories.length}{" "}
                  {category.subcategories.length === 1
                    ? "subcategory"
                    : "subcategories"}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-white px-4 text-[12px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                disabled={isDeletingCategory}
                onClick={() => onDeleteCategory(category.id, category.name)}
                type="button"
              >
                {isDeletingCategory ? "Deleting..." : "Delete"}
              </button>
              <button
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#aeb9ab]/60 bg-[#f8fbf5] text-xl leading-none text-[#506051] transition-colors hover:border-[#506051]/50 hover:bg-[#e5edde] hover:text-[#3f5140]"
                onClick={onClose}
                type="button"
              >
                x
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6 md:px-8">
          <ErrorAlert message={errorMessage} />

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)]">
            <section className="flex flex-col gap-5">
              <DropZone
                active={activeDropTarget === categoryTargetKey}
                className="min-h-[260px] rounded-2xl border border-[#aeb9ab]/45 bg-[#f8fbf5] p-5 shadow-[0_8px_28px_rgba(80,96,81,0.06)]"
                onDragOver={(event) => onDragOver(event, categoryTargetKey)}
                onDrop={(event) =>
                  onDrop(event, {
                    categoryId: category.id,
                    subcategoryId: null,
                  })
                }
              >
                <div className="border-b border-[#c3c8c0]/20 pb-3">
                  <h3 className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]">
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
                      listId={`category-${category.id}`}
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

              <CreateSubcategoryForm
                categoryId={category.id}
                isCreating={creatingSubcategoryId === category.id}
                onSubmit={onCreateSubcategory}
              />
            </section>

            <section className="flex flex-col gap-4">
              <div>
                <h3 className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]">
                  Subcategories
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#747872]">
                  Drop notes into more specific groups.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {category.subcategories.length > 0 ? (
                  visibleSubcategories.map((subcategory) => (
                    <SubcategoryDropZone
                      activeDropTarget={activeDropTarget}
                      categoryId={category.id}
                      deletingSubcategoryId={deletingSubcategoryId}
                      documentList={
                        documentsBySubcategory.get(subcategory.id) ?? []
                      }
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
                  <div className="rounded-2xl border border-dashed border-[#aeb9ab]/70 bg-[#f8fbf5] px-5 py-8">
                    <p className="text-sm leading-6 text-[#434842]">
                      No subcategories yet. Add one to split this category into
                      smaller sections.
                    </p>
                  </div>
                )}
              </div>
              {subcategoryPageCount > 1 ? (
                <div className="flex items-center justify-between gap-3 border-t border-[#aeb9ab]/35 pt-4">
                  <span className="text-[12px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
                    {subcategoryPageStart + 1}-
                    {Math.min(
                      subcategoryPageStart + subcategoriesPerPage,
                      category.subcategories.length,
                    )}{" "}
                    of {category.subcategories.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex h-8 items-center justify-center rounded-full border border-[#506051] bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#e5edde] disabled:cursor-not-allowed disabled:border-[#aeb9ab] disabled:text-[#9aa198]"
                      disabled={safeSubcategoryPage === 0}
                      onClick={() =>
                        setSubcategoryPage((currentPage) =>
                          Math.max(0, currentPage - 1),
                        )
                      }
                      type="button"
                    >
                      Prev
                    </button>
                    <button
                      className="inline-flex h-8 items-center justify-center rounded-full border border-[#506051] bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#e5edde] disabled:cursor-not-allowed disabled:border-[#aeb9ab] disabled:text-[#9aa198]"
                      disabled={safeSubcategoryPage >= subcategoryPageCount - 1}
                      onClick={() =>
                        setSubcategoryPage((currentPage) =>
                          Math.min(subcategoryPageCount - 1, currentPage + 1),
                        )
                      }
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
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
      className="rounded-2xl border border-[#aeb9ab]/45 bg-[#f8fbf5] p-5 shadow-[0_8px_28px_rgba(80,96,81,0.05)]"
      onSubmit={(event: FormEvent<HTMLFormElement>) =>
        onSubmit(event, categoryId)
      }
    >
      <label
        className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]"
        htmlFor={`modal-subcategory-${categoryId}`}
      >
        New subcategory
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#aeb9ab]/70 bg-white px-4 text-sm text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051] focus:ring-4 focus:ring-[#506051]/10"
          id={`modal-subcategory-${categoryId}`}
          maxLength={80}
          name="name"
          placeholder="Ideas, Drafts, Meetings..."
          type="text"
        />
        <button
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#506051] bg-[#506051] px-5 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#3f5140] disabled:cursor-not-allowed disabled:border-[#9aa198] disabled:bg-[#9aa198]"
          disabled={isCreating}
          type="submit"
        >
          {isCreating ? "Adding..." : "Add"}
        </button>
      </div>
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
          <h3 className="line-clamp-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]">
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

function PaginatedModalDocumentList({
  documents,
  draggedDocumentId,
  listId,
  onDeleteDocument,
  onDragEnd,
  onDragStart,
  onRemoveDocumentFromCategory,
  pendingDocumentAction,
}: {
  documents: OrganizationDocument[];
  draggedDocumentId: string | null;
  listId: string;
  onDeleteDocument: (documentId: string, title: string) => Promise<void>;
  onDragEnd: () => void;
  onDragStart: DragStartHandler;
  onRemoveDocumentFromCategory: (documentId: string) => Promise<void>;
  pendingDocumentAction: PendingDocumentAction;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(documents.length / documentsPerPage));
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

      {pageCount > 1 ? (
        <div
          aria-label={`${listId} pages`}
          className="mt-1 flex items-center justify-between gap-3 border-t border-[#aeb9ab]/35 pt-3"
        >
          <span className="text-[12px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
            {pageStart + 1}-{Math.min(pageStart + documentsPerPage, documents.length)}{" "}
            of {documents.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-8 items-center justify-center rounded-full border border-[#506051] bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#e5edde] disabled:cursor-not-allowed disabled:border-[#aeb9ab] disabled:text-[#9aa198]"
              disabled={safePage === 0}
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              type="button"
            >
              Prev
            </button>
            <button
              className="inline-flex h-8 items-center justify-center rounded-full border border-[#506051] bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#e5edde] disabled:cursor-not-allowed disabled:border-[#aeb9ab] disabled:text-[#9aa198]"
              disabled={safePage >= pageCount - 1}
              onClick={() =>
                setPage((currentPage) => Math.min(pageCount - 1, currentPage + 1))
              }
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
