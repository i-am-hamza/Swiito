"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  position?: "right" | "bottom";
}

export function Drawer({ isOpen, onClose, title, footer, children, className, position = "right" }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isBottom = position === "bottom";

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      {isBottom ? (
        /* Bottom sheet */
        <div
          className={cn(
            "absolute bottom-0 inset-x-0 bg-surface flex flex-col shadow-lift rounded-t-2xl",
            "max-h-[88vh]",
            className
          )}
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] shrink-0">
            <span className="font-display font-semibold text-fg">{title ?? "Filters"}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
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
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
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
