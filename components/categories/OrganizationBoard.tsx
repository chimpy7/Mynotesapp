"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DragEvent,
  FormEvent,
  MouseEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

export type OrganizationDocument = {
  id: string;
  title: string;
  preview: string;
  categoryId: string | null;
  subcategoryId: string | null;
  updatedAtLabel: string;
};

export type OrganizationCategory = {
  id: string;
  name: string;
  subcategories: {
    id: string;
    name: string;
  }[];
};

type OrganizationBoardProps = {
  categories: OrganizationCategory[];
  documents: OrganizationDocument[];
};

type DropTarget = {
  categoryId: string | null;
  subcategoryId: string | null;
};

async function sendJson(
  endpoint: string,
  method: string,
  body: Record<string, string | null>,
) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

  async function moveDocument(
    documentId: string,
    categoryId: string | null,
    subcategoryId: string | null,
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
        error instanceof Error ? error.message : "Could not move document.",
      );
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

          {errorMessage ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

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
                <DocumentCard
                  document={document}
                  isDragging={draggedDocumentId === document.id}
                  key={document.id}
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
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
          directDocuments={
            documentsByCategory.get(selectedCategory.id) ?? []
          }
          documentsBySubcategory={documentsBySubcategory}
          draggedDocumentId={draggedDocumentId}
          onClose={() => setSelectedCategoryId(null)}
          onCreateSubcategory={createSubcategory}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ) : null}
    </>
  );
}

function CategoryContentModal({
  activeDropTarget,
  category,
  creatingSubcategoryId,
  directDocuments,
  documentsBySubcategory,
  draggedDocumentId,
  onClose,
  onCreateSubcategory,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
}: {
  activeDropTarget: string;
  category: OrganizationCategory;
  creatingSubcategoryId: string | null;
  directDocuments: OrganizationDocument[];
  documentsBySubcategory: Map<string, OrganizationDocument[]>;
  draggedDocumentId: string | null;
  onClose: () => void;
  onCreateSubcategory: (
    event: FormEvent<HTMLFormElement>,
    categoryId: string,
  ) => Promise<void>;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>, targetKey: string) => void;
  onDragStart: (event: DragEvent<HTMLElement>, documentId: string) => void;
  onDrop: (event: DragEvent<HTMLElement>, target: DropTarget) => Promise<void>;
}) {
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
          <button
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-xl leading-none text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#506051]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-5">
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
                  <ModalDocument
                    document={document}
                    isDragging={draggedDocumentId === document.id}
                    key={document.id}
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                  />
                ))
              ) : (
                <p className="text-sm leading-6 text-[#747872]">
                  Drop a note here to keep it directly in this category.
                </p>
              )}
            </div>
          </DropZone>

          <form
            className="flex gap-2"
            onSubmit={(event) => onCreateSubcategory(event, category.id)}
          >
            <label className="sr-only" htmlFor={`modal-subcategory-${category.id}`}>
              Subcategory name
            </label>
            <input
              className="min-w-0 flex-1 rounded-lg border border-[#c3c8c0]/50 bg-white px-3 py-2 text-sm text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051]"
              id={`modal-subcategory-${category.id}`}
              maxLength={80}
              name="name"
              placeholder="New subcategory"
              type="text"
            />
            <button
              className="shrink-0 rounded-lg border border-[#c3c8c0] bg-white px-3 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec] disabled:cursor-not-allowed disabled:text-[#9aa198]"
              disabled={creatingSubcategoryId === category.id}
              type="submit"
            >
              Add
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {category.subcategories.length > 0 ? (
              category.subcategories.map((subcategory) => {
                const subcategoryTargetKey = `modal-subcategory:${subcategory.id}`;
                const subcategoryDocuments =
                  documentsBySubcategory.get(subcategory.id) ?? [];

                return (
                  <DropZone
                    active={activeDropTarget === subcategoryTargetKey}
                    className="rounded-xl border border-[#c3c8c0]/30 bg-[#efeeec] p-4"
                    key={subcategory.id}
                    onDragOver={(event) =>
                      onDragOver(event, subcategoryTargetKey)
                    }
                    onDrop={(event) =>
                      onDrop(event, {
                        categoryId: category.id,
                        subcategoryId: subcategory.id,
                      })
                    }
                  >
                    <h3 className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]">
                      {subcategory.name}
                    </h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {subcategoryDocuments.length > 0 ? (
                        subcategoryDocuments.map((document) => (
                          <ModalDocument
                            document={document}
                            isDragging={draggedDocumentId === document.id}
                            key={document.id}
                            onDragEnd={onDragEnd}
                            onDragStart={onDragStart}
                          />
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-[#747872]">
                          Drop a note here.
                        </p>
                      )}
                    </div>
                  </DropZone>
                );
              })
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

function CategoryCard({
  activeDropTarget,
  category,
  directDocuments,
  documentsBySubcategory,
  onDragOver,
  onDrop,
  onOpenCategory,
}: {
  activeDropTarget: string;
  category: OrganizationCategory;
  directDocuments: OrganizationDocument[];
  documentsBySubcategory: Map<string, OrganizationDocument[]>;
  onDragOver: (event: DragEvent<HTMLElement>, targetKey: string) => void;
  onDrop: (event: DragEvent<HTMLElement>, target: DropTarget) => Promise<void>;
  onOpenCategory: () => void;
}) {
  const categoryTargetKey = `category:${category.id}`;
  const documentCount =
    directDocuments.length +
    category.subcategories.reduce(
      (count, subcategory) =>
        count + (documentsBySubcategory.get(subcategory.id)?.length ?? 0),
      0,
    );

  return (
    <DropZone
      active={activeDropTarget === categoryTargetKey}
      className="group relative flex min-h-[190px] cursor-pointer flex-col rounded-xl border border-transparent bg-[#efeeec] p-5 text-center transition-all duration-300 hover:border-[#506051]/30"
      onClick={onOpenCategory}
      onDragOver={(event) => onDragOver(event, categoryTargetKey)}
      onDrop={(event) =>
        onDrop(event, {
          categoryId: category.id,
          subcategoryId: null,
        })
      }
    >
      <div className="mx-auto mb-3 h-10 w-12 transition-transform duration-300 group-hover:scale-110">
        <div className="h-3 w-7 rounded-t bg-[#506051]/60" />
        <div className="h-8 rounded bg-[#506051]/70" />
      </div>
      <h3 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b] transition-colors group-hover:text-[#506051]">
        {category.name}
      </h3>
      <span className="mt-1 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {documentCount} {documentCount === 1 ? "Note" : "Notes"}
      </span>
      {category.subcategories.length > 0 ? (
        <span className="mt-3 text-xs leading-5 text-[#747872]">
          {category.subcategories.length}{" "}
          {category.subcategories.length === 1
            ? "subcategory"
            : "subcategories"}
        </span>
      ) : null}
    </DropZone>
  );
}

function DocumentCard({
  document,
  isDragging,
  onDragEnd,
  onDragStart,
}: {
  document: OrganizationDocument;
  isDragging: boolean;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, documentId: string) => void;
}) {
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
        <Link
          className="line-clamp-1 font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b] transition-colors group-hover:text-[#506051]"
          href={`/write?documentId=${document.id}`}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (isDragging) {
              event.preventDefault();
            }
          }}
        >
          {document.title}
        </Link>
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
        <Link
          className="rounded-full border border-[#c3c8c0] bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec]"
          href={`/write?documentId=${document.id}`}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (isDragging) {
              event.preventDefault();
            }
          }}
        >
          View
        </Link>
      </div>
    </article>
  );
}

function ModalDocument({
  document,
  isDragging,
  onDragEnd,
  onDragStart,
}: {
  document: OrganizationDocument;
  isDragging: boolean;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, documentId: string) => void;
}) {
  return (
    <article
      className={`cursor-grab rounded-lg border border-[#c3c8c0]/30 bg-white p-3 text-left shadow-[0_4px_14px_rgba(80,96,81,0.04)] transition-opacity active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(event, document.id)}
    >
      <Link
        className="line-clamp-1 text-sm font-semibold leading-5 text-[#1a1c1b] transition-colors hover:text-[#506051]"
        href={`/write?documentId=${document.id}`}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (isDragging) {
            event.preventDefault();
          }
        }}
      >
        {document.title}
      </Link>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#434842]">
        {document.preview}
      </p>
      <p className="mt-2 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {document.updatedAtLabel}
      </p>
      <Link
        className="mt-3 inline-flex w-fit rounded-full border border-[#c3c8c0] bg-white px-3 py-1.5 text-[12px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec]"
        href={`/write?documentId=${document.id}`}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (isDragging) {
            event.preventDefault();
          }
        }}
      >
        View
      </Link>
    </article>
  );
}

function DropZone({
  active,
  children,
  className,
  onClick,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  children: ReactNode;
  className: string;
  onClick?: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className={`${className} ${
        active ? "outline outline-2 outline-offset-2 outline-[#506051]/50" : ""
      }`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
}

function CreateCategoryModal({
  isCreating,
  onClose,
  onSubmit,
}: {
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c1b]/30 px-4"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-xl border border-[#c3c8c0]/30 bg-[#faf9f7] p-5 shadow-[0_20px_60px_rgba(26,28,27,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b]">
              New Category
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#434842]">
              Create a place for related notes.
            </p>
          </div>
          <button
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-xl leading-none text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#506051]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="category-name">
            Category name
          </label>
          <input
            autoFocus
            className="rounded-lg border border-[#c3c8c0]/50 bg-white px-3 py-2 text-sm text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051]"
            id="category-name"
            maxLength={80}
            name="name"
            placeholder="Category name"
            type="text"
          />
          <div className="flex justify-end gap-2">
            <button
              className="rounded-full border border-[#c3c8c0] bg-white px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-[#506051] px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253] disabled:cursor-not-allowed disabled:bg-[#9aa198]"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyPanel({
  actionHref,
  actionLabel,
  text,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-[#c3c8c0]/20 bg-white p-5 shadow-[0_4px_20px_rgba(80,96,81,0.04)]">
      <h2 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b]">
        {title}
      </h2>
      <p className="mt-2 text-base leading-[26px] text-[#434842]">{text}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-5 inline-flex rounded-full bg-[#506051] px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
