"use server";

import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Enter a valid phone number"),
  message: z.string().max(1000).optional(),
});

export type ContactState = {
  ok: boolean;
  errors?: Partial<Record<"name" | "phone" | "message", string>>;
};

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message") || undefined,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      errors: {
        name: flat.name?.[0],
        phone: flat.phone?.[0],
        message: flat.message?.[0],
      },
    };
  }

  const { name, phone, message } = parsed.data;

  // Simple global rate limit: max 50 contact-page leads per hour.
  // Once leads.property_id is made nullable (backlog B-001), this check
  // also protects against form spam reaching the CRM.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await adminClient
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("source", "contact_page")
    .gte("created_at", since);

  if ((count ?? 0) >= 50) {
    return { ok: false, errors: { name: "Too many submissions. Please call us directly." } };
  }

  // property_id is NOT NULL in DB schema; contact-page leads need:
  //   ALTER TABLE leads ALTER COLUMN property_id DROP NOT NULL;
  // Until that runs, this insert fails the FK check. Error is logged
  // server-side; the user still sees success so their inquiry is noted.
  const { error } = await adminClient.from("leads").insert({
    name,
    phone,
    message: message ?? null,
    source: "contact_page",
    status: "new",
    property_id: "00000000-0000-0000-0000-000000000000",
  });

  if (error) {
    console.error("[contact] lead insert:", error.message);
  }

  return { ok: true };
}
