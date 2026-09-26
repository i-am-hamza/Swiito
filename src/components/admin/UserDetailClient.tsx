"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR, cn } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { verifyOwnerAction } from "@/lib/actions/admin";
import type { AdminUser, AdminPropertyRow, AdminLead, PropertyStatus } from "@/types";

const STATUS_COLORS: Record<PropertyStatus, string> = {
  draft: "text-fg-muted",
  pending: "text-[#B45309]",
  approved: "text-accent",
  rejected: "text-danger",
  rented: "text-fg-muted",
  sold: "text-fg-muted",
  expired: "text-fg-muted",
};

interface Props {
  user: AdminUser;
  listings: AdminPropertyRow[];
  leads: AdminLead[];
}

export function UserDetailClient({ user, listings, leads }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleVerify() {
    const res = await verifyOwnerAction(user.id, !user.isVerified);
    if (res.ok) {
      addToast({ type: "success", message: user.isVerified ? "Verification removed." : "Owner verified." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="bg-surface rounded-lg border border-[var(--border)] p-5">
        <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-4">Profile</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-fg-muted">Role</dt>
            <dd className="text-fg font-medium capitalize">{user.role ?? "seeker"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Phone</dt>
            <dd className="text-fg">{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Verified</dt>
            <dd className={user.isVerified ? "text-accent font-medium" : "text-fg-muted"}>
              {user.isVerified ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Listings</dt>
            <dd className="text-fg">{user.listingCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Leads</dt>
            <dd className="text-fg">{user.leadCount}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Joined</dt>
            <dd className="text-fg">{new Date(user.createdAt).toLocaleDateString("en-IN")}</dd>
          </div>
        </dl>

        {(user.role === "owner" || user.isOwner) && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={isPending}
            >
              {user.isVerified ? "Remove verification" : "Verify owner"}
            </Button>
          </div>
        )}
      </div>

      {/* Listings */}
      {listings.length > 0 && (
        <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Listings ({listings.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {listings.map((p, i) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-[var(--border)] last:border-0",
                    i % 2 !== 0 ? "bg-surface-2/30" : ""
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="text-fg font-medium line-clamp-1">{p.title}</p>
                    <p className="text-xs text-fg-muted">
                      {p.listingType} · {p.propertyType.replace(/_/g, " ")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-medium capitalize", STATUS_COLORS[p.status])}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-fg-muted text-xs">
                      {p.displayPrice > 0 ? formatINR(p.displayPrice) : "—"}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leads */}
      {leads.length > 0 && (
        <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Lead history ({leads.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {leads.map((l, i) => (
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
                      className="text-fg hover:text-accent transition-brand line-clamp-1"
                    >
                      {l.propertyTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-fg-muted capitalize">
                      {l.status?.replace(/_/g, " ") ?? "new"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-fg-muted">
                    {new Date(l.createdAt).toLocaleDateString("en-IN")}
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
