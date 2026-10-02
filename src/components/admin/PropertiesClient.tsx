"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatINR } from "@/lib/utils/format";
import { updatePropertyAction } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toast";
import type { AdminPropertyPage, PropertyStatus } from "@/types";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  draft: "bg-surface-2 text-fg-muted",
  pending: "bg-[#B45309]/10 text-[#B45309]",
  approved: "bg-accent/10 text-accent",
  rejected: "bg-danger/10 text-danger",
  rented: "bg-surface-2 text-fg-muted",
  sold: "bg-surface-2 text-fg-muted",
  expired: "bg-surface-2 text-fg-muted",
};

interface Props {
  result: AdminPropertyPage;
  initialStatus: string;
  initialListingType: string;
  initialSearch: string;
  isStale: boolean;
}

export function PropertiesClient({
  result,
  initialStatus,
  initialListingType,
  initialSearch,
  isStale,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(initialSearch);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function pushParams(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    p.delete("page");
    startTransition(() => router.push(`/admin/properties?${p.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search });
  }

  async function handleStatusChange(id: string, newStatus: PropertyStatus) {
    const res = await updatePropertyAction(id, { status: newStatus });
    if (res.ok) {
      addToast({ type: "success", message: `Status updated to ${newStatus}.` });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed to update." });
    }
  }

  const allSelected = result.properties.length > 0 && selected.size === result.properties.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(result.properties.map((p) => p.id)));
  }

  const page = result.page;
  const totalPages = Math.ceil(result.total / result.perPage);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearch} className="flex gap-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or area…"
              className="pl-8 pr-3 h-9 rounded-md bg-surface border border-[var(--border)] text-sm text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-brand w-52"
            />
          </div>
          <button
            type="submit"
            className="px-3 h-9 rounded-md bg-accent text-on-accent text-xs font-medium hover:bg-[var(--accent-hover)] transition-brand"
          >
            Search
          </button>
        </form>

        <select
          value={initialStatus}
          onChange={(e) => pushParams({ status: e.target.value })}
          className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40 transition-brand"
        >
          <option value="all">All statuses</option>
          {(["pending", "approved", "rejected", "draft", "rented", "sold", "expired"] as const).map(
            (s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            )
          )}
        </select>

        <select
          value={initialListingType}
          onChange={(e) => pushParams({ listingType: e.target.value })}
          className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40 transition-brand"
        >
          <option value="all">Rent & Sale</option>
          <option value="rent">Rent</option>
          <option value="sale">Sale</option>
        </select>

        {isStale && (
          <span className="px-2.5 py-1 rounded-full bg-[#B45309]/10 text-[#B45309] text-xs font-medium">
            Showing stale listings
          </span>
        )}

        <span className="ml-auto text-xs text-fg-muted">{result.total} listings</span>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-surface-2">
              <th className="px-4 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-accent"
                />
              </th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted">Listing</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden lg:table-cell">Display</th>
              <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden lg:table-cell">Asking</th>
              <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden xl:table-cell">Views</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden sm:table-cell">Owner</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {result.properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-fg-muted">
                  No listings found
                </td>
              </tr>
            ) : (
              result.properties.map((p, i) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    selected.has(p.id) ? "bg-accent/5" : i % 2 !== 0 ? "bg-surface-2/30" : ""
                  )}
                >
                  <td className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => {
                        const next = new Set(selected);
                        if (next.has(p.id)) next.delete(p.id);
                        else next.add(p.id);
                        setSelected(next);
                      }}
                      className="accent-accent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg line-clamp-1">{p.title}</p>
                    <p className="text-xs text-fg-muted mt-0.5">
                      {p.listingType === "rent" ? "Rent" : "Sale"} ·{" "}
                      {p.propertyType.replace(/_/g, " ")} ·{" "}
                      {p.localityName ?? p.addressArea}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as PropertyStatus)}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer outline-none transition-brand",
                        STATUS_STYLES[p.status]
                      )}
                    >
                      {(["pending", "approved", "rejected", "draft", "rented", "sold", "expired"] as const).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-fg font-medium">{p.displayPrice > 0 ? formatINR(p.displayPrice) : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-fg-muted">{p.askingPrice > 0 ? formatINR(p.askingPrice) : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden xl:table-cell text-fg-muted">
                    {p.viewCount}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-fg-muted text-xs">
                    {p.ownerName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="text-xs text-accent hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-fg-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Link
              href={`/admin/properties?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`}
              className={cn(
                "p-2 rounded-md border border-[var(--border)] transition-brand",
                page <= 1
                  ? "text-fg-muted pointer-events-none opacity-40"
                  : "text-fg hover:bg-surface-2"
              )}
            >
              <ChevronLeft size={14} />
            </Link>
            <Link
              href={`/admin/properties?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`}
              className={cn(
                "p-2 rounded-md border border-[var(--border)] transition-brand",
                page >= totalPages
                  ? "text-fg-muted pointer-events-none opacity-40"
                  : "text-fg hover:bg-surface-2"
              )}
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
