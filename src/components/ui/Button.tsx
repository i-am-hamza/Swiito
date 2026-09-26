import { cn } from "@/lib/utils/format";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-full transition-brand cursor-pointer select-none",
        size === "sm" && "px-4 py-1.5 text-sm min-h-[36px]",
        size === "md" && "px-6 py-2.5 text-sm min-h-[44px]",
        size === "lg" && "px-8 py-3 text-base min-h-[52px]",
        variant === "solid" &&
          "bg-accent text-on-accent hover:bg-[var(--accent-hover)] active:scale-95",
        variant === "outline" &&
          "border border-[var(--border)] text-fg hover:bg-surface-2 active:scale-95",
        variant === "ghost" &&
          "text-fg-muted hover:text-fg hover:bg-surface-2 active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
