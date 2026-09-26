"use client";

import { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { MapPin } from "@/types";
import { formatPriceShort } from "@/lib/utils/format";

const RANCHI = { lat: 23.3441, lng: 85.3096 };

interface PropertyMapProps {
  pins: MapPin[];
}

export function PropertyMap({ pins }: PropertyMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full min-h-[500px] bg-surface-2 rounded-lg flex items-center justify-center">
        <p className="text-fg-muted text-sm text-center px-4">
          Map unavailable —{" "}
          <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          is not configured.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ minHeight: 520 }}>
      <APIProvider apiKey={apiKey}>
        <MapContainer pins={pins} />
      </APIProvider>
    </div>
  );
}

function MapContainer({ pins }: { pins: MapPin[] }) {
  const [selected, setSelected] = useState<MapPin | null>(null);

  return (
    <div className="relative w-full h-full" style={{ minHeight: 520 }}>
      <GoogleMap
        mapId="swiito"
        defaultCenter={RANCHI}
        defaultZoom={12}
        disableDefaultUI={false}
        clickableIcons={false}
        style={{ width: "100%", height: "100%", minHeight: 520 }}
        onClick={() => setSelected(null)}
      >
        <ClusteredPins pins={pins} onSelect={setSelected} />
      </GoogleMap>

      {selected && (
        <PreviewCard pin={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function ClusteredPins({
  pins,
  onSelect,
}: {
  pins: MapPin[];
  onSelect: (pin: MapPin) => void;
}) {
  const map = useMap();
  const clusterer = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;

    const { AdvancedMarkerElement } = google.maps.marker;

    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }

    const markers = pins.map((pin) => {
      const el = document.createElement("div");
      el.textContent = formatPriceShort(pin.displayPrice);
      Object.assign(el.style, {
        padding: "3px 9px",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: "700",
        background: pin.listingType === "sale" ? "#111827" : "#ffffff",
        color: pin.listingType === "sale" ? "#f9fafb" : "#111827",
        border: "1.5px solid #d1d5db",
        cursor: "pointer",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
        userSelect: "none",
        lineHeight: "1.6",
        transition: "transform 0.1s",
      });

      const marker = new AdvancedMarkerElement({
        position: { lat: pin.lat, lng: pin.lng },
        content: el,
      });

      marker.addListener("click", () => onSelect(pin));
      return marker;
    });

    clusterer.current.clearMarkers();
    clusterer.current.addMarkers(markers);

    return () => {
      clusterer.current?.clearMarkers();
      for (const m of markers) {
        google.maps.event.clearInstanceListeners(m);
      }
    };
  }, [map, pins, onSelect]);

  return null;
}

function PreviewCard({
  pin,
  onClose,
}: {
  pin: MapPin;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[280px] bg-surface rounded-xl border border-[var(--border)] shadow-lift overflow-hidden z-10">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
        aria-label="Close preview"
      >
        <X size={12} />
      </button>

      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        {pin.coverUrl ? (
          <Image
            src={pin.coverUrl}
            alt={pin.title}
            fill
            sizes="280px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <span className="text-fg-muted text-xs">No photo</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-bold text-fg text-sm">
          {formatPriceShort(pin.displayPrice)}
          {pin.listingType === "rent" && (
            <span className="font-normal text-fg-muted text-xs"> /mo</span>
          )}
        </p>
        <p className="text-xs text-fg mt-0.5 line-clamp-2 leading-snug">
          {pin.title}
        </p>
        <Link
          href={`/properties/${pin.slug}`}
          className="mt-2 block text-center text-xs font-medium text-accent border border-accent rounded-md py-1.5 hover:bg-accent hover:text-on-accent transition-brand"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
