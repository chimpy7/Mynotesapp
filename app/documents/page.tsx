import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { AuthControls } from "@/components/auth/AuthControls";
import {
  DocumentList,
} from "@/components/documents/DocumentList";
import { connectToDatabase } from "@/lib/db";
import { ensureCurrentUser } from "@/lib/users";
import { DocumentModel } from "@/models/Document";

type LexicalNode = {
  text?: string;
  children?: LexicalNode[];
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
  timeStyle: "short",
});

export default async function DocumentsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Documents
            </p>
            <AuthControls />
          </div>
          <section className="rounded-lg border border-zinc-200 bg-white px-6 py-8 shadow-sm">
            <h1 className="text-xl font-semibold tracking-normal">
              Sign in to view your documents
            </h1>
          </section>
        </div>
      </main>
    );
  }

  await ensureCurrentUser();
  await connectToDatabase();

  const savedDocuments = await DocumentModel.find({ userId })
    .sort({ updatedAt: -1 })
    .select("title content categoryId subcategoryId updatedAt")
    .exec();

  const documents = savedDocuments.map((document) => ({
    id: document._id.toString(),
    title: document.title,
    preview: getDocumentPreview(document.content),
    categoryLabel: document.categoryId ? "Categorized" : "Uncategorized",
    updatedAtLabel: dateFormatter.format(document.updatedAt),
  }));

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Documents
          </p>
          <AuthControls />
        </div>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              Saved documents
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
              Review your saved drafts and organized documents.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            href="/"
          >
            New document
          </Link>
        </header>

        <DocumentList documents={documents} />
      </div>
    </main>
  );
}
