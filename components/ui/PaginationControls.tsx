type PaginationControlsProps = {
  currentPage: number;
  itemLabel: string;
  itemsPerPage: number;
  onPageChange: (nextPage: number) => void;
  totalItems: number;
};

/**
 * Shared previous/next controls for compact lists in the organization UI.
 * Returns nothing for one-page lists to avoid extra visual noise.
 */
export function PaginationControls({
  currentPage,
  itemLabel,
  itemsPerPage,
  onPageChange,
  totalItems,
}: PaginationControlsProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const pageStart = currentPage * itemsPerPage;
  const pageEnd = Math.min(pageStart + itemsPerPage, totalItems);

  if (pageCount <= 1) {
    return null;
  }

  return (
    <div
      aria-label={`${itemLabel} pages`}
      className="flex items-center justify-between gap-3 border-t border-[#aeb9ab]/35 pt-3"
    >
      <span className="text-[12px] font-medium uppercase leading-4 tracking-wide text-[#747872]">
        {pageStart + 1}-{pageEnd} of {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-8 items-center justify-center rounded-full border border-[#506051] bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#e5edde] disabled:cursor-not-allowed disabled:border-[#aeb9ab] disabled:text-[#9aa198]"
          disabled={currentPage === 0}
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          type="button"
        >
          Prev
        </button>
        <button
          className="inline-flex h-8 items-center justify-center rounded-full border border-[#506051] bg-white px-3 text-[11px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#e5edde] disabled:cursor-not-allowed disabled:border-[#aeb9ab] disabled:text-[#9aa198]"
          disabled={currentPage >= pageCount - 1}
          onClick={() =>
            onPageChange(Math.min(pageCount - 1, currentPage + 1))
          }
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
