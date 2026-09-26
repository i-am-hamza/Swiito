import type { Metadata } from "next";
import Link from "next/link";
import { PlusSquare } from "lucide-react";
import { getOwnerListings, getOwnerStats } from "@/lib/queries/owner";
import { DashboardStats } from "@/components/owner/DashboardStats";
import { OwnerListingsTable } from "@/components/owner/OwnerListingsTable";

export const metadata: Metadata = {
  title: "Owner Dashboard — Swiito",
};

export default async function OwnerDashboardPage() {
  const [stats, listings] = await Promise.all([getOwnerStats(), getOwnerListings()]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-fg">My listings</h1>
          <p className="text-sm text-fg-muted mt-1">
            Manage your properties and track performance.
          </p>
        </div>
        <Link
          href="/owner/post"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px] shrink-0"
        >
          <PlusSquare size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Post property</span>
          <span className="sm:hidden">Post</span>
        </Link>
      </div>

      <DashboardStats stats={stats} />

      <OwnerListingsTable listings={listings} />
    </div>
  );
}
