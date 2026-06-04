import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  OrganizationBoard,
  type OrganizationCategory,
  type OrganizationDocument,
} from "@/components/categories/OrganizationBoard";
import { AppNavBar } from "@/components/layout/AppNavBar";
import { connectToDatabase } from "@/lib/db";
import { ensureCurrentUser } from "@/lib/users";
import { CategoryModel } from "@/models/Category";
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
      .select("title content categoryId subcategoryId updatedAt")
      .exec(),
    CategoryModel.find({ userId })
      .sort({ name: 1 })
      .select("name subcategories")
      .exec(),
  ]);

  const documents: OrganizationDocument[] = savedDocuments.map((document) => ({
    id: document._id.toString(),
    title: document.title,
    preview: getDocumentPreview(document.content),
    categoryId: document.categoryId?.toString() ?? null,
    subcategoryId: document.subcategoryId?.toString() ?? null,
    updatedAtLabel: dateFormatter.format(document.updatedAt),
  }));

  const categories: OrganizationCategory[] = savedCategories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory._id.toString(),
      name: subcategory.name,
    })),
  }));

  return (
    <main className="flex min-h-screen flex-col bg-[#faf9f7] font-[Arial,Helvetica,sans-serif] text-[#1a1c1b] selection:bg-[#506051]/20">
      <AppNavBar activePage="documents" />

      <OrganizationBoard categories={categories} documents={documents} />

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
