"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { COPY } from "@/lib/copy";

const NAV_LINKS = [
  { label: COPY.nav.browse, href: "/properties" },
  { label: COPY.nav.howItWorks, href: "/how-it-works" },
  { label: COPY.nav.about, href: "/about" },
] as const;

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email?: string } | null;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const CLOSE_MS = 160;

export function MobileNav({ isOpen, onClose, user, triggerRef }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const savedScrollY = useRef(0);
  const prevPathname = useRef(pathname);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Mount → double-rAF → visible (triggers CSS transitions)
  useEffect(() => {
    if (isOpen) {
      // setTimeout(0) avoids synchronous setState in effect body
      const t = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(t);
    } else if (mounted) {
      setVisible(false); // eslint-disable-line react-hooks/set-state-in-effect
      const t = setTimeout(() => {
        setMounted(false);
        triggerRef.current?.focus();
      }, CLOSE_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!mounted || !isOpen) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, isOpen]);

  // Close on route change
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      if (isOpen) onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Scroll lock — save and restore exact position
  useEffect(() => {
    if (isOpen) {
      savedScrollY.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, savedScrollY.current);
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Focus trap + Escape
  useEffect(() => {
    if (!visible) return;

    const panel = panelRef.current;
    // Focus close button on open
    panel?.querySelector<HTMLButtonElement>("button[aria-label='Close menu']")?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  async function handleSignOut() {
    const { createClient } = await import("@/lib/supabase/browser");
    await createClient().auth.signOut();
    onClose();
    router.refresh();
    router.push("/");
  }

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity var(--dur-fast) var(--ease)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-screen panel */}
      <div
        ref={panelRef}
        className="absolute inset-0 bg-surface flex flex-col"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          transition: `opacity var(--dur) var(--ease), transform var(--dur) var(--ease)`,
          paddingTop: "max(1.5rem, env(safe-area-inset-top, 0px))",
          paddingBottom: "max(2rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Top-right: theme toggle + close */}
        <div className="flex items-center justify-end px-5 pb-6 shrink-0">
          <ThemeToggle />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links — centred, staggered in */}
        <nav
          className="flex-1 flex flex-col items-center justify-center"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ label, href }, i) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="w-full min-h-[56px] flex items-center justify-center px-8 text-[1.375rem] font-semibold text-fg hover:text-accent transition-brand text-center"
            >
              {/* animate-nav-link-in only applied when visible so fill-mode:both
                  starts from opacity:0 (hidden by parent) then enters at opacity:1 */}
              <span
                className={visible ? "animate-nav-link-in" : ""}
                style={visible ? { animationDelay: `${80 + i * 40}ms` } : undefined}
              >
                {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Divider + CTA buttons */}
        <div className="shrink-0 px-6 pt-6 border-t border-[var(--border)]">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link href="/owner/dashboard" onClick={onClose}>
                <Button variant="outline" className="w-full justify-center">
                  Owner portal
                </Button>
              </Link>
              <Button variant="solid" className="w-full justify-center" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/sign-up?role=owner" onClick={onClose}>
                <Button variant="outline" className="w-full justify-center">
                  {COPY.nav.listProperty}
                </Button>
              </Link>
              <Link href="/sign-in" onClick={onClose}>
                <Button variant="solid" className="w-full justify-center">
                  {COPY.nav.signIn}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
