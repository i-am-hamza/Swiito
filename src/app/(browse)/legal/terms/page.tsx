import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — Swiito",
  description: "Terms and conditions for using Swiito property listings in Ranchi.",
  alternates: { canonical: "https://swiito.in/legal/terms" },
};

const EFFECTIVE_DATE = "1 October 2024";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-display font-bold text-4xl text-fg mb-4">
            Terms of Use
          </h1>
          <p className="text-sm text-fg-muted">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="prose-legal">
          <Section title="1. Acceptance">
            <p>
              By accessing or using Swiito (&ldquo;the platform&rdquo;, operated
              by &laquo;TO CONFIRM: registered entity name&raquo;), you agree to
              these Terms of Use. If you do not agree, do not use the platform.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old to create an account on Swiito.
              By registering, you confirm that the information you provide is
              accurate and up to date.
            </p>
          </Section>

          <Section title="3. Owner accounts">
            <ul>
              <li>
                You may post listings only for properties you own or are
                authorised to list.
              </li>
              <li>
                Listings must include real photographs of the actual property.
                Stock images or images of other properties are not permitted.
              </li>
              <li>
                Property details (location, price, size, condition) must be
                accurate and not materially misleading.
              </li>
              <li>
                You acknowledge that Swiito will review and may reject or modify
                any listing at its discretion before it goes live.
              </li>
              <li>
                The display price shown publicly is set by Swiito&apos;s admin
                team; your asking price is kept private.
              </li>
              <li>
                You agree to notify Swiito promptly when a property is no longer
                available (rented, sold, or withdrawn).
              </li>
            </ul>
          </Section>

          <Section title="4. Seeker accounts">
            <ul>
              <li>
                You may use the platform to browse properties and request broker
                contact information.
              </li>
              <li>
                Swiito provides the broker&apos;s contact number for legitimate
                property enquiries. Misuse of this number (harassment, spam,
                fraud) is prohibited.
              </li>
              <li>
                You may not scrape, copy, or commercially redistribute listing
                data from Swiito.
              </li>
            </ul>
          </Section>

          <Section title="5. Prohibited conduct">
            <p>The following are prohibited on the platform:</p>
            <ul>
              <li>Posting false, fraudulent, or duplicate listings.</li>
              <li>Collecting or attempting to collect other users&apos; contact details.</li>
              <li>Impersonating another person or organisation.</li>
              <li>
                Using the platform for any unlawful purpose or in violation of
                applicable Indian law.
              </li>
              <li>Attempting to bypass or compromise our security measures.</li>
            </ul>
          </Section>

          <Section title="6. Intellectual property">
            <p>
              By posting photos and content to Swiito, you grant us a
              non-exclusive, royalty-free licence to display that content on the
              platform for the purpose of operating the listing service.
            </p>
            <p>
              All other content on Swiito — design, code, copy — is owned by or
              licensed to Swiito and may not be reproduced without permission.
            </p>
          </Section>

          <Section title="7. Disclaimers">
            <p>
              Swiito verifies listings before publication but does not guarantee
              the accuracy of listing details, the condition of properties, or
              the identity of owners. All property transactions are between the
              owner and the prospective tenant or buyer; Swiito is not a party to
              any such transaction.
            </p>
            <p>
              THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF
              ANY KIND. &laquo;TO CONFIRM: specific disclaimers under Indian
              contract law&raquo;
            </p>
          </Section>

          <Section title="8. Limitation of liability">
            <p>
              To the maximum extent permitted by law, Swiito shall not be liable
              for any indirect, incidental, or consequential loss arising from
              your use of the platform or any transaction facilitated through it.
              &laquo;TO CONFIRM: jurisdiction and applicable liability cap&raquo;
            </p>
          </Section>

          <Section title="9. Account termination">
            <p>
              We reserve the right to suspend or terminate any account that
              violates these terms, at our sole discretion and without prior
              notice. You may delete your account at any time through your account
              settings.
            </p>
          </Section>

          <Section title="10. Governing law">
            <p>
              These terms are governed by the laws of India. &laquo;TO CONFIRM:
              specific jurisdiction — e.g. courts of Jharkhand / Ranchi&raquo;
            </p>
          </Section>

          <Section title="11. Changes">
            <p>
              We may update these terms from time to time. Continued use of the
              platform after changes are posted constitutes acceptance of the
              revised terms.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For questions about these terms, see our{" "}
              <a href="/legal/grievance" className="text-accent hover:underline">
                Grievance page
              </a>{" "}
              or email &laquo;TO CONFIRM: legal contact email&raquo;.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-display font-semibold text-xl text-fg mb-4">{title}</h2>
      <div className="space-y-3 text-sm text-fg-muted leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-fg [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
