# Swiito — Launch Checklist

Step-by-step human-executable checklist for go-live.  
Run in order. Check off each item only when confirmed working, not when started.

**Estimated time:** 1–2 days (mostly waiting on DNS propagation and DB setup).

---

## Phase 0 — Content (do first, blocks Phase 2)

- [ ] **0.1** Replace all `«TO CONFIRM»` placeholders in legal pages — see `docs/backlog.md` item B-000
  - `src/app/(browse)/legal/grievance/page.tsx` — 14 items
  - `src/app/(browse)/legal/privacy/page.tsx` — 7 items
  - `src/app/(browse)/legal/terms/page.tsx` — 5 items
- [ ] **0.2** Run `pnpm typecheck && pnpm lint` — must pass
- [ ] **0.3** Commit and push all content changes

---

## Phase 1 — Load real listings (staging environment)

- [ ] **1.1** Sign in to staging admin at `[staging URL]/admin`
- [ ] **1.2** For each listing provided by the client:
  - Confirm photos show the actual property (not stock images)
  - Confirm price is correct
  - Set display price
  - Set Swiito Score if applicable
  - Approve
- [ ] **1.3** Verify each approved listing appears on the staging browse page
- [ ] **1.4** Click through to each listing detail page — gallery, price, address area all correct
- [ ] **1.5** Run contact reveal as a seeker — broker number appears correctly

---

## Phase 2 — Supabase production project

- [ ] **2.1** Create a new Supabase project named "swiito-production" (use a paid plan for backups)
- [ ] **2.2** Run all migrations against the production project — or use Supabase CLI: `supabase db push --linked`
- [ ] **2.3** Enable RLS on all tables — see `docs/backlog.md` item B-005 for the policy SQL
- [ ] **2.4** Set Auth → URL Configuration → Site URL: `https://swiito.in`
- [ ] **2.5** Set Auth → URL Configuration → Redirect URLs: `https://swiito.in/**`
- [ ] **2.6** Confirm daily backups are enabled — Database → Backups
- [ ] **2.7** Do a test restore to a throwaway project — confirm it works before go-live
- [ ] **2.8** Seed the `settings` table with broker contact info:
  ```sql
  INSERT INTO settings (key, value) VALUES
    ('broker_phone', '+91 XXXXX XXXXX'),
    ('broker_whatsapp', '91XXXXXXXXXX'),
    ('broker_display', '+91 XXXXX XXXXX'),
    ('instagram_url', 'https://www.instagram.com/YOUR_HANDLE/');
  ```
- [ ] **2.9** Create the admin user account (see `docs/runbook.md` R-004 Scenario C)

---

## Phase 3 — Staging smoke test

Test all three journeys on real devices before touching production.

### Journey 1 — Seeker browse to contact
- [ ] Open staging URL on Android Chrome
- [ ] Browse properties — all listings appear, photos load
- [ ] Filter by locality — works
- [ ] Open a property detail page — gallery, price, description correct
- [ ] Sign up as new seeker (email only, no OTP)
- [ ] Tap "Get broker number" — contact gate reveals broker number
- [ ] Tap phone number — dials correctly
- [ ] Repeat on iPhone Safari

### Journey 2 — Owner post to approval queue
- [ ] Sign up as new owner on staging
- [ ] Post a new listing (fill all 5 steps, upload 3+ photos)
- [ ] Submit for review
- [ ] Sign in to staging admin
- [ ] Listing appears in approvals queue
- [ ] Review page shows all photos, owner contact, correct price diff
- [ ] Approve with a display price
- [ ] Visit the property page — listing is live at correct URL

### Journey 3 — Admin approve to live
- [ ] Post a second listing (as owner)
- [ ] Reject it with a reason
- [ ] Sign back in as owner — listing shows as rejected with the reason
- [ ] Admin changes status back to pending and re-approves
- [ ] Listing goes live again

---

## Phase 4 — Production deployment

- [ ] **4.1** Import repository in Vercel (or link existing project to production branch)
- [ ] **4.2** Set all environment variables in Vercel → project → Settings → Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL` — production Supabase URL
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — production anon key
  - `SUPABASE_SECRET_KEY` — production service-role key
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- [ ] **4.3** Set environment variable scope to **Production** only (not Preview)
- [ ] **4.4** Trigger a production build — verify it completes without errors in Vercel Build Logs
- [ ] **4.5** Add custom domain — Vercel → project → Settings → Domains → add `swiito.in` and `www.swiito.in`
- [ ] **4.6** Update DNS at registrar:
  - `swiito.in` → A record → `76.76.21.21` (Vercel IP, confirm in Vercel Domains panel)
  - `www` → CNAME → `cname.vercel-dns.com`
- [ ] **4.7** Wait for DNS propagation (15 minutes – 48 hours). Check at [dnschecker.org](https://dnschecker.org)
- [ ] **4.8** Confirm SSL is active — `https://swiito.in` loads with green padlock, no mixed-content warning
- [ ] **4.9** Set Supabase Auth → Site URL and Redirect URLs to `https://swiito.in`

---

## Phase 5 — Production smoke test

- [ ] `https://swiito.in` loads — hero image, featured properties, FAQs
- [ ] Browse page loads — filters work
- [ ] At least one property detail page loads — gallery, price, contact gate
- [ ] Sign-up flow completes (seeker)
- [ ] Sign-up flow completes (owner)
- [ ] Contact reveal works — correct broker number appears
- [ ] Admin panel loads at `/admin`
- [ ] `https://swiito.in/sitemap.xml` returns XML with listing URLs
- [ ] `https://swiito.in/robots.txt` returns correct disallow rules
- [ ] `https://swiito.in/og/property?slug=[a-real-slug]` returns a 1200×630 image

---

## Phase 6 — Google Search Console

- [ ] **6.1** Go to [search.google.com/search-console](https://search.google.com/search-console)
- [ ] **6.2** Add property → URL prefix: `https://swiito.in`
- [ ] **6.3** Verify ownership — recommended: HTML tag method → add the `<meta>` tag to `src/app/layout.tsx` → deploy → verify
- [ ] **6.4** Go to Sitemaps → add `https://swiito.in/sitemap.xml` → Submit
- [ ] **6.5** Wait 24–48 hours for first crawl report
- [ ] **6.6** Check Coverage report for any indexing errors

---

## Phase 7 — Post-launch

- [ ] **7.1** Load all real listings through admin (repeat Phase 1 on production)
- [ ] **7.2** Verify photos, prices, descriptions on live site
- [ ] **7.3** Share a listing URL in WhatsApp — confirm OG card shows property photo, title, price
- [ ] **7.4** Share the URL on Instagram Stories — confirm preview renders
- [ ] **7.5** Run a final smoke test on a real Android and iPhone (production)
- [ ] **7.6** Complete account transfer — see `docs/transfer-checklist.md`
- [ ] **7.7** Send client the admin guide (`docs/admin-guide.md`) and credentials

---

## Critical blockers (must be done before Phase 4)

| Item | File | Action |
|---|---|---|
| 26 «TO CONFIRM» placeholders | legal pages | Phase 0 |
| Contact form silently fails | `leads` schema | `ALTER TABLE leads ALTER COLUMN property_id DROP NOT NULL;` in Supabase SQL Editor |
| DB-level RLS not verified | Supabase dashboard | Add policies in Phase 2.3 |

---

## Recommended before Phase 4 (not blockers)

| Item | Effort | Backlog ref |
|---|---|---|
| Security headers | 30 min | B-002 |
| Rate limit on contact form | 2 hours | B-003 |
| Sentry error monitoring | 1 hour | B-006 |
