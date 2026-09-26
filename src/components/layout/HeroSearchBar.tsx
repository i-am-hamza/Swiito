"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { COPY } from "@/lib/copy";

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

  const selectBase =
    "w-full h-11 px-3 text-sm bg-white text-[#101614] appearance-none cursor-pointer rounded-lg border-0 outline-none";

  const desktopSelect =
    "flex-1 h-12 px-4 text-sm bg-white text-[#101614] appearance-none cursor-pointer border-0 outline-none min-w-0";

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mt-8 px-2 sm:px-0">

      {/* ── Mobile layout (< sm) ── */}
      <div className="sm:hidden flex flex-col gap-3">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              {COPY.hero.searchLocality}
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              aria-label={COPY.hero.searchLocality}
              className={selectBase}
            >
              {COPY.search.localityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              {COPY.hero.searchType}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label={COPY.hero.searchType}
              className={selectBase}
            >
              {COPY.search.typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">
              {COPY.hero.searchBudget}
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              aria-label={COPY.hero.searchBudget}
              className={selectBase}
            >
              {COPY.search.budgetOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full h-12 bg-accent text-on-accent font-semibold text-sm flex items-center justify-center gap-2 rounded-xl shadow-lift hover:bg-[var(--accent-hover)] transition-brand"
          aria-label={COPY.hero.searchCta}
        >
          <Search size={16} aria-hidden="true" />
          {COPY.hero.searchCta}
        </button>
      </div>

      {/* ── Desktop layout (≥ sm) ── */}
      <div className="hidden sm:flex rounded-xl overflow-hidden shadow-lift">
        <select
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          aria-label={COPY.hero.searchLocality}
          className={`${desktopSelect} border-r border-gray-200`}
        >
          {COPY.search.localityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label={COPY.hero.searchType}
          className={`${desktopSelect} border-r border-gray-200`}
        >
          {COPY.search.typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          aria-label={COPY.hero.searchBudget}
          className={desktopSelect}
        >
          {COPY.search.budgetOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-12 px-6 bg-accent text-on-accent font-semibold text-sm flex items-center gap-2 hover:bg-[var(--accent-hover)] transition-brand whitespace-nowrap"
          aria-label={COPY.hero.searchCta}
        >
          <Search size={16} aria-hidden="true" />
          {COPY.hero.searchCta}
        </button>
      </div>

    </form>
  );
}
