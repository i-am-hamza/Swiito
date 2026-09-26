# Swiito — Deferred Backlog

Items that were scoped out, deferred by decision, or identified in the hardening
audit. Prioritised by impact.

---

## Critical (block launch or compliance)

### B-000 · Legal pages — replace all «TO CONFIRM» placeholders
**Files:** `src/app/(browse)/legal/grievance/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`  
**What:** 26 markers need confirmed client content — entity name, grievance officer details, jurisdiction, timelines, contact email, applicable law.  
**Why deferred:** Awaiting confirmed client content.  
**Impact:** IT Rules 2021 require a named grievance officer. Pages should not go live without this.

---

## High (security, data integrity)

### B-001 · `leads.property_id` NOT NULL — contact form silently fails
**File:** `src/lib/actions/contact.ts`  
**What:** The `leads` table requires a non-null `property_id`. Contact-page submissions use a placeholder UUID (`00000000-...`) which fails the FK check. The insert errors silently; the user sees success.  
**Fix:** Run `ALTER TABLE leads ALTER COLUMN property_id DROP NOT NULL;` in Supabase SQL Editor.  
**Impact:** Contact form submissions from `/contact` are currently not being saved to the DB.

### B-002 · No security headers (CSP, X-Frame-Options, HSTS)
**File:** `next.config.ts`  
**What:** No `headers()` function configured. The app has no Content-Security-Policy, no X-Frame-Options, no Strict-Transport-Security, no X-Content-Type-Options.  
**Fix:** Add a `headers()` export to `next.config.ts`. Minimum recommended set:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com maps.googleapis.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; connect-src 'self' *.supabase.co wss://*.supabase.co;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### B-003 · No rate limit on contact form
**File:** `src/lib/actions/contact.ts`  
**What:** Unauthenticated form submission with no throttle.  
**Fix:** Add IP-based rate limiting (e.g. Upstash Redis + `@upstash/ratelimit`) or a Vercel Edge middleware check. Limit to 5 submissions per IP per hour.

### B-004 · No rate limit on listing submission
**File:** `src/lib/actions/owner.ts → submitListingAction`  
**What:** An owner can submit unlimited listings.  
**Fix:** Check count of listings for the owner in the last 24 hours before insert; reject above a threshold (e.g. 5/day).

### B-005 · DB-level RLS not verified
**What:** The application enforces ownership in every server action, but it is unverified whether Supabase's row-level security policies are enabled and correctly configured at the database level. If RLS is disabled, a direct PostgREST call with a valid JWT could bypass application-level checks.  
**Fix:** In Supabase dashboard → Table Editor → enable RLS on `properties`, `leads`, `property_media`, `shortlist`. Add policies:
- `properties`: SELECT all; INSERT/UPDATE/DELETE where `owner_id = auth.uid()`
- `leads`: SELECT/INSERT where `seeker_id = auth.uid()`
- `shortlist`: all operations where `user_id = auth.uid()`

---

## Medium (performance, accessibility, UX)

### B-006 · Sentry error monitoring not wired up
**What:** Runtime errors in production are silent. No alerting, no stack traces, no source maps.  
**Fix:** `npm i @sentry/nextjs` → `npx @sentry/wizard@latest -i nextjs` → set `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN` in Vercel.

### B-007 · `PropertyCard` has no `priority` prop — browse page LCP unoptimised
**File:** `src/components/property/PropertyCard.tsx`  
**What:** The first card in the browse grid is likely the LCP element. Without `priority`, Next.js lazy-loads the image.  
**Fix:** Accept an optional `priority?: boolean` prop on `PropertyCard` and pass `priority={i === 0}` from `PropertyGrid` for the first item.

### B-008 · `prefers-reduced-motion` not respected
**File:** `globals.css`  
**What:** `transition-brand` applies a transition unconditionally.  
**Fix:** Add `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; } }` to `globals.css`.

### B-009 · Admin leads `<select>` has no visible focus ring
**File:** `src/components/admin/LeadsClient.tsx` line 183  
**What:** `border-0` removes the native focus indicator. Keyboard users cannot see focus.  
**Fix:** Replace `border-0` with `focus:ring-2 focus:ring-accent/40 focus:outline-none`.

### B-010 · `Tabs` panel missing `aria-labelledby`
**File:** `src/components/ui/Tabs.tsx`  
**What:** Each `<button role="tab">` has no `id`. The panel has no `aria-labelledby`.  
**Fix:** Add `id={`tab-${i}`}` to each tab button; add `aria-labelledby={`tab-${active}`}` to the panel div.

### B-011 · Hero trust markers use `<span>` not `<ul><li>`
**File:** `src/app/page.tsx`  
**What:** The three trust markers are separate `<span>` elements. Screen readers announce them as a flat string.  
**Fix:** Wrap in `<ul>` with `<li>` children.

### B-012 · Instagram pink `#E1306C` hardcoded in two places
**Files:** `src/app/(browse)/how-it-works/page.tsx`, `src/app/(browse)/contact/page.tsx`  
**What:** Not a CSS variable. If the brand colour changes, two files need updating.  
**Fix:** Extract to CSS variable `--instagram: #E1306C` in `globals.css`, or a JS constant.

### B-013 · Google Maps key referrer restriction unverified
**What:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is exposed in the client bundle (required for the maps library). Whether the key has HTTP referrer restrictions locked to `swiito.in` is not verifiable from code.  
**Fix:** In Google Cloud Console → APIs & Services → Credentials → select the key → Application restrictions → HTTP referrers → add `https://swiito.in/*` and `https://*.swiito.in/*`. Set a daily quota cap.

---

## Low / future features

### B-014 · Analytics not wired up
**What:** No product analytics in place. User behaviour (which pages are viewed, where seekers drop off) is invisible.  
**Options:** Vercel Analytics (zero config, privacy-friendly), PostHog, or Plausible.

### B-015 · No email notifications to owners on listing approval/rejection
**What:** Owners currently have to check their dashboard to know if a listing was approved.  
**Fix:** Send a transactional email via Resend or Supabase Edge Functions when `status` changes to `approved` or `rejected`.

### B-016 · No push notification or email for new leads
**What:** Admin has no real-time alert when a new lead comes in.  
**Fix:** Supabase webhook on `leads` INSERT → send WhatsApp or email notification.

### B-017 · Listing expiry not automated
**What:** Listings marked `expired` must be done manually. Common convention is 90 days after approval.  
**Fix:** Vercel cron job (`/api/cron/expire-listings`) that runs daily and sets `status = 'expired'` on listings where `published_at < now() - interval '90 days'`.

### B-018 · Owner cannot add photos after posting
**What:** The edit flow (`/owner/edit/[id]`) allows editing form fields but photo upload may not be available post-submission.  
**Verify:** Test the edit flow. If upload is missing, add the `ImageUploader` to the edit page.

### B-019 · Locality pages not in `COPY.search.localityOptions`
**What:** New localities added via the DB are not automatically in the search bar dropdown. The dropdown uses a hardcoded array in `src/lib/copy/index.ts`.  
**Fix:** Replace the static array in the search bar with a server-side fetch from the `localities` table.

---

## Explicitly out of scope (by product decision)

The following were explicitly excluded and should not be built without a product decision:

- Reviews or ratings
- In-app chat between seeker and owner
- Property visit scheduling
- Payment or commission processing
- OTP or SMS verification
- Social login (Google, Facebook, etc.)
- Magic links
