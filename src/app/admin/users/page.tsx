import type { Metadata } from "next";
import { getAdminUsers } from "@/lib/queries/admin";
import { UsersClient } from "@/components/admin/UsersClient";

export const metadata: Metadata = { title: "Users — Swiito Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const role = (params.role ?? "all") as "seeker" | "owner" | "admin" | "all";
  const search = params.search ?? "";
  const page = Number(params.page ?? 1);

  const result = await getAdminUsers({ role, search, page, perPage: 25 });

  return (
    <div className="max-w-5xl space-y-4">
      <h1 className="font-display font-bold text-2xl text-fg">Users</h1>
      <UsersClient result={result} initialRole={role} initialSearch={search} />
    </div>
  );
}
