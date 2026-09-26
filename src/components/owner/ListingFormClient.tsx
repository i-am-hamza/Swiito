"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/utils/format";
import { saveDraftAction, submitListingAction, updateListingAction } from "@/lib/actions/owner";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { StepIndicator } from "@/components/owner/StepIndicator";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import type { OwnerListingFull } from "@/types";

interface Props {
  localities: { id: string; name: string; slug: string }[];
  amenities: { id: string; name: string }[];
  initialData?: OwnerListingFull;
  supabaseUrl: string;
  anonKey: string;
}

type Furnishing = "unfurnished" | "semi_furnished" | "fully_furnished";
type ListingType = "rent" | "sale";
type PropertyType =
  | "flat"
  | "independent_house"
  | "room"
  | "pg"
  | "hostel"
  | "shop"
  | "office"
  | "plot";

interface DraftData {
  listingType: ListingType;
  propertyType: PropertyType;
  localityId: string;
  addressArea: string;
  bhk: number | null;
  bathrooms: number | null;
  carpetAreaSqft: number | null;
  builtupAreaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnishing: Furnishing | null;
  ageYears: number | null;
  facing: string | null;
  amenities: string[];
  description: string;
  askingPrice: number | null;
  deposit: number | null;
  maintenance: number | null;
  availableFrom: string | null;
  tenantPreference: string[];
  fullAddress: string;
}

const DRAFT_KEY = "swiito_listing_draft";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "flat", label: "Flat / Apartment" },
  { value: "independent_house", label: "Independent House / Villa" },
  { value: "room", label: "Single Room" },
  { value: "pg", label: "PG / Paying Guest" },
  { value: "hostel", label: "Hostel" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office Space" },
  { value: "plot", label: "Plot / Land" },
];

const BHK_OPTIONS = [1, 2, 3, 4, 5];
const BATH_OPTIONS = [1, 2, 3, 4, 5];
const FACING_OPTIONS = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const TENANT_PREFS = ["Family", "Bachelor", "Working professional", "Students", "Any"];

const PHOTO_GUIDELINES = {
  required: [
    "Minimum 5 photos (8+ strongly recommended)",
    "Main room, every bedroom, kitchen, bathroom, building exterior",
    "Landscape 4:3 or 16:9, 1200px+ on the long edge",
    "Daylight — lights on, curtains open",
    "Empty and tidy — no people or pets",
  ],
  rejected: [
    "Under 5 photos or missing kitchen/bathroom",
    "Blurry, dark, or heavily filtered images",
    "Watermarks, text overlays, another agency's logo",
    "Screenshots or photos from another listing site",
    "Obviously not the property · Portrait-only photos",
  ],
};

const REQUIRED_ROOMS = [
  { id: "main_room", label: "Main living room" },
  { id: "bedroom", label: "Bedroom(s)" },
  { id: "kitchen", label: "Kitchen" },
  { id: "bathroom", label: "Bathroom" },
  { id: "exterior", label: "Building exterior" },
];

function numOrNull(v: string): number | null {
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function defaultDraft(): DraftData {
  return {
    listingType: "rent",
    propertyType: "flat",
    localityId: "",
    addressArea: "",
    bhk: null,
    bathrooms: null,
    carpetAreaSqft: null,
    builtupAreaSqft: null,
    floor: null,
    totalFloors: null,
    furnishing: null,
    ageYears: null,
    facing: null,
    amenities: [],
    description: "",
    askingPrice: null,
    deposit: null,
    maintenance: null,
    availableFrom: null,
    tenantPreference: [],
    fullAddress: "",
  };
}

function fromInitial(d: OwnerListingFull): DraftData {
  return {
    listingType: d.listingType,
    propertyType: d.propertyType as PropertyType,
    localityId: d.localityId ?? "",
    addressArea: d.addressArea,
    bhk: d.bhk,
    bathrooms: d.bathrooms,
    carpetAreaSqft: d.carpetAreaSqft,
    builtupAreaSqft: d.builtupAreaSqft,
    floor: d.floor,
    totalFloors: d.totalFloors,
    furnishing: d.furnishing as Furnishing | null,
    ageYears: d.ageYears,
    facing: d.facing,
    amenities: d.amenities,
    description: d.description,
    askingPrice: d.askingPrice || null,
    deposit: d.deposit,
    maintenance: d.maintenance,
    availableFrom: d.availableFrom,
    tenantPreference: d.tenantPreference,
    fullAddress: d.fullAddress,
  };
}

export function ListingFormClient({ localities, amenities, initialData, supabaseUrl, anonKey }: Props) {
  const isEdit = !!initialData;
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DraftData>(() =>
    initialData ? fromInitial(initialData) : defaultDraft()
  );
  const [propertyId, setPropertyId] = useState<string | null>(() => {
    if (initialData?.id) return initialData.id;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { id?: string };
          return parsed.id ?? null;
        }
      } catch {
        // ignore
      }
    }
    return null;
  });
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [showReapproveWarning, setShowReapproveWarning] = useState(false);
  const [roomsChecked, setRoomsChecked] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function autosave(patch: Partial<DraftData>, id: string | null) {
    if (pendingSaveRef.current) clearTimeout(pendingSaveRef.current);
    pendingSaveRef.current = setTimeout(async () => {
      setSaving(true);
      const result = await saveDraftAction(id, { ...patch });
      setSaving(false);
      if (result.ok && result.id) {
        setPropertyId(result.id);
        if (!isEdit) {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ id: result.id }));
        }
      }
    }, 1200);
  }

  function update(patch: Partial<DraftData>) {
    setData((prev) => {
      const next = { ...prev, ...patch };
      autosave(patch, propertyId);
      return next;
    });
    setErrors({});
  }

  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!data.listingType) return "Please select a listing type";
      if (!data.propertyType) return "Please select a property type";
      if (!data.localityId) return "Please select a locality";
      if (!data.addressArea.trim()) return "Please enter the area / street name";
    }
    if (s === 1) {
      if (!data.description || data.description.length < 30)
        return "Description must be at least 30 characters";
    }
    if (s === 2) {
      if (!data.askingPrice || data.askingPrice <= 0) return "Please enter your asking price";
      if (!data.fullAddress.trim()) return "Please enter the full property address";
    }
    if (s === 3) {
      if (!propertyId) return "Please wait — saving your draft first";
      const checked = Object.values(roomsChecked).filter(Boolean).length;
      if (checked < REQUIRED_ROOMS.length) return "Please confirm you have uploaded all required room photos";
    }
    return null;
  }

  async function goNext() {
    const err = validateStep(step);
    if (err) {
      setErrors({ step: err });
      return;
    }
    setErrors({});

    // Ensure draft is saved before step 4 (need propertyId for uploads)
    if (step === 2 && !propertyId) {
      setSaving(true);
      const result = await saveDraftAction(null, data);
      setSaving(false);
      if (result.ok && result.id) {
        setPropertyId(result.id);
        if (!isEdit) localStorage.setItem(DRAFT_KEY, JSON.stringify({ id: result.id }));
      } else {
        addToast({ type: "error", message: result.error ?? "Failed to save draft" });
        return;
      }
    } else if (!propertyId && step < 3) {
      // Save immediately if no ID yet
      const result = await saveDraftAction(null, data);
      if (result.ok && result.id) {
        setPropertyId(result.id);
        if (!isEdit) localStorage.setItem(DRAFT_KEY, JSON.stringify({ id: result.id }));
      }
    }

    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit() {
    if (isEdit && initialData?.status === "approved") {
      setShowReapproveWarning(true);
      return;
    }
    doSubmit();
  }

  function doSubmit() {
    if (!propertyId) {
      addToast({ type: "error", message: "Draft not saved yet. Please wait." });
      return;
    }
    setShowReapproveWarning(false);
    startTransition(async () => {
      const result = isEdit
        ? await updateListingAction(propertyId, data)
        : await submitListingAction(propertyId);

      if (result.ok) {
        if (!isEdit) localStorage.removeItem(DRAFT_KEY);
        setReferenceId(propertyId.slice(0, 8).toUpperCase());
        setSubmitted(true);
      } else {
        addToast({ type: "error", message: result.error ?? "Submission failed" });
      }
    });
  }

  if (submitted) {
    return <ConfirmationScreen referenceId={referenceId} isEdit={isEdit} />;
  }

  const needsBhk = ["flat", "independent_house", "room"].includes(data.propertyType);

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} />

      <div className="mt-8 bg-surface rounded-xl border border-[var(--border)] p-6 sm:p-8">
        {/* Step 0: Listing type */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-fg">What are you listing?</h2>

            <fieldset>
              <legend className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                Listing type
              </legend>
              <div className="flex gap-3">
                {(["rent", "sale"] as ListingType[]).map((lt) => (
                  <button
                    key={lt}
                    type="button"
                    onClick={() => update({ listingType: lt })}
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-brand ${
                      data.listingType === lt
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-[var(--border)] text-fg-muted hover:border-accent/50"
                    }`}
                  >
                    {lt === "rent" ? "For Rent" : "For Sale"}
                  </button>
                ))}
              </div>
            </fieldset>

            <Select
              id="propertyType"
              label="Property type"
              value={data.propertyType}
              onChange={(e) => update({ propertyType: e.target.value as PropertyType })}
              options={PROPERTY_TYPES}
            />

            <Select
              id="locality"
              label="Locality"
              value={data.localityId}
              onChange={(e) => update({ localityId: e.target.value })}
              options={[
                { value: "", label: "Select locality…" },
                ...localities.map((l) => ({ value: l.id, label: l.name })),
              ]}
            />

            <Input
              id="addressArea"
              label="Area / street"
              placeholder="e.g. Near HEC Gate, Dhurwa"
              value={data.addressArea}
              onChange={(e) => update({ addressArea: e.target.value })}
            />
          </div>
        )}

        {/* Step 1: Property details */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-fg">Property details</h2>

            {needsBhk && (
              <fieldset>
                <legend className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                  BHK
                </legend>
                <div className="flex gap-2 flex-wrap">
                  {BHK_OPTIONS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => update({ bhk: b })}
                      className={`w-12 h-11 rounded-lg border text-sm font-medium transition-brand ${
                        data.bhk === b
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-[var(--border)] text-fg-muted hover:border-accent/50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => update({ bhk: 6 })}
                    className={`px-3 h-11 rounded-lg border text-sm font-medium transition-brand ${
                      data.bhk !== null && data.bhk >= 6
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-[var(--border)] text-fg-muted hover:border-accent/50"
                    }`}
                  >
                    6+
                  </button>
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                Bathrooms
              </legend>
              <div className="flex gap-2">
                {BATH_OPTIONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => update({ bathrooms: b })}
                    className={`w-12 h-11 rounded-lg border text-sm font-medium transition-brand ${
                      data.bathrooms === b
                        ? "border-accent bg-accent/5 text-accent"
                        : "border-[var(--border)] text-fg-muted hover:border-accent/50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="carpet"
                label="Carpet area (sq ft)"
                type="number"
                min="1"
                placeholder="e.g. 850"
                value={data.carpetAreaSqft ?? ""}
                onChange={(e) => update({ carpetAreaSqft: numOrNull(e.target.value) })}
              />
              <Input
                id="builtup"
                label="Builtup area (sq ft)"
                type="number"
                min="1"
                placeholder="e.g. 950"
                value={data.builtupAreaSqft ?? ""}
                onChange={(e) => update({ builtupAreaSqft: numOrNull(e.target.value) })}
              />
              <Input
                id="floor"
                label="Floor number"
                type="number"
                min="0"
                placeholder="e.g. 3"
                value={data.floor ?? ""}
                onChange={(e) => update({ floor: numOrNull(e.target.value) })}
              />
              <Input
                id="totalFloors"
                label="Total floors"
                type="number"
                min="1"
                placeholder="e.g. 8"
                value={data.totalFloors ?? ""}
                onChange={(e) => update({ totalFloors: numOrNull(e.target.value) })}
              />
            </div>

            <Select
              id="furnishing"
              label="Furnishing"
              value={data.furnishing ?? ""}
              onChange={(e) =>
                update({ furnishing: (e.target.value || null) as Furnishing | null })
              }
              options={[
                { value: "", label: "Select…" },
                { value: "unfurnished", label: "Unfurnished" },
                { value: "semi_furnished", label: "Semi-Furnished" },
                { value: "fully_furnished", label: "Fully Furnished" },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="age"
                label="Property age (years)"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={data.ageYears ?? ""}
                onChange={(e) => update({ ageYears: numOrNull(e.target.value) })}
              />
              <Select
                id="facing"
                label="Facing"
                value={data.facing ?? ""}
                onChange={(e) => update({ facing: e.target.value || null })}
                options={[
                  { value: "", label: "Select…" },
                  ...FACING_OPTIONS.map((f) => ({ value: f, label: f })),
                ]}
              />
            </div>

            {amenities.length > 0 && (
              <fieldset>
                <legend className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                  Amenities
                </legend>
                <div className="grid grid-cols-2 gap-x-4">
                  {amenities.map((a) => (
                    <Checkbox
                      key={a.id}
                      id={`amenity-${a.id}`}
                      label={a.name}
                      checked={data.amenities.includes(a.id)}
                      onChange={(checked) =>
                        update({
                          amenities: checked
                            ? [...data.amenities, a.id]
                            : data.amenities.filter((x) => x !== a.id),
                        })
                      }
                    />
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-xs font-medium text-fg-muted uppercase tracking-wide"
              >
                Description <span className="text-fg-muted font-normal normal-case">(min 30 chars)</span>
              </label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe the property — layout, highlights, nearby landmarks…"
                value={data.description}
                onChange={(e) => update({ description: e.target.value })}
                className="w-full px-4 py-3 rounded-sm bg-surface border border-[var(--border)] text-fg text-sm placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-brand resize-y"
              />
              <p className="text-xs text-fg-muted">{data.description.length} / 3000</p>
            </div>
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-fg">Pricing & availability</h2>

            <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 text-sm text-fg-muted">
              Swiito reviews your asking price and sets the final listed price. Your asking price is
              private and only visible to Swiito.
            </div>

            <Input
              id="askingPrice"
              label={`Your asking price (₹) — ${data.listingType === "rent" ? "per month" : "total"}`}
              type="number"
              min="1"
              placeholder={data.listingType === "rent" ? "e.g. 15000" : "e.g. 3500000"}
              value={data.askingPrice ?? ""}
              onChange={(e) => update({ askingPrice: numOrNull(e.target.value) })}
            />

            <div className="grid grid-cols-2 gap-4">
              {data.listingType === "rent" && (
                <Input
                  id="deposit"
                  label="Security deposit (₹)"
                  type="number"
                  min="0"
                  placeholder="e.g. 30000"
                  value={data.deposit ?? ""}
                  onChange={(e) => update({ deposit: numOrNull(e.target.value) })}
                />
              )}
              <Input
                id="maintenance"
                label="Maintenance (₹/mo)"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={data.maintenance ?? ""}
                onChange={(e) => update({ maintenance: numOrNull(e.target.value) })}
              />
            </div>

            <Input
              id="availableFrom"
              label="Available from"
              type="date"
              value={data.availableFrom ?? ""}
              onChange={(e) => update({ availableFrom: e.target.value || null })}
            />

            {data.listingType === "rent" && (
              <fieldset>
                <legend className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                  Tenant preference
                </legend>
                <div className="flex flex-wrap gap-2">
                  {TENANT_PREFS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        const sel = data.tenantPreference;
                        update({
                          tenantPreference: sel.includes(t)
                            ? sel.filter((x) => x !== t)
                            : [...sel, t],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-brand ${
                        data.tenantPreference.includes(t)
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-[var(--border)] text-fg-muted hover:border-accent/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="fullAddress"
                className="text-xs font-medium text-fg-muted uppercase tracking-wide"
              >
                Full property address{" "}
                <span className="text-fg-muted font-normal normal-case">(private — not shown publicly)</span>
              </label>
              <textarea
                id="fullAddress"
                rows={3}
                placeholder="House/flat number, building name, street, landmark, PIN"
                value={data.fullAddress}
                onChange={(e) => update({ fullAddress: e.target.value })}
                className="w-full px-4 py-3 rounded-sm bg-surface border border-[var(--border)] text-fg text-sm placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-brand resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-fg">Photos</h2>

            {/* Guidelines */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-accent/5 rounded-lg border border-accent/20 p-4">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">Required</p>
                <ul className="space-y-1">
                  {PHOTO_GUIDELINES.required.map((g) => (
                    <li key={g} className="text-xs text-fg-muted flex gap-1.5">
                      <span className="text-accent shrink-0 mt-0.5">✓</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-danger/5 rounded-lg border border-danger/20 p-4">
                <p className="text-xs font-semibold text-danger uppercase tracking-wide mb-2">Not accepted</p>
                <ul className="space-y-1">
                  {PHOTO_GUIDELINES.rejected.map((g) => (
                    <li key={g} className="text-xs text-fg-muted flex gap-1.5">
                      <span className="text-danger shrink-0 mt-0.5">✗</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {propertyId ? (
              <ImageUploader
                propertyId={propertyId}
                supabaseUrl={supabaseUrl}
                anonKey={anonKey}
                initial={initialData?.media}
              />
            ) : (
              <div className="rounded-lg bg-surface-2 border border-[var(--border)] px-4 py-6 text-center text-sm text-fg-muted">
                Saving your draft first…
              </div>
            )}

            {/* Room checklist */}
            <div>
              <p className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-3">
                Confirm you have uploaded
              </p>
              <div className="space-y-0.5">
                {REQUIRED_ROOMS.map((r) => (
                  <Checkbox
                    key={r.id}
                    id={`room-${r.id}`}
                    label={r.label}
                    checked={roomsChecked[r.id] ?? false}
                    onChange={(checked) =>
                      setRoomsChecked((prev) => ({ ...prev, [r.id]: checked }))
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-fg">Review your listing</h2>

            <ReviewCard data={data} localities={localities} />

            {isEdit && initialData?.status === "approved" && (
              <div className="bg-[#B45309]/10 border border-[#B45309]/30 rounded-lg px-4 py-3 text-sm text-[#B45309]">
                Saving changes will unpublish this listing and return it to &ldquo;Under review&rdquo; until Swiito re-approves it.
              </div>
            )}

            <p className="text-xs text-fg-muted">
              By submitting, you confirm this listing is accurate and belongs to you. Swiito will review
              it before publishing.
            </p>
          </div>
        )}

        {/* Error */}
        {errors.step && (
          <p className="mt-4 text-sm text-danger bg-danger/5 border border-danger/20 rounded-lg px-4 py-2">
            {errors.step}
          </p>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={goBack} disabled={isPending}>
                <ArrowLeft size={16} className="mr-1.5" />
                Back
              </Button>
            )}
            {saving && (
              <span className="text-xs text-fg-muted">Saving…</span>
            )}
          </div>

          {step < 4 ? (
            <Button onClick={goNext} disabled={saving}>
              Next
              <ArrowRight size={16} className="ml-1.5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? isEdit
                  ? "Saving…"
                  : "Submitting…"
                : isEdit
                  ? "Save changes"
                  : "Submit for review"}
            </Button>
          )}
        </div>
      </div>

      {/* Re-approve warning modal */}
      <Modal
        isOpen={showReapproveWarning}
        onClose={() => setShowReapproveWarning(false)}
        title="Listing will be unpublished"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowReapproveWarning(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={doSubmit} disabled={isPending}>
              {isPending ? "Saving…" : "Save and unpublish"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg-muted">
          Editing this listing will unpublish it from search. Swiito will review your changes
          before it goes live again. This usually takes 1–2 business days.
        </p>
      </Modal>
    </div>
  );
}

function ReviewCard({
  data,
  localities,
}: {
  data: DraftData;
  localities: { id: string; name: string }[];
}) {
  const locality = localities.find((l) => l.id === data.localityId);
  const typeLabel: Record<string, string> = {
    flat: "Flat",
    independent_house: "House",
    room: "Room",
    pg: "PG",
    hostel: "Hostel",
    shop: "Shop",
    office: "Office",
    plot: "Plot",
  };

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="bg-surface-2 px-4 py-3 border-b border-[var(--border)]">
        <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">Preview</p>
      </div>
      <div className="px-4 py-4 space-y-3">
        <div>
          <p className="font-display font-semibold text-fg">
            {data.bhk ? `${data.bhk} BHK ` : ""}
            {typeLabel[data.propertyType] ?? data.propertyType} for{" "}
            {data.listingType === "rent" ? "Rent" : "Sale"}
            {locality ? ` in ${locality.name}` : ""}
          </p>
          <p className="text-sm text-fg-muted mt-0.5">{data.addressArea || "—"}</p>
        </div>

        {data.askingPrice && data.askingPrice > 0 && (
          <p className="text-sm text-fg-muted">
            Your asking price:{" "}
            <span className="font-semibold text-fg tabular">{formatINR(data.askingPrice)}</span>
            {data.listingType === "rent" && "/mo"}
          </p>
        )}

        {data.description && (
          <p className="text-sm text-fg-muted line-clamp-3">{data.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-fg-muted">
          {data.furnishing && <span className="capitalize">{data.furnishing.replace("_", " ")}</span>}
          {data.carpetAreaSqft && <span>{data.carpetAreaSqft} sq ft carpet</span>}
          {data.floor != null && <span>Floor {data.floor}</span>}
          {data.ageYears != null && <span>{data.ageYears} yr old</span>}
        </div>
      </div>
    </div>
  );
}

function ConfirmationScreen({ referenceId, isEdit }: { referenceId: string; isEdit: boolean }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16 flex flex-col items-center gap-6">
      <CheckCircle2 size={56} className="text-accent" />
      <div>
        <h2 className="font-display font-bold text-2xl text-fg">
          {isEdit ? "Changes saved" : "Listing submitted!"}
        </h2>
        <p className="text-fg-muted mt-2 text-sm">
          {isEdit
            ? "Your listing has been updated and is now under review."
            : "Your listing is under review by the Swiito team. We'll publish it once approved."}
        </p>
        {!isEdit && (
          <p className="text-sm font-medium text-fg mt-3">
            Reference:{" "}
            <span className="text-accent font-mono">{referenceId}</span>
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Link
          href="/owner/dashboard"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px]"
        >
          Go to dashboard
        </Link>
        {!isEdit && (
          <Link
            href="/owner/post"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[var(--border)] text-fg text-sm font-medium min-h-[44px] hover:bg-surface-2"
          >
            Post another
          </Link>
        )}
      </div>
    </div>
  );
}
