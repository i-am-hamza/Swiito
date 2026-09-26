"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type PropInsert = Database["public"]["Tables"]["properties"]["Insert"];
type PropUpdate = Database["public"]["Tables"]["properties"]["Update"];

const RANCHI_WKT = "SRID=4326;POINT(85.3096 23.3441)";

async function requireOwner(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  return { userId: user.id };
}

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeTitle(data: {
  listingType?: string | null;
  propertyType?: string | null;
  bhk?: number | null;
  furnishing?: string | null;
  localityName?: string | null;
}): string {
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
  const furnishLabel: Record<string, string> = {
    unfurnished: "Unfurnished",
    semi_furnished: "Semi-Furnished",
    fully_furnished: "Fully Furnished",
  };
  const bhkPart = data.bhk ? `${data.bhk} BHK ` : "";
  const furnPart = data.furnishing ? `${furnishLabel[data.furnishing] ?? ""} ` : "";
  const typePart = typeLabel[data.propertyType ?? ""] ?? "Property";
  const forPart = data.listingType === "sale" ? "Sale" : "Rent";
  const localityPart = data.localityName ? ` in ${data.localityName}` : " in Ranchi";
  return `${bhkPart}${furnPart}${typePart} for ${forPart}${localityPart}`;
}

const draftSchema = z.object({
  listingType: z.enum(["rent", "sale"]).optional(),
  propertyType: z
    .enum(["flat", "independent_house", "room", "pg", "hostel", "shop", "office", "plot"])
    .optional(),
  localityId: z.string().uuid().optional(),
  addressArea: z.string().max(200).optional(),
  bhk: z.number().int().min(1).max(10).nullable().optional(),
  bathrooms: z.number().int().min(1).max(10).nullable().optional(),
  carpetAreaSqft: z.number().int().min(1).nullable().optional(),
  builtupAreaSqft: z.number().int().min(1).nullable().optional(),
  floor: z.number().int().min(0).nullable().optional(),
  totalFloors: z.number().int().min(1).nullable().optional(),
  furnishing: z.enum(["unfurnished", "semi_furnished", "fully_furnished"]).nullable().optional(),
  ageYears: z.number().int().min(0).max(300).nullable().optional(),
  facing: z.string().max(50).nullable().optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().max(3000).optional(),
  askingPrice: z.number().int().min(1).nullable().optional(),
  deposit: z.number().int().min(0).nullable().optional(),
  maintenance: z.number().int().min(0).nullable().optional(),
  availableFrom: z.string().nullable().optional(),
  tenantPreference: z.array(z.string()).optional(),
  fullAddress: z.string().max(500).optional(),
});

type DraftPayload = z.infer<typeof draftSchema>;

export async function saveDraftAction(
  propertyId: string | null,
  data: DraftPayload
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const parsed = draftSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const d = parsed.data;

  let localityName: string | null = null;
  let locationWkt: string = RANCHI_WKT;
  if (d.localityId) {
    const { data: loc } = await adminClient
      .from("localities")
      .select("name, lat, lng")
      .eq("id", d.localityId)
      .single();
    if (loc) {
      localityName = loc.name;
      if (loc.lat != null && loc.lng != null) {
        locationWkt = `SRID=4326;POINT(${loc.lng} ${loc.lat})`;
      }
    }
  }

  const title = makeTitle({
    listingType: d.listingType,
    propertyType: d.propertyType,
    bhk: d.bhk,
    furnishing: d.furnishing,
    localityName,
  });

  let finalId = propertyId;

  if (!propertyId) {
    const slug = makeSlug(title);
    const insert: PropInsert = {
      owner_id: userId,
      title,
      slug,
      status: "draft",
      listing_type: d.listingType ?? "rent",
      property_type: d.propertyType ?? "flat",
      locality_id: d.localityId ?? null,
      address_area: d.addressArea ?? "",
      display_price: 0,
      location: locationWkt as unknown,
      bhk: d.bhk ?? null,
      bathrooms: d.bathrooms ?? null,
      carpet_area_sqft: d.carpetAreaSqft ?? null,
      builtup_area_sqft: d.builtupAreaSqft ?? null,
      floor: d.floor ?? null,
      total_floors: d.totalFloors ?? null,
      furnishing: d.furnishing ?? null,
      age_years: d.ageYears ?? null,
      facing: d.facing ?? null,
      amenities: d.amenities ?? [],
      description: d.description ?? "",
      deposit: d.deposit ?? null,
      maintenance: d.maintenance ?? null,
      available_from: d.availableFrom ?? null,
      tenant_preference: d.tenantPreference ?? [],
    };

    const { data: inserted, error } = await adminClient
      .from("properties")
      .insert(insert)
      .select("id")
      .single();

    if (error || !inserted) {
      return { ok: false, error: "Failed to create draft" };
    }
    finalId = inserted.id;
  } else {
    const { data: existing } = await adminClient
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("owner_id", userId)
      .single();

    if (!existing) return { ok: false, error: "Listing not found" };

    const update: PropUpdate = {
      title,
      updated_at: new Date().toISOString(),
      ...(d.listingType !== undefined && { listing_type: d.listingType }),
      ...(d.propertyType !== undefined && { property_type: d.propertyType }),
      ...(d.localityId !== undefined && { locality_id: d.localityId, location: locationWkt as unknown }),
      ...(d.addressArea !== undefined && { address_area: d.addressArea }),
      ...(d.bhk !== undefined && { bhk: d.bhk }),
      ...(d.bathrooms !== undefined && { bathrooms: d.bathrooms }),
      ...(d.carpetAreaSqft !== undefined && { carpet_area_sqft: d.carpetAreaSqft }),
      ...(d.builtupAreaSqft !== undefined && { builtup_area_sqft: d.builtupAreaSqft }),
      ...(d.floor !== undefined && { floor: d.floor }),
      ...(d.totalFloors !== undefined && { total_floors: d.totalFloors }),
      ...(d.furnishing !== undefined && { furnishing: d.furnishing }),
      ...(d.ageYears !== undefined && { age_years: d.ageYears }),
      ...(d.facing !== undefined && { facing: d.facing }),
      ...(d.amenities !== undefined && { amenities: d.amenities }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.deposit !== undefined && { deposit: d.deposit }),
      ...(d.maintenance !== undefined && { maintenance: d.maintenance }),
      ...(d.availableFrom !== undefined && { available_from: d.availableFrom }),
      ...(d.tenantPreference !== undefined && { tenant_preference: d.tenantPreference }),
    };

    const { error } = await adminClient
      .from("properties")
      .update(update)
      .eq("id", propertyId)
      .eq("owner_id", userId);

    if (error) return { ok: false, error: "Failed to save draft" };
  }

  if (finalId && (d.askingPrice !== undefined || d.fullAddress !== undefined)) {
    await adminClient.from("property_owner_contact").upsert(
      {
        property_id: finalId,
        owner_asking_price: d.askingPrice ?? 0,
        ...(d.fullAddress !== undefined && { full_address: d.fullAddress }),
      },
      { onConflict: "property_id" }
    );
  }

  revalidatePath("/owner/dashboard");
  return { ok: true, id: finalId ?? undefined };
}

export async function submitListingAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  // Limit concurrent pending listings per owner to prevent queue flooding
  const { count: pendingCount } = await adminClient
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId)
    .eq("status", "pending");

  if ((pendingCount ?? 0) >= 5) {
    return {
      ok: false,
      error: "You already have 5 listings awaiting review. Please wait before submitting more.",
    };
  }

  const { data: prop } = await adminClient
    .from("properties")
    .select("id, status, locality_id, listing_type, property_type, description, address_area")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (!prop) return { ok: false, error: "Listing not found" };
  if (prop.status !== "draft" && prop.status !== "rejected") {
    return { ok: false, error: "Only draft or rejected listings can be submitted" };
  }
  if (!prop.locality_id) return { ok: false, error: "Please select a locality" };
  if (!prop.description || prop.description.length < 30) {
    return { ok: false, error: "Description must be at least 30 characters" };
  }
  if (!prop.address_area) return { ok: false, error: "Please enter the address area" };

  const { data: contact } = await adminClient
    .from("property_owner_contact")
    .select("owner_asking_price, full_address")
    .eq("property_id", id)
    .maybeSingle();

  if (!contact || !contact.owner_asking_price || Number(contact.owner_asking_price) <= 0) {
    return { ok: false, error: "Please enter your asking price" };
  }
  if (!contact.full_address) {
    return { ok: false, error: "Please enter the full property address" };
  }

  const { count } = await adminClient
    .from("property_media")
    .select("*", { count: "exact", head: true })
    .eq("property_id", id);

  if (!count || count < 5) {
    return { ok: false, error: "Please upload at least 5 photos before submitting" };
  }

  const { error } = await adminClient
    .from("properties")
    .update({ status: "pending", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) return { ok: false, error: "Failed to submit listing" };

  await adminClient
    .from("profiles")
    .update({ is_owner: true, role: "owner" })
    .eq("id", userId);

  revalidatePath("/owner/dashboard");
  return { ok: true };
}

export async function updateListingAction(
  id: string,
  data: DraftPayload
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const { data: existing } = await adminClient
    .from("properties")
    .select("id, status")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (!existing) return { ok: false, error: "Listing not found" };

  const result = await saveDraftAction(id, data);
  if (!result.ok) return result;

  if (existing.status === "approved") {
    await adminClient
      .from("properties")
      .update({ status: "pending", published_at: null, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("owner_id", userId);
  }

  revalidatePath("/owner/dashboard");
  revalidatePath(`/owner/edit/${id}`);
  return { ok: true };
}

export async function deleteListingAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const { data: prop } = await adminClient
    .from("properties")
    .select("id, status")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (!prop) return { ok: false, error: "Listing not found" };
  if (prop.status !== "draft") {
    return { ok: false, error: "Only draft listings can be deleted" };
  }

  await adminClient.from("property_media").delete().eq("property_id", id);
  await adminClient.from("property_owner_contact").delete().eq("property_id", id);

  const { error } = await adminClient
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) return { ok: false, error: "Failed to delete listing" };

  revalidatePath("/owner/dashboard");
  return { ok: true };
}

export async function markStatusAction(
  id: string,
  status: "rented" | "sold"
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const { data: prop } = await adminClient
    .from("properties")
    .select("id, status")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();

  if (!prop) return { ok: false, error: "Listing not found" };
  if (prop.status !== "approved") {
    return { ok: false, error: "Only live listings can be marked as rented or sold" };
  }

  const { error } = await adminClient
    .from("properties")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) return { ok: false, error: "Failed to update status" };

  revalidatePath("/owner/dashboard");
  return { ok: true };
}

export async function addPhotoAction(
  propertyId: string,
  url: string,
  isCover: boolean,
  sortOrder: number
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const { data: prop } = await adminClient
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("owner_id", userId)
    .single();

  if (!prop) return { ok: false, error: "Listing not found" };

  if (isCover) {
    await adminClient
      .from("property_media")
      .update({ is_cover: false })
      .eq("property_id", propertyId);
  }

  const { data, error } = await adminClient
    .from("property_media")
    .insert({ property_id: propertyId, url, is_cover: isCover, sort_order: sortOrder })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "Failed to save photo" };

  revalidatePath(`/owner/edit/${propertyId}`);
  return { ok: true, id: data.id };
}

export async function deletePhotoAction(
  propertyId: string,
  mediaId: string
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const { data: prop } = await adminClient
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("owner_id", userId)
    .single();

  if (!prop) return { ok: false, error: "Listing not found" };

  const { error } = await adminClient
    .from("property_media")
    .delete()
    .eq("id", mediaId)
    .eq("property_id", propertyId);

  if (error) return { ok: false, error: "Failed to delete photo" };
  revalidatePath(`/owner/edit/${propertyId}`);
  return { ok: true };
}

export async function reorderPhotosAction(
  propertyId: string,
  photos: { id: string; sortOrder: number; isCover: boolean }[]
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireOwner();
  if ("error" in auth) return { ok: false, error: auth.error };
  const { userId } = auth;

  const { data: prop } = await adminClient
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("owner_id", userId)
    .single();

  if (!prop) return { ok: false, error: "Listing not found" };

  await Promise.all(
    photos.map((p) =>
      adminClient
        .from("property_media")
        .update({ sort_order: p.sortOrder, is_cover: p.isCover })
        .eq("id", p.id)
        .eq("property_id", propertyId)
    )
  );

  return { ok: true };
}
