"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";
import { COPY } from "@/lib/copy";
import { cn } from "@/lib/utils/format";

const NAV_LINKS = [
  { label: COPY.nav.browse, href: "/properties" },
  { label: COPY.nav.howItWorks, href: "/how-it-works" },
  { label: COPY.nav.about, href: "/about" },
];

interface HeaderUser { id: string; email?: string }

export function Header({ user }: { user: HeaderUser | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/browser");
    await createClient().auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40",
          "transition-[background-color,border-color,box-shadow] duration-[260ms]",
          scrolled
            ? "bg-surface/95 backdrop-blur-sm border-b border-[var(--border)] shadow-card"
            : "bg-transparent"
        )}
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Swiito home">
            <SwiitoLogo scrolled={scrolled} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-brand",
                  scrolled ? "text-fg-muted hover:text-fg" : "text-white/80 hover:text-white"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle className={!scrolled ? "text-white/80 hover:text-white" : ""} />
            {user ? (
              <>
                <Link href="/owner/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className={!scrolled ? "border-white/40 text-white hover:bg-white/10 hover:text-white" : ""}
                  >
                    Owner portal
                  </Button>
                </Link>
                <Button variant="solid" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-up?role=owner">
                  <Button
                    variant="outline"
                    size="sm"
                    className={!scrolled ? "border-white/40 text-white hover:bg-white/10 hover:text-white" : ""}
                  >
                    {COPY.nav.listProperty}
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="solid" size="sm">{COPY.nav.signIn}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle className={!scrolled ? "text-white/80 hover:text-white" : ""} />
            <button
              ref={hamburgerRef}
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              aria-haspopup="dialog"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md"
            >
              {/* Hamburger ↔ X morph */}
              <span className="relative w-[22px] h-[22px] flex items-center justify-center">
                <Menu
                  size={22}
                  className={cn(
                    "absolute transition-[opacity,transform] duration-[150ms]",
                    scrolled ? "text-fg" : "text-white",
                    navOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  )}
                  aria-hidden="true"
                />
                <X
                  size={22}
                  className={cn(
                    "absolute transition-[opacity,transform] duration-[150ms]",
                    scrolled ? "text-fg" : "text-white",
                    navOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  )}
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        user={user}
        triggerRef={hamburgerRef}
      />
    </>
  );
}

function SwiitoLogo({ scrolled }: { scrolled: boolean }) {
  return (
    <span
      className={cn(
        "font-display font-bold text-xl tracking-tight transition-brand",
        scrolled ? "text-fg" : "text-white"
      )}
    >
      Swiito
    </span>
  );
}
