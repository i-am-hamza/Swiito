import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Swiito",
  description: "How Swiito collects, uses, and protects your personal data.",
  alternates: { canonical: "https://swiito.in/legal/privacy" },
};

const EFFECTIVE_DATE = "1 October 2024";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-bg">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="font-display font-bold text-4xl text-fg mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-fg-muted">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="prose-legal">
          <Section title="1. Who we are">
            <p>
              Swiito (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
              a property listing and brokerage platform operating in Ranchi,
              Jharkhand, India. &laquo;TO CONFIRM: registered entity name and
              address&raquo;
            </p>
            <p>
              This policy describes what personal data we collect, how we use it,
              and your rights with respect to that data.
            </p>
          </Section>

          <Section title="2. Data we collect">
            <h3>2.1 All registered users (owners and seekers)</h3>
            <ul>
              <li>
                <strong>Email address</strong> — collected at sign-up, used for
                account access. Email and password is the only sign-in method.
              </li>
              <li>
                <strong>Full name</strong> — provided during profile set-up,
                displayed to admin only.
              </li>
              <li>
                <strong>Phone number</strong> — provided during profile set-up.
                For seekers, used only to pass to our broker when a contact
                request is made. For owners, held internally only.
              </li>
              <li>
                <strong>Account role</strong> — whether you registered as a
                &ldquo;seeker&rdquo; or &ldquo;owner&rdquo;.
              </li>
            </ul>

            <h3>2.2 Property owners (additional)</h3>
            <ul>
              <li>
                <strong>Property details</strong> — title, description, photos,
                location area, price, floor, amenities, and availability entered
                when posting a listing.
              </li>
              <li>
                <strong>Full address and exact location</strong> — the precise
                address and GPS coordinates of listed properties.{" "}
                <strong>
                  This information is stored securely and is never shown
                  publicly, not even to signed-in seekers.
                </strong>
              </li>
              <li>
                <strong>Owner contact details</strong> — your name, phone number,
                and email as provided during registration.{" "}
                <strong>
                  These details are never published on the public site and are
                  accessible only to Swiito&apos;s internal admin team.
                </strong>
              </li>
              <li>
                <strong>Asking price</strong> — the price you set when submitting
                a listing. This is held privately; the price shown publicly
                (&ldquo;display price&rdquo;) is set by our admin team.
              </li>
            </ul>

            <h3>2.3 Property seekers (additional)</h3>
            <ul>
              <li>
                <strong>Enquiry records</strong> — when you request broker
                contact details for a property, we record which property you
                enquired about and the date.
              </li>
              <li>
                <strong>Shortlisted properties</strong> — properties you add to
                your shortlist are stored against your account.
              </li>
            </ul>

            <h3>2.4 Contact form submissions</h3>
            <p>
              If you submit the contact form, we collect the name, phone number,
              and message you provide. This data is stored in our CRM for
              follow-up by our broker team.
            </p>

            <h3>2.5 Usage data</h3>
            <p>
              We record property view counts on a per-property basis.
              &laquo;TO CONFIRM: whether any analytics platform (e.g. Google
              Analytics, Vercel Analytics) is in use&raquo;
            </p>
          </Section>

          <Section title="3. How we use your data">
            <ul>
              <li>
                <strong>Account access</strong> — to authenticate you when you
                sign in.
              </li>
              <li>
                <strong>Listing operations</strong> — to review, approve, and
                display property listings.
              </li>
              <li>
                <strong>Brokerage</strong> — to facilitate contact between
                seekers and our broker. We pass the seeker&apos;s broker contact
                request and, if relevant, their phone number to our internal
                team only.
              </li>
              <li>
                <strong>Customer support</strong> — to respond to enquiries and
                complaints.
              </li>
              <li>
                <strong>Fraud prevention and moderation</strong> — to detect
                suspicious activity and take action against policy violations.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell your personal data to third parties.
              We do <strong>not</strong> use your data for targeted advertising.
            </p>
          </Section>

          <Section title="4. Data sharing">
            <p>
              We share personal data only in the following circumstances:
            </p>
            <ul>
              <li>
                <strong>Within our team</strong> — admin team members access
                data to review listings and handle enquiries.
              </li>
              <li>
                <strong>Infrastructure providers</strong> — Supabase (database
                and authentication), Vercel (hosting), and cloud storage for
                photos. &laquo;TO CONFIRM: specific data processing agreements
                in place&raquo;
              </li>
              <li>
                <strong>Legal obligation</strong> — if required by law, court
                order, or government authority.
              </li>
            </ul>
            <p>
              <strong>
                Owner contact details and property addresses are never shared
                with seekers or any third party, including advertisers.
              </strong>
            </p>
          </Section>

          <Section title="5. Data retention">
            <p>
              We retain your personal data for as long as your account is active.
              If you delete your account, we will delete or anonymise your
              personal data within a reasonable period, except where retention is
              required by law.
            </p>
            <p>
              &laquo;TO CONFIRM: specific retention periods for different data
              categories&raquo;
            </p>
          </Section>

          <Section title="6. Cookies and local storage">
            <p>
              We use browser local storage to retain temporary form state (e.g.
              draft listings) and theme preferences. We use session cookies for
              authentication.
            </p>
            <p>
              &laquo;TO CONFIRM: complete list of cookies and third-party
              scripts&raquo;
            </p>
          </Section>

          <Section title="7. Your rights">
            <p>
              Under applicable law &laquo;TO CONFIRM: India&apos;s Digital
              Personal Data Protection Act 2023 (DPDPA) or other applicable
              legislation&raquo;, you have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request erasure of your data in certain circumstances.</li>
              <li>Withdraw consent where processing is based on consent.</li>
              <li>
                Lodge a complaint with the relevant data protection authority.
              </li>
            </ul>
            <p>
              To exercise these rights, email us at &laquo;TO CONFIRM: privacy
              contact email address&raquo;.
            </p>
          </Section>

          <Section title="8. Children">
            <p>
              Swiito is not intended for use by persons under 18 years of age. We
              do not knowingly collect personal data from children.
            </p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>
              We may update this policy from time to time. Material changes will
              be communicated by updating the effective date above and, where
              appropriate, by notice in the app.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For privacy-related enquiries, contact our Grievance Officer — see
              the{" "}
              <a href="/legal/grievance" className="text-accent hover:underline">
                Grievance page
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
      <div className="space-y-3 text-sm text-fg-muted leading-relaxed [&_h3]:font-semibold [&_h3]:text-fg [&_h3]:text-base [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-fg [&_strong]:font-medium">
        {children}
      </div>
    </section>
  );
}
