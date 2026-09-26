import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

interface PriceTagProps {
  amount: number;
  listingType: "rent" | "sale";
  className?: string;
}

export function PriceTag({ amount, listingType, className }: PriceTagProps) {
  return (
    <span
      className={cn(
        "tabular font-display font-bold text-fg",
        className
      )}
    >
      {formatINR(amount)}
      {listingType === "rent" && (
        <span className="text-fg-muted font-body font-normal text-sm">/mo</span>
      )}
    </span>
  );
}
