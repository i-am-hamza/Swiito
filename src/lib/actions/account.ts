"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(80).optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .optional()
    .or(z.literal("")),
});

const changePasswordSchema = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

export async function updateProfile(data: {
  fullName?: string;
  phone?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input";
    return { ok: false, error: msg };
  }

  const update: { full_name?: string | null; phone?: string | null } = {};
  if (data.fullName !== undefined) update.full_name = data.fullName;
  if (data.phone !== undefined) update.phone = data.phone || null;

  const { error } = await adminClient
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) return { ok: false, error: "Failed to update profile" };

  revalidatePath("/account");
  return { ok: true };
}

export async function changePassword(
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const parsed = changePasswordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
