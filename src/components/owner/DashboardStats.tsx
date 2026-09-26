import { Eye, MessageSquare, Home, Clock, CheckCircle } from "lucide-react";
import type { OwnerStats } from "@/types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-[var(--border)] px-5 py-4 flex items-center gap-4">
      <span className="text-accent shrink-0">{icon}</span>
      <div>
        <p className="text-2xl font-display font-bold text-fg tabular">{value.toLocaleString("en-IN")}</p>
        <p className="text-xs text-fg-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function DashboardStats({ stats }: { stats: OwnerStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard icon={<Home size={20} />} label="Total listings" value={stats.total} />
      <StatCard icon={<CheckCircle size={20} />} label="Live" value={stats.live} />
      <StatCard icon={<Clock size={20} />} label="Pending review" value={stats.pending} />
      <StatCard icon={<Eye size={20} />} label="Total views" value={stats.totalViews} />
      <StatCard icon={<MessageSquare size={20} />} label="Enquiries" value={stats.totalEnquiries} />
    </div>
  );
}
