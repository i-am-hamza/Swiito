import { PropertyGridSkeleton } from "@/components/property/PropertyGrid";
import { FilterSidebarSkeleton } from "@/components/ui/Skeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>

        <div className="flex gap-8 items-start">
          <aside className="hidden lg:flex flex-col w-[280px] shrink-0">
            <FilterSidebarSkeleton />
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-8 w-48" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            <PropertyGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </main>
  );
}
