import Link from "next/link";

import { AuthControls } from "@/components/auth/AuthControls";
import { NewDocumentLink } from "@/components/documents/NewDocumentLink";

type AppNavBarProps = {
  activePage: "write" | "documents";
};

const navLinks = [
  { href: "/write", label: "Writing", page: "write" },
  { href: "/documents", label: "Organization", page: "documents" },
] as const;

export function AppNavBar({ activePage }: AppNavBarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-transparent bg-[#faf9f7]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[840px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            className="font-[Georgia,serif] text-2xl font-medium tracking-normal text-[#1a1c1b]"
            href="/documents"
          >
            Notes
          </Link>
          <div className="hidden items-center gap-6 pt-1 md:flex">
            {navLinks.map((link) => {
              const isActive = activePage === link.page;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "border-b border-[#506051] pb-1 text-base font-semibold leading-7 text-[#506051]"
                      : "text-base leading-7 text-[#434842] transition-colors hover:text-[#506051]"
                  }
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NewDocumentLink
            className="hidden items-center justify-center rounded-full bg-[#506051] px-4 py-2 text-[13px] font-medium uppercase leading-4 tracking-wide text-white transition-colors hover:bg-[#526253] md:flex"
          >
            New Note
          </NewDocumentLink>
          <AuthControls />
        </div>
      </div>
    </nav>
  );
}
