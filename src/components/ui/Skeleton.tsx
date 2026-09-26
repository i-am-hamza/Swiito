import { cn } from "@/lib/utils/format";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded bg-surface-2", className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-[var(--border)] overflow-hidden">
      <Skeleton className="w-full" style={{ aspectRatio: "4/3" } as React.CSSProperties} />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3 mt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function FilterSidebarSkeleton() {
  return (
    <aside className="w-full flex flex-col gap-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </aside>
  );
}
