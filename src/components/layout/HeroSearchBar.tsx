"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils/format";

export function HeroSearchBar() {
  const router = useRouter();
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (locality) params.set("locality", locality);
    if (type) params.set("type", type);
    if (budget) params.set("budget", budget);
    router.push(`/properties${params.size ? `?${params}` : ""}`);
  }

  const selectClass = cn(
    "flex-1 h-12 px-4 text-sm bg-white text-[#101614] appearance-none cursor-pointer",
    "border-0 outline-none min-w-0",
    "rounded-none first:rounded-l-md last-of-type:rounded-none"
  );

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mt-8 rounded-xl overflow-hidden shadow-lift flex flex-col sm:flex-row"
    >
      <select
        value={locality}
        onChange={(e) => setLocality(e.target.value)}
        aria-label={COPY.hero.searchLocality}
        className={cn(selectClass, "sm:border-r sm:border-gray-200")}
      >
        {COPY.search.localityOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label={COPY.hero.searchType}
        className={cn(selectClass, "sm:border-r sm:border-gray-200")}
      >
        {COPY.search.typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        aria-label={COPY.hero.searchBudget}
        className={selectClass}
      >
        {COPY.search.budgetOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-12 px-6 bg-accent text-on-accent font-semibold text-sm flex items-center gap-2 hover:bg-[var(--accent-hover)] transition-brand whitespace-nowrap"
        aria-label={COPY.hero.searchCta}
      >
        <Search size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{COPY.hero.searchCta}</span>
      </button>
    </form>
  );
}
