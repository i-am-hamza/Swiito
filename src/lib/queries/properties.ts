import { createClient } from "@/lib/supabase/server";
import type {
  Property,
  PropertyDetail,
  Locality,
  ValueProp,
  Faq,
  Testimonial,
  PropertyFilters,
  PropertyPage,
  LocalityDetail,
  PriceContext,
  MapPin,
} from "@/types";
import type { Tables } from "@/types/database";

type PublicRow = NonNullable<Tables<"properties_public">>;
type MediaRow = Tables<"property_media">;

function mapProperty(
  row: PublicRow,
  media: MediaRow[],
  localitySlug: string
): Property {
  return {
    id: row.id ?? "",
    slug: row.slug ?? "",
    title: row.title ?? "",
    listingType: (row.listing_type ?? "rent") as Property["listingType"],
    propertyType: (row.property_type ?? "flat") as Property["propertyType"],
    bhk: row.bhk ?? null,
    bathrooms: row.bathrooms ?? null,
    carpetAreaSqft: row.carpet_area_sqft ?? null,
    builtupAreaSqft: row.builtup_area_sqft ?? null,
    floor: row.floor ?? null,
    totalFloors: row.total_floors ?? null,
    furnishing: (row.furnishing ?? null) as Property["furnishing"],
    facing: row.facing ?? null,
    ageYears: row.age_years ?? null,
    displayPrice: Number(row.display_price ?? 0),
    deposit: row.deposit ? Number(row.deposit) : null,
    maintenance: row.maintenance ? Number(row.maintenance) : null,
    availableFrom: row.available_from ?? null,
    tenantPreference: (row.tenant_preference as string[]) ?? [],
    amenities: (row.amenities as string[]) ?? [],
    description: row.description ?? "",
    localitySlug,
    addressArea: row.address_area ?? "",
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    isVerified: row.is_verified ?? false,
    swiitoScore: (row.swiito_score as Property["swiitoScore"]) ?? null,
    isFeatured: row.is_featured ?? false,
    viewCount: row.view_count ?? 0,
    publishedAt: row.published_at ?? new Date().toISOString(),
    media: media
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((m) => ({
        url: m.url,
        isCover: m.is_cover ?? false,
        sortOrder: m.sort_order ?? 0,
      })),
  };
}

async function fetchPropertiesWithMedia(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: PublicRow[]
): Promise<Property[]> {
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id).filter(Boolean) as string[];

  const [{ data: media }, { data: localities }] = await Promise.all([
    supabase
      .from("property_media")
      .select("property_id, url, is_cover, sort_order")
      .in("property_id", ids),
    supabase.from("localities").select("id, slug"),
  ]);

  const mediaMap: Record<string, MediaRow[]> = {};
  for (const m of media ?? []) {
    (mediaMap[m.property_id] ??= []).push(m as MediaRow);
  }

  const localityMap = Object.fromEntries(
    (localities ?? []).map((l) => [l.id, l.slug])
  );

  return rows.map((row) =>
    mapProperty(
      row,
      mediaMap[row.id ?? ""] ?? [],
      localityMap[row.locality_id ?? ""] ?? ""
    )
  );
}

export async function getFeaturedProperties(limit: number): Promise<Property[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties_public")
    .select("*")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  return fetchPropertiesWithMedia(supabase, (data ?? []) as PublicRow[]);
}

export async function getRecentProperties(limit: number): Promise<Property[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties_public")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  return fetchPropertiesWithMedia(supabase, (data ?? []) as PublicRow[]);
}

export async function getLocalities(): Promise<Locality[]> {
  const supabase = await createClient();

  const [{ data: locs }, { data: counts }] = await Promise.all([
    supabase
      .from("localities")
      .select("id, name, slug, description, image_url, lat, lng")
      .order("sort_order"),
    supabase.from("properties_public").select("locality_id"),
  ]);

  if (!locs?.length) return [];

  const countMap: Record<string, number> = {};
  for (const p of counts ?? []) {
    if (p.locality_id) countMap[p.locality_id] = (countMap[p.locality_id] ?? 0) + 1;
  }

  return locs.map((l) => ({
    slug: l.slug,
    name: l.name,
    description: l.description ?? "",
    listingCount: countMap[l.id] ?? 0,
    imageUrl: l.image_url ?? "",
    lat: l.lat ?? 0,
    lng: l.lng ?? 0,
  }));
}

export async function getValueProps(): Promise<ValueProp[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("value_props")
    .select("*")
    .order("sort_order");

  return (data ?? []).map((vp) => ({
    id: vp.id,
    icon: vp.icon,
    title: vp.title,
    body: vp.body,
    sortOrder: vp.sort_order ?? 0,
  }));
}

export async function getFaqs(limit: number): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order")
    .limit(limit);

  return (data ?? []).map((f) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sort_order ?? 0,
  }));
}

export async function getFaqsAll(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order");

  return (data ?? []).map((f) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sort_order ?? 0,
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (data ?? []).map((t) => ({
    id: t.id,
    authorName: t.author_name,
    locality: t.locality ?? "",
    rating: (t.rating ?? 5) as Testimonial["rating"],
    body: t.body,
    avatarUrl: t.avatar_url ?? "",
  }));
}

export async function getAmenities(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("amenities")
    .select("id, name")
    .order("sort_order");
  return (data ?? []).map((a) => ({ id: a.id, name: a.name }));
}

// ── Browse / filter queries ───────────────────────────────────────────────────

async function resolveLocalityIds(
  slugs: string[],
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string[]> {
  const { data } = await supabase
    .from("localities")
    .select("id")
    .in("slug", slugs);
  return (data ?? []).map((l) => l.id);
}

// Chainable PostgREST builder shape — method syntax uses TypeScript's bivariant
// parameter checking, so concrete PostgrestFilterBuilder satisfies this.
type QB<T> = {
  in(col: string, vals: readonly unknown[]): T;
  eq(col: string, val: unknown): T;
  gte(col: string, val: unknown): T;
  lte(col: string, val: unknown): T;
  or(filter: string): T;
  contains(col: string, vals: readonly unknown[]): T;
  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }): T;
  limit(count: number): T;
  range(from: number, to: number): T;
};

function applyFilters<T extends QB<T>>(
  q: T,
  filters: PropertyFilters,
  localityIds?: string[]
): T {
  if (localityIds?.length) q = q.in("locality_id", localityIds);
  if (filters.types?.length) q = q.in("property_type", filters.types);
  if (filters.listing) q = q.eq("listing_type", filters.listing);
  if (filters.minPrice !== undefined) q = q.gte("display_price", filters.minPrice);
  if (filters.maxPrice !== undefined) q = q.lte("display_price", filters.maxPrice);
  if (filters.bhk?.length) {
    const exact = filters.bhk.filter((b) => b < 4);
    const plus = filters.bhk.includes(4);
    if (exact.length && !plus) {
      q = q.in("bhk", exact);
    } else if (!exact.length && plus) {
      q = q.gte("bhk", 4);
    } else if (exact.length && plus) {
      q = q.or(`bhk.in.(${exact.join(",")}),bhk.gte.4`);
    }
  }
  if (filters.furnishing?.length) q = q.in("furnishing", filters.furnishing);
  if (filters.amenities?.length) q = q.contains("amenities", filters.amenities);
  if (filters.verified) q = q.eq("is_verified", true);
  if (filters.q) {
    const safe = filters.q.replace(/[%_\\]/g, "\\$&");
    q = q.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  return q;
}

function applySort<T extends QB<T>>(q: T, sort: PropertyFilters["sort"]): T {
  switch (sort) {
    case "newest":
      return q.order("published_at", { ascending: false });
    case "price_asc":
      return q.order("display_price", { ascending: true });
    case "price_desc":
      return q.order("display_price", { ascending: false });
    case "score":
      return q
        .order("swiito_score", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false });
    default:
      return q
        .order("is_featured", { ascending: false })
        .order("published_at", { ascending: false });
  }
}

export async function getPropertiesPage(
  filters: PropertyFilters
): Promise<PropertyPage> {
  const supabase = await createClient();
  const perPage = filters.perPage ?? 12;
  const page = filters.page ?? 1;

  let localityIds: string[] | undefined;
  if (filters.localities?.length) {
    localityIds = await resolveLocalityIds(filters.localities, supabase);
    if (!localityIds.length) {
      return { properties: [], total: 0, page, perPage, totalPages: 0 };
    }
  }

  // eslint-disable-next-line prefer-const
  let q = supabase.from("properties_public").select("*", { count: "exact" });
  let filtered = applyFilters(q, filters, localityIds);
  filtered = applySort(filtered, filters.sort);
  filtered = filtered.range((page - 1) * perPage, page * perPage - 1) as typeof filtered;

  const { data, count } = await filtered;
  const total = count ?? 0;
  const properties = await fetchPropertiesWithMedia(supabase, (data ?? []) as PublicRow[]);

  return { properties, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getPropertyMapPins(
  filters: PropertyFilters
): Promise<MapPin[]> {
  const supabase = await createClient();

  let localityIds: string[] | undefined;
  if (filters.localities?.length) {
    localityIds = await resolveLocalityIds(filters.localities, supabase);
    if (!localityIds.length) return [];
  }

  // eslint-disable-next-line prefer-const
  let q = supabase
    .from("properties_public")
    .select("id, slug, title, display_price, listing_type, lat, lng, bhk, property_type");
  let filtered = applyFilters(q, filters, localityIds);
  filtered = filtered.limit(200) as typeof filtered;

  const { data } = await filtered;
  if (!data?.length) return [];

  const ids = data.map((p) => p.id).filter(Boolean) as string[];
  const { data: covers } = await supabase
    .from("property_media")
    .select("property_id, url")
    .in("property_id", ids)
    .eq("is_cover", true)
    .limit(200);

  const coverMap: Record<string, string> = {};
  for (const m of covers ?? []) {
    if (!coverMap[m.property_id]) coverMap[m.property_id] = m.url;
  }

  return data
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      id: p.id!,
      slug: p.slug!,
      title: p.title ?? "",
      displayPrice: Number(p.display_price ?? 0),
      listingType: (p.listing_type ?? "rent") as "rent" | "sale",
      // Round to 3 decimal places (~110 m precision) — never expose exact building coords
      lat: Math.round((p.lat ?? 0) * 1000) / 1000,
      lng: Math.round((p.lng ?? 0) * 1000) / 1000,
      coverUrl: coverMap[p.id!] ?? null,
      bhk: p.bhk ?? null,
      propertyType: (p.property_type ?? "flat") as Property["propertyType"],
    }));
}

export async function getLocalityBySlug(slug: string): Promise<LocalityDetail | null> {
  const supabase = await createClient();

  const { data: loc } = await supabase
    .from("localities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!loc) return null;

  const [{ count }, { data: faqs }] = await Promise.all([
    supabase
      .from("properties_public")
      .select("*", { count: "exact", head: true })
      .eq("locality_id", loc.id),
    supabase
      .from("faqs")
      .select("*")
      .eq("category", slug)
      .order("sort_order"),
  ]);

  return {
    id: loc.id,
    slug: loc.slug,
    name: loc.name,
    description: loc.description ?? "",
    listingCount: count ?? 0,
    imageUrl: loc.image_url ?? "",
    lat: loc.lat ?? 0,
    lng: loc.lng ?? 0,
    metaTitle: loc.meta_title ?? null,
    metaDescription: loc.meta_description ?? null,
    faqs: (faqs ?? []).map((f) => ({
      id: f.id,
      category: f.category,
      question: f.question,
      answer: f.answer,
      sortOrder: f.sort_order ?? 0,
    })),
  };
}

export async function getLocalityProperties(
  localitySlug: string,
  limit = 12
): Promise<Property[]> {
  const supabase = await createClient();

  const { data: loc } = await supabase
    .from("localities")
    .select("id")
    .eq("slug", localitySlug)
    .single();

  if (!loc) return [];

  const { data } = await supabase
    .from("properties_public")
    .select("*")
    .eq("locality_id", loc.id)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  return fetchPropertiesWithMedia(supabase, (data ?? []) as PublicRow[]);
}

export async function getNearbyLocalities(
  localityId: string,
  limit = 4
): Promise<Locality[]> {
  const supabase = await createClient();

  const { data: locs } = await supabase
    .from("localities")
    .select("id, name, slug, description, image_url, lat, lng")
    .neq("id", localityId)
    .order("sort_order")
    .limit(limit);

  if (!locs?.length) return [];

  const ids = locs.map((l) => l.id);
  const { data: counts } = await supabase
    .from("properties_public")
    .select("locality_id")
    .in("locality_id", ids);

  const countMap: Record<string, number> = {};
  for (const p of counts ?? []) {
    if (p.locality_id) countMap[p.locality_id] = (countMap[p.locality_id] ?? 0) + 1;
  }

  return locs.map((l) => ({
    slug: l.slug,
    name: l.name,
    description: l.description ?? "",
    listingCount: countMap[l.id] ?? 0,
    imageUrl: l.image_url ?? "",
    lat: l.lat ?? 0,
    lng: l.lng ?? 0,
  }));
}

export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties_public")
    .select("*")
    .in("id", ids);
  return fetchPropertiesWithMedia(supabase, (data ?? []) as PublicRow[]);
}

export async function getPropertyDetail(slug: string): Promise<PropertyDetail | null> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("properties_public")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!row || !row.id) return null;

  const [{ data: media }, localityResult] = await Promise.all([
    supabase
      .from("property_media")
      .select("id, property_id, url, is_cover, sort_order, blurhash, height, width, kind")
      .eq("property_id", row.id)
      .order("sort_order"),
    row.locality_id
      ? supabase.from("localities").select("id, name, slug").eq("id", row.locality_id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const loc = localityResult.data;
  const localitySlug = loc?.slug ?? "";
  const localityName = loc?.name ?? "";
  const localityId = loc?.id ?? "";

  const base = mapProperty(row as PublicRow, (media ?? []) as MediaRow[], localitySlug);
  return { ...base, localityName, localityId };
}

export async function getSimilarProperties(
  excludeId: string,
  localityId: string,
  limit = 4
): Promise<Property[]> {
  if (!localityId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties_public")
    .select("*")
    .eq("locality_id", localityId)
    .neq("id", excludeId)
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  return fetchPropertiesWithMedia(supabase, (data ?? []) as PublicRow[]);
}

export async function getLocalityOptions(): Promise<{ id: string; name: string; slug: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("localities")
    .select("id, name, slug")
    .order("sort_order");
  return (data ?? []).map((l) => ({ id: l.id, name: l.name, slug: l.slug }));
}

export async function getAreaPriceContext(localityId: string): Promise<PriceContext> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("properties_public")
    .select("listing_type, display_price")
    .eq("locality_id", localityId);

  if (!data?.length) return { rentMin: null, rentAvg: null, saleMin: null, saleAvg: null };

  const rents = data
    .filter((p) => p.listing_type === "rent")
    .map((p) => Number(p.display_price));
  const sales = data
    .filter((p) => p.listing_type === "sale")
    .map((p) => Number(p.display_price));

  return {
    rentMin: rents.length ? Math.min(...rents) : null,
    rentAvg: rents.length ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : null,
    saleMin: sales.length ? Math.min(...sales) : null,
    saleAvg: sales.length ? Math.round(sales.reduce((a, b) => a + b, 0) / sales.length) : null,
  };
}
