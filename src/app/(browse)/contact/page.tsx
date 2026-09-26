import type { Metadata } from "next";
import type React from "react";
import { Phone, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/queries/settings";
import { ContactForm } from "@/components/contact/ContactForm";
import { INSTAGRAM_PINK } from "@/lib/utils/brand";

export const metadata: Metadata = {
  title: "Contact Swiito — Get in Touch",
  description:
    "Reach Swiito's broker by phone, WhatsApp, or Instagram. We cover properties in Ranchi, Jharkhand.",
  alternates: { canonical: "https://swiito.in/contact" },
};

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const whatsappHref = `https://wa.me/${settings.broker_whatsapp}?text=Hi%20Swiito%2C%20I%27d%20like%20to%20enquire%20about%20a%20property`;

  return (
    <main className="min-h-screen bg-bg">
      {/* Header */}
      <section className="py-16 bg-surface-2" aria-labelledby="contact-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            id="contact-heading"
            className="font-display font-bold text-4xl text-fg"
          >
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-fg-muted">
            We cover properties in Ranchi, Jharkhand. Reach us by phone,
            WhatsApp, or send a message below.
          </p>
        </div>
      </section>

      <section className="py-16 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Contact channels */}
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-fg text-xl mb-6">
                Contact us directly
              </h2>

              <a
                href={`tel:${settings.broker_phone}`}
                className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-[var(--border)] hover:bg-surface-2 transition-brand min-h-[72px]"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
                >
                  <Phone size={18} className="text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-0.5">Phone</p>
                  <p className="font-medium text-fg">{settings.broker_display}</p>
                </div>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-[var(--border)] hover:bg-surface-2 transition-brand min-h-[72px]"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#25D36620" }}
                >
                  <MessageCircle size={18} style={{ color: "#25D366" }} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-0.5">WhatsApp</p>
                  <p className="font-medium text-fg">{settings.broker_display}</p>
                </div>
              </a>

              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-[var(--border)] hover:bg-surface-2 transition-brand min-h-[72px]"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${INSTAGRAM_PINK} 12%, transparent)` }}
                >
                  <InstagramIcon className="w-[18px] h-[18px]" style={{ color: INSTAGRAM_PINK }} />
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-0.5">Instagram</p>
                  <p className="font-medium text-fg">@swiito</p>
                </div>
              </a>

              <p className="text-xs text-fg-muted pt-2">
                We cover Ranchi, Jharkhand. Response times may vary on weekends
                and public holidays.
              </p>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
