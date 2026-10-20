"use client";

import { useRef } from "react";
import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/format";

const lsKey = (id: string) => `swiito_sl_${id}`;

interface HeartButtonProps {
  propertyId: string;
  initialShortlisted?: boolean;
  className?: string;
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

export function HeartButton({ propertyId, initialShortlisted = false, className }: HeartButtonProps) {
  const iconWrapRef = useRef<HTMLSpanElement>(null);

  const shortlisted = useSyncExternalStore(
    subscribe,
    () => { try { return localStorage.getItem(lsKey(propertyId)) === "1"; } catch { return false; } },
    () => initialShortlisted
  );

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !shortlisted;

    if (next) {
      // Bounce on add — restart CSS animation on the wrapper
      const el = iconWrapRef.current;
      if (el) {
        el.style.animation = "none";
        void el.offsetHeight;
        el.style.animation = "heart-pop 300ms var(--ease) both";
      }
    }

    try {
      if (next) {
        localStorage.setItem(lsKey(propertyId), "1");
      } else {
        localStorage.removeItem(lsKey(propertyId));
      }
      window.dispatchEvent(new StorageEvent("storage", { key: lsKey(propertyId) }));
    } catch {}
  }

  return (
    <button
      onClick={handleClick}
      aria-label={shortlisted ? "Remove from shortlist" : "Save to shortlist"}
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-full transition-brand",
        "bg-black/40 hover:bg-black/60 backdrop-blur-sm",
        className
      )}
    >
      <span ref={iconWrapRef} className="flex items-center justify-center">
        <Heart
          size={16}
          className={cn(shortlisted ? "fill-red-500 text-red-500" : "text-white")}
          style={{ transition: "fill var(--dur) var(--ease), color var(--dur) var(--ease)" }}
        />
      </span>
    </button>
  );
}
