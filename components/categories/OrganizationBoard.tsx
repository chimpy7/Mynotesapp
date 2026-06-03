"use client";

import { useRouter } from "next/navigation";
import type { DragEvent, FormEvent } from "react";
import { useMemo, useState } from "react";

import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryContentModal } from "@/components/categories/CategoryContentModal";
import { CreateCategoryModal } from "@/components/categories/CreateCategoryModal";
import { DropZone } from "@/components/categories/DropZone";
import { EmptyPanel } from "@/components/categories/EmptyPanel";
import { OrganizationDocumentCard } from "@/components/categories/OrganizationDocumentCards";
import type {
  DropTarget,
  OrganizationCategory,
  OrganizationDocument,
  PendingDocumentAction,
} from "@/components/categories/organizationTypes";

export type { OrganizationCategory, OrganizationDocument };

type OrganizationBoardProps = {
  categories: OrganizationCategory[];
  documents: OrganizationDocument[];
};

async function sendJson(
  endpoint: string,
  method: string,
  body?: Record<string, string | null>,
) {
  const response = await fetch(endpoint, {
    method,
    headers: body
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "The request failed.");
  }
}

export function OrganizationBoard({
  categories,
  documents,
}: OrganizationBoardProps) {
  const router = useRouter();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [creatingSubcategoryId, setCreatingSubcategoryId] = useState<
    string | null
  >(null);
  const [draggedDocumentId, setDraggedDocumentId] = useState<string | null>(
    null,
  );
  const [activeDropTarget, setActiveDropTarget] = useState("");
  const [pendingDocumentAction, setPendingDocumentAction] =
    useState<PendingDocumentAction>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [deletingSubcategoryId, setDeletingSubcategoryId] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");

  const documentsByCategory = useMemo(() => {
    const grouped = new Map<string, OrganizationDocument[]>();

    categories.forEach((category) => grouped.set(category.id, []));

    documents.forEach((document) => {
      if (!document.categoryId || document.subcategoryId) {
        return;
      }

      grouped.get(document.categoryId)?.push(document);
    });

    return grouped;
  }, [categories, documents]);

  const documentsBySubcategory = useMemo(() => {
    const grouped = new Map<string, OrganizationDocument[]>();

    categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        grouped.set(subcategory.id, []);
      });
    });

    documents.forEach((document) => {
      if (!document.subcategoryId) {
        return;
      }

      grouped.get(document.subcategoryId)?.push(document);
    });

    return grouped;
  }, [categories, documents]);

  const uncategorizedDocuments = documents.filter(
    (document) => !document.categoryId,
  );
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      return;
    }

    setIsCreatingCategory(true);
    setErrorMessage("");

    try {
      await sendJson("/api/categories", "POST", { name });
      form.reset();
      setIsCategoryModalOpen(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not create category.",
      );
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function createSubcategory(
    event: FormEvent<HTMLFormElement>,
    categoryId: string,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      return;
    }

    setCreatingSubcategoryId(categoryId);
    setErrorMessage("");

    try {
      await sendJson(`/api/categories/${categoryId}/subcategories`, "POST", {
        name,
      });
      form.reset();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create subcategory.",
      );
    } finally {
      setCreatingSubcategoryId(null);
    }
  }

  async function updateDocumentCategory(
    documentId: string,
    categoryId: string | null,
    subcategoryId: string | null,
    fallbackMessage: string,
  ) {
    setErrorMessage("");

    try {
      await sendJson(`/api/documents/${documentId}`, "PATCH", {
        categoryId,
        subcategoryId,
      });
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : fallbackMessage,
      );
    }
  }

  async function moveDocument(
    documentId: string,
    categoryId: string | null,
    subcategoryId: string | null,
  ) {
    await updateDocumentCategory(
      documentId,
      categoryId,
      subcategoryId,
      "Could not move document.",
    );
  }

  async function removeDocumentFromCategory(documentId: string) {
    setPendingDocumentAction({ documentId, action: "remove" });

    try {
      await updateDocumentCategory(
        documentId,
        null,
        null,
        "Could not remove document from category.",
      );
    } finally {
      setPendingDocumentAction(null);
    }
  }

  async function deleteDocument(documentId: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setPendingDocumentAction({ documentId, action: "delete" });
    setErrorMessage("");

    try {
      await sendJson(`/api/documents/${documentId}`, "DELETE");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete document.",
      );
    } finally {
      setPendingDocumentAction(null);
    }
  }

  async function deleteCategory(categoryId: string, name: string) {
    if (
      !window.confirm(
        `Delete "${name}"? Notes in this category will become unorganized.`,
      )
    ) {
      return;
    }

    setDeletingCategoryId(categoryId);
    setErrorMessage("");

    try {
      await sendJson(`/api/categories/${categoryId}`, "DELETE");
      setSelectedCategoryId((currentCategoryId) =>
        currentCategoryId === categoryId ? null : currentCategoryId,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete category.",
      );
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function deleteSubcategory(
    categoryId: string,
    subcategoryId: string,
    name: string,
  ) {
    if (
      !window.confirm(
        `Delete "${name}"? Notes in this subcategory will stay in the parent category.`,
      )
    ) {
      return;
    }

    setDeletingSubcategoryId(subcategoryId);
    setErrorMessage("");

    try {
      await sendJson(
        `/api/categories/${categoryId}/subcategories/${subcategoryId}`,
        "DELETE",
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not delete subcategory.",
      );
    } finally {
      setDeletingSubcategoryId(null);
    }
  }

  function handleDragStart(
    event: DragEvent<HTMLElement>,
    documentId: string,
  ) {
    setDraggedDocumentId(documentId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", documentId);
  }

  function handleDragEnd() {
    setDraggedDocumentId(null);
    setActiveDropTarget("");
  }

  function handleDragOver(event: DragEvent<HTMLElement>, targetKey: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setActiveDropTarget(targetKey);
  }

  async function handleDrop(
    event: DragEvent<HTMLElement>,
    target: DropTarget,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const documentId =
      event.dataTransfer.getData("text/plain") || draggedDocumentId;

    setDraggedDocumentId(null);
    setActiveDropTarget("");

    if (!documentId) {
      return;
    }

    await moveDocument(documentId, target.categoryId, target.subcategoryId);
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-5 py-12 md:flex-row md:px-16">
        <section className="flex w-full flex-col gap-6 md:w-1/2 md:pr-8 lg:pr-12">
          <header className="mb-4 border-b border-[#c3c8c0]/30 pb-4">
            <h1 className="font-[Georgia,serif] text-4xl font-medium leading-[44px] tracking-normal text-[#1a1c1b] md:text-[32px] md:leading-10">
              Unorganized
            </h1>
            <p className="mt-2 text-base leading-[26px] text-[#434842]">
              Drag notes into a category to organize them.
            </p>
          </header>

          <DropZone
            active={activeDropTarget === "uncategorized"}
            className="flex min-h-[160px] flex-col gap-4"
            onDragOver={(event) => handleDragOver(event, "uncategorized")}
            onDrop={(event) =>
              handleDrop(event, { categoryId: null, subcategoryId: null })
            }
          >
            {uncategorizedDocuments.length > 0 ? (
              uncategorizedDocuments.map((document) => (
                <OrganizationDocumentCard
                  document={document}
                  isDragging={draggedDocumentId === document.id}
                  key={document.id}
                  onDelete={deleteDocument}
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                  pendingAction={
                    pendingDocumentAction?.documentId === document.id
                      ? pendingDocumentAction.action
                      : null
                  }
                />
              ))
            ) : (
              <EmptyPanel
                actionHref="/write"
                actionLabel="Create note"
                text="Every saved note currently belongs to a category, or you have not created a note yet."
                title="No unorganized notes"
              />
            )}
          </DropZone>
        </section>

        <div className="hidden w-px shrink-0 bg-[#c3c8c0]/30 md:block" />

        <section className="mt-12 flex w-full flex-col gap-6 border-t border-[#c3c8c0]/30 pt-6 md:mt-0 md:w-1/2 md:border-t-0 md:pl-8 md:pt-0 lg:pl-12">
          <header className="mb-4 flex items-end justify-between border-b border-[#c3c8c0]/30 pb-4">
            <div>
              <h1 className="font-[Georgia,serif] text-4xl font-medium leading-[44px] tracking-normal text-[#1a1c1b] md:text-[32px] md:leading-10">
                Categories
              </h1>
              <p className="mt-2 text-base leading-[26px] text-[#434842]">
                Drop notes here to organize.
              </p>
            </div>
            <button
              aria-label="New Category"
              className="rounded-lg p-2 text-2xl leading-none text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#506051]"
              onClick={() => setIsCategoryModalOpen(true)}
              type="button"
            >
              +
            </button>
          </header>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <CategoryCard
                  activeDropTarget={activeDropTarget}
                  category={category}
                  directDocuments={documentsByCategory.get(category.id) ?? []}
                  documentsBySubcategory={documentsBySubcategory}
                  key={category.id}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onOpenCategory={() => setSelectedCategoryId(category.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel
              text="Create categories to start sorting your notes into a clear structure."
              title="No categories yet"
            />
          )}
        </section>
      </div>

      {isCategoryModalOpen ? (
        <CreateCategoryModal
          errorMessage={errorMessage}
          isCreating={isCreatingCategory}
          onClose={() => setIsCategoryModalOpen(false)}
          onSubmit={createCategory}
        />
      ) : null}

      {selectedCategory ? (
        <CategoryContentModal
          activeDropTarget={activeDropTarget}
          category={selectedCategory}
          creatingSubcategoryId={creatingSubcategoryId}
          deletingSubcategoryId={deletingSubcategoryId}
          directDocuments={documentsByCategory.get(selectedCategory.id) ?? []}
          documentsBySubcategory={documentsBySubcategory}
          draggedDocumentId={draggedDocumentId}
          errorMessage={errorMessage}
          isDeletingCategory={deletingCategoryId === selectedCategory.id}
          onClose={() => setSelectedCategoryId(null)}
          onCreateSubcategory={createSubcategory}
          onDeleteCategory={deleteCategory}
          onDeleteDocument={deleteDocument}
          onDeleteSubcategory={deleteSubcategory}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onRemoveDocumentFromCategory={removeDocumentFromCategory}
          pendingDocumentAction={pendingDocumentAction}
        />
      ) : null}
    </>
  );
}
