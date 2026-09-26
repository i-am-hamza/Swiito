"use server";

import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { OwnerListing, OwnerListingFull, OwnerStats } from "@/types";

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getOwnerListings(): Promise<OwnerListing[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data: props } = await adminClient
    .from("properties")
    .select(
      "id, slug, title, status, listing_type, property_type, address_area, locality_id, display_price, view_count, enquiry_count, rejection_reason, created_at, updated_at"
    )
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (!props?.length) return [];

  const ids = props.map((p) => p.id);
  const { data: covers } = await adminClient
    .from("property_media")
    .select("property_id, url")
    .in("property_id", ids)
    .eq("is_cover", true);

  const coverMap: Record<string, string> = {};
  for (const m of covers ?? []) {
    if (!coverMap[m.property_id]) coverMap[m.property_id] = m.url;
  }

  return props.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: (p.status ?? "draft") as OwnerListing["status"],
    listingType: (p.listing_type ?? "rent") as "rent" | "sale",
    propertyType: (p.property_type ?? "flat") as OwnerListing["propertyType"],
    addressArea: p.address_area ?? "",
    localityId: p.locality_id ?? null,
    displayPrice: Number(p.display_price ?? 0),
    viewCount: p.view_count ?? 0,
    enquiryCount: p.enquiry_count ?? 0,
    rejectionReason: p.rejection_reason ?? null,
    createdAt: p.created_at ?? new Date().toISOString(),
    updatedAt: p.updated_at ?? null,
    coverUrl: coverMap[p.id] ?? null,
  }));
}

export async function getOwnerStats(): Promise<OwnerStats> {
  const userId = await getCurrentUserId();
  if (!userId) return { total: 0, live: 0, pending: 0, totalViews: 0, totalEnquiries: 0 };

  const { data } = await adminClient
    .from("properties")
    .select("status, view_count, enquiry_count")
    .eq("owner_id", userId);

  if (!data?.length) return { total: 0, live: 0, pending: 0, totalViews: 0, totalEnquiries: 0 };

  return {
    total: data.length,
    live: data.filter((p) => p.status === "approved").length,
    pending: data.filter((p) => p.status === "pending").length,
    totalViews: data.reduce((sum, p) => sum + (p.view_count ?? 0), 0),
    totalEnquiries: data.reduce((sum, p) => sum + (p.enquiry_count ?? 0), 0),
  };
}

export async function getOwnerListingFull(id: string): Promise<OwnerListingFull | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data: p } = await adminClient
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (!p) return null;

  const [{ data: contact }, { data: media }] = await Promise.all([
    adminClient
      .from("property_owner_contact")
      .select("owner_asking_price, full_address")
      .eq("property_id", id)
      .maybeSingle(),
    adminClient
      .from("property_media")
      .select("id, url, is_cover, sort_order")
      .eq("property_id", id)
      .order("sort_order"),
  ]);

  const { data: coverRow } = await adminClient
    .from("property_media")
    .select("url")
    .eq("property_id", id)
    .eq("is_cover", true)
    .maybeSingle();

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: (p.status ?? "draft") as OwnerListing["status"],
    listingType: (p.listing_type ?? "rent") as "rent" | "sale",
    propertyType: (p.property_type ?? "flat") as OwnerListing["propertyType"],
    addressArea: p.address_area ?? "",
    localityId: p.locality_id ?? null,
    displayPrice: Number(p.display_price ?? 0),
    viewCount: p.view_count ?? 0,
    enquiryCount: p.enquiry_count ?? 0,
    rejectionReason: p.rejection_reason ?? null,
    createdAt: p.created_at ?? new Date().toISOString(),
    updatedAt: p.updated_at ?? null,
    coverUrl: coverRow?.url ?? null,
    bhk: p.bhk ?? null,
    bathrooms: p.bathrooms ?? null,
    carpetAreaSqft: p.carpet_area_sqft ?? null,
    builtupAreaSqft: p.builtup_area_sqft ?? null,
    floor: p.floor ?? null,
    totalFloors: p.total_floors ?? null,
    furnishing: (p.furnishing as OwnerListingFull["furnishing"]) ?? null,
    ageYears: p.age_years ?? null,
    facing: p.facing ?? null,
    amenities: (p.amenities as string[]) ?? [],
    description: p.description ?? "",
    deposit: p.deposit ? Number(p.deposit) : null,
    maintenance: p.maintenance ? Number(p.maintenance) : null,
    availableFrom: p.available_from ?? null,
    tenantPreference: (p.tenant_preference as string[]) ?? [],
    askingPrice: contact?.owner_asking_price ? Number(contact.owner_asking_price) : 0,
    fullAddress: contact?.full_address ?? "",
    media: (media ?? []).map((m) => ({
      id: m.id,
      url: m.url,
      isCover: m.is_cover ?? false,
      sortOrder: m.sort_order ?? 0,
    })),
  };
}
