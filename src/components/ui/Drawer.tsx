"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { ScrollArea } from "@/components/ui/ScrollArea";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  position?: "right" | "bottom";
}

const CLOSE_MS = 160;
const DISMISS_THRESHOLD = 100;

export function Drawer({ isOpen, onClose, title, footer, children, className, position = "right" }: DrawerProps) {
  const isBottom = position === "bottom";

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Mount → double-rAF → visible
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(t);
    } else if (mounted) {
      setVisible(false); // eslint-disable-line react-hooks/set-state-in-effect
      const t = setTimeout(() => setMounted(false), CLOSE_MS);
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

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Drag handlers for bottom sheet
  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  }
  function onTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - startY.current;
    setDragY(delta < 0 ? delta * 0.15 : delta); // rubber-band upward
  }
  function onTouchEnd() {
    setIsDragging(false);
    if (dragY > DISMISS_THRESHOLD) {
      onClose();
    }
    setDragY(0);
  }

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity var(--dur-fast) var(--ease)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {isBottom ? (
        /* Bottom sheet — slides up */
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 bg-surface flex flex-col shadow-lift rounded-t-2xl max-h-[88vh]",
            className
          )}
          style={{
            transform: visible ? `translateY(${dragY}px)` : "translateY(100%)",
            transition: isDragging ? "none" : `transform ${visible ? "var(--dur)" : "var(--dur-fast)"} var(--ease)`,
            paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Grab handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing" aria-hidden="true">
            <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] shrink-0">
            <span className="font-display font-semibold text-fg">{title ?? "Filters"}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
            >
              <X size={20} />
            </button>
          </div>
          <ScrollArea className="flex-1 px-5 py-5">{children}</ScrollArea>
          {footer && (
            <div className="shrink-0 px-5 py-4 border-t border-[var(--border)] bg-surface">
              {footer}
            </div>
          )}
        </div>
      ) : (
        /* Side drawer */
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-surface flex flex-col shadow-lift",
            className
          )}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(100%)",
            transition: `opacity var(--dur-fast) var(--ease), transform ${visible ? "var(--dur)" : "var(--dur-fast)"} var(--ease)`,
          }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <span className="font-display font-semibold text-fg">{title ?? "Menu"}</span>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
            >
              <X size={20} />
            </button>
          </div>
          <ScrollArea className="flex-1 px-6 py-6">{children}</ScrollArea>
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-[var(--border)]">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
