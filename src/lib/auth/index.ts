import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function isOwner(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("is_owner")
    .eq("id", user.id)
    .single();
  return data?.is_owner ?? false;
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

export async function requireOwner() {
  const user = await requireAuth();
  const owner = await isOwner();
  if (!owner) redirect("/");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  const admin = await isAdmin();
  if (!admin) redirect("/");
  return user;
}
