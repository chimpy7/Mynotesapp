"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type NewDocumentLinkProps = {
  children: ReactNode;
  className?: string;
};

export function NewDocumentLink({
  children,
  className,
}: NewDocumentLinkProps) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const nextDraftKey = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2)}`;

    router.push(`/write?new=${nextDraftKey}`);
    router.refresh();
  }

  return (
    <Link className={className} href="/write" onClick={handleClick}>
      {children}
    </Link>
  );
}
