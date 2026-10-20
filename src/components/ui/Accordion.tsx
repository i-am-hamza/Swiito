"use client";

import { useEffect, useRef, useState } from "react";
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
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.scrollHeight));
    ro.observe(el);
    setHeight(el.scrollHeight);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <button
        id={`acc-btn-${item.id}`}
        aria-expanded={isOpen}
        aria-controls={`acc-panel-${item.id}`}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left font-medium text-fg gap-4 min-h-[44px]"
      >
        <span>{item.question}</span>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className={cn(
            "text-fg-muted shrink-0 transition-transform duration-[260ms]",
            isOpen && "rotate-180"
          )}
          style={{ transitionTimingFunction: "var(--ease)" }}
        />
      </button>

      {/* max-height animation — measured value prevents easing distortion */}
      <div
        id={`acc-panel-${item.id}`}
        role="region"
        aria-labelledby={`acc-btn-${item.id}`}
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? (height || 500) : 0,
          opacity: isOpen ? 1 : 0,
          transition: "max-height var(--dur) var(--ease), opacity var(--dur) var(--ease)",
        }}
      >
        <p ref={contentRef} className="pb-5 text-fg-muted leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}
