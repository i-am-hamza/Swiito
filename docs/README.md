# Swiito — Developer Reference

Property listing and brokerage platform for Ranchi, Jharkhand.  
Owners post → admin approves → Swiito brokers all contact.

---

## Table of contents

1. [Architecture](#architecture)
2. [Local setup](#local-setup)
3. [Environment variables](#environment-variables)
4. [Database](#database)
5. [Key conventions](#key-conventions)
6. [Deployment](#deployment)
7. [Cron and background jobs](#cron-and-background-jobs)

---

## Architecture

```
Browser
  ↓
Vercel Edge (Next.js 16 App Router)
  ├── Server Components  — read-only, use createClient() with publishable key
  ├── Server Actions     — mutations, use adminClient() with service-role key
  └── Client Components  — interactive leaves only ("use client")
  ↓
Supabase
  ├── Auth              — email/password only (no OTP, no social)
  ├── PostgreSQL         — properties, profiles, leads, media, localities, …
  └── Storage           — property photos (bucket: property-media)
```

### Two Supabase clients

| Client | Key | Where used | RLS bypass |
|---|---|---|---|
| `createClient()` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Server Components, public reads | No |
| `adminClient` | `SUPABASE_SECRET_KEY` | Server Actions only | Yes |

`adminClient` is imported exclusively in `src/lib/actions/` and `src/lib/queries/admin.ts`. It is never imported by any file with `"use client"`.

### Route groups

| Group | Path | Description |
|---|---|---|
| `(browse)` | `/`, `/properties`, `/ranchi/[locality]`, `/about`, … | Public + seeker pages, shared Header/Footer |
| `(auth)` | `/sign-in`, `/sign-up` | Unauthenticated only |
| `admin` | `/admin/*` | Role-checked in layout, adminClient throughout |
| `owner` | `/owner/*` | Auth-checked, ownership verified per action |

---

## Local setup

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+
- Supabase CLI (for local dev): `npm i -g supabase`

### Steps

```bash
git clone <repo-url>
cd swiito
pnpm install

# Copy env template and fill in values
cp .env.example .env.local

# Start dev server
pnpm dev
```

The app runs on `http://localhost:3000`.

### Useful scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build locally |
| `pnpm typecheck` | TypeScript check (`tsc --noEmit`) |
| `pnpm lint` | ESLint check |

Both `pnpm typecheck && pnpm lint` must pass before any commit.

---

## Environment variables

### Required in production

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | Same page as above |
| `SUPABASE_SECRET_KEY` | Supabase service-role key (**never commit, never expose**) | Same page — service_role key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | Google Cloud Console |

### Optional / recommended

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring (not wired yet — see backlog) |
| `SENTRY_AUTH_TOKEN` | For source-map uploads during build |

### Local `.env.local` template

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

---

## Database

See `docs/schema.md` for the full table reference.

### Key views

- **`properties_public`** — security_invoker view; exposes only approved listings with no owner contact. All public pages read this view exclusively.
- **`property_owner_contact`** — contains owner name, phone, email, full address, asking price. Never queried from public routes.

### Key tables

`properties`, `profiles`, `leads`, `property_media`, `localities`, `faqs`, `value_props`, `testimonials`, `amenities`, `settings`, `audit_log`, `shortlist`

### Supabase Storage

Bucket name: `property-media` (or verify in dashboard).  
Photos are stored at a path like `{user_id}/{property_id}/{filename}`.

---

## Key conventions

### Data flow

1. All reads go through `src/lib/queries/`. Components never call Supabase directly.
2. All mutations go through `src/lib/actions/`. Use `"use server"` and validate with Zod.
3. Admin actions call `getAdminUserId()` first — this verifies the session and the `admin` role. If this check fails, the function throws and the mutation does not proceed.

### Types

- `src/types/index.ts` — application types (Property, Faq, AdminListingFull, etc.)
- `src/types/database.ts` — auto-generated Supabase types (do not edit manually)

### Copy / strings

All user-facing strings live in `src/lib/copy/index.ts`. Do not hardcode strings in components.

### Styling

- No hardcoded colours, radii, or shadows. Use Tailwind tokens and CSS variables only.
- Exception: WhatsApp green (`#25D366`), Instagram pink (`#E1306C`), amber pending (`#B45309`).
- `transition-brand` for all transitions.
- `formatINR(amount)` for all INR formatting.

---

## Deployment

Hosted on Vercel. Every push to `main` triggers a production deployment.

### First deploy checklist

1. Import repo in Vercel
2. Set all environment variables (see above)
3. Set `NEXTAUTH_URL` / canonical domain to `https://swiito.in`
4. Assign custom domain in Vercel → Domains
5. Update Supabase Auth → URL Configuration → Site URL to `https://swiito.in`
6. Update Supabase Auth → Redirect URLs to include `https://swiito.in/**`

### Rollback

Vercel keeps all previous deployments. To roll back:  
Vercel dashboard → Deployments → find the last good build → "Promote to Production".

---

## Cron and background jobs

None currently. View count increment and enquiry count increment are fire-and-forget within the request cycle.
