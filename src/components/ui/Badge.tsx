import { cn } from "@/lib/utils/format";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "danger";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full",
        variant === "default" && "bg-surface-2 text-fg-muted",
        variant === "gold" && "border border-[var(--border)]",
        variant === "success" && "bg-accent/10 text-accent",
        variant === "danger" && "bg-danger/10 text-danger",
        className
      )}
      style={variant === "gold" ? { backgroundColor: "var(--gold)", color: "var(--on-gold)" } : undefined}
    >
      {children}
    </span>
  );
}
