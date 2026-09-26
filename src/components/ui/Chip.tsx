import { cn } from "@/lib/utils/format";

interface ChipProps {
  children: React.ReactNode;
  className?: string;
}

export function Chip({ children, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-surface-2 text-fg-muted border border-[var(--border)]",
        className
      )}
    >
      {children}
    </span>
  );
}
