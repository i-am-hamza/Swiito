import Link from "next/link";
import { Phone } from "lucide-react";
import { COPY } from "@/lib/copy";

interface FooterSettings {
  broker_display?: string;
  broker_phone?: string;
  instagram_url?: string;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer({ settings }: { settings?: FooterSettings }) {
  const instagramUrl = settings?.instagram_url ?? COPY.footer.instagram;
  const brokerDisplay = settings?.broker_display ?? COPY.footer.brokerNumber;
  const brokerPhone =
    settings?.broker_phone ?? COPY.footer.brokerNumber.replace(/\s/g, "");

  return (
    <footer
      className="bg-surface border-t border-[var(--border)]"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display font-bold text-xl text-fg">
              Swiito
            </span>
            <p className="mt-3 text-sm text-fg-muted leading-relaxed">
              {COPY.footer.tagline}
            </p>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-fg-muted hover:text-accent transition-brand text-sm min-h-[44px]"
              aria-label="Swiito on Instagram"
            >
              <InstagramIcon className="w-[18px] h-[18px]" />
              Instagram
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-4">
              Quick links
            </h3>
            <ul className="flex flex-col gap-3">
              {COPY.footer.nav.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-fg-muted hover:text-fg transition-brand min-h-[44px] flex items-center"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Localities */}
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-4">
              Localities
            </h3>
            <ul className="flex flex-col gap-3">
              {COPY.footer.localities.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-fg-muted hover:text-fg transition-brand min-h-[44px] flex items-center"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & legal */}
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-4">
              {COPY.footer.brokerLabel}
            </h3>
            <a
              href={`tel:${brokerPhone}`}
              className="flex items-center gap-2 text-sm text-fg hover:text-accent transition-brand min-h-[44px]"
            >
              <Phone size={15} aria-hidden="true" />
              {brokerDisplay}
            </a>
            <div className="mt-6 flex flex-col gap-3">
              {COPY.footer.legal.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-fg-muted hover:text-fg transition-brand"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-fg-muted">{COPY.footer.copyright}</p>
          <p className="text-xs text-fg-muted">
            Properties in Ranchi, Jharkhand, India
          </p>
        </div>
      </div>
    </footer>
  );
}
