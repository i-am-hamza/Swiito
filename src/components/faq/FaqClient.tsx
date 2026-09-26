"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import type { Faq } from "@/types";

interface Props {
  faqs: Faq[];
}

export function FaqClient({ faqs }: Props) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q)
        )
      : faqs;

    const map = new Map<string, Faq[]>();
    for (const f of filtered) {
      const cat = f.category ?? "general";
      (map.get(cat) ?? (() => { const a: Faq[] = []; map.set(cat, a); return a; })()).push(f);
    }
    return map;
  }, [faqs, query]);

  const total = Array.from(groups.values()).reduce((s, a) => s + a.length, 0);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-10">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          aria-label="Search FAQs"
          className="w-full pl-10 pr-4 h-12 rounded-xl border border-[var(--border)] bg-surface text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 transition-brand text-sm"
        />
      </div>

      {total === 0 ? (
        <p className="text-center text-fg-muted py-16">
          No questions match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="space-y-12">
          {Array.from(groups.entries()).map(([cat, items]) => (
            <section key={cat} aria-labelledby={`faq-cat-${cat}`}>
              <h2
                id={`faq-cat-${cat}`}
                className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-4 capitalize"
              >
                {cat.replace(/_/g, " ")}
              </h2>
              <div className="bg-surface rounded-xl border border-[var(--border)] px-5">
                <Accordion items={items} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
