type DeleteConfirmationModalProps = {
  confirmLabel?: string;
  description: string;
  icon?: "remove" | "trash";
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  pendingLabel?: string;
  title: string;
};

export function DeleteConfirmationModal({
  confirmLabel = "Delete",
  description,
  icon = "trash",
  isPending,
  onCancel,
  onConfirm,
  pendingLabel = "Deleting...",
  title,
}: DeleteConfirmationModalProps) {
  return (
    <div
      aria-labelledby="delete-confirmation-title"
      aria-modal="true"
      className="fixed inset-0 z-[140] flex items-center justify-center bg-[#9ca09a]/70 px-4 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-[420px] rounded-xl border border-[#d9ddd5] bg-white px-8 py-10 text-center shadow-[0_24px_70px_rgba(26,28,27,0.18)] md:px-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1f1] text-[#c93030]">
          {icon === "trash" ? <TrashIcon /> : <RemoveIcon />}
        </div>

        <h2
          className="mt-8 font-[Georgia,serif] text-[28px] font-medium leading-9 tracking-normal text-[#050505]"
          id="delete-confirmation-title"
        >
          {title}
        </h2>
        <p className="mx-auto mt-6 max-w-[340px] font-[Georgia,serif] text-[18px] leading-8 tracking-normal text-[#1f1f1f]">
          {description}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            className="inline-flex h-[52px] items-center justify-center rounded-full border border-[#d8d8d4] bg-white px-7 text-[13px] font-medium uppercase leading-4 tracking-[0.18em] text-[#333333] transition-colors hover:bg-[#f7f6f3] disabled:cursor-not-allowed disabled:text-[#9c9c98]"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex h-[52px] items-center justify-center rounded-full bg-[#ffd7d2] px-7 text-[13px] font-medium uppercase leading-4 tracking-[0.18em] text-[#b31f1f] transition-colors hover:bg-[#ffc9c3] disabled:cursor-not-allowed disabled:bg-[#f5d9d6] disabled:text-[#cc8989]"
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-1" />
    </svg>
  );
}
