import type { Metadata } from "next";
import { getFaqsAll } from "@/lib/queries/properties";
import { FaqClient } from "@/components/faq/FaqClient";

export const metadata: Metadata = {
  title: "FAQs — Swiito Property Ranchi",
  description:
    "Answers to common questions about finding, renting, and listing properties in Ranchi through Swiito.",
  alternates: { canonical: "https://swiito.in/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqsAll();

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <main className="min-h-screen bg-bg">
        <section className="py-16 bg-surface-2" aria-labelledby="faq-hero-heading">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              id="faq-hero-heading"
              className="font-display font-bold text-4xl text-fg"
            >
              Frequently asked questions
            </h1>
            <p className="mt-4 text-fg-muted">
              Search or browse answers below. Can&apos;t find what you&apos;re
              looking for?{" "}
              <a href="/contact" className="text-accent hover:underline">
                Contact us.
              </a>
            </p>
          </div>
        </section>

        <section className="py-16 bg-bg">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {faqs.length === 0 ? (
              <p className="text-center text-fg-muted py-16">
                No FAQs yet. Check back soon.
              </p>
            ) : (
              <FaqClient faqs={faqs} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
