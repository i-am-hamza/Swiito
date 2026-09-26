import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  buildUrl: (page: number) => string;
  className?: string;
}

export function Pagination({ total, page, perPage, buildUrl, className }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <PaginationLink
        href={buildUrl(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </PaginationLink>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm text-fg-muted"
          >
            …
          </span>
        ) : (
          <PaginationLink
            key={p}
            href={buildUrl(p)}
            active={p === page}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </PaginationLink>
        )
      )}

      <PaginationLink
        href={buildUrl(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </PaginationLink>
    </nav>
  );
}

function PaginationLink({
  href,
  active,
  disabled,
  children,
  ...props
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  if (disabled) {
    return (
      <span
        className="w-9 h-9 flex items-center justify-center rounded-md text-fg-muted opacity-40 cursor-not-allowed"
        aria-disabled="true"
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-brand",
        active
          ? "bg-accent text-on-accent"
          : "text-fg hover:bg-surface-2"
      )}
      scroll={false}
      {...props}
    >
      {children}
    </Link>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2;
  const pages: (number | "...")[] = [];

  pages.push(1);

  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");

  pages.push(total);
  return pages;
}
