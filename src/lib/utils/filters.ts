import type { PropertyFilters } from "@/types";

type RawParams = Record<string, string | string[] | undefined>;

function str(params: RawParams, key: string): string | undefined {
  const v = params[key];
  return typeof v === "string" ? v : undefined;
}

function strList(params: RawParams, key: string): string[] | undefined {
  const v = str(params, key);
  const list = v ? v.split(",").filter(Boolean) : undefined;
  return list?.length ? list : undefined;
}

function num(params: RawParams, key: string): number | undefined {
  const v = str(params, key);
  const n = v !== undefined ? Number(v) : NaN;
  return isNaN(n) ? undefined : n;
}

function intList(params: RawParams, key: string): number[] | undefined {
  const v = str(params, key);
  if (!v) return undefined;
  const nums = v.split(",").map(Number).filter((n) => !isNaN(n));
  return nums.length ? nums : undefined;
}

export function parseFilters(params: RawParams): PropertyFilters {
  const listing = str(params, "listing");
  const sort = str(params, "sort") as PropertyFilters["sort"];

  return {
    localities: strList(params, "locality"),
    types: strList(params, "type"),
    listing: (listing === "rent" || listing === "sale") ? listing : undefined,
    minPrice: num(params, "min"),
    maxPrice: num(params, "max"),
    bhk: intList(params, "bhk"),
    furnishing: strList(params, "furnishing"),
    amenities: strList(params, "amenities"),
    verified: str(params, "verified") === "1" ? true : undefined,
    sort: sort ?? "featured",
    page: num(params, "page") ?? 1,
    perPage: 12,
    q: str(params, "q") ?? undefined,
  };
}

export function filtersToParams(
  filters: Partial<PropertyFilters>,
  extra: Record<string, string> = {}
): URLSearchParams {
  const p = new URLSearchParams(extra);

  if (filters.localities?.length) p.set("locality", filters.localities.join(","));
  if (filters.types?.length) p.set("type", filters.types.join(","));
  if (filters.listing) p.set("listing", filters.listing);
  if (filters.minPrice) p.set("min", String(filters.minPrice));
  if (filters.maxPrice) p.set("max", String(filters.maxPrice));
  if (filters.bhk?.length) p.set("bhk", filters.bhk.join(","));
  if (filters.furnishing?.length) p.set("furnishing", filters.furnishing.join(","));
  if (filters.amenities?.length) p.set("amenities", filters.amenities.join(","));
  if (filters.verified) p.set("verified", "1");
  if (filters.sort && filters.sort !== "featured") p.set("sort", filters.sort);
  if (filters.page && filters.page > 1) p.set("page", String(filters.page));
  if (filters.q) p.set("q", filters.q);

  return p;
}

export function countActiveFilters(filters: PropertyFilters): number {
  let n = 0;
  if (filters.localities?.length) n++;
  if (filters.types?.length) n++;
  if (filters.listing) n++;
  if (filters.minPrice || filters.maxPrice) n++;
  if (filters.bhk?.length) n++;
  if (filters.furnishing?.length) n++;
  if (filters.amenities?.length) n++;
  if (filters.verified) n++;
  if (filters.q) n++;
  return n;
}
