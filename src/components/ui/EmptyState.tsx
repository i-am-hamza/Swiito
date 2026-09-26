import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-20 px-4",
        className
      )}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)" }}
      >
        <SearchX size={28} className="text-accent" aria-hidden="true" />
      </div>
      <h3 className="font-display font-semibold text-xl text-fg">{title}</h3>
      {description && (
        <p className="mt-3 text-sm text-fg-muted max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
