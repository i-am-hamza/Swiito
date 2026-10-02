import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Camera,
  Lock,
  MapPin,
  CheckCircle,
  Phone,
  Check,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSearchBar } from "@/components/layout/HeroSearchBar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Tabs } from "@/components/ui/Tabs";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import {
  getFeaturedProperties,
  getRecentProperties,
  getLocalities,
  getValueProps,
  getFaqs,
  getTestimonials,
} from "@/lib/queries/properties";
import { COPY } from "@/lib/copy";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import type { ValueProp } from "@/types";

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Swiito — Verified Properties in Ranchi",
  description:
    "Find verified flats, rooms, PGs, and houses for rent and sale in Ranchi. All enquiries go through Swiito's broker — your details stay private.",
  alternates: { canonical: "https://swiito.in" },
};

/* ── Icon map for value props ─────────────────────────────────────────────── */
const ICON_MAP: Record<
  string,
  React.ComponentType<{ size: number; className?: string }>
> = {
  ShieldCheck,
  Camera,
  Lock,
  MapPin,
  CheckCircle,
  Phone,
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const [featured, recent, localities, valueProps, faqs, testimonials, settings, supabase] =
    await Promise.all([
      getFeaturedProperties(6),
      getRecentProperties(6),
      getLocalities(),
      getValueProps(),
      getFaqs(5),
      getTestimonials(),
      getSiteSettings(),
      createClient(),
    ]);
  const { data: { user } } = await supabase.auth.getUser();

  const whatsappHref = `https://wa.me/${settings.broker_whatsapp}?text=Hi%20Swiito%2C%20I%27m%20looking%20for%20a%20place%20in%20Ranchi`;

  const howItWorksTabs = [
    {
      label: COPY.howItWorks.tabs.tenants,
      content: <StepsGrid steps={COPY.howItWorks.tenantSteps} />,
    },
    {
      label: COPY.howItWorks.tabs.owners,
      content: <StepsGrid steps={COPY.howItWorks.ownerSteps} />,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Swiito",
    url: "https://swiito.in",
    telephone: settings.broker_phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ranchi",
      addressRegion: "Jharkhand",
      addressCountry: "IN",
    },
  };

  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Swiito",
    url: "https://swiito.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://swiito.in/properties?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header user={user ? { id: user.id, email: user.email } : null} />
      <main>
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center text-center px-4"
          style={{ paddingTop: "var(--safe-top)" }}
          aria-label="Find a home in Ranchi"
        >
          {/* LCP hero image */}
          <Image
            src="/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          {/* Base gradient — dark throughout for glass pill legibility */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/60 to-black/80"
            aria-hidden="true"
          />
          {/* Extra scrim behind headline + search band */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 110% 55% at 50% 48%, rgba(0,0,0,0.38), transparent)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-4xl mx-auto w-full">
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-[3.5rem] text-white leading-tight tracking-tight">
              {COPY.hero.headline}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-xl mx-auto">
              {COPY.hero.subheadline}
            </p>

            <div className="flex justify-center w-full">
              <HeroSearchBar
                localities={localities.map((l) => ({
                  slug: l.slug,
                  name: l.name,
                  listingCount: l.listingCount,
                }))}
              />
            </div>

            {/* Quick-filter type pills — horizontally scrollable on mobile */}
            <div
              className="mt-4 flex items-center gap-2 overflow-x-auto pb-1
                sm:flex-wrap sm:justify-center sm:overflow-x-visible
                [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
              style={{ WebkitMaskImage: undefined }}
              aria-label="Browse by property type"
            >
              {[
                { label: "Flat",  value: "flat" },
                { label: "Room",  value: "room" },
                { label: "PG",    value: "pg" },
                { label: "House", value: "independent_house" },
                { label: "Shop",  value: "shop" },
              ].map((t) => (
                <Link
                  key={t.value}
                  href={`/properties?type=${t.value}`}
                  className="shrink-0 inline-flex items-center px-4 py-2 rounded-full
                    bg-white/15 text-white text-xs font-medium border border-white/25
                    hover:bg-white/28 transition-brand min-h-[36px] whitespace-nowrap
                    first:ml-4 last:mr-4 sm:first:ml-0 sm:last:mr-0"
                >
                  {t.label}
                </Link>
              ))}
            </div>

            {/* Trust markers */}
            <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 list-none">
              {COPY.hero.trust.map((marker) => (
                <li
                  key={marker}
                  className="flex items-center gap-2 text-sm text-white/80"
                >
                  <Check
                    size={14}
                    className="text-white/60 shrink-0"
                    aria-hidden="true"
                  />
                  {marker}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FEATURED PROPERTIES ───────────────────────────────────────── */}
        {featured.length > 0 && (
          <section className="py-20 bg-bg" aria-labelledby="featured-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader
                id="featured-heading"
                title={COPY.featured.heading}
                ctaLabel={COPY.featured.viewAll}
                ctaHref="/properties?featured=true"
              />
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── BROWSE BY LOCALITY ────────────────────────────────────────── */}
        <section
          className="py-20 bg-surface-2"
          aria-labelledby="locality-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              id="locality-heading"
              title={COPY.locality.heading}
              ctaLabel={COPY.locality.allLocalities}
              ctaHref="/properties"
            />
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {localities.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/properties?locality=${loc.slug}`}
                  className="group relative overflow-hidden rounded-lg aspect-square block transition-brand hover:shadow-lift"
                >
                  <Image
                    src={loc.imageUrl}
                    alt={loc.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[420ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display font-semibold text-white text-base">
                      {loc.name}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">
                      {loc.listingCount > 0
                        ? `${loc.listingCount} ${COPY.locality.listingsSuffix}`
                        : COPY.locality.comingSoon}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline min-h-[44px]"
              >
                {COPY.locality.allLocalities}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
        <section
          className="py-20 bg-bg"
          aria-labelledby="how-it-works-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2
              id="how-it-works-heading"
              className="font-display font-bold text-3xl sm:text-4xl text-fg text-center"
            >
              {COPY.howItWorks.heading}
            </h2>
            <div className="mt-10">
              <Tabs tabs={howItWorksTabs} />
            </div>
          </div>
        </section>

        {/* ── WHY SWIITO ────────────────────────────────────────────────── */}
        {valueProps.length > 0 && (
          <section
            className="py-20 bg-surface-2"
            aria-labelledby="why-swiito-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="why-swiito-heading"
                className="font-display font-bold text-3xl sm:text-4xl text-fg text-center"
              >
                {COPY.whySwiito.heading}
              </h2>
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {valueProps.map((vp) => (
                  <ValuePropCard key={vp.id} vp={vp} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── OWNER BAND ────────────────────────────────────────────────── */}
        <section
          className="py-20 bg-accent text-on-accent"
          aria-labelledby="owner-band-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              <div className="flex-1">
                <h2
                  id="owner-band-heading"
                  className="font-display font-bold text-3xl sm:text-4xl leading-tight text-on-accent"
                >
                  {COPY.ownerBand.heading}
                </h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {COPY.ownerBand.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm text-on-accent/80"
                    >
                      <Check
                        size={16}
                        className="text-on-accent shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <Link href="/sign-up?role=owner">
                  <Button
                    variant="solid"
                    size="lg"
                    className="w-full sm:w-auto bg-surface text-accent hover:bg-surface-2 border-0"
                  >
                    {COPY.ownerBand.primaryCta}
                  </Button>
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium rounded-full border border-on-accent/30 text-on-accent hover:bg-on-accent/10 transition-brand min-h-[52px]"
                >
                  <MessageSquare size={18} aria-hidden="true" />
                  {COPY.ownerBand.secondaryCta}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── RECENTLY ADDED — hidden under 3 items ─────────────────────── */}
        {recent.length >= 3 && (
          <section className="py-20 bg-bg" aria-labelledby="recent-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionHeader
                id="recent-heading"
                title={COPY.recentlyAdded.heading}
                ctaLabel={COPY.recentlyAdded.viewAll}
                ctaHref="/properties?sort=newest"
              />
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recent.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS — renders nothing when array is empty ─────────── */}
        {testimonials.length > 0 && (
          <section
            className="py-20 bg-surface-2"
            aria-labelledby="testimonials-heading"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="testimonials-heading"
                className="font-display font-bold text-3xl text-fg text-center"
              >
                What people say
              </h2>
            </div>
          </section>
        )}

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        {faqs.length > 0 && (
          <section
            className="py-20 bg-surface-2"
            aria-labelledby="faq-heading"
          >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2
                id="faq-heading"
                className="font-display font-bold text-3xl sm:text-4xl text-fg text-center"
              >
                {COPY.faq.heading}
              </h2>
              <div className="mt-10">
                <Accordion items={faqs} />
              </div>
              <div className="mt-8 text-center">
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline min-h-[44px]"
                >
                  {COPY.faq.viewAll}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />

      {/* ── FLOATING WHATSAPP ─────────────────────────────────────────────── */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={COPY.whatsapp.ariaLabel}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-lift hover:scale-110 transition-brand"
        style={{ backgroundColor: "#25D366" }}
      >
        <WhatsAppIcon />
      </a>
    </>
  );
}

/* ── Sub-components (server) ──────────────────────────────────────────────── */

function SectionHeader({
  id,
  title,
  ctaLabel,
  ctaHref,
}: {
  id: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2
        id={id}
        className="font-display font-bold text-3xl sm:text-4xl text-fg"
      >
        {title}
      </h2>
      <Link
        href={ctaHref}
        className="text-sm font-medium text-accent hover:underline shrink-0 min-h-[44px] flex items-center"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function StepsGrid({
  steps,
}: {
  steps: readonly { step: string; title: string; body: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {steps.map((s) => (
        <div key={s.step} className="flex flex-col gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
          >
            {s.step}
          </div>
          <div>
            <h3 className="font-display font-semibold text-fg text-base">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-fg-muted leading-relaxed">
              {s.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ValuePropCard({ vp }: { vp: ValueProp }) {
  const Icon = ICON_MAP[vp.icon];
  return (
    <div className="flex flex-col gap-3">
      {Icon && (
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--accent) 12%, transparent)",
          }}
        >
          <Icon size={20} className="text-accent" />
        </div>
      )}
      <h3 className="font-display font-semibold text-fg text-base">
        {vp.title}
      </h3>
      <p className="text-sm text-fg-muted leading-relaxed">{vp.body}</p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="w-7 h-7"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
