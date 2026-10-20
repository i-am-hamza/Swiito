"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { ScrollArea } from "@/components/ui/ScrollArea";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const CLOSE_MS = 160;

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

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
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity var(--dur-fast) var(--ease)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg bg-surface rounded-xl shadow-lift flex flex-col max-h-[90vh]",
          className
        )}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.96)",
          transition: `opacity var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)`,
        }}
      >
        {(title || true) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
            <span className="font-display font-semibold text-fg">{title}</span>
            <button
              onClick={onClose}
              aria-label="Close"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-brand"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <ScrollArea className="flex-1 px-6 py-6">{children}</ScrollArea>
        {footer && (
          <div className="shrink-0 px-6 py-4 border-t border-[var(--border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
