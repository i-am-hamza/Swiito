"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Input } from "@/components/ui/Input";
import type { Locality } from "@/types";

export interface DraftFilters {
  localities: string[];
  types: string[];
  listing: string;
  minPrice: string;
  maxPrice: string;
  bhk: number[];
  furnishing: string[];
  amenities: string[];
  verified: boolean;
}

export function emptyDraft(): DraftFilters {
  return {
    localities: [],
    types: [],
    listing: "",
    minPrice: "",
    maxPrice: "",
    bhk: [],
    furnishing: [],
    amenities: [],
    verified: false,
  };
}

interface FilterFormProps {
  draft: DraftFilters;
  onChange: (draft: DraftFilters) => void;
  localities: Pick<Locality, "slug" | "name">[];
  amenities: { id: string; name: string }[];
}

const PROPERTY_TYPES = [
  { value: "flat", label: "Flat" },
  { value: "independent_house", label: "Independent house" },
  { value: "room", label: "Room" },
  { value: "pg", label: "PG / Hostel" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office" },
  { value: "plot", label: "Plot" },
];

const LISTING_OPTIONS = [
  { value: "", label: "Any" },
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Sale" },
];

const BHK_OPTIONS = [1, 2, 3, 4] as const;

const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi-furnished" },
  { value: "fully_furnished", label: "Fully furnished" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FilterForm({ draft, onChange, localities, amenities }: FilterFormProps) {
  const set = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <div className="flex flex-col gap-6">
      {/* Locality */}
      {localities.length > 0 && (
        <Section label="Locality">
          {localities.map((loc) => (
            <Checkbox
              key={loc.slug}
              id={`loc-${loc.slug}`}
              label={loc.name}
              checked={draft.localities.includes(loc.slug)}
              onChange={() => set("localities", toggle(draft.localities, loc.slug))}
            />
          ))}
        </Section>
      )}

      {/* Listing type */}
      <Section label="Listing type">
        <RadioGroup
          name="listing"
          options={LISTING_OPTIONS}
          value={draft.listing}
          onChange={(v) => set("listing", v)}
        />
      </Section>

      {/* Property type */}
      <Section label="Property type">
        {PROPERTY_TYPES.map((pt) => (
          <Checkbox
            key={pt.value}
            id={`type-${pt.value}`}
            label={pt.label}
            checked={draft.types.includes(pt.value)}
            onChange={() => set("types", toggle(draft.types, pt.value))}
          />
        ))}
      </Section>

      {/* Budget */}
      <Section label="Budget (₹/month or total)">
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            type="number"
            value={draft.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Max"
            type="number"
            value={draft.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="flex-1"
          />
        </div>
      </Section>

      {/* BHK */}
      <Section label="BHK">
        <div className="flex flex-wrap gap-2">
          {BHK_OPTIONS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => set("bhk", toggle(draft.bhk, b))}
              className={[
                "min-w-[44px] min-h-[36px] px-3 rounded-full text-sm font-medium border transition-brand",
                draft.bhk.includes(b)
                  ? "bg-accent text-on-accent border-accent"
                  : "bg-surface border-[var(--border)] text-fg hover:border-accent",
              ].join(" ")}
            >
              {b === 4 ? "4+" : b}
            </button>
          ))}
        </div>
      </Section>

      {/* Furnishing */}
      <Section label="Furnishing">
        {FURNISHING_OPTIONS.map((f) => (
          <Checkbox
            key={f.value}
            id={`fur-${f.value}`}
            label={f.label}
            checked={draft.furnishing.includes(f.value)}
            onChange={() => set("furnishing", toggle(draft.furnishing, f.value))}
          />
        ))}
      </Section>

      {/* Amenities */}
      {amenities.length > 0 && (
        <Section label="Amenities">
          {amenities.map((a) => (
            <Checkbox
              key={a.id}
              id={`am-${a.id}`}
              label={a.name}
              checked={draft.amenities.includes(a.name)}
              onChange={() => set("amenities", toggle(draft.amenities, a.name))}
            />
          ))}
        </Section>
      )}

      {/* Verified only */}
      <Section label="Verification">
        <Checkbox
          id="verified-only"
          label="Verified listings only"
          checked={draft.verified}
          onChange={(v) => set("verified", v)}
        />
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}
