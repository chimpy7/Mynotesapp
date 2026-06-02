import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { AuthControls } from "@/components/auth/AuthControls";
import { CreateDocumentDraft } from "@/components/documents/CreateDocumentDraft";
import { ensureCurrentUser } from "@/lib/users";
import { DocumentModel } from "@/models/Document";

type WritePageProps = {
  searchParams?: Promise<{
    documentId?: string | string[];
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
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Create document
          </p>
          <AuthControls />
        </div>

        <CreateDocumentDraft initialDocument={initialDocument} />
      </div>
    </main>
  );
}
