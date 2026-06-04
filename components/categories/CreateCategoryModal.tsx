import type { FormEvent } from "react";

import { ErrorAlert } from "@/components/categories/ErrorAlert";

type CreateCategoryModalProps = {
  errorMessage: string;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

/**
 * Modal used from the organization board to create a top-level category.
 * The parent component owns form submission, validation errors, and loading state.
 */
export function CreateCategoryModal({
  errorMessage,
  isCreating,
  onClose,
  onSubmit,
}: CreateCategoryModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c1b]/45 px-4 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#c3c8c0]/40 bg-[#faf9f7] shadow-[0_28px_90px_rgba(26,28,27,0.28)]">
        <div className="border-b border-[#c3c8c0]/30 bg-white/55 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium uppercase leading-4 tracking-wide text-[#486173]">
                Organization
              </p>
              <h2 className="mt-2 font-[Georgia,serif] text-3xl font-medium leading-9 tracking-normal text-[#1a1c1b]">
                New Category
              </h2>
              <p className="mt-2 max-w-sm text-base leading-7 text-[#434842]">
                Create a place for related notes and keep your workspace easier
                to scan.
              </p>
            </div>
            <button
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c3c8c0]/50 bg-[#faf9f7] text-xl leading-none text-[#747872] transition-colors hover:border-[#506051]/40 hover:bg-[#efeeec] hover:text-[#506051]"
              onClick={onClose}
              type="button"
            >
              x
            </button>
          </div>
        </div>

        <form className="flex flex-col gap-5 px-6 py-6" onSubmit={onSubmit}>
          <ErrorAlert message={errorMessage} />

          <div>
            <label
              className="text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051]"
              htmlFor="category-name"
            >
              Category name
            </label>
            <input
              autoFocus
              className="mt-2 h-12 w-full rounded-xl border border-[#c3c8c0]/60 bg-white px-4 text-base text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051] focus:ring-4 focus:ring-[#506051]/10"
              id="category-name"
              maxLength={80}
              name="name"
              placeholder="Writing, Research, Journal..."
              type="text"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#c3c8c0]/30 pt-5 sm:flex-row sm:justify-end">
            <button
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#c3c8c0] bg-white px-5 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#506051] px-5 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253] disabled:cursor-not-allowed disabled:bg-[#9aa198]"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
