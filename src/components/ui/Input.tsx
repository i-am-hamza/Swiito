import { cn } from "@/lib/utils/format";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-fg-muted uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full h-11 px-4 rounded-sm bg-surface border border-[var(--border)]",
          "text-fg text-sm placeholder:text-fg-muted",
          "outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-brand",
          error && "border-danger focus:ring-danger/40",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
