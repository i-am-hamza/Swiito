import type { Metadata } from "next";
import Link from "next/link";
import { getAuditLog } from "@/lib/queries/admin";
import { cn } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Audit log — Swiito Admin" };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const ACTION_COLORS: Record<string, string> = {
  approve: "text-accent",
  reject: "text-danger",
  create_faq: "text-fg-muted",
  delete_faq: "text-danger",
  update_settings: "text-[#B45309]",
  suspend_user: "text-danger",
  delete_testimonial: "text-danger",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const tableName = params.table ?? "";
  const action = params.action ?? "";
  const page = Number(params.page ?? 1);

  const result = await getAuditLog({ tableName, action, page, perPage: 50 });
  const totalPages = Math.ceil(result.total / result.perPage);

  const buildUrl = (updates: Record<string, string>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(updates)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    return `/admin/audit?${p.toString()}`;
  };

  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="font-display font-bold text-2xl text-fg">Audit log</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          defaultValue={tableName}
          placeholder="Filter table…"
          form="audit-filter"
          name="table"
          className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 transition-brand w-40"
        />
        <input
          defaultValue={action}
          placeholder="Filter action…"
          form="audit-filter"
          name="action"
          className="h-9 px-3 rounded-md bg-surface border border-[var(--border)] text-sm text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 transition-brand w-40"
        />
        <form
          id="audit-filter"
          action="/admin/audit"
          method="GET"
        >
          <button
            type="submit"
            className="px-3 h-9 rounded-md bg-accent text-on-accent text-xs font-medium hover:bg-[var(--accent-hover)] transition-brand"
          >
            Filter
          </button>
        </form>
        <span className="ml-auto text-xs text-fg-muted">{result.total} entries</span>
      </div>

      <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-surface-2">
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted">Time</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted">Action</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden sm:table-cell">Table</th>
              <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden md:table-cell">Record</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {result.entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-fg-muted">
                  No audit entries found
                </td>
              </tr>
            ) : (
              result.entries.map((e, i) => (
                <tr
                  key={e.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    i % 2 !== 0 ? "bg-surface-2/30" : ""
                  )}
                >
                  <td className="px-4 py-2.5 text-xs text-fg-muted whitespace-nowrap">
                    {fmtDate(e.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        ACTION_COLORS[e.action] ?? "text-fg-muted"
                      )}
                    >
                      {e.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-fg-muted hidden sm:table-cell">
                    {e.tableName}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-fg-muted font-mono hidden md:table-cell">
                    {e.recordId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {e.newData && (
                      <details className="text-right">
                        <summary className="text-xs text-accent cursor-pointer hover:underline">
                          diff
                        </summary>
                        <pre className="text-xs text-left mt-1 p-2 rounded bg-surface-2 max-w-xs overflow-auto">
                          {JSON.stringify(e.newData, null, 2)}
                        </pre>
                      </details>
                    )}
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
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-3 py-1.5 rounded-md border border-[var(--border)] text-fg hover:bg-surface-2 text-xs transition-brand"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-3 py-1.5 rounded-md border border-[var(--border)] text-fg hover:bg-surface-2 text-xs transition-brand"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
