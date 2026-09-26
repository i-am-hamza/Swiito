"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";

type PropUpdate = Database["public"]["Tables"]["properties"]["Update"];

async function getAdminUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
  return user.id;
}

async function writeAudit(
  actorId: string,
  action: string,
  tableName: string,
  recordId: string,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null
) {
  await adminClient.from("audit_log").insert({
    actor_id: actorId,
    action,
    table_name: tableName,
    record_id: recordId,
    old_data: oldData as Json | null,
    new_data: newData as Json | null,
  });
}

export async function approveListingAction(
  id: string,
  displayPrice: number,
  score: number | null,
  isVerified: boolean,
  isFeatured: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();

    const { data: old } = await adminClient
      .from("properties")
      .select("status, display_price, swiito_score, is_verified, is_featured")
      .eq("id", id)
      .single();

    const update: PropUpdate = {
      status: "approved",
      display_price: displayPrice,
      swiito_score: score,
      is_verified: isVerified,
      is_featured: isFeatured,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rejection_reason: null,
    };

    const { error } = await adminClient.from("properties").update(update).eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, "approve", "properties", id, old as Record<string, unknown>, {
      status: "approved",
      display_price: displayPrice,
      swiito_score: score,
      is_verified: isVerified,
      is_featured: isFeatured,
    });

    revalidatePath("/admin/approvals");
    revalidatePath(`/admin/approvals/${id}`);
    revalidatePath("/admin/properties");
    revalidatePath("/properties");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function rejectListingAction(
  id: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();

    const { data: old } = await adminClient
      .from("properties")
      .select("status, rejection_reason")
      .eq("id", id)
      .single();

    const update: PropUpdate = {
      status: "rejected",
      rejection_reason: reason,
      published_at: null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await adminClient.from("properties").update(update).eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, "reject", "properties", id, old as Record<string, unknown>, {
      status: "rejected",
      rejection_reason: reason,
    });

    revalidatePath("/admin/approvals");
    revalidatePath(`/admin/approvals/${id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

const updatePropertySchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(["draft", "pending", "approved", "rejected", "rented", "sold", "expired"]).optional(),
  display_price: z.number().int().min(0).optional(),
  address_area: z.string().optional(),
  description: z.string().optional(),
  bhk: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  carpet_area_sqft: z.number().int().nullable().optional(),
  builtup_area_sqft: z.number().int().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  total_floors: z.number().int().nullable().optional(),
  swiito_score: z.number().int().min(1).max(5).nullable().optional(),
  is_verified: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  rejection_reason: z.string().nullable().optional(),
  deposit: z.number().int().nullable().optional(),
  maintenance: z.number().int().nullable().optional(),
});

export async function updatePropertyAction(
  id: string,
  data: z.infer<typeof updatePropertySchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const parsed = updatePropertySchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const { data: old } = await adminClient
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    const update: PropUpdate = { ...parsed.data, updated_at: new Date().toISOString() };
    const { error } = await adminClient.from("properties").update(update).eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, "update", "properties", id, old as Record<string, unknown>, parsed.data);
    revalidatePath("/admin/properties");
    revalidatePath(`/admin/properties/${id}`);
    revalidatePath("/properties");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function adminReorderPhotosAction(
  propertyId: string,
  photos: { id: string; isCover: boolean; sortOrder: number }[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    await Promise.all(
      photos.map((ph) =>
        adminClient
          .from("property_media")
          .update({ is_cover: ph.isCover, sort_order: ph.sortOrder })
          .eq("id", ph.id)
          .eq("property_id", propertyId)
      )
    );
    await writeAudit(actorId, "reorder_photos", "property_media", propertyId, null, { count: photos.length });
    revalidatePath(`/admin/properties/${propertyId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function adminDeletePhotoAction(
  propertyId: string,
  mediaId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const { error } = await adminClient
      .from("property_media")
      .delete()
      .eq("id", mediaId)
      .eq("property_id", propertyId);
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, "delete_photo", "property_media", mediaId, null, { propertyId });
    revalidatePath(`/admin/properties/${propertyId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function verifyOwnerAction(
  userId: string,
  verified: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const { data: old } = await adminClient
      .from("profiles")
      .select("is_verified")
      .eq("id", userId)
      .single();
    const { error } = await adminClient
      .from("profiles")
      .update({ is_verified: verified })
      .eq("id", userId);
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, verified ? "verify_owner" : "unverify_owner", "profiles", userId, old as Record<string, unknown>, { is_verified: verified });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function suspendUserAction(
  userId: string,
  suspended: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    if (suspended) {
      await adminClient.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
    } else {
      await adminClient.auth.admin.updateUserById(userId, { ban_duration: "none" });
    }
    await writeAudit(actorId, suspended ? "suspend_user" : "unsuspend_user", "profiles", userId, null, { suspended });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

const updateLeadSchema = z.object({
  status: z.enum(["new", "contacted", "connected", "closed_won", "closed_lost"]).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function updateLeadAction(
  id: string,
  data: z.infer<typeof updateLeadSchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const parsed = updateLeadSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const { data: old } = await adminClient
      .from("leads")
      .select("status, notes")
      .eq("id", id)
      .single();

    const { error } = await adminClient
      .from("leads")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, "update_lead", "leads", id, old as Record<string, unknown>, parsed.data);
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

const faqSchema = z.object({
  id: z.string().optional(),
  category: z.string().default("general"),
  question: z.string().min(1),
  answer: z.string().min(1),
  sort_order: z.number().int().nullable().optional(),
});

export async function upsertFaqAction(
  data: z.infer<typeof faqSchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const parsed = faqSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const { id, ...rest } = parsed.data;
    const payload = id ? { id, ...rest } : rest;
    const { data: result, error } = await adminClient.from("faqs").upsert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, id ? "update_faq" : "create_faq", "faqs", result?.id ?? id ?? "new", null, rest);
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function deleteFaqAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const { error } = await adminClient.from("faqs").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, "delete_faq", "faqs", id, null, null);
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

const valuePropSchema = z.object({
  id: z.string().optional(),
  icon: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  sort_order: z.number().int().nullable().optional(),
});

export async function upsertValuePropAction(
  data: z.infer<typeof valuePropSchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const parsed = valuePropSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const { id, ...rest } = parsed.data;
    const payload = id ? { id, ...rest } : rest;
    const { data: result, error } = await adminClient.from("value_props").upsert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, id ? "update_value_prop" : "create_value_prop", "value_props", result?.id ?? id ?? "new", null, rest);
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function deleteValuePropAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const { error } = await adminClient.from("value_props").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, "delete_value_prop", "value_props", id, null, null);
    revalidatePath("/admin/content");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

const testimonialSchema = z.object({
  id: z.string().optional(),
  author_name: z.string().min(1),
  locality: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5).nullable().optional(),
  body: z.string().min(1),
  avatar_url: z.string().url().nullable().optional(),
  is_active: z.boolean().default(false),
  sort_order: z.number().int().nullable().optional(),
});

export async function upsertTestimonialAction(
  data: z.infer<typeof testimonialSchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const parsed = testimonialSchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const { id, ...rest } = parsed.data;
    const payload = id ? { id, ...rest } : rest;
    const { data: result, error } = await adminClient.from("testimonials").upsert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, id ? "update_testimonial" : "create_testimonial", "testimonials", result?.id ?? id ?? "new", null, { author_name: rest.author_name, is_active: rest.is_active });
    revalidatePath("/admin/content");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function deleteTestimonialAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const { error } = await adminClient.from("testimonials").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, "delete_testimonial", "testimonials", id, null, null);
    revalidatePath("/admin/content");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

const amenitySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
});

export async function upsertAmenityAction(
  data: z.infer<typeof amenitySchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const parsed = amenitySchema.safeParse(data);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const { id, ...rest } = parsed.data;
    const payload = id ? { id, ...rest } : rest;
    const { data: result, error } = await adminClient.from("amenities").upsert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };

    await writeAudit(actorId, id ? "update_amenity" : "create_amenity", "amenities", result?.id ?? id ?? "new", null, rest);
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function deleteAmenityAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const { error } = await adminClient.from("amenities").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, "delete_amenity", "amenities", id, null, null);
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}

export async function updateSettingsAction(
  settings: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const actorId = await getAdminUserId();
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await adminClient
      .from("settings")
      .upsert(rows, { onConflict: "key" });
    if (error) return { ok: false, error: error.message };
    await writeAudit(actorId, "update_settings", "settings", "global", null, settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Server error" };
  }
}
