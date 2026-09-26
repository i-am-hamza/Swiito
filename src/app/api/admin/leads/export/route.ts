import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { getAdminLeads } from "@/lib/queries/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search") ?? "";

  const result = await getAdminLeads({
    status: status as "all",
    search,
    page: 1,
    perPage: 10000,
  });

  const headers = [
    "ID",
    "Property",
    "Seeker name",
    "Seeker phone",
    "Seeker email",
    "Status",
    "Source",
    "Notes",
    "Created at",
    "Updated at",
  ];

  const rows = result.leads.map((l) => [
    l.id,
    `"${l.propertyTitle.replace(/"/g, '""')}"`,
    `"${(l.seekerName ?? "").replace(/"/g, '""')}"`,
    l.seekerPhone ?? "",
    l.seekerEmail ?? "",
    l.status ?? "",
    l.source ?? "",
    `"${(l.notes ?? "").replace(/"/g, '""')}"`,
    l.createdAt,
    l.updatedAt ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
