import Link from "next/link";

export type DocumentSummary = {
  id: string;
  title: string;
  preview: string;
  categoryLabel: string;
  updatedAtLabel: string;
};

type DocumentCardProps = {
  document: DocumentSummary;
};

export function DocumentCard({ document }: DocumentCardProps) {
  return (
    <Link
      className="block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
      href={`/write?documentId=${document.id}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-normal text-zinc-950">
            {document.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
            {document.preview}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600">
          {document.categoryLabel}
        </span>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        Last updated {document.updatedAtLabel}
      </p>
    </Link>
  );
}
