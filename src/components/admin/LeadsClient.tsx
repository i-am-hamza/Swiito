"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Phone, MessageCircle, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { updateLeadAction } from "@/lib/actions/admin";
import { useToast } from "@/components/ui/Toast";
import type { AdminLeadPage, AdminLead } from "@/types";

type LeadStatus = NonNullable<AdminLead["status"]>;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-danger/10 text-danger",
  contacted: "bg-[#B45309]/10 text-[#B45309]",
  connected: "bg-accent/10 text-accent",
  closed_won: "bg-surface-2 text-fg-muted",
  closed_lost: "bg-surface-2 text-fg-muted",
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "connected", label: "Connected" },
  { value: "closed_won", label: "Won" },
  { value: "closed_lost", label: "Lost" },
];

function ageLabel(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

interface Props {
  result: AdminLeadPage;
  initialStatus: string;
  initialSearch: string;
}

export function LeadsClient({ result, initialStatus, initialSearch }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());

  function pushParams(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    p.delete("page");
    startTransition(() => router.push(`/admin/leads?${p.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ search });
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    const res = await updateLeadAction(id, { status });
    if (res.ok) {
      addToast({ type: "success", message: "Status updated." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function handleSaveNotes(id: string) {
    const notes = editNotes[id] ?? "";
    setSavingNotes((s) => new Set(s).add(id));
    const res = await updateLeadAction(id, { notes });
    setSavingNotes((s) => { const n = new Set(s); n.delete(id); return n; });
    if (res.ok) {
      addToast({ type: "success", message: "Notes saved." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  const exportHref = `/api/admin/leads/export?${searchParams.toString()}`;

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
              placeholder="Search property or seeker…"
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
          value={initialStatus}
          onChange={(e) => pushParams({ status: e.target.value })}
          className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40 transition-brand"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <a
          href={exportHref}
          download
          className="ml-auto flex items-center gap-1.5 px-3 h-9 rounded-md bg-surface border border-[var(--border)] text-sm text-fg hover:bg-surface-2 transition-brand"
        >
          <Download size={14} />
          Export CSV
        </a>

        <span className="text-xs text-fg-muted">{result.total} leads</span>
      </div>

      <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-surface-2">
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted">Property</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden sm:table-cell">Seeker</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden md:table-cell">Notes</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden lg:table-cell">Source</th>
              <th className="text-right px-4 py-2.5 font-medium text-fg-muted">Age</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {result.leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-fg-muted">
                  No leads found
                </td>
              </tr>
            ) : (
              result.leads.map((l, i) => (
                <tr
                  key={l.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    i % 2 !== 0 ? "bg-surface-2/30" : ""
                  )}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/properties/${l.propertySlug}`}
                      className="font-medium text-fg hover:text-accent transition-brand line-clamp-1 text-xs"
                    >
                      {l.propertyTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-fg text-xs">{l.seekerName ?? "—"}</p>
                    {l.seekerPhone && (
                      <p className="text-xs text-fg-muted">{l.seekerPhone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status ?? "new"}
                      onChange={(e) => handleStatusChange(l.id, e.target.value as LeadStatus)}
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-brand focus:outline-none focus:ring-2 focus:ring-accent/50",
                        STATUS_STYLES[l.status ?? "new"]
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editNotes[l.id] ?? (l.notes ?? "")}
                        onChange={(e) => setEditNotes((prev) => ({ ...prev, [l.id]: e.target.value }))}
                        onBlur={() => {
                          if ((editNotes[l.id] ?? l.notes ?? "") !== (l.notes ?? "")) {
                            handleSaveNotes(l.id);
                          }
                        }}
                        placeholder="Add note…"
                        className="h-7 px-2 rounded bg-surface-2 border border-transparent focus:border-accent text-xs text-fg placeholder:text-fg-muted outline-none transition-brand w-36"
                      />
                      {savingNotes.has(l.id) && (
                        <span className="text-xs text-fg-muted">Saving…</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-fg-muted">
                    {l.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-fg-muted whitespace-nowrap">
                    {ageLabel(l.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {l.seekerPhone && (
                        <>
                          <a
                            href={`tel:${l.seekerPhone}`}
                            className="w-7 h-7 rounded-md bg-surface-2 hover:bg-accent hover:text-on-accent flex items-center justify-center transition-brand"
                            title="Call"
                          >
                            <Phone size={12} />
                          </a>
                          <a
                            href={`https://wa.me/${l.seekerPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-md bg-surface-2 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-brand"
                            title="WhatsApp"
                          >
                            <MessageCircle size={12} />
                          </a>
                        </>
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
              href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`}
              className={cn("p-2 rounded-md border border-[var(--border)] transition-brand", page <= 1 ? "text-fg-muted pointer-events-none opacity-40" : "text-fg hover:bg-surface-2")}
            >
              <ChevronLeft size={14} />
            </Link>
            <Link
              href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`}
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
