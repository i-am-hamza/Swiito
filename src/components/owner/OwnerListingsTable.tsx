"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal, Pencil, CheckSquare, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils/format";
import {
  deleteListingAction,
  markStatusAction,
} from "@/lib/actions/owner";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { OwnerListing } from "@/types";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  pending: "Under review",
  approved: "Live",
  rejected: "Rejected",
  rented: "Rented",
  sold: "Sold",
  expired: "Expired",
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-surface-2 text-fg-muted",
  pending: "bg-[#B45309]/10 text-[#B45309]",
  approved: "bg-accent/10 text-accent",
  rejected: "bg-danger/10 text-danger",
  rented: "bg-surface-2 text-fg-muted",
  sold: "bg-surface-2 text-fg-muted",
  expired: "bg-surface-2 text-fg-muted",
};

interface ActionMenuProps {
  listing: OwnerListing;
}

function ActionMenu({ listing }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmMark, setConfirmMark] = useState<"rented" | "sold" | null>(null);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteListingAction(listing.id);
      if (res.ok) {
        addToast({ type: "success", message: "Draft deleted" });
      } else {
        addToast({ type: "error", message: res.error ?? "Failed to delete" });
      }
      setConfirmDelete(false);
    });
  }

  function handleMark(status: "rented" | "sold") {
    startTransition(async () => {
      const res = await markStatusAction(listing.id, status);
      if (res.ok) {
        addToast({ type: "success", message: `Marked as ${status}` });
      } else {
        addToast({ type: "error", message: res.error ?? "Failed to update" });
      }
      setConfirmMark(null);
    });
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Listing actions"
          className="w-9 h-9 flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
        >
          <MoreHorizontal size={16} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 top-10 z-20 w-48 bg-surface border border-[var(--border)] rounded-lg shadow-lift py-1">
              <Link
                href={`/owner/edit/${listing.id}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:bg-surface-2"
                onClick={() => setOpen(false)}
              >
                <Pencil size={14} />
                Edit listing
              </Link>

              {listing.status === "approved" && (
                <>
                  <button
                    onClick={() => { setOpen(false); setConfirmMark("rented"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:bg-surface-2"
                  >
                    <CheckSquare size={14} />
                    Mark as rented
                  </button>
                  <button
                    onClick={() => { setOpen(false); setConfirmMark("sold"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-fg hover:bg-surface-2"
                  >
                    <CheckSquare size={14} />
                    Mark as sold
                  </button>
                </>
              )}

              {listing.status === "draft" && (
                <button
                  onClick={() => { setOpen(false); setConfirmDelete(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-surface-2"
                >
                  <Trash2 size={14} />
                  Delete draft
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete draft"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-danger hover:bg-danger/90"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg-muted">
          This will permanently delete the draft and all its photos. This cannot be undone.
        </p>
      </Modal>

      <Modal
        isOpen={!!confirmMark}
        onClose={() => setConfirmMark(null)}
        title={`Mark as ${confirmMark ?? ""}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setConfirmMark(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => confirmMark && handleMark(confirmMark)}
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Confirm"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg-muted">
          This listing will be unpublished from search.
        </p>
      </Modal>
    </>
  );
}

export function OwnerListingsTable({ listings }: { listings: OwnerListing[] }) {
  if (listings.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-[var(--border)] py-16 flex flex-col items-center gap-4 text-center px-4">
        <p className="font-display font-semibold text-lg text-fg">No listings yet</p>
        <p className="text-sm text-fg-muted max-w-xs">
          Post your first property and start receiving enquiries from seekers in Ranchi.
        </p>
        <Link
          href="/owner/post"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px]"
        >
          Post a property
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-surface-2">
              <th className="text-left px-4 py-3 font-medium text-fg-muted text-xs uppercase tracking-wide">
                Property
              </th>
              <th className="text-left px-4 py-3 font-medium text-fg-muted text-xs uppercase tracking-wide hidden sm:table-cell">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-fg-muted text-xs uppercase tracking-wide hidden md:table-cell">
                Views
              </th>
              <th className="text-right px-4 py-3 font-medium text-fg-muted text-xs uppercase tracking-wide hidden md:table-cell">
                Enquiries
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr
                key={listing.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-surface-2/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-md overflow-hidden bg-surface-2 shrink-0">
                      {listing.coverUrl ? (
                        <Image
                          src={listing.coverUrl}
                          alt=""
                          width={48}
                          height={40}
                          className="w-full h-full object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-2" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-fg line-clamp-1 text-sm">{listing.title}</p>
                      <p className="text-xs text-fg-muted mt-0.5">
                        {listing.addressArea || "—"}
                        {listing.displayPrice > 0 && (
                          <> · {formatINR(listing.displayPrice)}</>
                        )}
                      </p>
                      {/* Mobile: status inline */}
                      <div className="sm:hidden mt-1">
                        <StatusBadge status={listing.status} />
                      </div>
                      {listing.status === "rejected" && listing.rejectionReason && (
                        <p className="text-xs text-danger mt-1 line-clamp-2">
                          {listing.rejectionReason}{" "}
                          <Link href={`/owner/edit/${listing.id}`} className="underline">
                            Edit listing
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <StatusBadge status={listing.status} />
                </td>
                <td className="px-4 py-3 text-right tabular text-fg-muted hidden md:table-cell">
                  {listing.viewCount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-right tabular text-fg-muted hidden md:table-cell">
                  {listing.enquiryCount.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <ActionMenu listing={listing} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[status] ?? "bg-surface-2 text-fg-muted"}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
