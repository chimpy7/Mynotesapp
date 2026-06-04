import type { FormEvent } from "react";

import type { CreateSubcategoryHandler } from "@/components/categories/organizationTypes";

type CreateSubcategoryFormProps = {
  categoryId: string;
  isCreating: boolean;
  onSubmit: CreateSubcategoryHandler;
};

/**
 * Inline form for creating a subcategory inside the currently opened category.
 * Submission is delegated to the parent so state refresh and API errors share one flow.
 */
export function CreateSubcategoryForm({
  categoryId,
  isCreating,
  onSubmit,
}: CreateSubcategoryFormProps) {
  return (
    <form
      className="rounded-2xl border border-[#aeb9ab]/45 bg-[#f8fbf5] p-5 shadow-[0_8px_28px_rgba(80,96,81,0.05)]"
      onSubmit={(event: FormEvent<HTMLFormElement>) =>
        onSubmit(event, categoryId)
      }
    >
      <label
        className="text-[14px] font-bold uppercase leading-4 tracking-wide text-[#506051]"
        htmlFor={`modal-subcategory-${categoryId}`}
      >
        New subcategory
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#aeb9ab]/70 bg-white px-4 text-sm text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051] focus:ring-4 focus:ring-[#506051]/10"
          id={`modal-subcategory-${categoryId}`}
          maxLength={80}
          name="name"
          placeholder="Ideas, Drafts, Meetings..."
          type="text"
        />
        <button
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#506051] bg-[#506051] px-5 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#3f5140] disabled:cursor-not-allowed disabled:border-[#9aa198] disabled:bg-[#9aa198]"
          disabled={isCreating}
          type="submit"
        >
          {isCreating ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
