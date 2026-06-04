import Link from "next/link";

type EmptyPanelProps = {
  actionHref?: string;
  actionLabel?: string;
  text: string;
  title: string;
};

export function EmptyPanel({
  actionHref,
  actionLabel,
  text,
  title,
}: EmptyPanelProps) {
  return (
    <div className="rounded-xl border border-[#c3c8c0]/20 bg-white p-5 shadow-[0_4px_20px_rgba(80,96,81,0.04)]">
      <h2 className="font-[Georgia,serif] text-2xl font-medium leading-8 tracking-normal text-[#1a1c1b]">
        {title}
      </h2>
      <p className="mt-2 text-base leading-[26px] text-[#434842]">{text}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-5 inline-flex rounded-full bg-[#506051] px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253]"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
