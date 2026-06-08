import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { CreateDocumentDraft } from "@/components/documents/CreateDocumentDraft";
import { AppNavBar } from "@/components/layout/AppNavBar";
import { ensureCurrentUser } from "@/lib/users";
import { DocumentModel } from "@/models/Document";

type WritePageProps = {
  searchParams?: Promise<{
    documentId?: string | string[];
    new?: string | string[];
  }>;
};

export default async function WritePage({ searchParams }: WritePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const resolvedSearchParams = await searchParams;
  const rawDocumentId = resolvedSearchParams?.documentId;
  const documentId = Array.isArray(rawDocumentId)
    ? rawDocumentId[0]
    : rawDocumentId;
  const rawNewDraftKey = resolvedSearchParams?.new;
  const newDraftKey = Array.isArray(rawNewDraftKey)
    ? rawNewDraftKey[0]
    : rawNewDraftKey;
  let initialDocument:
    | {
        id: string;
        title: string;
        serializedContent: string | null;
      }
    | undefined;

  await ensureCurrentUser();

  if (documentId && Types.ObjectId.isValid(documentId)) {
    const document = await DocumentModel.findOne({
      _id: documentId,
      userId,
    })
      .select("title content")
      .exec();

    if (document) {
      initialDocument = {
        id: document._id.toString(),
        title: document.title,
        serializedContent: document.content
          ? JSON.stringify(document.content)
          : null,
      };
    }
  }

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-[#faf9f7] font-[Arial,Helvetica,sans-serif] text-[#1a1c1b] selection:bg-[#506051]/20">
      <AppNavBar activePage="write" />
      <div className="flex flex-1 flex-col">
        <CreateDocumentDraft
          draftKey={initialDocument?.id ?? newDraftKey ?? "blank"}
          initialDocument={initialDocument}
          key={initialDocument?.id ?? newDraftKey ?? "blank"}
        />
      </div>
    </main>
  );
}
