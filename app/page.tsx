import { Show } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { AuthControls } from "@/components/auth/AuthControls";
import { CreateDocumentDraft } from "@/components/documents/CreateDocumentDraft";
import { ensureCurrentUser } from "@/lib/users";
import { DocumentModel } from "@/models/Document";

type HomeProps = {
  searchParams?: Promise<{
    documentId?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { userId } = await auth();
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

  if (userId) {
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

        <Show when="signed-out">
          <section className="rounded-lg border border-zinc-200 bg-white px-6 py-8 shadow-sm">
            <h2 className="text-xl font-semibold tracking-normal">
              Sign in to start writing
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
              Create an account or sign in to keep your documents private and
              tied to your user account.
            </p>
          </section>
        </Show>

        <Show when="signed-in">
          <CreateDocumentDraft initialDocument={initialDocument} />
        </Show>
      </div>
    </main>
  );
}
