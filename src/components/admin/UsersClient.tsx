"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { verifyOwnerAction } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toast";
import type { AdminUserPage } from "@/types";

const ROLE_STYLES: Record<string, string> = {
  seeker: "bg-surface-2 text-fg-muted",
  owner: "bg-accent/10 text-accent",
  admin: "bg-[#B45309]/10 text-[#B45309]",
};

interface Props {
  result: AdminUserPage;
  initialRole: string;
  initialSearch: string;
}

export function UsersClient({ result, initialRole, initialSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  function pushParams(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    p.delete("page");
    startTransition(() => router.push(`/admin/users?${p.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search });
  }

  async function handleVerify(userId: string, verified: boolean) {
    const res = await verifyOwnerAction(userId, verified);
    if (res.ok) {
      addToast({ type: "success", message: verified ? "Owner verified." : "Verification removed." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  const page = result.page;
  const totalPages = Math.ceil(result.total / result.perPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <form onSubmit={handleSearch} className="flex gap-1">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="pl-8 pr-3 h-9 rounded-md bg-surface border border-[var(--border)] text-sm text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 transition-brand w-52"
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
          value={initialRole}
          onChange={(e) => pushParams({ role: e.target.value })}
          className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40 transition-brand"
        >
          <option value="all">All roles</option>
          <option value="seeker">Seekers</option>
          <option value="owner">Owners</option>
          <option value="admin">Admin</option>
        </select>

        <span className="ml-auto text-xs text-fg-muted">{result.total} users</span>
      </div>

      <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-surface-2">
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted">User</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden sm:table-cell">Role</th>
              <th className="text-center px-4 py-2.5 font-medium text-fg-muted hidden md:table-cell">Verified</th>
              <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden lg:table-cell">Listings</th>
              <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden lg:table-cell">Leads</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {result.users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-fg-muted">
                  No users found
                </td>
              </tr>
            ) : (
              result.users.map((u, i) => (
                <tr
                  key={u.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    i % 2 !== 0 ? "bg-surface-2/30" : ""
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg">{u.fullName ?? "(no name)"}</p>
                    <p className="text-xs text-fg-muted mt-0.5">{u.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        ROLE_STYLES[u.role ?? "seeker"]
                      )}
                    >
                      {u.role ?? "seeker"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    {u.isVerified ? (
                      <span className="text-accent text-xs font-medium">✓</span>
                    ) : (
                      <span className="text-fg-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-fg-muted hidden lg:table-cell">
                    {u.listingCount}
                  </td>
                  <td className="px-4 py-3 text-right text-fg-muted hidden lg:table-cell">
                    {u.leadCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-xs text-accent hover:underline"
                      >
                        View
                      </Link>
                      {(u.role === "owner" || u.isOwner) && (
                        <button
                          type="button"
                          onClick={() => handleVerify(u.id, !u.isVerified)}
                          className="text-xs text-fg-muted hover:text-fg transition-brand"
                        >
                          {u.isVerified ? "Unverify" : "Verify"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-fg-muted">Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <Link
              href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`}
              className={cn("p-2 rounded-md border border-[var(--border)] transition-brand", page <= 1 ? "text-fg-muted pointer-events-none opacity-40" : "text-fg hover:bg-surface-2")}
            >
              <ChevronLeft size={14} />
            </Link>
            <Link
              href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`}
              className={cn("p-2 rounded-md border border-[var(--border)] transition-brand", page >= totalPages ? "text-fg-muted pointer-events-none opacity-40" : "text-fg hover:bg-surface-2")}
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
