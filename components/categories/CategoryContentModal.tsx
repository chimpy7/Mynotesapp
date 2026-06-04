"use client";

import { useState } from "react";

import { CategoryContentModalHeader } from "@/components/categories/CategoryContentModalHeader";
import { CategoryDocumentsDropZone } from "@/components/categories/CategoryDocumentsDropZone";
import { CreateSubcategoryForm } from "@/components/categories/CreateSubcategoryForm";
import { ErrorAlert } from "@/components/categories/ErrorAlert";
import { PaginationControls } from "@/components/categories/PaginationControls";
import { SubcategoryDropZone } from "@/components/categories/SubcategoryDropZone";
import { getCategoryDocumentCount } from "@/components/categories/categoryDocumentCount";
import type {
  CreateSubcategoryHandler,
  DragOverHandler,
  DragStartHandler,
  DropHandler,
  OrganizationCategory,
  OrganizationDocument,
  PendingDocumentAction,
} from "@/components/categories/organizationTypes";

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

/**
 * Full workspace modal for one selected category.
 * This component coordinates the category sections while child components handle
 * the header, direct-document drop zone, subcategory form, and subcategory cards.
 */
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
  const [subcategoryPage, setSubcategoryPage] = useState(0);
  const documentCount = getCategoryDocumentCount(
    category,
    directDocuments,
    documentsBySubcategory,
  );
  const subcategoryPageCount = Math.max(
    1,
    Math.ceil(category.subcategories.length / subcategoriesPerPage),
  );
  const safeSubcategoryPage = Math.min(
    subcategoryPage,
    subcategoryPageCount - 1,
  );
  // Keep the current page valid if subcategories are deleted while the modal is open.
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
        <CategoryContentModalHeader
          category={category}
          documentCount={documentCount}
          isDeletingCategory={isDeletingCategory}
          onClose={onClose}
          onDeleteCategory={onDeleteCategory}
        />

        <div className="max-h-[calc(90vh-150px)] overflow-y-auto px-6 py-6 md:px-8">
          <ErrorAlert message={errorMessage} />

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)]">
            <section className="flex flex-col gap-5">
              <CategoryDocumentsDropZone
                activeDropTarget={activeDropTarget}
                categoryId={category.id}
                directDocuments={directDocuments}
                draggedDocumentId={draggedDocumentId}
                onDeleteDocument={onDeleteDocument}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                onDragStart={onDragStart}
                onDrop={onDrop}
                onRemoveDocumentFromCategory={onRemoveDocumentFromCategory}
                pendingDocumentAction={pendingDocumentAction}
              />

              <CreateSubcategoryForm
                categoryId={category.id}
                isCreating={creatingSubcategoryId === category.id}
                onSubmit={onCreateSubcategory}
              />
            </section>

            <section className="flex flex-col gap-4">
              <div>
                <h3 className= " text-[14px] font-bold uppercase leading-4 tracking-wide text-[#506051]">
                  Subcategories
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#747872]">
                  Drop notes into more specific groups.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
              <div className="pt-1">
                <PaginationControls
                  currentPage={safeSubcategoryPage}
                  itemLabel="subcategories"
                  itemsPerPage={subcategoriesPerPage}
                  onPageChange={setSubcategoryPage}
                  totalItems={category.subcategories.length}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
