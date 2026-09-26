import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Eye, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Swiito — Verified Properties in Ranchi",
  description:
    "Swiito is a property brokerage platform for Ranchi. We verify every listing before it goes live and keep your contact details private.",
  alternates: { canonical: "https://swiito.in/about" },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="py-20 bg-surface-2" aria-labelledby="about-hero-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-4">
            About Swiito
          </p>
          <h1
            id="about-hero-heading"
            className="font-display font-bold text-4xl sm:text-5xl text-fg leading-tight"
          >
            Finding a home in Ranchi should be simple.
          </h1>
          <p className="mt-6 text-lg text-fg-muted leading-relaxed">
            Swiito is a property listing platform built for Ranchi. We verify every
            listing before it goes live, broker all contact through one number, and
            keep your personal details off the internet.
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="py-20 bg-bg" aria-labelledby="what-we-do-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="what-we-do-heading"
            className="font-display font-bold text-3xl text-fg text-center mb-14"
          >
            What we do
          </h2>
          <div className="grid sm:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
              >
                <ShieldCheck size={22} className="text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-fg text-base">
                Verified listings
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed">
                Every listing is reviewed by our team before it appears on the site.
                Photos must be real. Details must match the property.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
              >
                <Eye size={22} className="text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-fg text-base">
                Privacy by default
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed">
                Owner names, phone numbers, and addresses are never shown publicly.
                Seekers call Swiito&apos;s broker — not the owner directly.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
              >
                <Phone size={22} className="text-accent" aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-fg text-base">
                One number to call
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed">
                All enquiries come through Swiito. You get the same broker number
                for every property. No spam, no cold calls from strangers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our promise */}
      <section
        className="py-20"
        aria-labelledby="promise-heading"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="promise-heading"
            className="font-display font-bold text-3xl text-fg text-center mb-10"
          >
            Our promise
          </h2>
          <ul className="space-y-4">
            {[
              "We check every listing before it goes live.",
              "Owner contact details are never shown to seekers.",
              "Seeker contact details are never shown to owners.",
              "Listing photos must show the actual property.",
              "We never charge seekers a commission.",
              "Listings are free to post for owners.",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-fg-muted">
                <Check
                  size={16}
                  className="text-accent shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-bg text-center" aria-label="Get started">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="font-display font-bold text-2xl text-fg mb-6">
            Ready to find your next home?
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/properties">
              <Button variant="solid" size="lg">
                Browse properties
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Talk to us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
