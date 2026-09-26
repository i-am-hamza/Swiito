import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { COPY } from "@/lib/copy";

export const metadata: Metadata = {
  title: "How Swiito Works — Rent or Sell Property in Ranchi",
  description:
    "Learn how Swiito works for tenants and property owners in Ranchi. Browse verified listings, contact our broker, and post your property — all in a few simple steps.",
  alternates: { canonical: "https://swiito.in/how-it-works" },
};

function StepsDetail({
  steps,
}: {
  steps: readonly { step: string; title: string; body: string }[];
}) {
  return (
    <ol className="flex flex-col gap-10">
      {steps.map((s) => (
        <li key={s.step} className="flex gap-6 items-start">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0 mt-1"
            style={{ backgroundColor: "var(--accent)", color: "var(--on-accent)" }}
          >
            {s.step}
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-fg text-lg mb-2">
              {s.title}
            </h3>
            <p className="text-fg-muted leading-relaxed">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const howItWorksTabs = [
  {
    label: COPY.howItWorks.tabs.tenants,
    content: <StepsDetail steps={COPY.howItWorks.tenantSteps} />,
  },
  {
    label: COPY.howItWorks.tabs.owners,
    content: <StepsDetail steps={COPY.howItWorks.ownerSteps} />,
  },
];

const tenantFaq = [
  {
    q: "Do I need to create an account to browse listings?",
    a: "No. You can browse all approved listings without signing up. You only need an account to get the broker contact number.",
  },
  {
    q: "Will the owner see my phone number?",
    a: "No. All contact goes through Swiito's broker. The owner never receives your personal details.",
  },
  {
    q: "Is there a fee for seekers?",
    a: "Swiito does not charge seekers any fee to browse or contact us.",
  },
];

const ownerFaq = [
  {
    q: "How long does verification take?",
    a: "Our team reviews new listings before approving them. We aim to complete reviews quickly.",
  },
  {
    q: "Will my phone number be shown publicly?",
    a: "Never. Your name, phone, email, and address are never shown on the public site.",
  },
  {
    q: "How much does it cost to list?",
    a: "Listing your property on Swiito is free.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="py-20 bg-surface-2" aria-labelledby="hiw-hero-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            id="hiw-hero-heading"
            className="font-display font-bold text-4xl sm:text-5xl text-fg leading-tight"
          >
            {COPY.howItWorks.heading}
          </h1>
          <p className="mt-6 text-lg text-fg-muted">
            Swiito connects tenants and property owners in Ranchi through a
            verified, privacy-first platform.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-20 bg-bg" aria-label="Steps for tenants and owners">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={howItWorksTabs} />
        </div>
      </section>

      {/* Privacy highlight */}
      <section
        className="py-16 bg-surface-2"
        aria-labelledby="privacy-highlight-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="privacy-highlight-heading"
            className="font-display font-bold text-2xl text-fg mb-8 text-center"
          >
            Privacy is built in
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Owner phone, email, and address are never shown publicly.",
              "Seeker details are only shared with the broker, never the owner.",
              "Contact is brokered — one number for every enquiry.",
              "Your sign-up only requires an email and password — no OTP, no spam.",
            ].map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 bg-surface rounded-lg border border-[var(--border)] p-4"
              >
                <Check
                  size={16}
                  className="text-accent shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-sm text-fg-muted">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs per role */}
      <section className="py-20 bg-bg" aria-labelledby="hiw-faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            id="hiw-faq-heading"
            className="font-display font-bold text-2xl text-fg mb-12 text-center"
          >
            Common questions
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
            <div>
              <h3 className="font-display font-semibold text-fg mb-6">
                For tenants
              </h3>
              <div className="space-y-6">
                {tenantFaq.map((item) => (
                  <div key={item.q}>
                    <p className="font-medium text-fg text-sm mb-1">{item.q}</p>
                    <p className="text-sm text-fg-muted leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-display font-semibold text-fg mb-6">
                For owners
              </h3>
              <div className="space-y-6">
                {ownerFaq.map((item) => (
                  <div key={item.q}>
                    <p className="font-medium text-fg text-sm mb-1">{item.q}</p>
                    <p className="text-sm text-fg-muted leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/faq">
              <Button variant="outline">See all FAQs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section
        className="py-20"
        aria-label="Get started"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-0 sm:divide-x sm:divide-[var(--border)]">
            <div className="flex-1 sm:pr-10 text-center sm:text-left">
              <h3 className="font-display font-semibold text-fg text-xl mb-3">
                Looking for a place?
              </h3>
              <p className="text-fg-muted text-sm mb-6">
                Browse verified listings across Ranchi and contact our broker.
              </p>
              <Link href="/properties">
                <Button variant="solid">Browse listings</Button>
              </Link>
            </div>
            <div className="flex-1 sm:pl-10 text-center sm:text-left">
              <h3 className="font-display font-semibold text-fg text-xl mb-3">
                Own a property?
              </h3>
              <p className="text-fg-muted text-sm mb-6">
                List it for free. We verify and publish it. Your number stays private.
              </p>
              <Link href="/sign-up?role=owner">
                <Button variant="solid">List your property</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
