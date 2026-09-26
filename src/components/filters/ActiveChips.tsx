"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { PropertyFilters } from "@/types";

interface Chip {
  label: string;
  removeHref: string;
}

const FURNISHING_LABEL: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-furnished",
  fully_furnished: "Fully furnished",
};

const TYPE_LABEL: Record<string, string> = {
  flat: "Flat",
  independent_house: "House",
  room: "Room",
  pg: "PG / Hostel",
  hostel: "Hostel",
  shop: "Shop",
  office: "Office",
  plot: "Plot",
};

function removeParam(
  params: URLSearchParams,
  key: string,
  value?: string
): string {
  const copy = new URLSearchParams(params.toString());
  if (value !== undefined) {
    const list = (copy.get(key) ?? "").split(",").filter((v) => v !== value && v !== "");
    if (list.length) {
      copy.set(key, list.join(","));
    } else {
      copy.delete(key);
    }
  } else {
    copy.delete(key);
  }
  copy.delete("page");
  return `?${copy.toString()}`;
}

interface ActiveChipsProps {
  filters: PropertyFilters;
  localityNames?: Record<string, string>;
}

export function ActiveChips({ filters, localityNames = {} }: ActiveChipsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sp = new URLSearchParams(searchParams.toString());

  const chips: Chip[] = [];

  for (const slug of filters.localities ?? []) {
    chips.push({
      label: localityNames[slug] ?? slug,
      removeHref: pathname + removeParam(sp, "locality", slug),
    });
  }

  for (const t of filters.types ?? []) {
    chips.push({
      label: TYPE_LABEL[t] ?? t,
      removeHref: pathname + removeParam(sp, "type", t),
    });
  }

  if (filters.listing) {
    chips.push({
      label: filters.listing === "rent" ? "For Rent" : "For Sale",
      removeHref: pathname + removeParam(sp, "listing"),
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    const label = [
      filters.minPrice ? `₹${filters.minPrice.toLocaleString("en-IN")}` : "",
      filters.maxPrice ? `₹${filters.maxPrice.toLocaleString("en-IN")}` : "",
    ]
      .filter(Boolean)
      .join(" – ");
    const href = pathname + (() => {
      const c = new URLSearchParams(sp.toString());
      c.delete("min");
      c.delete("max");
      c.delete("page");
      return `?${c.toString()}`;
    })();
    chips.push({ label, removeHref: href });
  }

  for (const b of filters.bhk ?? []) {
    chips.push({
      label: b === 4 ? "4+ BHK" : `${b} BHK`,
      removeHref: pathname + removeParam(sp, "bhk", String(b)),
    });
  }

  for (const f of filters.furnishing ?? []) {
    chips.push({
      label: FURNISHING_LABEL[f] ?? f,
      removeHref: pathname + removeParam(sp, "furnishing", f),
    });
  }

  for (const a of filters.amenities ?? []) {
    chips.push({
      label: a,
      removeHref: pathname + removeParam(sp, "amenities", a),
    });
  }

  if (filters.verified) {
    chips.push({
      label: "Verified only",
      removeHref: pathname + removeParam(sp, "verified"),
    });
  }

  if (filters.q) {
    chips.push({
      label: `"${filters.q}"`,
      removeHref: pathname + removeParam(sp, "q"),
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <Link
          key={chip.removeHref}
          href={chip.removeHref}
          scroll={false}
          role="listitem"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-surface border border-[var(--border)] text-fg hover:bg-surface-2 transition-brand min-h-[32px]"
        >
          {chip.label}
          <X size={12} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}
