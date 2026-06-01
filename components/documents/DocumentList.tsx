import {
  DocumentCard,
  type DocumentSummary,
} from "@/components/documents/DocumentCard";

type DocumentListProps = {
  documents: DocumentSummary[];
};

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white px-6 py-8 shadow-sm">
        <h2 className="text-xl font-semibold tracking-normal">
          No saved documents yet
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">
          Create a draft and save it to see it here.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Saved documents" className="grid gap-4">
      {documents.map((document) => (
        <DocumentCard document={document} key={document.id} />
      ))}
    </section>
  );
}
