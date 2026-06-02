import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthControls } from "@/components/auth/AuthControls";
import { connectToDatabase } from "@/lib/db";
import { ensureCurrentUser } from "@/lib/users";
import { CategoryModel } from "@/models/Category";
import { DocumentModel } from "@/models/Document";

type LexicalNode = {
  text?: string;
  children?: LexicalNode[];
};

type DocumentSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAtLabel: string;
};

type CategorySummary = {
  id: string;
  name: string;
  documentCount: number;
};

function collectLexicalText(node: LexicalNode, parts: string[]) {
  if (typeof node.text === "string") {
    parts.push(node.text);
  }

  node.children?.forEach((child) => collectLexicalText(child, parts));
}

function getDocumentPreview(content: unknown) {
  if (!content || typeof content !== "object") {
    return "No preview available.";
  }

  const root = (content as { root?: LexicalNode }).root;

  if (!root) {
    return "No preview available.";
  }

  const parts: string[] = [];
  collectLexicalText(root, parts);

  return parts.join(" ").replace(/\s+/g, " ").trim() || "No preview available.";
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

export default async function DocumentsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await ensureCurrentUser();
  await connectToDatabase();

  const [savedDocuments, savedCategories] = await Promise.all([
    DocumentModel.find({ userId })
      .sort({ updatedAt: -1 })
      .select("title content categoryId updatedAt")
      .exec(),
    CategoryModel.find({ userId }).sort({ name: 1 }).select("name").exec(),
  ]);

  const uncategorizedDocuments: DocumentSummary[] = savedDocuments
    .filter((document) => !document.categoryId)
    .map((document) => ({
      id: document._id.toString(),
      title: document.title,
      preview: getDocumentPreview(document.content),
      updatedAtLabel: dateFormatter.format(document.updatedAt),
    }));

  const categoryDocumentCounts = new Map<string, number>();

  savedDocuments.forEach((document) => {
    const categoryId = document.categoryId?.toString();

    if (categoryId) {
      categoryDocumentCounts.set(
        categoryId,
        (categoryDocumentCounts.get(categoryId) ?? 0) + 1,
      );
    }
  });

  const categories: CategorySummary[] = savedCategories.map((category) => {
    const id = category._id.toString();

    return {
      id,
      name: category.name,
      documentCount: categoryDocumentCounts.get(id) ?? 0,
    };
  });

  return (
    <main className="flex min-h-screen flex-col bg-[#faf9f7] font-[Arial,Helvetica,sans-serif] text-[#1a1c1b] selection:bg-[#506051]/20">
      <nav className="sticky top-0 z-50 w-full border-b border-transparent bg-[#faf9f7]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[840px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              className="font-[Georgia,serif] text-2xl font-medium tracking-normal text-[#1a1c1b]"
              href="/documents"
            >
              Notes
            </Link>
            <div className="hidden items-center gap-6 pt-1 md:flex">
              <Link
                className="text-base leading-7 text-[#434842] transition-colors hover:text-[#506051]"
                href="/write"
              >
                Writing
              </Link>
              <Link
                aria-current="page"
                className="border-b border-[#506051] pb-1 text-base font-semibold leading-7 text-[#506051]"
                href="/documents"
              >
                Organization
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              className="hidden items-center justify-center rounded-full bg-[#506051] px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253] md:flex"
              href="/write"
            >
              New Note
            </Link>
            <AuthControls />
          </div>
        </div>
      </nav>

      <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-5 py-12 md:flex-row md:px-16">
        <section className="flex w-full flex-col gap-6 md:w-1/2 md:pr-8 lg:pr-12">
          <header className="mb-4 border-b border-[#c3c8c0]/30 pb-4">
            <h1 className="font-[Georgia,serif] text-4xl font-medium leading-[44px] tracking-normal text-[#1a1c1b] md:text-[32px] md:leading-10">
              Unorganized
            </h1>
            <p className="mt-2 text-base leading-[26px] text-[#434842]">
              Move notes to a category to organize them.
            </p>
          </header>

          <div className="flex flex-col gap-4">
            {uncategorizedDocuments.length > 0 ? (
              uncategorizedDocuments.map((document) => (
                <UnorganizedDocumentCard document={document} key={document.id} />
              ))
            ) : (
              <EmptyPanel
                actionHref="/write"
                actionLabel="Create note"
                text="Every saved note currently belongs to a category, or you have not created a note yet."
                title="No unorganized notes"
              />
            )}
          </div>
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
              className="rounded-lg p-2 text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#506051]"
              type="button"
            >
              +
            </button>
          </header>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {categories.map((category) => (
                <CategoryCard category={category} key={category.id} />
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

      <footer className="mt-auto border-t border-[#c3c8c0]/30 bg-[#faf9f7]">
        <div className="mx-auto flex w-full max-w-[840px] flex-col items-center gap-4 px-6 py-12">
          <div className="font-[Georgia,serif] text-2xl font-medium tracking-normal text-[#1a1c1b]">
            Notes
          </div>
          <div className="flex gap-6 text-[13px] font-medium uppercase leading-4 tracking-wide">
            <a
              className="text-[#747872] transition-colors hover:text-[#506051]"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-[#747872] transition-colors hover:text-[#506051]"
              href="#"
            >
              Terms
            </a>
            <a
              className="text-[#747872] transition-colors hover:text-[#506051]"
              href="#"
            >
              Contact
            </a>
          </div>
          <p className="mt-4 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#486173]">
            (c) 2024 Notes. Designed for the flow state.
          </p>
        </div>
      </footer>
    </main>
  );
}

function UnorganizedDocumentCard({
  document,
}: {
  document: DocumentSummary;
}) {
  return (
    <Link
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#c3c8c0]/20 bg-white p-5 shadow-[0_4px_20px_rgba(80,96,81,0.04)] transition-all duration-300 hover:border-[#506051]/50"
      href={`/write?documentId=${document.id}`}
    >
      <div className="mb-2 flex items-start justify-between gap-4">
        <h2 className="line-clamp-1 font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b] transition-colors group-hover:text-[#506051]">
          {document.title}
        </h2>
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
      </div>
    </Link>
  );
}

function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <div className="group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border border-transparent bg-[#efeeec] p-5 text-center transition-all duration-300 hover:border-[#506051]/30">
      <div className="mb-3 h-10 w-12 transition-transform duration-300 group-hover:scale-110">
        <div className="h-3 w-7 rounded-t bg-[#506051]/60" />
        <div className="h-8 rounded bg-[#506051]/70" />
      </div>
      <h3 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b] transition-colors group-hover:text-[#506051]">
        {category.name}
      </h3>
      <span className="mt-1 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {category.documentCount}{" "}
        {category.documentCount === 1 ? "Note" : "Notes"}
      </span>
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
