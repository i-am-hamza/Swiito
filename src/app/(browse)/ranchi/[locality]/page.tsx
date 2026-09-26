import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Home } from "lucide-react";
import {
  getLocalityBySlug,
  getLocalityProperties,
  getNearbyLocalities,
  getAreaPriceContext,
} from "@/lib/queries/properties";
import { adminClient } from "@/lib/supabase/admin";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { Accordion } from "@/components/ui/Accordion";
import { LOCALITY_COPY } from "@/lib/copy/localities";
import { formatINR } from "@/lib/utils/format";
import type { Faq } from "@/types";

export const revalidate = 3600;

type Props = { params: Promise<{ locality: string }> };

export async function generateStaticParams() {
  const { data } = await adminClient.from("localities").select("slug");
  return (data ?? []).map((l) => ({ locality: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locality } = await params;
  const loc = await getLocalityBySlug(locality);
  if (!loc) return {};
  const title =
    loc.metaTitle ?? `${loc.name} Flats & Rentals — Swiito`;
  const description =
    loc.metaDescription ??
    `Find ${loc.listingCount > 0 ? loc.listingCount + " verified" : ""} properties in ${loc.name}, Ranchi. Browse flats, rooms, PGs, and houses for rent and sale.`;
  return {
    title,
    description,
    alternates: { canonical: `https://swiito.in/ranchi/${locality}` },
  };
}

export default async function LocalityPage({ params }: Props) {
  const { locality } = await params;

  const loc = await getLocalityBySlug(locality);
  if (!loc) notFound();

  const [properties, nearby, priceCtx] = await Promise.all([
    getLocalityProperties(locality, 12),
    getNearbyLocalities(loc.id, 4),
    getAreaPriceContext(loc.id),
  ]);

  const copy = LOCALITY_COPY[locality];

  // Merge DB FAQs with static copy, deduplicating by question
  const dbFaqQs = new Set(loc.faqs.map((f) => f.question));
  const copyFaqs: Faq[] = (copy?.faqs ?? [])
    .filter((f) => !dbFaqQs.has(f.question))
    .map((f, i) => ({
      id: `copy-${i}`,
      category: locality,
      question: f.question,
      answer: f.answer,
      sortOrder: loc.faqs.length + i,
    }));
  const allFaqs = [...loc.faqs, ...copyFaqs];

  const hasPriceCtx =
    priceCtx.rentAvg != null ||
    priceCtx.saleAvg != null ||
    priceCtx.rentMin != null ||
    priceCtx.saleMin != null;

  const faqSchema =
    allFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section
          className="relative py-20 lg:py-28 overflow-hidden"
          aria-labelledby="locality-heading"
        >
          {loc.imageUrl && (
            <>
              <Image
                src={loc.imageUrl}
                alt={loc.name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />
            </>
          )}
          {!loc.imageUrl && (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--surface-2) 0%, var(--bg) 100%)",
              }}
            />
          )}

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs mb-6" aria-label="Breadcrumb">
              <Link
                href="/properties"
                className="text-white/70 hover:text-white transition-brand"
              >
                Properties
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white/90">{loc.name}</span>
            </nav>

            <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
              <MapPin size={14} aria-hidden="true" />
              <span>Ranchi, Jharkhand</span>
            </div>

            <h1
              id="locality-heading"
              className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight"
            >
              {copy?.headline ?? loc.name}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
              {copy?.lead ?? loc.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
                <Home size={14} aria-hidden="true" />
                {loc.listingCount > 0
                  ? `${loc.listingCount} listing${loc.listingCount !== 1 ? "s" : ""}`
                  : "Listings coming soon"}
              </span>
              <Link
                href={`/properties?locality=${locality}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[40px]"
              >
                Browse all
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {/* Highlights */}
            {copy?.highlights && copy.highlights.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-3">
                {copy.highlights.map((h) => (
                  <li
                    key={h}
                    className="text-xs text-white/75 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Price context ──────────────────────────────────────────────── */}
        {hasPriceCtx && (
          <section
            className="py-10 border-b border-[var(--border)]"
            style={{ backgroundColor: "var(--surface-2)" }}
            aria-labelledby="price-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="price-heading"
                className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-6"
              >
                Market prices in {loc.name}
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {priceCtx.rentMin != null && (
                  <div className="flex flex-col">
                    <dt className="text-xs text-fg-muted">Rent starts at</dt>
                    <dd className="mt-1 font-display font-bold text-xl text-fg">
                      {formatINR(priceCtx.rentMin)}
                      <span className="text-sm font-normal text-fg-muted">/mo</span>
                    </dd>
                  </div>
                )}
                {priceCtx.rentAvg != null && (
                  <div className="flex flex-col">
                    <dt className="text-xs text-fg-muted">Avg. rent</dt>
                    <dd className="mt-1 font-display font-bold text-xl text-fg">
                      {formatINR(priceCtx.rentAvg)}
                      <span className="text-sm font-normal text-fg-muted">/mo</span>
                    </dd>
                  </div>
                )}
                {priceCtx.saleMin != null && (
                  <div className="flex flex-col">
                    <dt className="text-xs text-fg-muted">Sale from</dt>
                    <dd className="mt-1 font-display font-bold text-xl text-fg">
                      {formatINR(priceCtx.saleMin)}
                    </dd>
                  </div>
                )}
                {priceCtx.saleAvg != null && (
                  <div className="flex flex-col">
                    <dt className="text-xs text-fg-muted">Avg. sale price</dt>
                    <dd className="mt-1 font-display font-bold text-xl text-fg">
                      {formatINR(priceCtx.saleAvg)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </section>
        )}

        {/* ── Market summary ─────────────────────────────────────────────── */}
        {copy?.marketSummary && (
          <section className="py-10 border-b border-[var(--border)] bg-bg">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-sm sm:text-base text-fg-muted leading-relaxed">
                {copy.marketSummary}
              </p>
            </div>
          </section>
        )}

        {/* ── Property listings ──────────────────────────────────────────── */}
        <section className="py-14 bg-bg" aria-labelledby="listings-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2
                id="listings-heading"
                className="font-display font-bold text-2xl sm:text-3xl text-fg"
              >
                {properties.length > 0
                  ? `Latest listings in ${loc.name}`
                  : `Properties in ${loc.name}`}
              </h2>
              {loc.listingCount > properties.length && (
                <Link
                  href={`/properties?locality=${locality}`}
                  className="text-sm font-medium text-accent hover:underline shrink-0 flex items-center gap-1 min-h-[44px]"
                >
                  View all
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>

            {properties.length > 0 ? (
              <PropertyGrid properties={properties} />
            ) : (
              <div className="py-16 text-center">
                <p className="text-fg-muted text-sm">
                  No listings yet in {loc.name}.
                </p>
                <Link
                  href="/properties"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  Browse all properties
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── Nearby localities ──────────────────────────────────────────── */}
        {nearby.length > 0 && (
          <section
            className="py-14 border-t border-[var(--border)]"
            style={{ backgroundColor: "var(--surface-2)" }}
            aria-labelledby="nearby-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="nearby-heading"
                className="font-display font-bold text-2xl sm:text-3xl text-fg mb-8"
              >
                Nearby localities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {nearby.map((n) => (
                  <Link
                    key={n.slug}
                    href={`/ranchi/${n.slug}`}
                    className="group relative overflow-hidden rounded-lg block transition-brand hover:shadow-lift"
                    style={{ aspectRatio: "4/3" }}
                  >
                    {n.imageUrl ? (
                      <Image
                        src={n.imageUrl}
                        alt={n.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-2" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-display font-semibold text-white text-sm">
                        {n.name}
                      </p>
                      {n.listingCount > 0 && (
                        <p className="text-white/65 text-xs mt-0.5">
                          {n.listingCount} listing{n.listingCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ ────────────────────────────────────────────────────────── */}
        {allFaqs.length > 0 && (
          <section
            className="py-14 border-t border-[var(--border)] bg-bg"
            aria-labelledby="faq-heading"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="faq-heading"
                className="font-display font-bold text-2xl sm:text-3xl text-fg mb-8"
              >
                Frequently asked questions about {loc.name}
              </h2>
              <Accordion items={allFaqs} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
