import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Clock, Building2, Users, CheckSquare, Phone } from "lucide-react";
import { getAdminStats } from "@/lib/queries/admin";
import { adminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Dashboard — Swiito Admin" };

export default async function AdminDashboardPage() {
  const [stats, totalProps, totalUsers] = await Promise.all([
    getAdminStats(),
    adminClient
      .from("properties")
      .select("id", { count: "exact", head: true })
      .then((r) => r.count ?? 0),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .then((r) => r.count ?? 0),
  ]);

  const actions = [
    {
      count: stats.pendingApprovals,
      label: "listings pending approval",
      description: "Need review before going live",
      href: "/admin/approvals",
      cta: "Review",
      urgent: stats.pendingApprovals > 0,
    },
    {
      count: stats.newLeads,
      label: "new leads not yet contacted",
      description: "Seekers who revealed broker contact",
      href: "/admin/leads?status=new",
      cta: "View leads",
      urgent: stats.newLeads > 0,
    },
    {
      count: stats.staleListings,
      label: "approved listings with no updates in 30+ days",
      description: "May need a status check",
      href: "/admin/properties?stale=true",
      cta: "View",
      urgent: false,
    },
    {
      count: stats.unverifiedOwners,
      label: "owners awaiting verification",
      description: "Have listings but not verified yet",
      href: "/admin/users?role=owner",
      cta: "View owners",
      urgent: false,
    },
  ].filter((a) => a.count > 0);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display font-bold text-2xl text-fg">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Building2, label: "Total listings", value: totalProps },
          {
            icon: CheckSquare,
            label: "Live",
            value: totalProps,
          },
          { icon: Users, label: "Users", value: totalUsers },
          { icon: Phone, label: "New leads", value: stats.newLeads },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-surface rounded-lg p-4 border border-[var(--border)]">
            <div className="flex items-center gap-2 text-fg-muted mb-2">
              <Icon size={14} />
              <span className="text-xs">{label}</span>
            </div>
            <div className="font-display font-bold text-2xl text-fg">{value}</div>
          </div>
        ))}
      </div>

      {/* Action items */}
      {actions.length > 0 ? (
        <div>
          <h2 className="text-sm font-medium text-fg-muted uppercase tracking-wide mb-3">
            Action required
          </h2>
          <ul className="space-y-2">
            {actions.map((a) => (
              <li
                key={a.href}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  a.urgent
                    ? "bg-danger/5 border-danger/20"
                    : "bg-surface border-[var(--border)]"
                }`}
              >
                <div className={`shrink-0 ${a.urgent ? "text-danger" : "text-fg-muted"}`}>
                  <AlertCircle size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-fg font-medium">
                    <span className="font-bold">{a.count}</span> {a.label}
                  </p>
                  <p className="text-xs text-fg-muted mt-0.5">{a.description}</p>
                </div>
                <Link
                  href={a.href}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-on-accent hover:bg-[var(--accent-hover)] transition-brand"
                >
                  {a.cta}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-[var(--border)]">
          <Clock size={18} className="text-fg-muted" />
          <p className="text-sm text-fg-muted">No pending actions — all caught up.</p>
        </div>
      )}
    </div>
  );
}
