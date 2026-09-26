"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { FilterForm, type DraftFilters, emptyDraft } from "./FilterForm";
import { filtersToParams, countActiveFilters } from "@/lib/utils/filters";
import type { PropertyFilters, Locality } from "@/types";

interface FilterPanelProps {
  current: PropertyFilters;
  localities: Pick<Locality, "slug" | "name">[];
  amenities: { id: string; name: string }[];
  total: number;
}

function filtersToDraft(f: PropertyFilters): DraftFilters {
  return {
    localities: f.localities ?? [],
    types: f.types ?? [],
    listing: f.listing ?? "",
    minPrice: f.minPrice !== undefined ? String(f.minPrice) : "",
    maxPrice: f.maxPrice !== undefined ? String(f.maxPrice) : "",
    bhk: f.bhk ?? [],
    furnishing: f.furnishing ?? [],
    amenities: f.amenities ?? [],
    verified: f.verified ?? false,
  };
}

function draftToFilters(d: DraftFilters): Partial<PropertyFilters> {
  return {
    localities: d.localities.length ? d.localities : undefined,
    types: d.types.length ? d.types : undefined,
    listing: (d.listing as PropertyFilters["listing"]) || undefined,
    minPrice: d.minPrice ? Number(d.minPrice) : undefined,
    maxPrice: d.maxPrice ? Number(d.maxPrice) : undefined,
    bhk: d.bhk.length ? d.bhk : undefined,
    furnishing: d.furnishing.length ? d.furnishing : undefined,
    amenities: d.amenities.length ? d.amenities : undefined,
    verified: d.verified || undefined,
  };
}

export function FilterPanel({ current, localities, amenities, total }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileDraft, setMobileDraft] = useState<DraftFilters>(() => filtersToDraft(current));

  const activeCount = countActiveFilters(current);

  const navigateTo = useCallback(
    (filters: Partial<PropertyFilters>) => {
      const view = searchParams.get("view");
      const sort = searchParams.get("sort");
      const extra: Record<string, string> = {};
      if (view) extra.view = view;
      if (sort) extra.sort = sort;
      const params = filtersToParams(filters, extra);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleDesktopChange = useCallback(
    (draft: DraftFilters) => {
      navigateTo(draftToFilters(draft));
    },
    [navigateTo]
  );

  const handleMobileApply = useCallback(() => {
    navigateTo(draftToFilters(mobileDraft));
    setDrawerOpen(false);
  }, [mobileDraft, navigateTo]);

  const handleClear = useCallback(() => {
    const view = searchParams.get("view");
    const sort = searchParams.get("sort");
    const params = new URLSearchParams();
    if (view) params.set("view", view);
    if (sort) params.set("sort", sort);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setMobileDraft(emptyDraft());
    setDrawerOpen(false);
  }, [router, pathname, searchParams]);

  const openDrawer = useCallback(() => {
    setMobileDraft(filtersToDraft(current));
    setDrawerOpen(true);
  }, [current]);

  const desktopDraft = filtersToDraft(current);

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0">
        <div className="sticky top-20 flex flex-col gap-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-4">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-fg">Filters</span>
            {activeCount > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <FilterForm
            draft={desktopDraft}
            onChange={handleDesktopChange}
            localities={localities}
            amenities={amenities}
          />
        </div>
      </aside>

      {/* ── Mobile filter button ─────────────────────────────────────────── */}
      <button
        onClick={openDrawer}
        className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-surface text-sm font-medium text-fg hover:bg-surface-2 transition-brand min-h-[44px] relative"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-on-accent text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            <button
              onClick={handleClear}
              className="flex-1 text-sm text-fg-muted hover:text-fg transition-brand min-h-[44px]"
            >
              Clear all
            </button>
            <Button onClick={handleMobileApply} className="flex-1">
              Show {total.toLocaleString("en-IN")} results
            </Button>
          </div>
        }
      >
        <FilterForm
          draft={mobileDraft}
          onChange={setMobileDraft}
          localities={localities}
          amenities={amenities}
        />
      </Drawer>
    </>
  );
}
