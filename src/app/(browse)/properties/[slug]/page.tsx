import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Shield, Calendar, MapPin, ChevronRight, Layers } from "lucide-react";
import { getPropertyDetail, getSimilarProperties } from "@/lib/queries/properties";
import { Gallery } from "@/components/property/Gallery";
import { ContactGate } from "@/components/property/ContactGate";
import { HeartButton } from "@/components/property/HeartButton";
import { ViewRecorder } from "@/components/property/ViewRecorder";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PriceTag } from "@/components/ui/PriceTag";
import { formatINR } from "@/lib/utils/format";

const TYPE_LABEL: Record<string, string> = {
  flat: "Flat",
  independent_house: "Independent House",
  room: "Room",
  pg: "PG",
  hostel: "Hostel",
  shop: "Shop",
  office: "Office",
  plot: "Plot",
};

const FURNISHING_LABEL: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-furnished",
  fully_furnished: "Fully Furnished",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyDetail(slug);
  if (!property) return {};

  const desc =
    property.description.slice(0, 155) ||
    `${property.bhk ? `${property.bhk} BHK ` : ""}${TYPE_LABEL[property.propertyType] ?? property.propertyType} for ${property.listingType} in ${property.addressArea}, Ranchi`;

  return {
    title: `${property.title} — Swiito`,
    description: desc,
    openGraph: {
      title: property.title,
      description: desc,
      type: "website",
      images: [
        {
          url: `https://swiito.in/og/property?slug=${slug}`,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    alternates: { canonical: `https://swiito.in/properties/${slug}` },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const property = await getPropertyDetail(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property.id, property.localityId);

  // JSON-LD — no owner data, only public facts
  const coverMedia = property.media.find((m) => m.isCover) ?? property.media[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    ...(property.description && { description: property.description }),
    url: `https://swiito.in/properties/${property.slug}`,
    image: coverMedia ? [coverMedia.url] : [],
    offers: {
      "@type": "Offer",
      price: property.displayPrice,
      priceCurrency: "INR",
    },
    ...(property.carpetAreaSqft && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.carpetAreaSqft,
        unitCode: "FTK",
      },
    }),
  };

  const breadcrumbItems = [
    { name: "Home", url: "https://swiito.in" },
    { name: "Properties", url: "https://swiito.in/properties" },
    ...(property.localitySlug
      ? [
          {
            name: property.localityName || property.localitySlug,
            url: `https://swiito.in/ranchi/${property.localitySlug}`,
          },
        ]
      : []),
    { name: property.title, url: `https://swiito.in/properties/${property.slug}` },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ViewRecorder propertyId={property.id} />

      <main className="min-h-screen bg-bg pb-28 lg:pb-0">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <nav className="flex items-center gap-1.5 text-xs text-fg-muted" aria-label="Breadcrumb">
            {/* Mobile: back link only */}
            <Link
              href="/properties"
              className="sm:hidden flex items-center gap-1 hover:text-fg transition-brand"
            >
              <ChevronRight size={12} className="rotate-180" aria-hidden="true" />
              Back to results
            </Link>
            {/* Desktop: full breadcrumb */}
            <span className="hidden sm:contents">
              <Link href="/" className="hover:text-fg transition-brand">Home</Link>
              <ChevronRight size={12} aria-hidden="true" />
              <Link href="/properties" className="hover:text-fg transition-brand">Properties</Link>
              <ChevronRight size={12} aria-hidden="true" />
              {property.localitySlug && (
                <>
                  <Link
                    href={`/ranchi/${property.localitySlug}`}
                    className="hover:text-fg transition-brand capitalize"
                  >
                    {property.localityName || property.localitySlug}
                  </Link>
                  <ChevronRight size={12} aria-hidden="true" />
                </>
              )}
              <span className="text-fg truncate max-w-[200px]">{property.title}</span>
            </span>
          </nav>
        </div>

        {/* Gallery — full bleed */}
        <Gallery media={property.media} title={property.title} />

        {/* Page body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8 items-start">
            {/* ── Main content ───────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Price row */}
              <div className="flex items-start gap-3 flex-wrap mb-3">
                <PriceTag
                  amount={property.displayPrice}
                  listingType={property.listingType}
                  className="text-3xl font-bold tabular-nums"
                />
                {property.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                    <Shield size={11} aria-hidden="true" />
                    Verified
                  </span>
                )}
                <HeartButton
                  propertyId={property.id}
                  className="ml-auto bg-surface-2 hover:bg-surface border border-[var(--border)]"
                />
              </div>

              <h1 className="font-display font-bold text-xl sm:text-2xl text-fg leading-snug mb-2">
                {property.title}
              </h1>
              <p className="text-sm text-fg-muted flex items-center gap-1 mb-8">
                <MapPin size={13} aria-hidden="true" />
                {property.addressArea}, Ranchi
              </p>

              {/* Key facts */}
              {(property.deposit ||
                property.maintenance ||
                property.availableFrom ||
                property.swiitoScore) && (
                <div className="mb-8 bg-surface rounded-xl border border-[var(--border)] overflow-hidden">
                  <dl className="divide-y divide-[var(--border)]">
                    {property.deposit && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <dt className="text-sm text-fg-muted">Deposit</dt>
                        <dd className="font-medium text-fg text-sm tabular-nums">
                          {formatINR(property.deposit)}
                        </dd>
                      </div>
                    )}
                    {property.maintenance && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <dt className="text-sm text-fg-muted">Maintenance</dt>
                        <dd className="font-medium text-fg text-sm tabular-nums">
                          {formatINR(property.maintenance)}/mo
                        </dd>
                      </div>
                    )}
                    {property.availableFrom && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <dt className="text-sm text-fg-muted flex items-center gap-1">
                          <Calendar size={13} aria-hidden="true" />
                          Available from
                        </dt>
                        <dd className="font-medium text-fg text-sm">
                          {new Date(property.availableFrom).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </dd>
                      </div>
                    )}
                    {property.swiitoScore && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <dt className="text-sm text-fg-muted">Swiito Score</dt>
                        <dd className="font-medium text-fg text-sm">
                          {property.swiitoScore} / 5
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Specs grid */}
              <div className="mb-8">
                <h2 className="font-display font-semibold text-fg mb-4">Property details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.bhk !== null && (
                    <Spec label="Bedrooms" value={`${property.bhk} BHK`} />
                  )}
                  {property.bathrooms !== null && (
                    <Spec label="Bathrooms" value={String(property.bathrooms)} />
                  )}
                  {(property.carpetAreaSqft ?? property.builtupAreaSqft) !== null && (
                    <Spec
                      label={property.carpetAreaSqft ? "Carpet area" : "Built-up area"}
                      value={`${(property.carpetAreaSqft ?? property.builtupAreaSqft)!.toLocaleString("en-IN")} sq ft`}
                    />
                  )}
                  {property.furnishing && (
                    <Spec label="Furnishing" value={FURNISHING_LABEL[property.furnishing] ?? property.furnishing} />
                  )}
                  {property.floor !== null && (
                    <Spec
                      label="Floor"
                      value={`${property.floor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`}
                    />
                  )}
                  {property.facing && (
                    <Spec label="Facing" value={property.facing} />
                  )}
                  {property.ageYears !== null && (
                    <Spec
                      label="Age"
                      value={`${property.ageYears} ${property.ageYears === 1 ? "year" : "years"}`}
                    />
                  )}
                  <Spec
                    label="Type"
                    value={TYPE_LABEL[property.propertyType] ?? property.propertyType}
                  />
                  <Spec label="Listed for" value={property.listingType === "rent" ? "Rent" : "Sale"} />
                </div>
              </div>

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display font-semibold text-fg mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <span
                        key={a}
                        className="px-3 py-1.5 text-xs font-medium bg-surface-2 text-fg rounded-full border border-[var(--border)]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h2 className="font-display font-semibold text-fg mb-4">About this property</h2>
                  <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Location */}
              <div className="mb-8">
                <h2 className="font-display font-semibold text-fg mb-3">Location</h2>
                <p className="text-sm text-fg-muted flex items-center gap-1 mb-3">
                  <MapPin size={14} aria-hidden="true" />
                  {property.addressArea}, Ranchi, Jharkhand
                </p>
                {property.localitySlug && (
                  <Link
                    href={`/ranchi/${property.localitySlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                  >
                    <Layers size={13} aria-hidden="true" />
                    Browse more in {property.localityName || property.localitySlug}
                  </Link>
                )}
              </div>

              {/* Similar properties */}
              {similar.length > 0 && (
                <div>
                  <h2 className="font-display font-semibold text-fg mb-6">Similar properties</h2>
                  <PropertyGrid properties={similar} columns={2} />
                </div>
              )}
            </div>

            {/* ── Desktop sidebar ─────────────────────────────────────────── */}
            <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0 sticky top-24">
              <ContactGate
                propertyId={property.id}
                propertyTitle={property.title}
                propertySlug={property.slug}
              />
            </aside>
          </div>
        </div>
      </main>

      {/* ── Mobile: fixed bottom bar ──────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-[var(--border)]"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="px-4 pt-3 pb-1">
          <ContactGate
            propertyId={property.id}
            propertyTitle={property.title}
            propertySlug={property.slug}
            variant="bar"
          />
        </div>
      </div>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg border border-[var(--border)] p-3">
      <p className="text-[10px] text-fg-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="font-semibold text-fg text-sm capitalize">{value}</p>
    </div>
  );
}
