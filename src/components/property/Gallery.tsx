"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { PropertyImagePlaceholder } from "@/components/property/PropertyImagePlaceholder";
import type { PropertyMedia } from "@/types";

interface GalleryProps {
  media: PropertyMedia[];
  title: string;
}

export function Gallery({ media, title }: GalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [erroredIdx, setErroredIdx] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number>(0);
  const count = media.length;

  const goPrev = useCallback(
    (idx: number) => (idx - 1 + count) % count,
    [count]
  );
  const goNext = useCallback((idx: number) => (idx + 1) % count, [count]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) {
      setActive((i) => (diff > 0 ? goNext(i) : goPrev(i)));
    }
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setLightboxIdx((i) => goPrev(i));
      if (e.key === "ArrowRight") setLightboxIdx((i) => goNext(i));
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, goPrev, goNext]);

  if (!count) {
    return (
      <div
        className="w-full bg-surface-2 flex items-center justify-center"
        style={{ aspectRatio: "16/9" }}
      >
        <span className="text-fg-muted text-sm">No photos available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main image */}
      <div
        className="relative w-full overflow-hidden bg-black select-none"
        style={{ aspectRatio: "16/9" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {erroredIdx.has(active) ? (
          <PropertyImagePlaceholder type="" />
        ) : (
          <Image
            key={active}
            src={media[active].url}
            alt={`${title} — photo ${active + 1} of ${count}`}
            fill
            priority={active === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1280px"
            className="object-cover cursor-zoom-in"
            onError={() => setErroredIdx((prev) => new Set([...prev, active]))}
            onClick={() => {
              setLightboxIdx(active);
              setLightboxOpen(true);
            }}
          />
        )}

        {/* Prev / Next arrows */}
        {count > 1 && (
          <>
            <button
              onClick={() => setActive((i) => goPrev(i))}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-brand z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setActive((i) => goNext(i))}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-brand z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Count badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium tabular-nums z-10">
          {active + 1} / {count}
        </div>
      </div>

      {/* Thumbnail strip — desktop only */}
      {count > 1 && (
        <div className="hidden md:flex gap-2 px-1 mt-2 overflow-x-auto pb-1">
          {media.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn(
                "shrink-0 relative w-16 h-12 rounded overflow-hidden border-2 transition-brand",
                i === active
                  ? "border-accent"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {erroredIdx.has(i) ? (
                <PropertyImagePlaceholder type="" />
              ) : (
                <Image
                  src={m.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                  onError={() => setErroredIdx((prev) => new Set([...prev, i]))}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — lightbox`}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-brand z-20"
          >
            <X size={20} />
          </button>

          {count > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) => goPrev(i));
                }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-brand z-20"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) => goNext(i));
                }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-brand z-20"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-5xl max-h-[85vh] mx-8"
            style={{ aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={lightboxIdx}
              src={media[lightboxIdx].url}
              alt={`${title} — photo ${lightboxIdx + 1}`}
              fill
              sizes="(max-width: 1024px) 90vw, 80vw"
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tabular-nums">
            {lightboxIdx + 1} / {count}
          </div>
        </div>
      )}
    </>
  );
}
