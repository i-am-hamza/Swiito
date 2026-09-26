"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/queries/settings";

const MAX_REVEALS_PER_DAY = 10;

export interface RevealResult {
  ok: boolean;
  brokerPhone?: string;
  brokerDisplay?: string;
  brokerWhatsapp?: string;
  error?: "not_authenticated" | "rate_limited" | "server_error";
}

export async function revealContact(propertyId: string, propertySlug: string): Promise<RevealResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "not_authenticated" };

  // Check for existing lead first — re-reveal doesn't count against rate limit
  const { data: existing } = await adminClient
    .from("leads")
    .select("id")
    .eq("property_id", propertyId)
    .eq("seeker_id", user.id)
    .maybeSingle();

  if (existing) {
    await adminClient
      .from("leads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // Rate limit: max N new reveals per 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await adminClient
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("seeker_id", user.id)
      .gte("created_at", since);

    if ((count ?? 0) >= MAX_REVEALS_PER_DAY) {
      return { ok: false, error: "rate_limited" };
    }

    // Insert new lead
    const { error: insertErr } = await adminClient.from("leads").insert({
      property_id: propertyId,
      seeker_id: user.id,
      source: "detail_page",
      status: "new",
    });

    if (insertErr) return { ok: false, error: "server_error" };

    // Increment enquiry_count (fire-and-forget, race condition acceptable for counts)
    const { data: prop } = await adminClient
      .from("properties")
      .select("enquiry_count")
      .eq("id", propertyId)
      .single();

    await adminClient
      .from("properties")
      .update({ enquiry_count: (prop?.enquiry_count ?? 0) + 1 })
      .eq("id", propertyId);
  }

  revalidatePath(`/properties/${propertySlug}`);

  const settings = await getSiteSettings();
  return {
    ok: true,
    brokerPhone: settings.broker_phone,
    brokerDisplay: settings.broker_display,
    brokerWhatsapp: settings.broker_whatsapp,
  };
}
