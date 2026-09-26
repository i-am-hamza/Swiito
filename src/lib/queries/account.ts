import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import type { Lead, UserProfile } from "@/types";

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await adminClient
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role")
    .eq("id", user.id)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    fullName: data.full_name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    avatarUrl: data.avatar_url ?? null,
    role: (data.role as UserProfile["role"]) ?? null,
  };
}

export async function getUserLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: leads } = await adminClient
    .from("leads")
    .select("id, property_id, source, status, created_at, updated_at")
    .eq("seeker_id", user.id)
    .order("updated_at", { ascending: false });

  if (!leads?.length) return [];

  const propertyIds = leads.map((l) => l.property_id);
  const { data: props } = await supabase
    .from("properties_public")
    .select("id, title, slug")
    .in("id", propertyIds);

  const propMap = Object.fromEntries(
    (props ?? []).map((p) => [p.id, { title: p.title ?? "", slug: p.slug ?? "" }])
  );

  return leads.map((l) => ({
    id: l.id,
    propertyId: l.property_id,
    propertyTitle: propMap[l.property_id]?.title ?? "Unknown property",
    propertySlug: propMap[l.property_id]?.slug ?? "",
    source: l.source ?? null,
    status: (l.status as Lead["status"]) ?? null,
    createdAt: l.created_at ?? new Date().toISOString(),
    updatedAt: l.updated_at ?? null,
  }));
}

export async function hasRevealedContact(propertyId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await adminClient
    .from("leads")
    .select("id")
    .eq("property_id", propertyId)
    .eq("seeker_id", user.id)
    .maybeSingle();

  return !!data;
}
