"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { getSiteSettings } from "@/lib/queries/settings";

const MAX_LEADS_PER_PHONE_24H = 5;

const contactSchema = z.object({
  propertyId: z.string().uuid(),
  propertySlug: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  message: z.string().max(500).optional(),
  moveInDate: z.string().max(20).optional(),
  website: z.string().optional(), // bot honeypot
});

export interface ContactResult {
  ok: boolean;
  brokerPhone?: string;
  brokerDisplay?: string;
  brokerWhatsapp?: string;
  error?: "validation" | "rate_limited" | "server_error";
  fieldErrors?: Partial<Record<"name" | "phone" | "message", string>>;
}

export async function submitPropertyContact(
  input: z.input<typeof contactSchema>
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "validation",
      fieldErrors: {
        name: flat.name?.[0],
        phone: flat.phone?.[0],
        message: flat.message?.[0],
      },
    };
  }

  const { propertyId, propertySlug, name, phone, message, moveInDate, website } = parsed.data;

  // Silently discard honeypot — bot thinks it succeeded
  if (website) {
    const s = await getSiteSettings();
    return { ok: true, brokerPhone: s.broker_phone, brokerDisplay: s.broker_display, brokerWhatsapp: s.broker_whatsapp };
  }

  const fullMessage =
    [message, moveInDate ? `Move-in: ${moveInDate}` : ""]
      .filter(Boolean)
      .join("\n\n") || null;

  // Check for existing lead on this property from this phone → upsert
  const { data: existing } = await adminClient
    .from("leads")
    .select("id")
    .eq("property_id", propertyId)
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    await adminClient
      .from("leads")
      .update({ name, message: fullMessage, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    // Rate limit: max N new leads per phone per 24 h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await adminClient
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", since);

    if ((count ?? 0) >= MAX_LEADS_PER_PHONE_24H) {
      return { ok: false, error: "rate_limited" };
    }

    const { error: insertErr } = await adminClient.from("leads").insert({
      property_id: propertyId,
      name,
      phone,
      message: fullMessage,
      source: "detail_page",
      status: "new",
    });

    if (insertErr) {
      console.error("[submitPropertyContact] insert:", insertErr.message);
      return { ok: false, error: "server_error" };
    }

    // Increment enquiry_count (fire-and-forget — minor race is acceptable)
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
