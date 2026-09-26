"use server";

import { adminClient } from "@/lib/supabase/admin";

export async function recordView(propertyId: string): Promise<void> {
  try {
    const { data: prop } = await adminClient
      .from("properties")
      .select("view_count")
      .eq("id", propertyId)
      .single();

    await adminClient
      .from("properties")
      .update({ view_count: (prop?.view_count ?? 0) + 1 })
      .eq("id", propertyId);
  } catch {
    // fire-and-forget
  }
}
