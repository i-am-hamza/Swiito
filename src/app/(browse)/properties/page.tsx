import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, MapIcon } from "lucide-react";
import { parseFilters } from "@/lib/utils/filters";
import {
  getPropertiesPage,
  getPropertyMapPins,
  getLocalities,
  getAmenities,
} from "@/lib/queries/properties";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { ActiveChips } from "@/components/filters/ActiveChips";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyMapClient } from "@/components/property/PropertyMapClient";
import { SortSelect } from "@/components/filters/SortSelect";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Properties in Ranchi — Swiito",
  description:
    "Browse verified flats, rooms, PGs, and houses for rent and sale in Ranchi. Filter by locality, BHK, budget, and more.",
  alternates: { canonical: "https://swiito.in/properties" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function spGet(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return typeof v === "string" ? v : undefined;
}

function buildBaseParams(sp: SearchParams): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
  }
  return p;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const isMap = spGet(sp, "view") === "map";

  const [localities, amenities, viewResult] = await Promise.all([
    getLocalities(),
    getAmenities(),
    isMap ? getPropertyMapPins(filters) : getPropertiesPage(filters),
  ]);

  const pins = Array.isArray(viewResult) ? viewResult : [];
  const page = Array.isArray(viewResult) ? null : viewResult;
  const total = isMap ? pins.length : (page?.total ?? 0);
  const localityNames = Object.fromEntries(
    localities.map((l) => [l.slug, l.name])
  );

  const buildPageUrl = (p: number): string => {
    const params = buildBaseParams(sp);
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    return `?${params.toString()}`;
  };

  const mapUrl = (() => {
    const params = buildBaseParams(sp);
    params.set("view", "map");
    params.delete("page");
    return `?${params.toString()}`;
  })();

  const listUrl = (() => {
    const params = buildBaseParams(sp);
    params.delete("view");
    return `?${params.toString()}`;
  })();

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-fg">
            Properties in Ranchi
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {total > 0
              ? `${total.toLocaleString("en-IN")} listing${total !== 1 ? "s" : ""} found`
              : "No listings found"}
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Filter panel — desktop sidebar + mobile drawer button */}
          <Suspense fallback={null}>
            <FilterPanel
              current={filters}
              localities={localities.map((l) => ({ slug: l.slug, name: l.name }))}
              amenities={amenities}
              total={total}
            />
          </Suspense>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-start gap-3 mb-6">
              <div className="flex-1 min-w-0">
                <Suspense fallback={null}>
                  <ActiveChips
                    filters={filters}
                    localityNames={localityNames}
                  />
                </Suspense>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isMap && (
                  <Suspense fallback={null}>
                    <SortSelect value={filters.sort ?? "featured"} />
                  </Suspense>
                )}

                {/* List ↔ Map toggle */}
                <div
                  className="flex rounded-lg border border-[var(--border)] overflow-hidden"
                  role="group"
                  aria-label="View mode"
                >
                  <Link
                    href={listUrl}
                    scroll={false}
                    aria-label="List view"
                    aria-pressed={!isMap}
                    className={[
                      "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-brand min-h-[36px]",
                      !isMap
                        ? "bg-accent text-on-accent"
                        : "bg-surface text-fg hover:bg-surface-2",
                    ].join(" ")}
                  >
                    <LayoutGrid size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">List</span>
                  </Link>
                  <Link
                    href={mapUrl}
                    scroll={false}
                    aria-label="Map view"
                    aria-pressed={isMap}
                    className={[
                      "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-brand min-h-[36px]",
                      isMap
                        ? "bg-accent text-on-accent"
                        : "bg-surface text-fg hover:bg-surface-2",
                    ].join(" ")}
                  >
                    <MapIcon size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Map</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Results */}
            {isMap ? (
              <PropertyMapClient pins={pins} />
            ) : !page || page.total === 0 ? (
              <EmptyState
                title="No properties found"
                description="Try adjusting your filters or clearing your search to see more listings."
                action={
                  <Link
                    href="/properties"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px]"
                  >
                    Clear all filters
                  </Link>
                }
              />
            ) : (
              <>
                <PropertyGrid properties={page.properties} />
                {page.totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      total={page.total}
                      page={page.page}
                      perPage={page.perPage}
                      buildUrl={buildPageUrl}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
