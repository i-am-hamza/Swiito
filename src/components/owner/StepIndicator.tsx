import { cn } from "@/lib/utils/format";

const STEPS = ["Listing type", "Details", "Pricing", "Photos", "Review"];

interface StepIndicatorProps {
  current: number; // 0-indexed
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <nav aria-label="Form steps" className="w-full">
      <ol className="flex items-center gap-0">
        {STEPS.map((label, idx) => {
          const done = idx < current;
          const active = idx === current;
          const isLast = idx === STEPS.length - 1;
          return (
            <li key={label} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-brand shrink-0",
                    done && "bg-accent text-on-accent",
                    active && "bg-accent text-on-accent ring-4 ring-accent/20",
                    !done && !active && "bg-surface-2 text-fg-muted"
                  )}
                >
                  {done ? (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                      <path
                        d="M1 5L4.5 8.5L11 1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(
                    "hidden sm:block text-xs font-medium text-center leading-tight",
                    active ? "text-fg" : "text-fg-muted"
                  )}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-px mx-2 mt-[-12px]",
                    done ? "bg-accent" : "bg-[var(--border)]"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
