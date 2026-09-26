# Swiito — Schema Reference

Auto-generated types live in `src/types/database.ts`. This document is the
human-readable reference for operators and developers.

---

## Tables

### `profiles`
Linked 1-to-1 with `auth.users`. Created on sign-up via trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | Matches `auth.users.id` |
| `full_name` | text | Display name |
| `phone` | text | Owner's phone — never shown publicly |
| `role` | enum | `seeker`, `owner`, `admin` |
| `is_verified` | bool | Admin-set owner verification |
| `created_at` | timestamptz | |

---

### `properties`
Core listing table. All public reads go through `properties_public` view.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `owner_id` | uuid FK → profiles | **Never exposed publicly** |
| `slug` | text unique | URL slug |
| `title` | text | |
| `description` | text | |
| `listing_type` | enum | `rent`, `sale` |
| `property_type` | enum | `flat`, `independent_house`, `room`, `pg`, `hostel`, `shop`, `office`, `plot` |
| `bhk` | int | Null for non-residential |
| `bathrooms` | int | |
| `carpet_area_sqft` | int | |
| `builtup_area_sqft` | int | |
| `floor` | int | |
| `total_floors` | int | |
| `furnishing` | enum | `unfurnished`, `semi_furnished`, `fully_furnished` |
| `facing` | text | |
| `age_years` | int | |
| `display_price` | numeric | **Admin-set public price** |
| `deposit` | numeric | |
| `maintenance` | numeric | |
| `available_from` | date | |
| `tenant_preference` | text[] | |
| `amenities` | text[] | |
| `address_area` | text | Area name only — no street/building |
| `locality_id` | uuid FK → localities | |
| `lat` | float8 | Rounded to 3dp in public view (~110m precision) |
| `lng` | float8 | Same |
| `status` | enum | `draft`, `pending`, `approved`, `rejected`, `rented`, `sold`, `expired` |
| `is_verified` | bool | Admin-set |
| `is_featured` | bool | Admin-set |
| `swiito_score` | int | 1–5, admin-set |
| `rejection_reason` | text | |
| `published_at` | timestamptz | Set on approval, nulled on rejection |
| `view_count` | int | Incremented on detail page load |
| `enquiry_count` | int | Incremented on contact reveal |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

### `property_owner_contact`
Separate table holding private owner details for a listing.  
**RLS: accessible to admin only. Never queried from public routes.**

| Column | Type | Notes |
|---|---|---|
| `property_id` | uuid PK FK → properties | |
| `owner_name` | text | |
| `owner_phone` | text | |
| `owner_email` | text | |
| `full_address` | text | |
| `owner_asking_price` | numeric | Price owner set — never shown publicly |

---

### `property_media`
Photos for a listing.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `property_id` | uuid FK → properties | |
| `url` | text | Public storage URL |
| `is_cover` | bool | First/cover photo |
| `sort_order` | int | Display order |
| `blurhash` | text | Blur placeholder |
| `width` | int | |
| `height` | int | |
| `kind` | text | `photo`, `floorplan`, etc. |

---

### `localities`
Neighbourhood index.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | Display name |
| `slug` | text unique | URL slug |
| `description` | text | |
| `image_url` | text | Hero image |
| `lat` / `lng` | float8 | Map centre |
| `centre` | geography | PostGIS point |
| `city_id` | uuid | |
| `meta_title` | text | SEO override |
| `meta_description` | text | SEO override |
| `sort_order` | int | Display order |

---

### `leads`
All contact reveals and enquiries. Also used for contact-page submissions.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `property_id` | uuid FK → properties | **Required by current schema** — see backlog |
| `seeker_id` | uuid FK → profiles | Null for anonymous contact-page submissions |
| `name` | text | From contact form (anonymous leads) |
| `phone` | text | From contact form (anonymous leads) |
| `message` | text | From contact form |
| `source` | text | `detail_page`, `contact_page`, etc. |
| `status` | enum | `new`, `contacted`, `connected`, `closed_won`, `closed_lost` |
| `notes` | text | Admin CRM notes |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Known schema issue:** `property_id` is NOT NULL. Contact-page submissions require a nullable `property_id`. Until the schema is updated, those inserts will fail silently (success shown to user; error logged server-side). See `docs/backlog.md` item B-001.

---

### `faqs`
Managed from admin → Content tab.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `category` | text | Groups FAQs on the FAQ page (e.g. `general`, `tenants`, `owners`) |
| `question` | text | |
| `answer` | text | |
| `sort_order` | int | |
| `is_active` | bool | (if present) |

---

### `value_props`
"Why Swiito" section. Managed from admin → Content tab.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `icon` | text | Lucide icon name (e.g. `ShieldCheck`) |
| `title` | text | |
| `body` | text | |
| `sort_order` | int | |
| `is_active` | bool | |

---

### `testimonials`
Hidden until at least one is published. Managed from admin → Content tab.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `author_name` | text | |
| `locality` | text | |
| `rating` | int | 1–5 |
| `body` | text | |
| `avatar_url` | text | |
| `is_active` | bool | Toggle in admin |
| `sort_order` | int | |

---

### `amenities`
Global amenity list. Managed from admin → Settings.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `icon` | text | |
| `sort_order` | int | |

---

### `settings`
Key-value store for broker/contact settings.

| Key | Description |
|---|---|
| `broker_phone` | Broker phone with country code (e.g. `+917488459279`) |
| `broker_whatsapp` | WhatsApp number without `+` (e.g. `917488459279`) |
| `broker_display` | Display string (e.g. `+91 74884 59279`) |
| `instagram_url` | Full Instagram URL |

---

### `audit_log`
Append-only log of every admin mutation.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `actor_id` | uuid FK → profiles | Admin who performed the action |
| `action` | text | e.g. `approve_listing`, `update_property` |
| `table_name` | text | |
| `record_id` | uuid | |
| `old_data` | jsonb | Before state |
| `new_data` | jsonb | After state |
| `created_at` | timestamptz | |

---

### `shortlist`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `property_id` | uuid FK → properties | |
| `created_at` | timestamptz | |

---

## Views

### `properties_public`
`SECURITY INVOKER` view. Excludes `owner_id`, all owner contact, and `owner_asking_price`. Only returns rows where `status = 'approved'`. All public-facing queries use this view exclusively.

---

## Enums

| Name | Values |
|---|---|
| `property_status` | `draft`, `pending`, `approved`, `rejected`, `rented`, `sold`, `expired` |
| `listing_type` | `rent`, `sale` |
| `property_type` | `flat`, `independent_house`, `room`, `pg`, `hostel`, `shop`, `office`, `plot` |
| `furnishing_type` | `unfurnished`, `semi_furnished`, `fully_furnished` |
| `user_role` | `seeker`, `owner`, `admin` |
| `lead_status` | `new`, `contacted`, `connected`, `closed_won`, `closed_lost` |
