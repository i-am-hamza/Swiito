"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, Phone, Mail, MapPin } from "lucide-react";
import { cn, formatINR } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { approveListingAction, rejectListingAction } from "@/lib/actions/admin";
import type { AdminListingFull } from "@/types";

const REJECTION_REASONS = [
  "Incomplete information — missing required fields",
  "Poor photo quality — too dark, blurry or insufficient photos",
  "Duplicate listing — same property already active",
  "Inaccurate information — details do not match location",
  "Spam or test listing",
  "Other",
];

function ScoreButton({
  value,
  active,
  onClick,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-9 h-9 rounded-md text-sm font-bold transition-brand border",
        active
          ? "bg-accent text-on-accent border-accent"
          : "border-[var(--border)] text-fg-muted hover:text-fg hover:bg-surface-2"
      )}
    >
      {value}
    </button>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-medium text-fg-muted uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-fg">{String(value)}</dd>
    </div>
  );
}

interface Props {
  listing: AdminListingFull;
}

export function ApprovalClient({ listing }: Props) {
  const router = useRouter();
  const { addToast } = useToast();

  const [displayPrice, setDisplayPrice] = useState(listing.ownerAskingPrice);
  const [score, setScore] = useState<number | null>(null);
  const [isVerified, setIsVerified] = useState(listing.isVerified);
  const [isFeatured, setIsFeatured] = useState(listing.isFeatured);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [saving, setSaving] = useState(false);

  const priceDiff = displayPrice - listing.ownerAskingPrice;
  const priceDiffPct =
    listing.ownerAskingPrice > 0 ? Math.round((priceDiff / listing.ownerAskingPrice) * 100) : 0;
  const roundStep = listing.listingType === "rent" ? 100 : 1000;
  const roundedSuggestion =
    Math.round(listing.ownerAskingPrice / roundStep) * roundStep;

  async function handleApprove() {
    setSaving(true);
    const res = await approveListingAction(
      listing.id,
      displayPrice,
      score,
      isVerified,
      isFeatured
    );
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "Listing approved and live." });
      router.push("/admin/approvals");
    } else {
      addToast({ type: "error", message: res.error ?? "Failed to approve." });
    }
  }

  async function handleReject() {
    setSaving(true);
    const reason = rejectionReason === "Other" ? customReason : rejectionReason;
    if (!reason.trim()) {
      addToast({ type: "error", message: "Enter a rejection reason." });
      setSaving(false);
      return;
    }
    const res = await rejectListingAction(listing.id, reason);
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "Listing rejected. Owner will be notified." });
      router.push("/admin/approvals");
    } else {
      addToast({ type: "error", message: res.error ?? "Failed to reject." });
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-xl text-fg">{listing.title}</h1>
          <p className="text-sm text-fg-muted mt-0.5">
            {listing.listingType === "rent" ? "For Rent" : "For Sale"} ·{" "}
            {listing.propertyType.replace(/_/g, " ")} ·{" "}
            {listing.localityName ?? listing.addressArea}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setShowRejectModal(true)}>
            <X size={14} className="mr-1" />
            Reject
          </Button>
          <Button onClick={() => setShowApproveModal(true)}>
            <Check size={14} className="mr-1" />
            Approve
          </Button>
        </div>
      </div>

      {/* Photos */}
      {listing.media.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wide mb-3">
            Photos ({listing.media.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {listing.media.map((m) => (
              <div key={m.id} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-2">
                <Image
                  src={m.url}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
                {m.isCover && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-xs bg-accent text-on-accent font-medium">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: property details */}
        <div className="space-y-5">
          <div className="bg-surface rounded-lg border border-[var(--border)] p-4">
            <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
              Property details
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="BHK" value={listing.bhk} />
              <Field label="Bathrooms" value={listing.bathrooms} />
              <Field label="Carpet area" value={listing.carpetAreaSqft ? `${listing.carpetAreaSqft} sqft` : null} />
              <Field label="Built-up area" value={listing.builtupAreaSqft ? `${listing.builtupAreaSqft} sqft` : null} />
              <Field label="Floor" value={listing.floor !== null ? `${listing.floor} / ${listing.totalFloors ?? "?"}` : null} />
              <Field label="Furnishing" value={listing.furnishing?.replace(/_/g, " ") ?? null} />
              <Field label="Age" value={listing.ageYears !== null ? `${listing.ageYears} yr` : null} />
              <Field label="Facing" value={listing.facing} />
            </dl>
            {listing.description && (
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-fg whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-surface rounded-lg border border-[var(--border)] p-4">
            <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
              Pricing
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Deposit" value={listing.deposit ? formatINR(listing.deposit) : null} />
              <Field label="Maintenance" value={listing.maintenance ? formatINR(listing.maintenance) : null} />
              <Field label="Available from" value={listing.availableFrom} />
              <Field label="Tenant preference" value={listing.tenantPreference.join(", ") || null} />
            </dl>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="bg-surface rounded-lg border border-[var(--border)] p-4">
              <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 rounded-full bg-surface-2 text-xs text-fg-muted"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: owner contact + admin controls */}
        <div className="space-y-5">
          {/* Owner contact — admin only */}
          <div className="bg-surface rounded-lg border border-danger/30 p-4">
            <h2 className="text-xs font-medium text-danger uppercase tracking-wide mb-3">
              Owner contact (admin only — never public)
            </h2>
            <dl className="space-y-2">
              {listing.ownerName && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-fg-muted w-5"><X size={14} className="opacity-0" /></span>
                  <span className="font-medium text-fg">{listing.ownerName}</span>
                </div>
              )}
              {listing.ownerPhone && (
                <a
                  href={`tel:${listing.ownerPhone}`}
                  className="flex items-center gap-2 text-sm text-fg hover:text-accent transition-brand"
                >
                  <Phone size={14} className="text-fg-muted shrink-0" />
                  {listing.ownerPhone}
                </a>
              )}
              {listing.ownerEmail && (
                <div className="flex items-center gap-2 text-sm text-fg">
                  <Mail size={14} className="text-fg-muted shrink-0" />
                  {listing.ownerEmail}
                </div>
              )}
              {listing.fullAddress && (
                <div className="flex items-start gap-2 text-sm text-fg">
                  <MapPin size={14} className="text-fg-muted shrink-0 mt-0.5" />
                  {listing.fullAddress}
                </div>
              )}
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="text-xs text-fg-muted">
                  Owner asking price:{" "}
                  <span className="font-bold text-fg">{formatINR(listing.ownerAskingPrice)}</span>
                </p>
              </div>
            </dl>
          </div>

          {/* Display price */}
          <div className="bg-surface rounded-lg border border-[var(--border)] p-4">
            <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
              Display price (public)
            </h2>
            <div className="space-y-2">
              <Input
                type="number"
                label="Display price (₹)"
                value={displayPrice}
                onChange={(e) => setDisplayPrice(Number(e.target.value))}
                min={0}
                step={roundStep}
              />
              {priceDiff !== 0 && (
                <p className={cn("text-xs", priceDiff > 0 ? "text-fg-muted" : "text-danger")}>
                  {priceDiff > 0 ? "+" : ""}
                  {formatINR(Math.abs(priceDiff))} ({priceDiff > 0 ? "+" : ""}
                  {priceDiffPct}%) vs asking price
                </p>
              )}
              {roundedSuggestion !== listing.ownerAskingPrice && (
                <button
                  type="button"
                  onClick={() => setDisplayPrice(roundedSuggestion)}
                  className="text-xs text-accent hover:underline"
                >
                  Round to {formatINR(roundedSuggestion)}
                </button>
              )}
            </div>
          </div>

          {/* Score + toggles */}
          <div className="bg-surface rounded-lg border border-[var(--border)] p-4 space-y-4">
            <div>
              <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">
                Swiito score
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <ScoreButton
                    key={v}
                    value={v}
                    active={score === v}
                    onClick={() => setScore(score === v ? null : v)}
                  />
                ))}
                {score && (
                  <button
                    type="button"
                    onClick={() => setScore(null)}
                    className="ml-1 text-xs text-fg-muted hover:text-fg"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-fg">Mark as verified</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent"
                />
                <span className="text-fg">Mark as featured</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(true)}>
              Reject
            </Button>
            <Button className="flex-1" onClick={() => setShowApproveModal(true)}>
              Approve & publish
            </Button>
          </div>
        </div>
      </div>

      {/* Approve confirm modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve listing"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={saving}>
              {saving ? "Publishing…" : "Approve & publish"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-fg">Confirm approval of <strong>{listing.title}</strong>.</p>
          <div className="bg-surface-2 rounded-lg p-3 space-y-1">
            <p className="text-fg-muted">Display price: <span className="font-bold text-fg">{formatINR(displayPrice)}</span></p>
            {score && <p className="text-fg-muted">Score: <span className="font-bold text-fg">{score}/5</span></p>}
            {isVerified && <p className="text-accent text-xs">Verified badge will appear</p>}
            {isFeatured && <p className="text-accent text-xs">Featured on browse page</p>}
          </div>
          <p className="text-fg-muted text-xs">This listing will be live immediately in public search.</p>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject listing"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-danger hover:bg-danger/90 text-white"
              onClick={handleReject}
              disabled={saving}
            >
              {saving ? "Rejecting…" : "Reject listing"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-fg-muted">Select a reason — the owner will see this.</p>
          <div className="space-y-1.5">
            {REJECTION_REASONS.map((r) => (
              <label key={r} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={rejectionReason === r}
                  onChange={() => setRejectionReason(r)}
                  className="mt-0.5 accent-accent"
                />
                <span className="text-sm text-fg">{r}</span>
              </label>
            ))}
          </div>
          {rejectionReason === "Other" && (
            <Input
              label="Custom reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe the issue…"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
