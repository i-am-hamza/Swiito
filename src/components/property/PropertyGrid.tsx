import { PropertyCard } from "./PropertyCard";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import type { Property } from "@/types";

interface PropertyGridProps {
  properties: Property[];
  columns?: 2 | 3;
  shortlistedIds?: Set<string>;
}

export function PropertyGrid({ properties, columns = 3, shortlistedIds }: PropertyGridProps) {
  return (
    <div
      className={[
        "grid gap-6",
        columns === 3
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2",
      ].join(" ")}
    >
      {properties.map((p, i) => (
        <PropertyCard
          key={p.id}
          property={p}
          shortlisted={shortlistedIds?.has(p.id) ?? false}
          priority={i === 0}
        />
      ))}
    </div>
  );
}

export function PropertyGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
