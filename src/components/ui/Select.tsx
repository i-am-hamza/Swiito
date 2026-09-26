import { cn } from "@/lib/utils/format";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className,
  id,
  ...props
}: SelectProps) {
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
      <select
        id={id}
        className={cn(
          "w-full h-11 px-4 rounded-sm bg-surface border border-[var(--border)]",
          "text-fg text-sm appearance-none cursor-pointer",
          "outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-brand",
          error && "border-danger focus:ring-danger/40",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
