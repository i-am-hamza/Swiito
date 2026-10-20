"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/format";
import { PropertyImagePlaceholder } from "./PropertyImagePlaceholder";

interface Props {
  url: string;
  alt: string;
  priority?: boolean;
  propertyType: string;
  className?: string;
}

export function PropertyCardImage({ url, alt, priority, propertyType, className }: Props) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(!!priority);

  if (errored) {
    return <PropertyImagePlaceholder type={propertyType} />;
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={cn("object-cover", className)}
      style={
        priority
          ? undefined
          : {
              opacity: loaded ? 1 : 0,
              // combine opacity fade-in + transform for the hover scale
              transition: "opacity var(--dur-slow) var(--ease), transform var(--dur-slow) var(--ease)",
            }
      }
      priority={priority}
      onLoad={() => setLoaded(true)}
      onError={() => setErrored(true)}
    />
  );
}
