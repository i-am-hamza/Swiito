"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GripVertical, Trash2 } from "lucide-react";
import { cn, formatINR } from "@/lib/utils/format";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  updatePropertyAction,
  adminReorderPhotosAction,
  adminDeletePhotoAction,
} from "@/lib/actions/admin";
import type { AdminListingFull, PropertyStatus } from "@/types";

interface Props {
  listing: AdminListingFull;
  supabaseUrl?: string;
  anonKey?: string;
}

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "rented", label: "Rented" },
  { value: "sold", label: "Sold" },
  { value: "expired", label: "Expired" },
];

export function PropertyEditClient({ listing }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [, startTransition] = useTransition();

  const [status, setStatus] = useState<PropertyStatus>(listing.status);
  const [displayPrice, setDisplayPrice] = useState(listing.displayPrice);
  const [score, setScore] = useState<number | null>(listing.swiitoScore ?? null);
  const [isVerified, setIsVerified] = useState(listing.isVerified);
  const [isFeatured, setIsFeatured] = useState(listing.isFeatured);
  const [rejectionReason, setRejectionReason] = useState(listing.rejectionReason ?? "");
  const [saving, setSaving] = useState(false);

  const [photos, setPhotos] = useState(listing.media);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    const res = await updatePropertyAction(listing.id, {
      status,
      display_price: displayPrice,
      swiito_score: score,
      is_verified: isVerified,
      is_featured: isFeatured,
      rejection_reason: rejectionReason || null,
    });
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "Property updated." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed to update." });
    }
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      return;
    }
    const next = [...photos];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    const reordered = next.map((p, i) => ({ ...p, sortOrder: i, isCover: i === 0 }));
    setPhotos(reordered);
    setDragIdx(null);

    adminReorderPhotosAction(
      listing.id,
      reordered.map((p) => ({ id: p.id, isCover: p.isCover, sortOrder: p.sortOrder }))
    ).then((res) => {
      if (!res.ok) addToast({ type: "error", message: "Failed to save photo order." });
    });
  }

  async function handleDeletePhoto(mediaId: string) {
    const res = await adminDeletePhotoAction(listing.id, mediaId);
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== mediaId));
      addToast({ type: "success", message: "Photo deleted." });
    } else {
      addToast({ type: "error", message: res.error ?? "Failed to delete photo." });
    }
    setDeletePhotoId(null);
  }

  return (
    <div className="space-y-6">
      {/* Status + core fields */}
      <div className="bg-surface rounded-lg border border-[var(--border)] p-5 space-y-5">
        <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide">
          Listing controls
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => setStatus(e.target.value as PropertyStatus)}
          />
          <Input
            label="Display price (₹)"
            type="number"
            value={displayPrice}
            onChange={(e) => setDisplayPrice(Number(e.target.value))}
            min={0}
          />
        </div>

        <div>
          <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">
            Swiito score
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setScore(score === v ? null : v)}
                className={cn(
                  "w-9 h-9 rounded-md text-sm font-bold transition-brand border",
                  score === v
                    ? "bg-accent text-on-accent border-accent"
                    : "border-[var(--border)] text-fg-muted hover:text-fg hover:bg-surface-2"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-fg">Verified</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-fg">Featured</span>
          </label>
        </div>

        {status === "rejected" && (
          <Input
            label="Rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason shown to owner…"
          />
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Owner contact (admin only) */}
      <div className="bg-surface rounded-lg border border-danger/20 p-5">
        <h2 className="text-xs font-medium text-danger uppercase tracking-wide mb-3">
          Owner contact (admin only)
        </h2>
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-fg-muted">Owner</dt>
            <dd className="text-fg font-medium">{listing.ownerName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Email</dt>
            <dd className="text-fg">{listing.ownerEmail ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Phone</dt>
            <dd className="text-fg">{listing.ownerPhone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-fg-muted">Asking price</dt>
            <dd className="text-fg font-medium">{formatINR(listing.ownerAskingPrice)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-fg-muted">Full address</dt>
            <dd className="text-fg">{listing.fullAddress ?? "—"}</dd>
          </div>
        </dl>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="bg-surface rounded-lg border border-[var(--border)] p-5">
          <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
            Photos — drag to reorder, first is cover
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {photos.map((m, idx) => (
              <div
                key={m.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(idx)}
                className={cn(
                  "relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-2 group cursor-grab active:cursor-grabbing border-2 transition-brand",
                  dragIdx === idx ? "border-accent opacity-60" : "border-transparent"
                )}
              >
                <Image
                  src={m.url}
                  alt=""
                  fill
                  sizes="25vw"
                  className="object-cover pointer-events-none"
                />
                {m.isCover && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs bg-accent text-on-accent font-medium">
                    Cover
                  </span>
                )}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-brand">
                  <button
                    type="button"
                    onClick={() => setDeletePhotoId(m.id)}
                    className="w-7 h-7 rounded-md bg-danger/90 text-white flex items-center justify-center"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 opacity-60">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete photo confirm */}
      <Modal
        isOpen={!!deletePhotoId}
        onClose={() => setDeletePhotoId(null)}
        title="Delete photo"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeletePhotoId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-danger text-white"
              onClick={() => deletePhotoId && handleDeletePhoto(deletePhotoId)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg-muted">This photo will be permanently deleted.</p>
      </Modal>
    </div>
  );
}
