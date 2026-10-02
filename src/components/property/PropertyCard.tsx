import Link from "next/link";
import { Bath, BedDouble, Maximize2 } from "lucide-react";
import type { Property } from "@/types";
import { PriceTag } from "@/components/ui/PriceTag";
import { StarRating } from "@/components/ui/StarRating";
import { HeartButton } from "@/components/property/HeartButton";
import { PropertyCardImage } from "@/components/property/PropertyCardImage";
import { PropertyImagePlaceholder } from "@/components/property/PropertyImagePlaceholder";
import { COPY } from "@/lib/copy";

interface PropertyCardProps {
  property: Property;
  shortlisted?: boolean;
  priority?: boolean;
}

const FURNISHING_LABEL: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-furnished",
  fully_furnished: "Fully furnished",
};

const TYPE_LABEL: Record<string, string> = {
  flat: "Flat",
  independent_house: "House",
  room: "Room",
  pg: "PG",
  hostel: "Hostel",
  shop: "Shop",
  office: "Office",
  plot: "Plot",
};

export function PropertyCard({ property, shortlisted, priority = false }: PropertyCardProps) {
  const cover = property.media.find((m) => m.isCover) ?? property.media[0];

  return (
    <article
      className="group relative bg-surface rounded-lg border border-[var(--border)] shadow-card overflow-hidden
        transition-brand hover:-translate-y-1 hover:shadow-lift active:scale-[.98]"
    >
      {/* Stretched link covers the full card */}
      <Link
        href={`/properties/${property.slug}`}
        className="absolute inset-0 z-[1] rounded-lg focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent outline-none"
        aria-label={property.title}
        tabIndex={0}
      />

      {/* Card content — pointer-events-none so clicks pass to the link */}
      <div className="pointer-events-none select-none">
        {/* Cover photo */}
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          {cover ? (
            <PropertyCardImage
              url={cover.url}
              alt={property.title}
              priority={priority}
              propertyType={property.propertyType}
            />
          ) : (
            <PropertyImagePlaceholder type={property.propertyType} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-black/50 text-white backdrop-blur-sm">
            {TYPE_LABEL[property.propertyType] ?? property.propertyType}
          </span>
          {property.isVerified && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 text-xs font-medium rounded-full bg-accent/90 text-on-accent backdrop-blur-sm">
              {COPY.propertyCard.verified}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2">
          <PriceTag
            amount={property.displayPrice}
            listingType={property.listingType}
            className="text-xl"
          />
          <h3 className="font-display font-semibold text-sm text-fg leading-snug line-clamp-2 group-hover:text-accent transition-brand">
            {property.title}
          </h3>
          <p className="text-xs text-fg-muted capitalize">{property.addressArea}</p>
          <div className="flex items-center gap-3 text-xs text-fg-muted mt-1">
            {property.bhk !== null && (
              <span className="flex items-center gap-1">
                <BedDouble size={13} aria-hidden="true" />
                {property.bhk} {COPY.propertyCard.bedLabel}
              </span>
            )}
            {property.bathrooms !== null && (
              <span className="flex items-center gap-1">
                <Bath size={13} aria-hidden="true" />
                {property.bathrooms} {COPY.propertyCard.bathLabel}
              </span>
            )}
            {(property.carpetAreaSqft ?? property.builtupAreaSqft) !== null && (
              <span className="flex items-center gap-1">
                <Maximize2 size={13} aria-hidden="true" />
                {property.carpetAreaSqft ?? property.builtupAreaSqft}{" "}
                {COPY.propertyCard.areaLabel}
              </span>
            )}
            {property.furnishing && (
              <span className="hidden sm:inline truncate">
                {FURNISHING_LABEL[property.furnishing]}
              </span>
            )}
          </div>
          {property.swiitoScore && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating score={property.swiitoScore} />
              <span className="text-xs text-fg-muted">
                {COPY.propertyCard.scoreLabelPrefix} {property.swiitoScore}/5
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Heart button — z-[2] sits above the stretched link */}
      <HeartButton
        propertyId={property.id}
        initialShortlisted={shortlisted ?? false}
        className="absolute top-3 right-3 z-[2]"
      />
    </article>
  );
}
