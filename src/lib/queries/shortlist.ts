import { createClient } from "@/lib/supabase/server";
import { getPropertiesByIds } from "@/lib/queries/properties";
import type { Property } from "@/types";

export async function getUserShortlistedIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("shortlists")
    .select("property_id")
    .eq("user_id", user.id);

  return new Set((data ?? []).map((s) => s.property_id));
}

export async function getUserShortlist(): Promise<Property[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("shortlists")
    .select("property_id")
    .eq("user_id", user.id);

  if (!data?.length) return [];
  return getPropertiesByIds(data.map((s) => s.property_id));
}
