import { Home, BedDouble, Building2, ShoppingBag, Briefcase, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/format";

const TYPE_CONFIG: Record<string, {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}> = {
  flat:              { Icon: Home,        label: "Flat" },
  independent_house: { Icon: Home,        label: "House" },
  room:              { Icon: BedDouble,   label: "Room" },
  pg:                { Icon: Building2,   label: "PG" },
  hostel:            { Icon: Building2,   label: "Hostel" },
  shop:              { Icon: ShoppingBag, label: "Shop" },
  office:            { Icon: Briefcase,   label: "Office" },
  plot:              { Icon: MapPin,      label: "Plot" },
};

interface Props {
  type: string;
  className?: string;
}

export function PropertyImagePlaceholder({ type, className }: Props) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.flat;
  const { Icon, label } = cfg;
  return (
    <div
      className={cn("w-full h-full flex flex-col items-center justify-center", className)}
      style={{
        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
      }}
      aria-hidden="true"
    >
      <Icon size={36} className="opacity-35 text-white" />
      <span
        className="mt-2 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--gold)", opacity: 0.85 }}
      >
        {label}
      </span>
    </div>
  );
}
