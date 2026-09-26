-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ── Enum types ───────────────────────────────────────────────────────────────
create type user_role       as enum ('seeker','owner','admin');
create type listing_type    as enum ('rent','sale');
create type property_type   as enum ('flat','independent_house','room','pg','hostel','shop','office','plot');
create type furnishing      as enum ('unfurnished','semi_furnished','fully_furnished');
create type property_status as enum ('draft','pending','approved','rejected','rented','sold','expired');
create type lead_status     as enum ('new','contacted','connected','closed_won','closed_lost');

-- ── profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  role        user_role default 'seeker',
  is_owner    boolean default false,
  is_verified boolean default false,
  created_at  timestamptz default now()
);

-- ── cities ───────────────────────────────────────────────────────────────────
create table cities (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique not null,
  centre           geography(point),
  description      text,
  image_url        text,
  meta_title       text,
  meta_description text,
  created_at       timestamptz default now()
);

-- ── localities ───────────────────────────────────────────────────────────────
create table localities (
  id               uuid primary key default gen_random_uuid(),
  city_id          uuid references cities,
  name             text not null,
  slug             text unique not null,
  centre           geography(point),
  lat              double precision,
  lng              double precision,
  description      text,
  image_url        text,
  meta_title       text,
  meta_description text,
  sort_order       int default 0,
  created_at       timestamptz default now()
);

-- ── properties ───────────────────────────────────────────────────────────────
create table properties (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references profiles,
  slug               text unique not null,
  title              text not null,
  listing_type       listing_type not null,
  property_type      property_type not null,
  bhk                int,
  bathrooms          int,
  carpet_area_sqft   numeric,
  builtup_area_sqft  numeric,
  floor              int,
  total_floors       int,
  furnishing         furnishing,
  facing             text,
  age_years          int,
  display_price      numeric not null,
  deposit            numeric,
  maintenance        numeric,
  available_from     date,
  tenant_preference  text[],
  amenities          text[],
  description        text,
  city_id            uuid references cities,
  locality_id        uuid references localities,
  address_area       text,
  location           geography(point) not null,
  status             property_status default 'draft',
  is_verified        boolean default false,
  switto_score       int check (switto_score between 1 and 5),
  is_featured        boolean default false,
  featured_until     timestamptz,
  view_count         int default 0,
  enquiry_count      int default 0,
  rejection_reason   text,
  published_at       timestamptz,
  expires_at         timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ── property_owner_contact ───────────────────────────────────────────────────
create table property_owner_contact (
  property_id        uuid primary key references properties on delete cascade,
  owner_asking_price numeric not null,
  full_address       text,
  alt_phone          text,
  internal_notes     text
);

-- ── property_media ───────────────────────────────────────────────────────────
create table property_media (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties on delete cascade,
  url         text not null,
  kind        text default 'photo',
  width       int,
  height      int,
  blurhash    text,
  sort_order  int default 0,
  is_cover    boolean default false
);

-- ── amenities ────────────────────────────────────────────────────────────────
create table amenities (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  icon       text,
  sort_order int default 0
);

-- ── faqs ─────────────────────────────────────────────────────────────────────
create table faqs (
  id         uuid primary key default gen_random_uuid(),
  category   text not null default 'general',
  question   text not null,
  answer     text not null,
  sort_order int default 0
);

-- ── value_props ──────────────────────────────────────────────────────────────
create table value_props (
  id         uuid primary key default gen_random_uuid(),
  icon       text not null,
  title      text not null,
  body       text not null,
  sort_order int default 0
);

-- ── testimonials ─────────────────────────────────────────────────────────────
create table testimonials (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  locality    text,
  rating      int check (rating between 1 and 5),
  body        text not null,
  avatar_url  text,
  sort_order  int default 0,
  is_active   boolean default true
);

-- ── settings (kv) ────────────────────────────────────────────────────────────
create table settings (
  key   text primary key,
  value text not null
);

-- ── audit_log ────────────────────────────────────────────────────────────────
create table audit_log (
  id         bigint generated always as identity primary key,
  table_name text not null,
  record_id  text not null,
  action     text not null,
  actor_id   uuid,
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz default now()
);

-- ── leads ────────────────────────────────────────────────────────────────────
create table leads (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties,
  seeker_id   uuid references profiles,
  name        text,
  phone       text,
  message     text,
  status      lead_status default 'new',
  notes       text,
  source      text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── shortlists ───────────────────────────────────────────────────────────────
create table shortlists (
  user_id     uuid not null references profiles,
  property_id uuid not null references properties,
  primary key (user_id, property_id)
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index on properties using gist (location);
create index on properties (status, city_id, listing_type, property_type, display_price);
create index on properties (owner_id, status);
create index on properties using gin (to_tsvector('english', title || ' ' || coalesce(description,'')));
create index on leads (status, created_at desc);

-- ── Helper function ──────────────────────────────────────────────────────────
create or replace function is_admin(uid uuid) returns boolean
  language sql security definer
  as $$
    select coalesce((select role = 'admin' from profiles where id = uid), false)
  $$;

-- ── Public view ──────────────────────────────────────────────────────────────
create view properties_public with (security_invoker = true) as
  select
    id, slug, title, listing_type, property_type, bhk, bathrooms,
    carpet_area_sqft, builtup_area_sqft, floor, total_floors, furnishing,
    facing, age_years, display_price, deposit, maintenance, available_from,
    tenant_preference, amenities, description, city_id, locality_id,
    address_area, location,
    st_x(location::geometry) as lng,
    st_y(location::geometry) as lat,
    switto_score, is_verified, is_featured,
    view_count, published_at
  from properties
  where status in ('approved','rented','sold');

-- ── Enable RLS on every table ────────────────────────────────────────────────
alter table profiles                enable row level security;
alter table cities                  enable row level security;
alter table localities              enable row level security;
alter table properties              enable row level security;
alter table property_owner_contact  enable row level security;
alter table property_media          enable row level security;
alter table amenities               enable row level security;
alter table faqs                    enable row level security;
alter table value_props             enable row level security;
alter table testimonials            enable row level security;
alter table settings                enable row level security;
alter table leads                   enable row level security;
alter table shortlists              enable row level security;

-- ── Grant schema usage ───────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;

-- ── properties: explicit grants so the view (security_invoker) works ─────────
grant select on table properties to anon, authenticated;
grant select, insert, update, delete on table properties to authenticated;

-- ── property_owner_contact: block anon entirely ───────────────────────────────
revoke all on table property_owner_contact from anon;
grant select, insert, update, delete on table property_owner_contact to authenticated;

-- ── property_media ───────────────────────────────────────────────────────────
grant select on table property_media to anon, authenticated;
grant insert, update, delete on table property_media to authenticated;

-- ── public read-only tables ───────────────────────────────────────────────────
grant select on table cities, localities, amenities, faqs, value_props, testimonials, settings to anon, authenticated;

-- ── properties_public view ───────────────────────────────────────────────────
grant select on table properties_public to anon, authenticated;

-- ── leads, shortlists, profiles ──────────────────────────────────────────────
grant select, insert, update, delete on table leads to authenticated;
grant select, insert, delete on table shortlists to authenticated;
grant select, update on table profiles to authenticated;

-- ── RLS Policies ─────────────────────────────────────────────────────────────

-- profiles
create policy "profiles_read_own" on profiles for select to authenticated
  using (id = auth.uid() or is_admin(auth.uid()));
create policy "profiles_update_own" on profiles for update to authenticated
  using (id = auth.uid());

-- cities, localities: public read
create policy "cities_anon_read"      on cities      for select to anon      using (true);
create policy "cities_auth_read"      on cities      for select to authenticated using (true);
create policy "localities_anon_read"  on localities  for select to anon      using (true);
create policy "localities_auth_read"  on localities  for select to authenticated using (true);

-- properties: anon sees approved/rented/sold only; owner sees all own; admin sees all
create policy "properties_anon_select" on properties for select to anon
  using (status in ('approved','rented','sold'));

create policy "properties_auth_select" on properties for select to authenticated
  using (
    status in ('approved','rented','sold')
    or owner_id = auth.uid()
    or is_admin(auth.uid())
  );

create policy "properties_owner_write" on properties for insert to authenticated
  with check (owner_id = auth.uid());

create policy "properties_owner_update" on properties for update to authenticated
  using (owner_id = auth.uid() or is_admin(auth.uid()));

create policy "properties_owner_delete" on properties for delete to authenticated
  using (owner_id = auth.uid() or is_admin(auth.uid()));

-- property_owner_contact: owner of that property + admin only
alter table property_owner_contact enable row level security;

create policy "owner_reads_own" on property_owner_contact for select to authenticated
  using (exists (
    select 1 from properties p
    where p.id = property_id and p.owner_id = auth.uid()
  ));

create policy "admin_all" on property_owner_contact for all to authenticated
  using (is_admin(auth.uid()));

-- property_media
create policy "media_anon_select" on property_media for select to anon
  using (exists (
    select 1 from properties p
    where p.id = property_id and p.status in ('approved','rented','sold')
  ));

create policy "media_auth_select" on property_media for select to authenticated
  using (exists (
    select 1 from properties p
    where p.id = property_id
      and (p.status in ('approved','rented','sold') or p.owner_id = auth.uid() or is_admin(auth.uid()))
  ));

create policy "media_owner_write" on property_media for insert to authenticated
  with check (exists (
    select 1 from properties p
    where p.id = property_id and p.owner_id = auth.uid()
  ));

create policy "media_owner_delete" on property_media for delete to authenticated
  using (exists (
    select 1 from properties p
    where p.id = property_id and (p.owner_id = auth.uid() or is_admin(auth.uid()))
  ));

-- amenities, faqs, value_props, testimonials: public read
create policy "amenities_read"   on amenities   for select to anon, authenticated using (true);
create policy "faqs_read"        on faqs        for select to anon, authenticated using (true);
create policy "value_props_read" on value_props for select to anon, authenticated using (true);
create policy "testimonials_anon_read" on testimonials for select to anon
  using (is_active = true);
create policy "testimonials_auth_read" on testimonials for select to authenticated
  using (is_active = true);

-- settings: public read, admin write
create policy "settings_read"  on settings for select to anon, authenticated using (true);
create policy "settings_admin" on settings for all to authenticated
  using (is_admin(auth.uid()));

-- leads
create policy "leads_seeker_own" on leads for select to authenticated
  using (seeker_id = auth.uid());
create policy "leads_owner_prop" on leads for select to authenticated
  using (exists (
    select 1 from properties p where p.id = property_id and p.owner_id = auth.uid()
  ));
create policy "leads_admin_all" on leads for all to authenticated
  using (is_admin(auth.uid()));
create policy "leads_seeker_insert" on leads for insert to authenticated
  with check (seeker_id = auth.uid());

-- shortlists
create policy "shortlists_own" on shortlists for all to authenticated
  using (user_id = auth.uid());

-- ── Profile creation trigger ──────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
