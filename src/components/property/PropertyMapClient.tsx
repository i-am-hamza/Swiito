"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/types";

const DynamicMap = dynamic(
  () => import("@/components/property/PropertyMap").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full bg-surface-2 rounded-lg animate-pulse"
        style={{ minHeight: 520 }}
      />
    ),
  }
);

export function PropertyMapClient({ pins }: { pins: MapPin[] }) {
  return <DynamicMap pins={pins} />;
}
