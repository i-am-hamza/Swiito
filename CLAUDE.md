# Swiito — project rules

Property listing website for Ranchi. Owners post, admin approves, Swiito brokers
all contact. Dark-premium design. Mobile-first.

## Model
- Owners create accounts and post listings. Admin approves before anything is live.
- Owner name, phone, email and address are NEVER shown publicly. Ever.
- Seekers browse anonymously.
- Contact is gated behind seeker sign-up, and shows SWIITO'S BROKER NUMBER.
- One admin account.
- No reviews, no chat, no visits, no payments, no OTP. Do not build them.

## Stack
Next.js App Router · TypeScript strict · Tailwind · Supabase (added session 2) ·
zod · Vitest · Playwright.

## Rules
1. All data access goes through src/lib/queries/. Components never fetch directly.
   These functions read mock data now and Supabase from session 2 — the signatures
   must not change when that happens.
2. From session 2: property_owner_contact is NEVER queried from a public or seeker
   route. Public pages read the properties_public view.
3. Check src/components/ui/ before creating any new primitive.
4. No hardcoded colours, spacing, radii or shadows. Tokens only.
5. Server Components by default. "use client" only on interactive leaves.
6. Every mutation validated by a zod schema shared client and server.
7. No `any`, no `@ts-ignore`.
8. Green buttons take dark text (--on-accent). Never white.
9. User-facing strings in src/lib/copy/.
10. next/image with explicit sizes. No raw <img>.
11. INR formatted Indian-style (₹1,25,000) via formatINR.

Run `pnpm typecheck && pnpm lint` before reporting any task done.
Never invent a business rule, fee, testimonial or claim about Swiito.
