"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const divRef = useRef<HTMLDivElement>(null);
  const prevPathname = useRef<string | null>(null);

  useLayoutEffect(() => {
    // Skip on first mount — never animate above-the-fold content on initial load
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    const div = divRef.current;
    if (!div) return;
    // Restart CSS animation: remove → reflow → re-apply
    div.style.animation = "none";
    void div.offsetHeight;
    div.style.animation = "page-enter var(--dur) var(--ease) both";
    // Clear after animation so fill-mode:both doesn't freeze transform:translateY(0)
    // on the element. A frozen transform creates a stacking context that breaks
    // all position:fixed children (header, mobile nav, search sheet).
    const t = setTimeout(() => { div.style.animation = ""; }, 280);
    return () => clearTimeout(t);
  }, [pathname]);

  return <div ref={divRef}>{children}</div>;
}
