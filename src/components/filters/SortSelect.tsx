"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "score", label: "Swiito score" },
] as const;

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (e.target.value === "featured") {
      sp.delete("sort");
    } else {
      sp.set("sort", e.target.value);
    }
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="h-9 px-3 pr-7 text-xs font-medium rounded-lg border border-[var(--border)] bg-surface text-fg appearance-none cursor-pointer hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-brand"
      aria-label="Sort listings"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
