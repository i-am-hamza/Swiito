import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Mail, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getUserLeads } from "@/lib/queries/account";
import { ProfileForm } from "@/components/account/ProfileForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  connected: "Connected",
  closed_won: "Closed",
  closed_lost: "Closed",
};

const LEAD_STATUS_COLOR: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600",
  contacted: "bg-yellow-500/10 text-yellow-700",
  connected: "bg-green-500/10 text-green-700",
  closed_won: "bg-surface-2 text-fg-muted",
  closed_lost: "bg-surface-2 text-fg-muted",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/account");

  const [profile, leads] = await Promise.all([getUserProfile(), getUserLeads()]);

  if (!profile) redirect("/sign-in?next=/account");

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">My account</h1>
        <p className="text-sm text-fg-muted mt-1 flex items-center gap-1.5">
          <Mail size={13} aria-hidden="true" />
          {profile.email ?? user.email}
        </p>
      </div>

      {/* ── Profile ──────────────────────────────────────────────── */}
      <Section title="Profile">
        <ProfileForm profile={profile} />
      </Section>

      {/* ── Shortlist ────────────────────────────────────────────── */}
      <Section title="Shortlist">
        <p className="text-sm text-fg-muted mb-4">Properties you&apos;ve saved for later.</p>
        <Link
          href="/account/shortlist"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          <Heart size={14} />
          View my shortlist
        </Link>
      </Section>

      {/* ── Enquiries ────────────────────────────────────────────── */}
      <Section title="My enquiries">
        {leads.length === 0 ? (
          <p className="text-sm text-fg-muted">
            You haven&apos;t revealed contact details for any property yet.{" "}
            <Link href="/properties" className="text-accent hover:underline">Browse properties</Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-4 bg-surface rounded-lg border border-[var(--border)] px-4 py-3"
              >
                <div className="min-w-0">
                  {lead.propertySlug ? (
                    <Link
                      href={`/properties/${lead.propertySlug}`}
                      className="text-sm font-medium text-fg hover:text-accent transition-brand line-clamp-1"
                    >
                      {lead.propertyTitle}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-fg line-clamp-1">{lead.propertyTitle}</p>
                  )}
                  <p className="text-xs text-fg-muted mt-0.5 flex items-center gap-1">
                    <Phone size={11} aria-hidden="true" />
                    {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {lead.status && (
                  <span
                    className={[
                      "shrink-0 text-xs font-medium px-2 py-0.5 rounded-full",
                      LEAD_STATUS_COLOR[lead.status] ?? "bg-surface-2 text-fg-muted",
                    ].join(" ")}
                  >
                    {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Change password ──────────────────────────────────────── */}
      <Section title="Change password">
        <ChangePasswordForm />
      </Section>

      {/* ── Theme ────────────────────────────────────────────────── */}
      <Section title="Appearance">
        <div className="flex items-center gap-3">
          <p className="text-sm text-fg-muted flex-1">Toggle between dark and light mode.</p>
          <ThemeToggle />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display font-semibold text-fg border-b border-[var(--border)] pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
