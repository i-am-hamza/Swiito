"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

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
          "fixed top-0 left-0 right-0 z-40 transition-all duration-[260ms]",
          scrolled
            ? "bg-surface/95 backdrop-blur-sm border-b border-[var(--border)] shadow-card"
            : "bg-transparent"
        )}
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="Swiito home"
          >
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
                  scrolled
                    ? "text-fg-muted hover:text-fg"
                    : "text-white/80 hover:text-white"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle
              className={!scrolled ? "text-white/80 hover:text-white" : ""}
            />
            {user ? (
              <>
                <Link href="/owner/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      !scrolled
                        ? "border-white/40 text-white hover:bg-white/10 hover:text-white"
                        : ""
                    }
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
                    className={
                      !scrolled
                        ? "border-white/40 text-white hover:bg-white/10 hover:text-white"
                        : ""
                    }
                  >
                    {COPY.nav.listProperty}
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="solid" size="sm">
                    {COPY.nav.signIn}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle
              className={!scrolled ? "text-white/80 hover:text-white" : ""}
            />
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-brand"
            >
              <Menu
                size={22}
                className={scrolled ? "text-fg" : "text-white"}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <nav className="flex flex-col gap-1" aria-label="Mobile nav">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDrawerOpen(false)}
              className="text-fg font-medium py-3 hover:text-accent transition-brand block"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          {user ? (
            <>
              <Link href="/owner/dashboard" onClick={() => setDrawerOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Owner portal
                </Button>
              </Link>
              <Button
                variant="solid"
                className="w-full justify-center"
                onClick={() => { setDrawerOpen(false); handleSignOut(); }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-up?role=owner" onClick={() => setDrawerOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  {COPY.nav.listProperty}
                </Button>
              </Link>
              <Link href="/sign-in" onClick={() => setDrawerOpen(false)}>
                <Button variant="solid" className="w-full justify-center">
                  {COPY.nav.signIn}
                </Button>
              </Link>
            </>
          )}
        </div>
      </Drawer>
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
