import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Grievance Officer — Swiito",
  description:
    "Contact Swiito's Grievance Officer for complaints, data requests, or legal notices.",
  alternates: { canonical: "https://swiito.in/legal/grievance" },
};

const EFFECTIVE_DATE = "1 October 2024";

export default function GrievancePage() {
  return (
    <main className="min-h-screen bg-bg">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-display font-bold text-4xl text-fg mb-4">
            Grievance Redressal
          </h1>
          <p className="text-sm text-fg-muted">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        {/* Grievance Officer block */}
        <section
          className="mb-12 bg-surface rounded-xl border border-[var(--border)] p-6"
          aria-labelledby="grievance-officer-heading"
        >
          <h2
            id="grievance-officer-heading"
            className="font-display font-semibold text-lg text-fg mb-4"
          >
            Grievance Officer
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex gap-3">
              <dt className="text-fg-muted w-20 shrink-0">Name</dt>
              <dd className="text-fg font-medium">
                &laquo;TO CONFIRM: Grievance Officer full name&raquo;
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-fg-muted w-20 shrink-0">Designation</dt>
              <dd className="text-fg">
                Grievance Officer, Swiito &laquo;TO CONFIRM: exact title&raquo;
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="text-fg-muted w-20 shrink-0">Address</dt>
              <dd className="text-fg">
                &laquo;TO CONFIRM: registered address, Ranchi, Jharkhand,
                India&raquo;
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="text-fg-muted w-20 shrink-0">Email</dt>
              <dd>
                <a
                  href="mailto:grievance@swiito.in"
                  className="text-accent hover:underline flex items-center gap-1.5 text-sm"
                >
                  <Mail size={14} aria-hidden="true" />
                  &laquo;TO CONFIRM: grievance@swiito.in or actual email&raquo;
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="text-fg-muted w-20 shrink-0">Phone</dt>
              <dd>
                <a
                  href="tel:+917488459279"
                  className="text-accent hover:underline flex items-center gap-1.5 text-sm"
                >
                  <Phone size={14} aria-hidden="true" />
                  &laquo;TO CONFIRM: dedicated grievance phone number&raquo;
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-fg-muted">
            Response time: we aim to acknowledge grievances within 48 hours
            &laquo;TO CONFIRM&raquo; and resolve them within 30 days
            &laquo;TO CONFIRM&raquo; of receipt.
          </p>
        </section>

        <div className="prose-legal">
          <Section title="1. Purpose">
            <p>
              Swiito (&laquo;TO CONFIRM: registered entity name&raquo;) is
              committed to addressing user complaints in a fair and timely manner,
              in accordance with applicable Indian law, including the Information
              Technology Act 2000 and rules made thereunder.
              &laquo;TO CONFIRM: also Digital Personal Data Protection Act
              2023 applicability&raquo;
            </p>
          </Section>

          <Section title="2. What you can report">
            <ul>
              <li>
                Content that is unlawful, offensive, defamatory, or violates
                another person&apos;s rights.
              </li>
              <li>
                Fraudulent or misleading listings.
              </li>
              <li>
                Violations of your privacy or unauthorised use of your personal
                data.
              </li>
              <li>
                Requests to access, correct, or delete your personal data
                (data subject rights under applicable law).
              </li>
              <li>
                Any other complaint about the operation of the Swiito platform.
              </li>
            </ul>
          </Section>

          <Section title="3. How to file a grievance">
            <p>
              Email the Grievance Officer at the address above with:
            </p>
            <ul>
              <li>Your full name and contact details.</li>
              <li>
                A clear description of your complaint and the relevant URL or
                content, where applicable.
              </li>
              <li>Any supporting documents or screenshots.</li>
            </ul>
            <p>
              Grievances should be submitted in English or Hindi.
              &laquo;TO CONFIRM&raquo;
            </p>
          </Section>

          <Section title="4. Process">
            <p>
              On receiving a grievance, we will:
            </p>
            <ol>
              <li>
                Acknowledge receipt within 48 hours.
                &laquo;TO CONFIRM: exact acknowledgement timeline&raquo;
              </li>
              <li>
                Investigate the complaint and take appropriate action, which may
                include removing content, suspending an account, or referring the
                matter to law enforcement.
              </li>
              <li>
                Communicate our decision to you within 30 days of receipt, unless
                the matter requires further investigation.
                &laquo;TO CONFIRM: resolution timeline&raquo;
              </li>
            </ol>
          </Section>

          <Section title="5. Escalation">
            <p>
              If you are not satisfied with our response, you may escalate your
              complaint to the relevant government authority.
              &laquo;TO CONFIRM: name of applicable authority under Indian law,
              e.g. Data Protection Board under DPDPA 2023&raquo;
            </p>
          </Section>

          <Section title="6. Related policies">
            <p>
              Please also read our{" "}
              <a href="/legal/privacy" className="text-accent hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/legal/terms" className="text-accent hover:underline">
                Terms of Use
              </a>
              .
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
      <div className="space-y-3 text-sm text-fg-muted leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_strong]:text-fg [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
