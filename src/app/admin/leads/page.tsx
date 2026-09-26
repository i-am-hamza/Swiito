import type { Metadata } from "next";
import { getAdminLeads } from "@/lib/queries/admin";
import { LeadsClient } from "@/components/admin/LeadsClient";

export const metadata: Metadata = { title: "Leads — Swiito Admin" };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "all") as "new" | "contacted" | "connected" | "closed_won" | "closed_lost" | "all";
  const search = params.search ?? "";
  const page = Number(params.page ?? 1);

  const result = await getAdminLeads({ status, search, page, perPage: 30 });

  return (
    <div className="max-w-6xl space-y-4">
      <h1 className="font-display font-bold text-2xl text-fg">Leads</h1>
      <LeadsClient result={result} initialStatus={status} initialSearch={search} />
    </div>
  );
}
