import { Skeleton } from "@/components/ui/Skeleton";
import { PropertyGridSkeleton } from "@/components/property/PropertyGrid";

export default function Loading() {
  return (
    <main>
      {/* Hero skeleton */}
      <div className="relative py-20 lg:py-28 bg-surface-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full mt-4" />
          <Skeleton className="h-5 w-2/3 mt-2" />
          <div className="flex gap-3 mt-6">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Price context skeleton */}
      <div className="py-10 border-b border-[var(--border)] bg-surface-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-40 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties skeleton */}
      <div className="py-14 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <PropertyGridSkeleton count={6} />
        </div>
      </div>
    </main>
  );
}
