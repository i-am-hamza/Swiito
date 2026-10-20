"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/format";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ScrollArea({ children, className, ...rest }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setFadeTop(el.scrollTop > 8);
    setFadeBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 8);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return (
    <div
      {...rest}
      ref={ref}
      onScroll={update}
      data-fade-top={fadeTop ? "1" : undefined}
      data-fade-bottom={fadeBottom ? "1" : undefined}
      className={cn("scroll-area", className)}
    >
      {children}
    </div>
  );
}
