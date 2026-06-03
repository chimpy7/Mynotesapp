import type { FormEvent } from "react";

import { ErrorAlert } from "@/components/categories/ErrorAlert";

type CreateCategoryModalProps = {
  errorMessage: string;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function CreateCategoryModal({
  errorMessage,
  isCreating,
  onClose,
  onSubmit,
}: CreateCategoryModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1c1b]/30 px-4"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-xl border border-[#c3c8c0]/30 bg-[#faf9f7] p-5 shadow-[0_20px_60px_rgba(26,28,27,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b]">
              New Category
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#434842]">
              Create a place for related notes.
            </p>
          </div>
          <button
            aria-label="Close"
            className="rounded-lg px-2 py-1 text-xl leading-none text-[#747872] transition-colors hover:bg-[#efeeec] hover:text-[#506051]"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <form className="mt-5 flex flex-col gap-4" onSubmit={onSubmit}>
          <ErrorAlert message={errorMessage} />

          <label className="sr-only" htmlFor="category-name">
            Category name
          </label>
          <input
            autoFocus
            className="rounded-lg border border-[#c3c8c0]/50 bg-white px-3 py-2 text-sm text-[#1a1c1b] outline-none transition-colors placeholder:text-[#747872] focus:border-[#506051]"
            id="category-name"
            maxLength={80}
            name="name"
            placeholder="Category name"
            type="text"
          />
          <div className="flex justify-end gap-2">
            <button
              className="rounded-full border border-[#c3c8c0] bg-white px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-[#506051] transition-colors hover:bg-[#efeeec]"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-[#506051] px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253] disabled:cursor-not-allowed disabled:bg-[#9aa198]"
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
