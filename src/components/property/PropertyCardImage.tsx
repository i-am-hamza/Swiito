"use client";

import { useState } from "react";
import Image from "next/image";
import { PropertyImagePlaceholder } from "./PropertyImagePlaceholder";

interface Props {
  url: string;
  alt: string;
  priority?: boolean;
  propertyType: string;
}

export function PropertyCardImage({ url, alt, priority, propertyType }: Props) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <PropertyImagePlaceholder type={propertyType} />;
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover"
      priority={priority}
      onError={() => setErrored(true)}
    />
  );
}
