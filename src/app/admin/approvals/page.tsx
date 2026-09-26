import type { Metadata } from "next";
import Link from "next/link";
import { getPendingListings } from "@/lib/queries/admin";
import { formatINR } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Approvals — Swiito Admin" };

function ageLabel(createdAt: string): string {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function ApprovalsPage() {
  const listings = await getPendingListings();

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-fg">Approvals</h1>
        {listings.length > 0 && (
          <span className="text-sm text-fg-muted">{listings.length} pending</span>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="py-16 text-center text-fg-muted">
          <p className="font-medium">No listings pending approval</p>
          <p className="text-sm mt-1">All caught up — check back later.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-surface-2">
                <th className="text-left px-4 py-2.5 font-medium text-fg-muted">Listing</th>
                <th className="text-left px-4 py-2.5 font-medium text-fg-muted hidden md:table-cell">Owner</th>
                <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden sm:table-cell">Asking</th>
                <th className="text-right px-4 py-2.5 font-medium text-fg-muted hidden lg:table-cell">Photos</th>
                <th className="text-right px-4 py-2.5 font-medium text-fg-muted">Age</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr
                  key={l.id}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    i % 2 === 0 ? "" : "bg-surface-2/50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-fg line-clamp-1">{l.title}</p>
                    <p className="text-xs text-fg-muted mt-0.5">
                      {l.listingType === "rent" ? "Rent" : "Sale"} ·{" "}
                      {l.propertyType.replace("_", " ")} ·{" "}
                      {l.localityName ?? l.addressArea}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-fg-muted">{l.ownerName ?? "—"}</p>
                    <p className="text-xs text-fg-muted">{l.ownerEmail ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="font-medium text-fg">{formatINR(l.askingPrice)}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className={l.photoCount < 5 ? "text-danger font-medium" : "text-fg-muted"}>
                      {l.photoCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-fg-muted text-xs whitespace-nowrap">
                    {ageLabel(l.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/approvals/${l.id}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-on-accent hover:bg-[var(--accent-hover)] transition-brand whitespace-nowrap"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
