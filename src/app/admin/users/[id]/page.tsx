import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAdminUserDetail } from "@/lib/queries/admin";
import { UserDetailClient } from "@/components/admin/UserDetailClient";

export const metadata: Metadata = { title: "User detail — Swiito Admin" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getAdminUserDetail(id);

  if (!detail) notFound();

  const { user, listings, leads } = detail;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-fg">
            {user.fullName ?? "(no name)"}
          </h1>
          <p className="text-sm text-fg-muted mt-0.5">{user.email ?? "—"}</p>
        </div>
        <Link
          href="/admin/users"
          className="text-sm text-fg-muted hover:text-fg transition-brand"
        >
          ← Back
        </Link>
      </div>

      <UserDetailClient user={user} listings={listings} leads={leads} />
    </div>
  );
}
