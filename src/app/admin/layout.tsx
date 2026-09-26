import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { ToastProvider } from "@/components/ui/Toast";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminStats } from "@/lib/queries/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/admin");

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const stats = await getAdminStats();
  const userName = profile.full_name ?? profile.email ?? "Admin";

  return (
    <ToastProvider>
      <AdminShell pendingCount={stats.pendingApprovals} userName={userName}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
