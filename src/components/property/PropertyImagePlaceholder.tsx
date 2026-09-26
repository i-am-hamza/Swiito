import { Home, BedDouble, Building2, ShoppingBag, Briefcase, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/format";

const TYPE_CONFIG: Record<string, {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  from: string;
  to: string;
}> = {
  flat:              { Icon: Home,         label: "Flat",    from: "from-slate-700",   to: "to-slate-900" },
  independent_house: { Icon: Home,         label: "House",   from: "from-amber-800",   to: "to-amber-950" },
  room:              { Icon: BedDouble,    label: "Room",    from: "from-indigo-800",  to: "to-indigo-950" },
  pg:                { Icon: Building2,    label: "PG",      from: "from-violet-800",  to: "to-violet-950" },
  hostel:            { Icon: Building2,    label: "Hostel",  from: "from-teal-800",    to: "to-teal-950" },
  shop:              { Icon: ShoppingBag,  label: "Shop",    from: "from-orange-800",  to: "to-orange-950" },
  office:            { Icon: Briefcase,    label: "Office",  from: "from-blue-800",    to: "to-blue-950" },
  plot:              { Icon: MapPin,       label: "Plot",    from: "from-green-800",   to: "to-green-950" },
};

interface Props {
  type: string;
  className?: string;
}

export function PropertyImagePlaceholder({ type, className }: Props) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.flat;
  const { Icon, label, from, to } = cfg;
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col items-center justify-center",
        `bg-gradient-to-br ${from} ${to}`,
        className
      )}
      aria-hidden="true"
    >
      <Icon size={36} className="text-white/30" />
      <span className="mt-2 text-xs font-medium text-white/40 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
