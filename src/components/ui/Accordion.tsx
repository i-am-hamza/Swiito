"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("divide-y divide-[var(--border)]", className)}>
      {items.map((item) => (
        <div key={item.id}>
          <button
            onClick={() =>
              setOpenId(openId === item.id ? null : item.id)
            }
            aria-expanded={openId === item.id}
            className="w-full flex items-center justify-between py-5 text-left font-medium text-fg gap-4 min-h-[44px]"
          >
            <span>{item.question}</span>
            <ChevronDown
              size={20}
              aria-hidden="true"
              className={cn(
                "text-fg-muted shrink-0 transition-transform duration-[260ms]",
                openId === item.id && "rotate-180"
              )}
            />
          </button>
          {openId === item.id && (
            <p className="pb-5 text-fg-muted leading-relaxed">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
