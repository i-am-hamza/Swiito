"use client";

import { useState, useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, X, ArrowLeft } from "lucide-react";
import type { Locality } from "@/types";

type LocalityHit = Pick<Locality, "slug" | "name" | "listingCount">;

interface Props {
  localities: LocalityHit[];
}

export function HeroSearchBar({ localities }: Props) {
  const router = useRouter();
  const listboxId = useId();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mobileOpen, setMobileOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Filter localities ───────────────────────────────────────── */
  const q = query.trim().toLowerCase();
  const list = localities ?? [];
  const filtered: LocalityHit[] = q
    ? list.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8)
    : list.slice(0, 8);

  /* ── Navigate on selection ───────────────────────────────────── */
  function navigate(slug?: string) {
    if (slug) {
      router.push(`/properties?locality=${slug}`);
    } else if (query.trim()) {
      const exact = list.find(
        (l) => l.name.toLowerCase() === query.trim().toLowerCase()
      );
      if (exact) {
        router.push(`/properties?locality=${exact.slug}`);
      } else {
        router.push(`/properties?q=${encodeURIComponent(query.trim())}`);
      }
    } else {
      router.push("/properties");
    }
    setIsOpen(false);
    setMobileOpen(false);
  }

  /* ── Keyboard navigation ─────────────────────────────────────── */
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) { setIsOpen(true); break; }
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        navigate(activeIndex >= 0 ? filtered[activeIndex]?.slug : undefined);
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  /* ── Close on outside click ──────────────────────────────────── */
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ── Auto-focus mobile input ─────────────────────────────────── */
  useEffect(() => {
    if (mobileOpen) {
      const t = setTimeout(() => mobileInputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [mobileOpen]);

  /* ── Lock body scroll when mobile sheet open ─────────────────── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const showDropdown = isOpen && filtered.length > 0;

  return (
    <>
      {/* ── Mobile trigger pill (< sm) ─────────────────────────────────── */}
      <div className="sm:hidden w-full mt-6 px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="glass-pill w-full min-h-[52px] flex items-center gap-3 px-5 text-left"
          aria-label="Search properties by area"
          aria-haspopup="dialog"
        >
          <MapPin size={18} className="text-white/75 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm text-white/75 truncate">
            {query || "Search by area — Hindpiri, Lalpur..."}
          </span>
          <span
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-full shrink-0"
            style={{ background: "var(--gold)", color: "var(--on-gold)" }}
            aria-hidden="true"
          >
            <Search size={16} />
          </span>
        </button>
      </div>

      {/* ── Desktop glass pill (≥ sm) ───────────────────────────────────── */}
      <div
        ref={containerRef}
        className="hidden sm:block relative w-full max-w-2xl mt-6"
      >
        <div className="glass-pill flex items-center gap-3 px-5 min-h-[56px]">
          <MapPin size={18} className="text-white/75 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search by area — Hindpiri, Lalpur, Kanke..."
            aria-label="Search by area or locality"
            className="flex-1 bg-transparent text-white text-sm outline-none
              placeholder:text-white/75 min-w-0"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear"
              className="text-white/60 hover:text-white/90 transition-brand shrink-0"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate()}
            className="min-h-[40px] px-5 rounded-full font-semibold text-sm
              flex items-center gap-2 shrink-0 hover:opacity-90 active:scale-95
              transition-brand"
            style={{ background: "var(--gold)", color: "var(--on-gold)" }}
          >
            <Search size={15} aria-hidden="true" />
            Search
          </button>
        </div>

        {/* Desktop autocomplete — solid surface, NOT glass */}
        {showDropdown && (
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Localities"
            className="absolute top-full left-0 right-0 mt-2 bg-surface
              border border-[var(--border)] rounded-xl shadow-lift overflow-hidden
              z-50 max-h-72 overflow-y-auto"
          >
            {filtered.map((loc, i) => (
              <li
                key={loc.slug}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // keep input focused
                  navigate(loc.slug);
                }}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer
                  text-sm transition-brand ${
                    i === activeIndex
                      ? "bg-accent/10 text-accent"
                      : "text-fg hover:bg-surface-2"
                  }`}
              >
                <span className="flex items-center gap-2.5">
                  <MapPin
                    size={13}
                    className="text-fg-muted shrink-0"
                    aria-hidden="true"
                  />
                  {loc.name}
                </span>
                {loc.listingCount > 0 && (
                  <span className="text-xs text-fg-muted tabular">
                    {loc.listingCount.toLocaleString("en-IN")}{" "}
                    listing{loc.listingCount !== 1 ? "s" : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Mobile full-screen search sheet ────────────────────────────── */}
      {mobileOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[60] bg-bg flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Search properties"
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0"
            style={{
              paddingTop:
                "max(0.75rem, env(safe-area-inset-top, 0px))",
            }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close search"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center
                rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div
              className="flex-1 flex items-center gap-2 bg-surface-2
                rounded-full px-4 min-h-[44px] border border-[var(--border)]"
            >
              <MapPin
                size={16}
                className="text-fg-muted shrink-0"
                aria-hidden="true"
              />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(
                      activeIndex >= 0
                        ? (q
                            ? list.filter((l) =>
                                l.name.toLowerCase().includes(q)
                              )
                            : list)[activeIndex]?.slug
                        : undefined
                    );
                  }
                  if (e.key === "Escape") setMobileOpen(false);
                }}
                placeholder="Search by area..."
                aria-label="Search by area"
                className="flex-1 bg-transparent text-fg text-sm outline-none
                  placeholder:text-fg-muted"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="min-w-[32px] min-h-[32px] flex items-center justify-center
                    text-fg-muted hover:text-fg transition-brand"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto" role="listbox" aria-label="Localities">
            {(() => {
              const hits = q
                ? list.filter((l) => l.name.toLowerCase().includes(q))
                : list;
              if (hits.length === 0)
                return (
                  <div className="px-4 py-12 text-center">
                    <p className="text-sm text-fg-muted mb-4">
                      No localities found for &ldquo;{query}&rdquo;
                    </p>
                    <button
                      onClick={() => navigate()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                        bg-accent text-on-accent text-sm font-medium min-h-[44px]
                        hover:bg-[var(--accent-hover)] transition-brand"
                    >
                      <Search size={15} aria-hidden="true" />
                      Search all properties
                    </button>
                  </div>
                );
              return (
                <ul>
                  {hits.map((loc, i) => (
                    <li key={loc.slug}>
                      <button
                        role="option"
                        aria-selected={i === activeIndex}
                        onClick={() => navigate(loc.slug)}
                        className="w-full flex items-center justify-between px-4 py-4
                          text-left border-b border-[var(--border)] hover:bg-surface-2
                          transition-brand min-h-[52px]"
                      >
                        <span className="flex items-center gap-3">
                          <MapPin
                            size={15}
                            className="text-fg-muted shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-medium text-fg text-sm">{loc.name}</span>
                        </span>
                        {loc.listingCount > 0 && (
                          <span className="text-xs text-fg-muted tabular">
                            {loc.listingCount.toLocaleString("en-IN")}{" "}
                            listing{loc.listingCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              );
            })()}
          </div>

          {/* Footer: search free text */}
          <div
            className="shrink-0 px-4 py-4 border-t border-[var(--border)] bg-surface"
            style={{
              paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            <button
              onClick={() => navigate()}
              className="w-full min-h-[48px] flex items-center justify-center gap-2
                bg-accent text-on-accent font-semibold text-sm rounded-full
                hover:bg-[var(--accent-hover)] transition-brand"
            >
              <Search size={16} aria-hidden="true" />
              {query.trim() ? `Search for "${query.trim()}"` : "Browse all properties"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
