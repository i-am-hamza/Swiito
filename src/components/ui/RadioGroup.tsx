"use client";

import { cn } from "@/lib/utils/format";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  legend?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({ name, legend, options, value, onChange, className }: RadioGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-1", className)}>
      {legend && (
        <legend className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-2">
          {legend}
        </legend>
      )}
      {options.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`${name}-${opt.value}`}
          className="flex items-center gap-3 cursor-pointer min-h-[44px] py-1 group"
        >
          <input
            type="radio"
            id={`${name}-${opt.value}`}
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="sr-only"
          />
          <span
            className={cn(
              "w-[18px] h-[18px] shrink-0 rounded-full border-2 transition-brand flex items-center justify-center",
              value === opt.value
                ? "border-accent"
                : "border-[var(--border)] group-hover:border-accent"
            )}
            aria-hidden="true"
          >
            {value === opt.value && (
              <span className="w-[8px] h-[8px] rounded-full bg-accent" />
            )}
          </span>
          <span className="text-sm text-fg select-none">{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
