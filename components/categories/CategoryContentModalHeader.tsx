import type { OrganizationCategory } from "@/components/categories/organizationTypes";

type CategoryContentModalHeaderProps = {
  category: OrganizationCategory;
  documentCount: number;
  isDeletingCategory: boolean;
  onClose: () => void;
  onDeleteCategory: (categoryId: string, name: string) => Promise<void>;
};

/**
 * Displays category metadata and modal-level actions.
 * Destructive category behavior is passed in from the board so API logic stays centralized.
 */
export function CategoryContentModalHeader({
  category,
  documentCount,
  isDeletingCategory,
  onClose,
  onDeleteCategory,
}: CategoryContentModalHeaderProps) {
  return (
    <div className="border-b border-[#aeb9ab]/35 bg-[#edf3e9] px-6 py-5 md:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase leading-4 tracking-wide text-[#486173]">
            Category workspace
          </p>
          <h2 className="mt-2 font-[Georgia,serif] text-4xl font-medium leading-[44px] tracking-normal text-[#1a1c1b]">
            {category.name}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-medium uppercase leading-4 tracking-wide">
            <span className="rounded-full border border-[#aeb9ab]/70 bg-[#f8fbf5] px-3 py-1.5 text-[#506051]">
              {documentCount} {documentCount === 1 ? "note" : "notes"}
            </span>
            <span className="rounded-full border border-[#aeb9ab]/70 bg-[#f8fbf5] px-3 py-1.5 text-[#506051]">
              {category.subcategories.length}{" "}
              {category.subcategories.length === 1
                ? "subcategory"
                : "subcategories"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-white px-4 text-[12px] font-medium uppercase leading-4 tracking-wide text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
            disabled={isDeletingCategory}
            onClick={() => onDeleteCategory(category.id, category.name)}
            type="button"
          >
            {isDeletingCategory ? "Deleting..." : "Delete"}
          </button>
          <button
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#aeb9ab]/60 bg-[#f8fbf5] text-xl leading-none text-[#506051] transition-colors hover:border-[#506051]/50 hover:bg-[#e5edde] hover:text-[#3f5140]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
