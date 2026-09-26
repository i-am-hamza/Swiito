"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export interface ShortlistResult {
  ok: boolean;
  shortlisted: boolean;
  error?: "not_authenticated" | "server_error";
}

export async function toggleShortlist(propertyId: string): Promise<ShortlistResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, shortlisted: false, error: "not_authenticated" };

  const { data: existing } = await adminClient
    .from("shortlists")
    .select("property_id")
    .eq("property_id", propertyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await adminClient
      .from("shortlists")
      .delete()
      .eq("property_id", propertyId)
      .eq("user_id", user.id);

    if (error) return { ok: false, shortlisted: true, error: "server_error" };

    revalidatePath("/account/shortlist");
    return { ok: true, shortlisted: false };
  } else {
    const { error } = await adminClient
      .from("shortlists")
      .insert({ property_id: propertyId, user_id: user.id });

    if (error) return { ok: false, shortlisted: false, error: "server_error" };

    revalidatePath("/account/shortlist");
    return { ok: true, shortlisted: true };
  }
}
