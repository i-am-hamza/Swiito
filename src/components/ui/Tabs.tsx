"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/format";

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  className?: string;
}

export function Tabs({ tabs, defaultIndex = 0, className }: TabsProps) {
  const [active, setActive] = useState(defaultIndex);

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            id={`tab-${i}`}
            role="tab"
            aria-selected={active === i}
            aria-controls={`tabpanel-${i}`}
            onClick={() => setActive(i)}
            className={cn(
              "px-6 py-2 rounded-full font-medium text-sm transition-brand min-h-[44px]",
              active === i
                ? "bg-accent text-on-accent"
                : "bg-surface-2 text-fg-muted hover:text-fg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${active}`}
        aria-labelledby={`tab-${active}`}
      >
        {tabs[active]?.content}
      </div>
    </div>
  );
}
