"use server";

import { adminClient } from "@/lib/supabase/admin";
import type {
  AdminStats,
  AdminPendingListing,
  AdminListingFull,
  AdminPropertyPage,
  AdminPropertyFilters,
  AdminPropertyRow,
  AdminUserPage,
  AdminUserFilters,
  AdminUser,
  AdminLeadPage,
  AdminLeadFilters,
  AdminLead,
  AuditPage,
  AuditFilters,
  AuditEntry,
  AdminContent,
  AdminTestimonial,
  PropertyStatus,
  Faq,
  ValueProp,
} from "@/types";

export async function getAdminStats(): Promise<AdminStats> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [pendingRes, newLeadsRes, staleRes, unverifiedRes] = await Promise.all([
    adminClient
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    adminClient
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved")
      .lt("updated_at", thirtyDaysAgo),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .or("role.eq.owner,is_owner.eq.true")
      .neq("is_verified", true),
  ]);

  return {
    pendingApprovals: pendingRes.count ?? 0,
    newLeads: newLeadsRes.count ?? 0,
    staleListings: staleRes.count ?? 0,
    unverifiedOwners: unverifiedRes.count ?? 0,
  };
}

export async function getPendingListings(): Promise<AdminPendingListing[]> {
  const { data: props } = await adminClient
    .from("properties")
    .select("id, title, listing_type, property_type, address_area, created_at, locality_id, owner_id")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (!props?.length) return [];

  const localityIds = [...new Set(props.map((p) => p.locality_id).filter(Boolean))] as string[];
  const ownerIds = [...new Set(props.map((p) => p.owner_id))];
  const propIds = props.map((p) => p.id);

  const [localities, contacts, owners, media] = await Promise.all([
    localityIds.length
      ? adminClient.from("localities").select("id, name").in("id", localityIds).then((r) => r.data ?? [])
      : Promise.resolve<{ id: string; name: string }[]>([]),
    adminClient
      .from("property_owner_contact")
      .select("property_id, owner_asking_price")
      .in("property_id", propIds)
      .then((r) => r.data ?? []),
    adminClient
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ownerIds)
      .then((r) => r.data ?? []),
    adminClient
      .from("property_media")
      .select("property_id")
      .in("property_id", propIds)
      .then((r) => r.data ?? []),
  ]);

  const localityMap: Record<string, string> = {};
  for (const l of localities) localityMap[l.id] = l.name;

  const contactMap: Record<string, number> = {};
  for (const c of contacts) contactMap[c.property_id] = Number(c.owner_asking_price);

  const ownerMap: Record<string, { fullName: string | null; email: string | null }> = {};
  for (const o of owners) ownerMap[o.id] = { fullName: o.full_name, email: o.email };

  const photoCountMap: Record<string, number> = {};
  for (const m of media) photoCountMap[m.property_id] = (photoCountMap[m.property_id] ?? 0) + 1;

  return props.map((p) => ({
    id: p.id,
    title: p.title,
    listingType: p.listing_type as "rent" | "sale",
    propertyType: p.property_type as AdminPendingListing["propertyType"],
    addressArea: p.address_area ?? "",
    localityName: p.locality_id ? (localityMap[p.locality_id] ?? null) : null,
    ownerName: ownerMap[p.owner_id]?.fullName ?? null,
    ownerEmail: ownerMap[p.owner_id]?.email ?? null,
    askingPrice: contactMap[p.id] ?? 0,
    photoCount: photoCountMap[p.id] ?? 0,
    createdAt: p.created_at ?? new Date().toISOString(),
  }));
}

export async function getAdminListingFull(id: string): Promise<AdminListingFull | null> {
  const { data: p } = await adminClient.from("properties").select("*").eq("id", id).single();
  if (!p) return null;

  const [contact, media, owner, localityData] = await Promise.all([
    adminClient
      .from("property_owner_contact")
      .select("owner_asking_price, full_address")
      .eq("property_id", id)
      .maybeSingle()
      .then((r) => r.data),
    adminClient
      .from("property_media")
      .select("id, url, is_cover, sort_order")
      .eq("property_id", id)
      .order("sort_order")
      .then((r) => r.data ?? []),
    adminClient
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", p.owner_id)
      .maybeSingle()
      .then((r) => r.data),
    p.locality_id
      ? adminClient
          .from("localities")
          .select("name")
          .eq("id", p.locality_id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
  ]);

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: (p.status ?? "pending") as PropertyStatus,
    listingType: p.listing_type as "rent" | "sale",
    propertyType: p.property_type as AdminListingFull["propertyType"],
    addressArea: p.address_area ?? "",
    localityId: p.locality_id ?? null,
    localityName: localityData?.name ?? null,
    displayPrice: Number(p.display_price ?? 0),
    bhk: p.bhk ?? null,
    bathrooms: p.bathrooms ?? null,
    carpetAreaSqft: p.carpet_area_sqft ?? null,
    builtupAreaSqft: p.builtup_area_sqft ?? null,
    floor: p.floor ?? null,
    totalFloors: p.total_floors ?? null,
    furnishing: (p.furnishing as AdminListingFull["furnishing"]) ?? null,
    ageYears: p.age_years ?? null,
    facing: p.facing ?? null,
    amenities: (p.amenities as string[]) ?? [],
    description: p.description ?? "",
    deposit: p.deposit ? Number(p.deposit) : null,
    maintenance: p.maintenance ? Number(p.maintenance) : null,
    availableFrom: p.available_from ?? null,
    tenantPreference: (p.tenant_preference as string[]) ?? [],
    swiitoScore: p.swiito_score ?? null,
    isVerified: p.is_verified ?? false,
    isFeatured: p.is_featured ?? false,
    rejectionReason: p.rejection_reason ?? null,
    publishedAt: p.published_at ?? null,
    createdAt: p.created_at ?? new Date().toISOString(),
    updatedAt: p.updated_at ?? null,
    viewCount: p.view_count ?? 0,
    enquiryCount: p.enquiry_count ?? 0,
    ownerName: owner?.full_name ?? null,
    ownerEmail: owner?.email ?? null,
    ownerPhone: owner?.phone ?? null,
    ownerAskingPrice: contact?.owner_asking_price ? Number(contact.owner_asking_price) : 0,
    fullAddress: contact?.full_address ?? null,
    media: media.map((m) => ({
      id: m.id,
      url: m.url,
      isCover: m.is_cover ?? false,
      sortOrder: m.sort_order ?? 0,
    })),
  };
}

export async function getAdminProperties(
  filters: AdminPropertyFilters = {}
): Promise<AdminPropertyPage> {
  const { status, listingType, search, stale, page = 1, perPage = 25 } = filters;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let query = adminClient
    .from("properties")
    .select(
      "id, slug, title, status, listing_type, property_type, address_area, locality_id, display_price, view_count, enquiry_count, created_at, owner_id",
      { count: "exact" }
    );

  if (status && status !== "all") query = query.eq("status", status);
  if (listingType && listingType !== "all") query = query.eq("listing_type", listingType);
  if (search) query = query.or(`title.ilike.%${search}%,address_area.ilike.%${search}%`);
  if (stale) query = query.eq("status", "approved").lt("updated_at", thirtyDaysAgo);

  const { data: props, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!props?.length) return { properties: [], total: count ?? 0, page, perPage };

  const localityIds = [...new Set(props.map((p) => p.locality_id).filter(Boolean))] as string[];
  const ownerIds = [...new Set(props.map((p) => p.owner_id))];
  const propIds = props.map((p) => p.id);

  const [localities, owners, contacts] = await Promise.all([
    localityIds.length
      ? adminClient.from("localities").select("id, name").in("id", localityIds).then((r) => r.data ?? [])
      : Promise.resolve<{ id: string; name: string }[]>([]),
    adminClient
      .from("profiles")
      .select("id, full_name")
      .in("id", ownerIds)
      .then((r) => r.data ?? []),
    adminClient
      .from("property_owner_contact")
      .select("property_id, owner_asking_price")
      .in("property_id", propIds)
      .then((r) => r.data ?? []),
  ]);

  const localityMap: Record<string, string> = {};
  for (const l of localities) localityMap[l.id] = l.name;

  const ownerMap: Record<string, string | null> = {};
  for (const o of owners) ownerMap[o.id] = o.full_name;

  const contactMap: Record<string, number> = {};
  for (const c of contacts) contactMap[c.property_id] = Number(c.owner_asking_price);

  const properties: AdminPropertyRow[] = props.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: (p.status ?? "draft") as PropertyStatus,
    listingType: p.listing_type as "rent" | "sale",
    propertyType: p.property_type as AdminPropertyRow["propertyType"],
    addressArea: p.address_area ?? "",
    localityName: p.locality_id ? (localityMap[p.locality_id] ?? null) : null,
    displayPrice: Number(p.display_price ?? 0),
    askingPrice: contactMap[p.id] ?? 0,
    viewCount: p.view_count ?? 0,
    enquiryCount: p.enquiry_count ?? 0,
    createdAt: p.created_at ?? new Date().toISOString(),
    ownerName: ownerMap[p.owner_id] ?? null,
  }));

  return { properties, total: count ?? 0, page, perPage };
}

export async function getAdminUsers(
  filters: AdminUserFilters = {}
): Promise<AdminUserPage> {
  const { role, search, page = 1, perPage = 25 } = filters;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = adminClient
    .from("profiles")
    .select("id, email, full_name, phone, role, is_owner, is_verified, created_at", { count: "exact" });

  if (role && role !== "all") query = query.eq("role", role);
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data: profiles, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!profiles?.length) return { users: [], total: count ?? 0, page, perPage };

  const userIds = profiles.map((u) => u.id);

  const [propertyOwners, leadSeekers] = await Promise.all([
    adminClient
      .from("properties")
      .select("owner_id")
      .in("owner_id", userIds)
      .then((r) => r.data ?? []),
    adminClient
      .from("leads")
      .select("seeker_id")
      .in("seeker_id", userIds)
      .then((r) => r.data ?? []),
  ]);

  const listingCountMap: Record<string, number> = {};
  for (const p of propertyOwners) listingCountMap[p.owner_id] = (listingCountMap[p.owner_id] ?? 0) + 1;

  const leadCountMap: Record<string, number> = {};
  for (const l of leadSeekers) {
    if (l.seeker_id) leadCountMap[l.seeker_id] = (leadCountMap[l.seeker_id] ?? 0) + 1;
  }

  const users: AdminUser[] = profiles.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    phone: u.phone,
    role: u.role as AdminUser["role"],
    isOwner: u.is_owner ?? false,
    isVerified: u.is_verified ?? false,
    listingCount: listingCountMap[u.id] ?? 0,
    leadCount: leadCountMap[u.id] ?? 0,
    createdAt: u.created_at ?? new Date().toISOString(),
  }));

  return { users, total: count ?? 0, page, perPage };
}

export async function getAdminUserDetail(
  id: string
): Promise<{ user: AdminUser; listings: AdminPropertyRow[]; leads: AdminLead[] } | null> {
  const { data: u } = await adminClient.from("profiles").select("*").eq("id", id).single();
  if (!u) return null;

  const [propsData, leadsData] = await Promise.all([
    adminClient
      .from("properties")
      .select("id, slug, title, status, listing_type, property_type, address_area, display_price, view_count, enquiry_count, created_at, locality_id")
      .eq("owner_id", id)
      .order("created_at", { ascending: false })
      .then((r) => r.data ?? []),
    adminClient
      .from("leads")
      .select("id, property_id, status, source, notes, created_at, updated_at")
      .eq("seeker_id", id)
      .order("created_at", { ascending: false })
      .then((r) => r.data ?? []),
  ]);

  const propIds = leadsData.map((l) => l.property_id);
  const leadProps = propIds.length
    ? await adminClient
        .from("properties")
        .select("id, title, slug")
        .in("id", propIds)
        .then((r) => r.data ?? [])
    : [];

  const leadPropMap: Record<string, { title: string; slug: string }> = {};
  for (const p of leadProps) leadPropMap[p.id] = { title: p.title, slug: p.slug };

  const user: AdminUser = {
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    phone: u.phone,
    role: u.role as AdminUser["role"],
    isOwner: u.is_owner ?? false,
    isVerified: u.is_verified ?? false,
    listingCount: propsData.length,
    leadCount: leadsData.length,
    createdAt: u.created_at ?? new Date().toISOString(),
  };

  const listings: AdminPropertyRow[] = propsData.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: (p.status ?? "draft") as PropertyStatus,
    listingType: p.listing_type as "rent" | "sale",
    propertyType: p.property_type as AdminPropertyRow["propertyType"],
    addressArea: p.address_area ?? "",
    localityName: null,
    displayPrice: Number(p.display_price ?? 0),
    askingPrice: 0,
    viewCount: p.view_count ?? 0,
    enquiryCount: p.enquiry_count ?? 0,
    createdAt: p.created_at ?? new Date().toISOString(),
    ownerName: u.full_name,
  }));

  const leads: AdminLead[] = leadsData.map((l) => ({
    id: l.id,
    propertyId: l.property_id,
    propertyTitle: leadPropMap[l.property_id]?.title ?? l.property_id,
    propertySlug: leadPropMap[l.property_id]?.slug ?? l.property_id,
    seekerName: u.full_name,
    seekerPhone: u.phone,
    seekerEmail: u.email,
    source: l.source ?? null,
    status: l.status as AdminLead["status"],
    notes: l.notes ?? null,
    createdAt: l.created_at ?? new Date().toISOString(),
    updatedAt: l.updated_at ?? null,
  }));

  return { user, listings, leads };
}

export async function getAdminLeads(
  filters: AdminLeadFilters = {}
): Promise<AdminLeadPage> {
  const { status, search, page = 1, perPage = 25 } = filters;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = adminClient
    .from("leads")
    .select(
      "id, property_id, seeker_id, name, phone, source, status, notes, created_at, updated_at",
      { count: "exact" }
    );

  if (status && status !== "all") query = query.eq("status", status);

  const { data: leadsData, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!leadsData?.length) return { leads: [], total: count ?? 0, page, perPage };

  const propertyIds = [...new Set(leadsData.map((l) => l.property_id))];
  const seekerIds = [...new Set(leadsData.map((l) => l.seeker_id).filter(Boolean))] as string[];

  const [propDataArr, seekerDataArr] = await Promise.all([
    adminClient
      .from("properties")
      .select("id, title, slug")
      .in("id", propertyIds)
      .then((r) => r.data ?? []),
    seekerIds.length
      ? adminClient
          .from("profiles")
          .select("id, full_name, phone, email")
          .in("id", seekerIds)
          .then((r) => r.data ?? [])
      : Promise.resolve<{ id: string; full_name: string | null; phone: string | null; email: string | null }[]>([]),
  ]);

  const propMap: Record<string, { title: string; slug: string }> = {};
  for (const p of propDataArr) propMap[p.id] = { title: p.title, slug: p.slug };

  const seekerMap: Record<string, { fullName: string | null; phone: string | null; email: string | null }> = {};
  for (const s of seekerDataArr) seekerMap[s.id] = { fullName: s.full_name, phone: s.phone, email: s.email };

  const leads: AdminLead[] = leadsData
    .filter((l) => !search || propMap[l.property_id]?.title.toLowerCase().includes(search.toLowerCase()) || (l.name ?? "").toLowerCase().includes(search.toLowerCase()))
    .map((l) => ({
      id: l.id,
      propertyId: l.property_id,
      propertyTitle: propMap[l.property_id]?.title ?? l.property_id,
      propertySlug: propMap[l.property_id]?.slug ?? l.property_id,
      seekerName: l.seeker_id ? (seekerMap[l.seeker_id]?.fullName ?? null) : (l.name ?? null),
      seekerPhone: l.seeker_id ? (seekerMap[l.seeker_id]?.phone ?? null) : (l.phone ?? null),
      seekerEmail: l.seeker_id ? (seekerMap[l.seeker_id]?.email ?? null) : null,
      source: l.source ?? null,
      status: l.status as AdminLead["status"],
      notes: l.notes ?? null,
      createdAt: l.created_at ?? new Date().toISOString(),
      updatedAt: l.updated_at ?? null,
    }));

  return { leads, total: count ?? 0, page, perPage };
}

export async function getAdminContent(): Promise<AdminContent> {
  const [faqsData, valuePropData, testimonialsData] = await Promise.all([
    adminClient.from("faqs").select("*").order("sort_order").then((r) => r.data ?? []),
    adminClient.from("value_props").select("*").order("sort_order").then((r) => r.data ?? []),
    adminClient.from("testimonials").select("*").order("sort_order").then((r) => r.data ?? []),
  ]);

  const faqs: Faq[] = faqsData.map((f) => ({
    id: f.id,
    category: f.category,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sort_order ?? 0,
  }));

  const valueProps: ValueProp[] = valuePropData.map((v) => ({
    id: v.id,
    icon: v.icon,
    title: v.title,
    body: v.body,
    sortOrder: v.sort_order ?? 0,
  }));

  const testimonials: AdminTestimonial[] = testimonialsData.map((t) => ({
    id: t.id,
    authorName: t.author_name,
    locality: t.locality ?? null,
    rating: t.rating ?? null,
    body: t.body,
    avatarUrl: t.avatar_url ?? null,
    isActive: t.is_active ?? false,
    sortOrder: t.sort_order ?? null,
  }));

  return { faqs, valueProps, testimonials };
}

export async function getAdminAmenities() {
  const { data } = await adminClient
    .from("amenities")
    .select("id, name, icon, sort_order")
    .order("sort_order");
  return (data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon ?? null,
    sortOrder: a.sort_order ?? 0,
  }));
}

export async function getAdminSettings(): Promise<Record<string, string>> {
  const { data } = await adminClient.from("settings").select("key, value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
}

export async function getAuditLog(filters: AuditFilters = {}): Promise<AuditPage> {
  const { tableName, action, page = 1, perPage = 50 } = filters;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = adminClient
    .from("audit_log")
    .select("id, actor_id, action, table_name, record_id, old_data, new_data, created_at", {
      count: "exact",
    });

  if (tableName) query = query.eq("table_name", tableName);
  if (action) query = query.eq("action", action);

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const entries: AuditEntry[] = (data ?? []).map((e) => ({
    id: e.id,
    actorId: e.actor_id ?? null,
    action: e.action,
    tableName: e.table_name,
    recordId: e.record_id,
    oldData: (e.old_data as Record<string, unknown>) ?? null,
    newData: (e.new_data as Record<string, unknown>) ?? null,
    createdAt: e.created_at ?? new Date().toISOString(),
  }));

  return { entries, total: count ?? 0, page, perPage };
}
