# Swiito — Admin Guide

**For: non-technical operators**  
You do not need to touch any code. Everything in this guide is done through the admin panel at `https://swiito.in/admin`.

---

## Signing in to the admin panel

1. Go to `https://swiito.in/sign-in`
2. Enter your admin email and password
3. You will be redirected to `https://swiito.in/admin`

If you are not redirected, your account may not have admin access. Contact the developer.

---

## Daily workflow

### Approving a new listing

When an owner submits a listing it appears in the **Approvals queue** (`/admin/approvals`). New listings are sorted oldest first.

1. Click the listing to open the review page
2. Check the photos — they must show the actual property. Reject if they are stock images or unrelated
3. Check the details are accurate and consistent with the photos
4. Set the **Display price** — this is the price shown publicly. It does not have to match the owner's asking price
5. Optionally set a **Swiito Score** (1–5) and tick **Verified** if the property has been physically verified
6. Click **Approve**. The listing goes live immediately

### Rejecting a listing

1. On the approval review page, click **Reject**
2. Select a reason (or type a custom reason)
3. Click **Confirm rejection**. The owner is shown the reason in their dashboard. The listing is removed from the queue

### Editing a live listing

Go to **Properties** (`/admin/properties`) → find the listing → click **Edit**.

You can change:
- Status (e.g. mark as Rented or Sold)
- Display price
- Swiito Score
- Verified / Featured toggles
- Photo order (drag to reorder) and delete individual photos

Click **Save changes** when done.

---

## Managing leads (CRM)

Go to **Leads** (`/admin/leads`).

- **Status** — change the pipeline stage inline using the dropdown: New → Contacted → Connected → Won / Lost
- **Notes** — click the notes field on any row, type, and click away to save
- **Call / WhatsApp** — tap the phone or message icon to call or open WhatsApp directly
- **Export** — click **Export CSV** to download the current filtered view

---

## Managing users

Go to **Users** (`/admin/users`).

- **Search** — type a name or email in the search box
- **Filter by role** — use the role dropdown to show only Seekers, Owners, or Admins
- **Verify an owner** — click **Verify** next to an owner's name. The owner's profile will show a verified badge

Click a user's name to see their full profile, listings, and lead history.

---

## Managing content

Go to **Content** (`/admin/content`). There are three tabs:

### FAQs
- Click **Add FAQ** to create a new question and answer
- Set the **Category** — this groups the FAQ on the public FAQ page (e.g. `general`, `tenants`, `owners`)
- Use the **Sort order** to control the order within a category
- Click the pencil icon to edit, the bin icon to delete

### Value props ("Why Swiito")
- These appear in the "Why Swiito" section on the home page
- The **Icon** field must be a valid Lucide icon name (e.g. `ShieldCheck`, `Camera`, `Lock`). Ask the developer if you need a new icon
- The section is **hidden** if the list is empty

### Testimonials
- The testimonials section on the home page is **hidden** until at least one is published
- Click the toggle to publish or unpublish a testimonial

---

## Settings

Go to **Settings** (`/admin/settings`).

### Broker contact
Update the broker phone number and WhatsApp number. These appear:
- In the contact reveal gate on property pages
- In the footer
- On the contact page

**Broker phone** — include the country code, e.g. `+91 74884 59279`  
**Broker WhatsApp** — digits only, no `+` or spaces, e.g. `917488459279`  
**Broker display** — how it appears on screen, e.g. `+91 74884 59279`

### Amenities
The amenities list appears when owners post a listing. Add, edit, or remove amenities here.

---

## Audit log

Go to **Audit log** (`/admin/audit`).

Every admin action (approval, rejection, price change, user verification) is recorded here. You can filter by table and action type.

---

## What to do if something looks wrong

| Problem | Action |
|---|---|
| Listing approved but not appearing on site | Check the display price is not 0. Check status is "Approved". Refresh the page after 1–2 minutes |
| Owner says their listing is rejected unfairly | Go to Properties → find listing → click Edit → change status to Pending, then re-review |
| Seeker complains about getting wrong number | Check Settings → Broker contact. Update if wrong |
| Need to take a listing down urgently | Go to Properties → find listing → Edit → change status to Expired or Rejected |
| Suspicious user activity | Go to Users → find user → view profile → contact developer to suspend |

---

## Important rules

- **Never publish an owner's phone number in a listing description.** If an owner includes their number in the description, edit the description and remove it before approving.
- **Display price is public. Asking price is private.** The price you set in the Display price field is what seekers see. The owner's asking price is only visible to you.
- **You cannot undo a deletion.** If you delete a photo or an FAQ entry, it is permanent.
