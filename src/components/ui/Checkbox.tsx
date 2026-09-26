"use client";

import { cn } from "@/lib/utils/format";

interface CheckboxProps {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ id, label, checked, onChange, className }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn("flex items-center gap-3 cursor-pointer min-h-[44px] py-1 group", className)}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "w-[18px] h-[18px] shrink-0 rounded border transition-brand flex items-center justify-center",
          checked
            ? "bg-accent border-accent"
            : "bg-surface border-[var(--border)] group-hover:border-accent"
        )}
        aria-hidden="true"
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="var(--on-accent)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="text-sm text-fg select-none">{label}</span>
    </label>
  );
}
