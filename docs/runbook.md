# Swiito — Runbook

Procedures for the four most likely operational events.

---

## R-001 · Restore a database backup

Supabase takes automatic daily backups (Pro plan and above).

### To restore to a point in time

1. Log in to [app.supabase.com](https://app.supabase.com)
2. Open the Swiito project
3. Go to **Database → Backups**
4. Select the backup you want to restore
5. Click **Restore** — confirm the dialog
6. Wait 5–15 minutes. The database will be offline during restore
7. After restore, run a smoke test:
   - Visit `https://swiito.in/properties` — listings appear
   - Sign in as admin — approvals queue loads
   - Sign in as an owner — their listings appear

### If a specific row needs recovery (not a full restore)

Point-in-time recovery (PITR) allows restoring a single table to a specific timestamp. Go to Database → Backups → Point in Time Recovery and follow Supabase's instructions. This requires the Pro plan.

### To test a backup without overwriting production

1. Create a new Supabase project (staging)
2. From the backup file, run `psql -h <staging-host> -U postgres < backup.sql`
3. Set `NEXT_PUBLIC_SUPABASE_URL` and keys to the staging project in a `.env.local`
4. Run `pnpm dev` locally and verify

---

## R-002 · Rotate a credential

### Rotate the Supabase service-role key

1. Log in to Supabase → Project Settings → API
2. Click **Regenerate** next to the service_role key
3. Copy the new key
4. In Vercel: open the project → Settings → Environment Variables → find `SUPABASE_SECRET_KEY` → edit → paste new key → save
5. In Vercel: go to Deployments → Redeploy the latest deployment to pick up the new key
6. Verify the admin panel loads and mutations work

### Rotate the Google Maps API key

1. Log in to [console.cloud.google.com](https://console.cloud.google.com)
2. Go to APIs & Services → Credentials
3. Click the Swiito API key → **Regenerate** (or create a new key and delete the old)
4. Update `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel Environment Variables
5. Redeploy
6. Verify the map loads on a property detail page

### Rotate the admin account password

1. Go to `https://swiito.in/sign-in`
2. Use "Forgot password" to send a reset link to the admin email
3. Set a new strong password (16+ characters, mixed)
4. Store it in a password manager — do not reuse it elsewhere

### Rotate the Supabase publishable (anon) key

This key is safe to expose publicly but can still be rotated:

1. Supabase → Project Settings → API → Regenerate the anon key
2. Update `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel
3. Redeploy
4. Verify sign-in, listing browsing, and contact reveal all work

---

## R-003 · Add a new locality

### Step 1 — Insert the row

```sql
INSERT INTO localities (
  name, slug, description, image_url, lat, lng, sort_order
) VALUES (
  'Morabadi',                       -- display name
  'morabadi',                       -- URL slug (lowercase, no spaces)
  'Description of Morabadi area.',  -- short paragraph
  'https://...',                    -- hero image URL (1:1 ratio, ≥800px)
  23.3688,                          -- latitude
  85.3196,                          -- longitude
  10                                -- sort order (lower = first)
);
```

Run this in Supabase → SQL Editor.

### Step 2 — Add copy to the code

Open `src/lib/copy/localities.ts` (or `src/lib/copy/index.ts`) and add the new locality to:
- `COPY.footer.localities` (for the footer nav)
- `COPY.search.localityOptions` (for the search bar)

### Step 3 — Add locality-specific FAQs (optional)

In the admin panel → Content → FAQs, add FAQs with `category = 'morabadi'`. These appear automatically on `/ranchi/morabadi`.

### Step 4 — Verify

Visit `https://swiito.in/ranchi/morabadi`. The page should render with the name, description, and any FAQs. If no listings exist yet, the page shows "No listings found".

---

## R-004 · Recover admin access

**Scenario A: Admin forgot password**

1. Go to `https://swiito.in/sign-in` → Forgot password → enter admin email → check inbox → follow reset link
2. Set a new password

**Scenario B: Admin email is inaccessible**

1. Log in to Supabase → Authentication → Users
2. Find the admin user by email
3. Click the user → **Send password reset** (this uses the email on record, so requires that email to work)
4. If the email is truly inaccessible: click the user → **Edit user** → set a new password directly
5. Update the admin email if needed from the same screen

**Scenario C: Admin account was deleted or role was changed**

1. Log in to Supabase → Table Editor → `profiles`
2. Find the row for the admin user ID
3. Set `role = 'admin'`
4. Or, if the user was deleted from Auth, re-create them:
   - Supabase → Authentication → Users → **Add user** → enter email + password
   - Then in `profiles`, insert a row with that user's UUID and `role = 'admin'`

**Scenario D: No working admin account exists at all**

You need Supabase service-role access to perform the above. If you have lost that too:
1. Log in to Supabase with the project owner's email at [app.supabase.com](https://app.supabase.com)
2. Follow Scenario C above

---

## Smoke test checklist (run after any credential rotation or restore)

- [ ] `https://swiito.in` loads; hero image appears
- [ ] Property cards appear on browse page
- [ ] Property detail page loads; gallery works
- [ ] Sign in as seeker → contact reveal returns broker number
- [ ] Sign in as owner → dashboard shows listings
- [ ] Sign in as admin → `/admin` dashboard loads
- [ ] Admin can approve a pending listing (or check approvals queue is accessible)
- [ ] No errors in Vercel → Functions → Runtime Logs
