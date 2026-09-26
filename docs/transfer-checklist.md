# Swiito — Account Transfer Checklist

Complete this when handing the project to the client or a new developer.
Check off each item only after the transfer is confirmed, not when initiated.

---

## GitHub

- [ ] **Invite new owner** — Settings → Collaborators → add GitHub username → Role: Admin
- [ ] **Transfer repository** (if full ownership transfer) — Settings → Danger Zone → Transfer → confirm new owner
- [ ] **Remove previous developer** — Settings → Collaborators → remove access after transfer confirmed
- [ ] **Branch protection rules** — confirm `main` requires PR review and passing CI before merge (Settings → Branches)
- [ ] **Secrets** — if any GitHub Actions secrets exist, rotate and hand over: Settings → Secrets and variables → Actions

---

## Vercel

- [ ] **Invite new team member** — Vercel dashboard → Team Settings → Members → Invite → Role: Owner
- [ ] **Transfer project** (or team) — Team Settings → Transfer team to new owner's Vercel account
- [ ] **Hand over all environment variables** — the new owner must set these in Vercel → Project → Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
  - `NEXT_PUBLIC_SENTRY_DSN` (when Sentry is added)
- [ ] **Remove previous developer** from team after handover confirmed
- [ ] **Confirm custom domain** remains configured — Vercel → Domains → `swiito.in` is assigned
- [ ] **Billing** — confirm Vercel billing is transferred to the new owner's payment method

---

## Supabase

- [ ] **Invite new owner** — Supabase dashboard → Project Settings → Team → Invite → Role: Owner
- [ ] **Transfer project** — Supabase → Project Settings → General → Transfer Project (requires both accounts to be on a paid plan)
- [ ] **Hand over service-role key** securely (use a password manager, not email or chat)
- [ ] **Hand over database password** — Project Settings → Database → password
- [ ] **Confirm daily backups** are enabled — Database → Backups → ensure automatic backups are on
- [ ] **Remove previous developer** from the team
- [ ] **Update auth email sender** (optional) — Authentication → Email Templates → from address should use client's domain

---

## Domain (DNS)

Current registrar: **[TO CONFIRM: registrar name]**

- [ ] **Transfer registrar login** — hand over username, password, and 2FA recovery codes
- [ ] **Unlock domain for transfer** if moving to a different registrar — Domains → Unlock
- [ ] **Confirm DNS records** are intact after any transfer:
  - `swiito.in` → Vercel nameservers or A record pointing to Vercel IP
  - `www.swiito.in` → CNAME to `swiito.in` or Vercel alias
  - MX records for email (if any)
- [ ] **Transfer registrar billing** to client's payment method
- [ ] **SSL** — Vercel provisions SSL automatically. Confirm HTTPS works after DNS transfer

---

## Google Maps

- [ ] **Share Google Cloud project** — Google Cloud Console → IAM → add new owner email → Role: Project Owner
  - Or: create a new API key under the client's Google account and update `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel
- [ ] **Confirm referrer restrictions** are set — APIs & Services → Credentials → API key → Application restrictions → HTTP referrers: `https://swiito.in/*`
- [ ] **Confirm quota cap** — set a daily requests per day limit to prevent billing surprise
- [ ] **Transfer billing** to client's Google Cloud billing account
- [ ] **Remove previous developer** from the Cloud project

---

## Sentry (when added — see backlog B-006)

- [ ] **Invite new team member** — Sentry → Settings → Teams → Invite
- [ ] **Transfer ownership** — Organization Settings → Transfer ownership
- [ ] **Hand over DSN** — Settings → Projects → Client Keys → copy DSN
- [ ] **Remove previous developer**
- [ ] **Billing** — update to client's payment method

---

## Admin account

- [ ] **Create a new admin account** for the client:
  1. Go to Supabase → Authentication → Users → Add user
  2. Set email to client's email, set a strong initial password
  3. In `profiles` table, set `role = 'admin'`
  4. Send credentials to client securely
- [ ] **Client changes password** on first login
- [ ] **Delete or demote the developer's admin account** after handover confirmed:
  1. `profiles` → set developer's row to `role = 'seeker'` (or delete entirely)
  2. Supabase → Authentication → Users → delete developer's auth user

---

## Final verification after full handover

- [ ] Client can sign in to `https://swiito.in/admin`
- [ ] Client can sign in to Vercel, Supabase, GitHub, registrar, Google Cloud
- [ ] Previous developer has no access to any of the above
- [ ] Smoke test (see `docs/runbook.md` R-004 smoke test checklist) passes
- [ ] Client knows where to find the admin guide (`docs/admin-guide.md`) and runbook (`docs/runbook.md`)
