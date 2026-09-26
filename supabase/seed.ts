/**
 * Seed script. Run with: pnpm db:seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env from .env.local
const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const [key, ...rest] = line.trim().split("=");
  if (key && rest.length) process.env[key] = rest.join("=");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const LOCAL_IMAGES: Record<string, string> = {
  "1531835551805-16d864c8d17e": "/properties/living-room-03.jpg",
  "1524758631624-e2822132143d": "/properties/bedroom-05.jpg",
  "1522771739844-6a9f6a5ab7b1": "/properties/kitchen-02.jpg",
  "1505693416388-ac5ce068fe85": "/properties/living-room-01.jpg",
  "1586023492125-27b2c045efd6": "/properties/building-exterior-02.jpg",
  "1560448204-e02f11c3d0e2":    "/properties/apartment-interior-01.jpg",
  "1484154218953-bbde7706e8ab": "/properties/bedroom-04.jpg",
  "1545324418-cc1a3fa490c3":    "/properties/bathroom-02.jpg",
  "1583847268964-b28dc8f51f92": "/properties/bedroom-01.jpg",
  "1580587771525-78b9dba3b914": "/properties/living-room-02.jpg",
  "1493809842364-78817add7ffb": "/properties/kitchen-dining-01.jpg",
  "1555041469-6ae23d3b2bcc":    "/properties/bedroom-06.jpg",
  "1502672777536-5f1ab2a67f2e": "/properties/living-room-04.jpg",
  "1480714378702-aba56aa814a0": "/properties/building-exterior-01.jpg",
  "1564013799819-9f6f0b2bbfd4": "/properties/kitchen-03.jpg",
  "1486325212027-8081e485255e": "/properties/flat-exterior-01.jpg",
  "1506905925346-21bda4d32df4": "/properties/building-exterior-02.jpg",
  "1556909114-f6e7ad7d3136":    "/properties/bedroom-07.jpg",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function img(id: string, _w = 800) {
  return LOCAL_IMAGES[id] ?? "/properties/living-room-01.jpg";
}

// ── Users ─────────────────────────────────────────────────────────────────────
const USERS = [
  { email: "owner1@swiito.test", password: "Swiito@123", full_name: "Ramesh Kumar",   phone: "9801234561" },
  { email: "owner2@swiito.test", password: "Swiito@123", full_name: "Sunita Devi",    phone: "9801234562" },
  { email: "owner3@swiito.test", password: "Swiito@123", full_name: "Ajay Sharma",    phone: "9801234563" },
  { email: "owner4@swiito.test", password: "Swiito@123", full_name: "Priya Singh",    phone: "9801234564" },
  { email: "seeker@swiito.test", password: "Swiito@123", full_name: "Vikash Gupta",   phone: "9801234565" },
  { email: "admin@swiito.test",  password: "Swiito@123", full_name: "Swiito Admin",   phone: "9801234566" },
];

async function seedUsers() {
  // Fetch existing users so re-runs can look up IDs
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const byEmail = new Map((existing?.users ?? []).map((u) => [u.email ?? "", u.id]));

  const ids: string[] = [];
  for (const u of USERS) {
    const existingId = byEmail.get(u.email);
    if (existingId) {
      ids.push(existingId);
      continue;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, phone: u.phone },
    });
    if (error) {
      console.error("User error:", u.email, error.message);
      ids.push("");
      continue;
    }
    ids.push(data.user?.id ?? "");
  }
  // Set admin role
  const adminId = ids[5];
  if (adminId) {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", adminId);
  }
  return ids; // [o1,o2,o3,o4,seeker,admin]
}

// ── City ─────────────────────────────────────────────────────────────────────
async function seedCity() {
  const { data } = await supabase
    .from("cities")
    .upsert({ name: "Ranchi", slug: "ranchi" }, { onConflict: "slug" })
    .select("id")
    .single();
  return data!.id as string;
}

// ── Localities ───────────────────────────────────────────────────────────────
const LOCALITY_DEFS = [
  { slug: "hindpiri", name: "Hindpiri", lat: 23.346, lng: 85.311, sort: 1,
    desc: "Central Ranchi's dense, vibrant neighbourhood. Markets, autos, and old Ranchi charm.",
    img: img("1586023492125-27b2c045efd6", 640) },
  { slug: "lalpur",   name: "Lalpur",   lat: 23.365, lng: 85.323, sort: 2,
    desc: "Commercial heart of the city. Excellent connectivity, shops, and restaurants on your doorstep.",
    img: img("1564013799819-9f6f0b2bbfd4", 640) },
  { slug: "kanke",    name: "Kanke",    lat: 23.415, lng: 85.305, sort: 3,
    desc: "Quieter north Ranchi near the universities. Newer buildings, greenery, and calm lanes.",
    img: img("1506905925346-21bda4d32df4", 640) },
  { slug: "bariatu",  name: "Bariatu",  lat: 23.353, lng: 85.296, sort: 4,
    desc: "Adjacent to RIMS hospital. Popular with doctors, nurses, and medical students.",
    img: img("1502672777536-5f1ab2a67f2e", 640) },
  { slug: "harmu",     name: "Harmu",     lat: 23.361, lng: 85.286, sort: 5,
    desc: "Quiet residential locality with easy access to Ranchi University.", img: img("1560448204-e02f11c3d0e2", 640) },
  { slug: "kadru",     name: "Kadru",     lat: 23.355, lng: 85.334, sort: 6,
    desc: "East Ranchi township with wide roads and good amenities.", img: img("1583847268964-b28dc8f51f92", 640) },
  { slug: "doranda",   name: "Doranda",   lat: 23.328, lng: 85.313, sort: 7,
    desc: "South Ranchi hub near government offices and schools.", img: img("1555041469-6ae23d3b2bcc", 640) },
  { slug: "hinoo",     name: "Hinoo",     lat: 23.335, lng: 85.303, sort: 8,
    desc: "Mixed-use area with good transport links to city centre.", img: img("1545324418-cc1a3fa490c3", 640) },
  { slug: "ashok-nagar", name: "Ashok Nagar", lat: 23.371, lng: 85.342, sort: 9,
    desc: "Upcoming residential zone with newer constructions.", img: img("1484154218953-bbde7706e8ab", 640) },
  { slug: "morabadi",  name: "Morabadi",  lat: 23.380, lng: 85.296, sort: 10,
    desc: "North Ranchi locality near Morabadi ground — leafy and calm.", img: img("1505693416388-ac5ce068fe85", 640) },
  { slug: "ratu-road", name: "Ratu Road", lat: 23.395, lng: 85.310, sort: 11,
    desc: "Developing corridor with affordable options and good schools.", img: img("1522771739844-6a9f6a5ab7b1", 640) },
  { slug: "argora",    name: "Argora",    lat: 23.342, lng: 85.298, sort: 12,
    desc: "Well-connected area between Doranda and Harmu.", img: img("1531835551805-16d864c8d17e", 640) },
];

async function seedLocalities(cityId: string) {
  const rows = LOCALITY_DEFS.map((l) => ({
    city_id: cityId, name: l.name, slug: l.slug,
    lat: l.lat, lng: l.lng, description: l.desc,
    image_url: l.img, sort_order: l.sort,
  }));
  const { data } = await supabase.from("localities").upsert(rows, { onConflict: "slug" }).select("id, slug");
  return Object.fromEntries((data ?? []).map((l) => [l.slug, l.id])) as Record<string, string>;
}

// ── Amenities ─────────────────────────────────────────────────────────────────
const AMENITY_NAMES = [
  "Water Supply 24/7","Power Backup","Parking","Security","CCTV",
  "Lift","Balcony","Modular Kitchen","Air Conditioning","Gym",
  "Play Area","Garden","Common Area","Intercom","Gas Pipeline",
];
async function seedAmenities() {
  await supabase.from("amenities").upsert(
    AMENITY_NAMES.map((name, i) => ({ name, sort_order: i })),
    { onConflict: "name" }
  );
}

// ── Value Props ───────────────────────────────────────────────────────────────
async function seedValueProps() {
  const props = [
    { icon: "ShieldCheck", title: "Every property verified",         body: "Our team visits or video-verifies each listing before it goes live. No ghost listings.", sort_order: 1 },
    { icon: "Camera",      title: "Real photos, no surprises",       body: "We only accept listings with genuine photos taken at the property. What you see is what you get.", sort_order: 2 },
    { icon: "Lock",        title: "Your contact stays private",      body: "Seekers never see the owner's number. Owners never see the seeker's number. Only Swiito's broker connects you.", sort_order: 3 },
    { icon: "MapPin",      title: "Local Ranchi knowledge",          body: "Our team lives here. We know which lanes flood, which buildings have lift issues, and which localities are noisy on weekends.", sort_order: 4 },
    { icon: "CheckCircle", title: "No dead listings",                body: "We call every owner weekly to confirm availability. If a flat is taken, it comes down within 24 hours.", sort_order: 5 },
    { icon: "Phone",       title: "One point of contact",            body: "One Swiito number. No multiple brokers. No confusion. Just call, ask, and we handle the rest.", sort_order: 6 },
  ];
  await supabase.from("value_props").upsert(props, { onConflict: "title" });
}

// ── FAQs ─────────────────────────────────────────────────────────────────────
async function seedFaqs() {
  const faqs = [
    { category: "general",  question: "How does Swiito work?",                       answer: "Browse verified listings, then create a free Swiito account. Once signed in, you get our broker's number — call us and we arrange everything. Owners post their property, we verify it, then publish it. Your number is never shared with anyone.", sort_order: 1 },
    { category: "seekers",  question: "Is it free to browse listings?",              answer: "Yes. You can browse all listings without signing in. Sign-up is only needed when you want to contact us about a specific property.", sort_order: 2 },
    { category: "owners",   question: "Who can post a listing on Swiito?",           answer: "Any property owner in Ranchi can post for free. Create an account as an owner, fill in the details and upload photos, and we'll verify and publish within 48 hours.", sort_order: 3 },
    { category: "seekers",  question: "Can I see the owner's contact directly?",     answer: "No. Swiito keeps all contact private. When you sign up and express interest, you receive Swiito's broker number. We connect you with the owner on a call — your numbers are never exchanged.", sort_order: 4 },
    { category: "general",  question: "How do I know if a listing is genuine?",      answer: "Every listing on Swiito carries our verification stamp. Our team physically or video-verifies the property before it's published. Listings with a Swiito Score have been rated by our team for quality and accuracy.", sort_order: 5 },
    { category: "general",  question: "Which areas of Ranchi does Swiito cover?",    answer: "Currently Hindpiri, Lalpur, Kanke, and Bariatu. We're expanding to Harmu, Doranda, and Ratu Road in the coming months.", sort_order: 6 },
  ];
  await supabase.from("faqs").upsert(faqs, { onConflict: "question" });
}

// ── Settings ──────────────────────────────────────────────────────────────────
async function seedSettings() {
  const rows = [
    { key: "broker_whatsapp", value: "917488459279" },
    { key: "broker_phone",    value: "+917488459279" },
    { key: "broker_display",  value: "+91 74884 59279" },
    { key: "instagram_url",   value: "https://www.instagram.com/city_vlogs7/" },
  ];
  await supabase.from("settings").upsert(rows, { onConflict: "key" });
}

// ── Properties ────────────────────────────────────────────────────────────────

interface PropDef {
  slug: string; title: string; listing_type: string; property_type: string;
  bhk?: number | null; bathrooms: number; carpet_area_sqft: number; builtup_area_sqft: number;
  floor?: number | null; total_floors: number; furnishing: string; facing?: string | null;
  age_years?: number | null; display_price: number; deposit?: number | null;
  maintenance?: number | null; available_from?: string | null;
  tenant_preference: string[]; amenities: string[]; description: string;
  locality: string; address_area: string; lat: number; lng: number;
  status: string; is_verified: boolean; switto_score?: number | null;
  is_featured: boolean; view_count: number; published_at?: string | null;
  owner_idx: number; owner_asking_price: number;
  media: { url: string; is_cover: boolean; sort_order: number }[];
}

const PROPS: PropDef[] = [
  // ── HINDPIRI (8 listings) ───────────────────────────────────────────────
  {
    slug:"room-hindpiri-market-001", title:"Affordable Room Near Hindpiri Market",
    listing_type:"rent", property_type:"room", bhk:null, bathrooms:1,
    carpet_area_sqft:120, builtup_area_sqft:140, floor:1, total_floors:3,
    furnishing:"unfurnished", facing:"East", age_years:18, display_price:3500,
    deposit:7000, maintenance:null, available_from:"2026-09-15",
    tenant_preference:["Bachelor","Working Professional"], amenities:["Water Supply 24/7","CCTV"],
    description:"A no-frills room in a bustling Hindpiri lane. Ground-floor building, close to market and autos. Shared bathroom available on the floor.",
    locality:"hindpiri", address_area:"Hindpiri Market", lat:23.345, lng:85.310,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:42, published_at:"2026-08-01T10:00:00Z", owner_idx:0, owner_asking_price:3200,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:2 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"1bhk-flat-hindpiri-chowk-002", title:"1 BHK Flat Near Hindpiri Chowk",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:360, builtup_area_sqft:420, floor:2, total_floors:4,
    furnishing:"semi_furnished", facing:"North", age_years:12, display_price:6000,
    deposit:12000, maintenance:300, available_from:"2026-09-01",
    tenant_preference:["Family","Working Professional"], amenities:["Water Supply 24/7","Power Backup","Security"],
    description:"Well-maintained 1 BHK on second floor with attached kitchen and bathroom. Semi-furnished with fans and geysers. Close to buses and daily essentials.",
    locality:"hindpiri", address_area:"Hindpiri Chowk", lat:23.347, lng:85.312,
    status:"approved", is_verified:true, switto_score:4, is_featured:false,
    view_count:118, published_at:"2026-08-10T09:00:00Z", owner_idx:0, owner_asking_price:5800,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:5 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"room-hindpiri-station-rd-003", title:"Budget Room for Students in Hindpiri",
    listing_type:"rent", property_type:"room", bhk:null, bathrooms:1,
    carpet_area_sqft:100, builtup_area_sqft:115, floor:3, total_floors:3,
    furnishing:"unfurnished", facing:null, age_years:22, display_price:4200,
    deposit:8400, maintenance:null, available_from:"2026-09-10",
    tenant_preference:["Student","Bachelor"], amenities:["Water Supply 24/7"],
    description:"Top-floor room in an old Hindpiri building. Economical rent, walking distance to Station Road autos. No cooking gas but LPG hook-up available.",
    locality:"hindpiri", address_area:"Station Road, Hindpiri", lat:23.344, lng:85.309,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:31, published_at:"2026-08-15T11:00:00Z", owner_idx:0, owner_asking_price:4000,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1531835551805-16d864c8d17e"), is_cover:false, sort_order:2 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:3 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"1bhk-flat-hindpiri-railway-004", title:"Spacious 1 BHK Flat in Hindpiri",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:450, builtup_area_sqft:520, floor:1, total_floors:2,
    furnishing:"unfurnished", facing:"South", age_years:15, display_price:8500,
    deposit:17000, maintenance:400, available_from:"2026-10-01",
    tenant_preference:["Family","Working Professional"], amenities:["Parking","Water Supply 24/7","Security"],
    description:"Ground-floor 1 BHK with private parking and a small rear garden. Quiet lane off the main Hindpiri road.",
    locality:"hindpiri", address_area:"Hindpiri, Near Railway Colony", lat:23.346, lng:85.313,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:74, published_at:"2026-08-20T14:00:00Z", owner_idx:0, owner_asking_price:8000,
    media:[
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"2bhk-hindpiri-pending-005", title:"2 BHK Flat Near Hindpiri Bus Stand",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:680, builtup_area_sqft:800, floor:3, total_floors:5,
    furnishing:"semi_furnished", facing:"East", age_years:8, display_price:13000,
    deposit:26000, maintenance:600, available_from:"2026-10-15",
    tenant_preference:["Family"], amenities:["Lift","Security","CCTV","Power Backup","Parking"],
    description:"Bright 2 BHK near Hindpiri bus stand. Lift access, 24-hour security. East-facing with morning sunlight.",
    locality:"hindpiri", address_area:"Hindpiri Bus Stand Road", lat:23.348, lng:85.311,
    status:"pending", is_verified:false, switto_score:null, is_featured:false,
    view_count:0, published_at:null, owner_idx:1, owner_asking_price:12500,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
    ],
  },
  {
    slug:"plot-hindpiri-sale-006", title:"Residential Plot for Sale in Hindpiri",
    listing_type:"sale", property_type:"plot", bhk:null, bathrooms:0,
    carpet_area_sqft:1200, builtup_area_sqft:0, floor:null, total_floors:0,
    furnishing:"unfurnished", facing:"North", age_years:null, display_price:3500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:[],
    description:"1200 sq ft north-facing plot on a paved road in Hindpiri. Clear title, ready for construction.",
    locality:"hindpiri", address_area:"Hindpiri, Behind Market", lat:23.343, lng:85.308,
    status:"approved", is_verified:true, switto_score:null, is_featured:false,
    view_count:55, published_at:"2026-08-25T08:00:00Z", owner_idx:1, owner_asking_price:3200000,
    media:[
      { url:img("1480714378702-aba56aa814a0"), is_cover:true,  sort_order:1 },
      { url:img("1564013799819-9f6f0b2bbfd4"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
    ],
  },
  {
    slug:"hostel-hindpiri-007", title:"Affordable Hostel in Hindpiri for Students",
    listing_type:"rent", property_type:"hostel", bhk:null, bathrooms:4,
    carpet_area_sqft:80, builtup_area_sqft:90, floor:2, total_floors:3,
    furnishing:"semi_furnished", facing:null, age_years:10, display_price:3000,
    deposit:6000, maintenance:null, available_from:"2026-09-01",
    tenant_preference:["Student"], amenities:["Water Supply 24/7","Common Area","CCTV"],
    description:"Hostel-style accommodation in Hindpiri. Shared rooms with a bed, study table, and locker per person.",
    locality:"hindpiri", address_area:"Hindpiri, Near Government School", lat:23.345, lng:85.312,
    status:"approved", is_verified:false, switto_score:2, is_featured:false,
    view_count:29, published_at:"2026-09-01T10:00:00Z", owner_idx:1, owner_asking_price:2800,
    media:[
      { url:img("1486325212027-8081e485255e"), is_cover:true,  sort_order:1 },
      { url:img("1531835551805-16d864c8d17e"), is_cover:false, sort_order:2 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"3bhk-hindpiri-sale-008", title:"3 BHK Flat for Sale Near Hindpiri",
    listing_type:"sale", property_type:"flat", bhk:3, bathrooms:2,
    carpet_area_sqft:1100, builtup_area_sqft:1300, floor:4, total_floors:6,
    furnishing:"semi_furnished", facing:"West", age_years:5, display_price:6500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Lift","Security","Parking","Power Backup"],
    description:"Premium 3 BHK in a modern high-rise near Hindpiri. Lift, covered parking. Ready for possession.",
    locality:"hindpiri", address_area:"Hindpiri Colony Extension", lat:23.346, lng:85.314,
    status:"approved", is_verified:true, switto_score:5, is_featured:true,
    view_count:190, published_at:"2026-09-05T08:00:00Z", owner_idx:0, owner_asking_price:6200000,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:4 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:5 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:6 },
    ],
  },
  // ── LALPUR (8 listings) ─────────────────────────────────────────────────
  {
    slug:"1bhk-furnished-lalpur-009", title:"Modern 1 BHK in Lalpur, Fully Furnished",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:520, builtup_area_sqft:620, floor:4, total_floors:6,
    furnishing:"fully_furnished", facing:"West", age_years:4, display_price:9000,
    deposit:18000, maintenance:500, available_from:"2026-09-15",
    tenant_preference:["Working Professional","Any"], amenities:["Lift","Security","CCTV","Power Backup","Modular Kitchen","Air Conditioning","Balcony"],
    description:"Premium 1 BHK in a well-maintained society. Fully furnished with AC, modular kitchen, sofa, and bed.",
    locality:"lalpur", address_area:"Lalpur, Main Road", lat:23.365, lng:85.323,
    status:"approved", is_verified:true, switto_score:5, is_featured:true,
    view_count:312, published_at:"2026-08-05T08:00:00Z", owner_idx:1, owner_asking_price:8500,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1556909114-f6e7ad7d3136"), is_cover:false, sort_order:4 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:5 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:6 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:7 },
    ],
  },
  {
    slug:"2bhk-lalpur-semi-furnished-010", title:"2 BHK Semi-Furnished Flat in Lalpur",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:780, builtup_area_sqft:940, floor:3, total_floors:5,
    furnishing:"semi_furnished", facing:"North-East", age_years:7, display_price:15000,
    deposit:30000, maintenance:800, available_from:"2026-10-01",
    tenant_preference:["Family","Working Professional"], amenities:["Lift","Security","CCTV","Parking","Power Backup","Balcony","Water Supply 24/7"],
    description:"Bright 2 BHK with north-east light all morning. Wardrobes, fans, and a modular kitchen shell.",
    locality:"lalpur", address_area:"Lalpur, Near Kali Mandir", lat:23.364, lng:85.325,
    status:"approved", is_verified:true, switto_score:4, is_featured:true,
    view_count:245, published_at:"2026-08-08T10:00:00Z", owner_idx:1, owner_asking_price:14500,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:4 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:5 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:6 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:7 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:8 },
    ],
  },
  {
    slug:"shop-lalpur-commercial-011", title:"Commercial Shop Space in Lalpur",
    listing_type:"rent", property_type:"shop", bhk:null, bathrooms:1,
    carpet_area_sqft:280, builtup_area_sqft:320, floor:0, total_floors:3,
    furnishing:"unfurnished", facing:"South", age_years:9, display_price:12000,
    deposit:36000, maintenance:null, available_from:"2026-09-01",
    tenant_preference:[], amenities:["Parking","CCTV","Power Backup"],
    description:"Ground-floor commercial space on a busy Lalpur lane. High ceiling, south-facing glass façade.",
    locality:"lalpur", address_area:"Lalpur Commercial Area", lat:23.363, lng:85.322,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:88, published_at:"2026-08-22T12:00:00Z", owner_idx:2, owner_asking_price:11000,
    media:[
      { url:img("1564013799819-9f6f0b2bbfd4"), is_cover:true,  sort_order:1 },
      { url:img("1480714378702-aba56aa814a0"), is_cover:false, sort_order:2 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:3 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:4 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"office-lalpur-furnished-012", title:"Furnished Office Space in Lalpur",
    listing_type:"rent", property_type:"office", bhk:null, bathrooms:2,
    carpet_area_sqft:650, builtup_area_sqft:780, floor:2, total_floors:5,
    furnishing:"fully_furnished", facing:"East", age_years:5, display_price:16000,
    deposit:48000, maintenance:1200, available_from:"2026-09-01",
    tenant_preference:[], amenities:["Lift","Security","CCTV","Power Backup","Air Conditioning","Parking"],
    description:"Corporate-ready office on second floor. Workstations, conference table, AC and fibre-ready.",
    locality:"lalpur", address_area:"Lalpur, Near Firayalal", lat:23.366, lng:85.324,
    status:"approved", is_verified:true, switto_score:null, is_featured:false,
    view_count:97, published_at:"2026-08-25T09:00:00Z", owner_idx:2, owner_asking_price:15000,
    media:[
      { url:img("1524758631624-e2822132143d"), is_cover:true,  sort_order:1 },
      { url:img("1564013799819-9f6f0b2bbfd4"), is_cover:false, sort_order:2 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:3 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:4 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"4bhk-lalpur-sale-013", title:"4 BHK Builder Floor for Sale in Lalpur",
    listing_type:"sale", property_type:"independent_house", bhk:4, bathrooms:3,
    carpet_area_sqft:1800, builtup_area_sqft:2100, floor:null, total_floors:3,
    furnishing:"semi_furnished", facing:"North", age_years:3, display_price:12000000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Parking","Security","Garden","Modular Kitchen","Power Backup"],
    description:"Premium 4 BHK builder floor in Lalpur's prime area. Excellent build quality with modular kitchen.",
    locality:"lalpur", address_area:"Lalpur, Premium Colony", lat:23.367, lng:85.321,
    status:"approved", is_verified:true, switto_score:5, is_featured:true,
    view_count:280, published_at:"2026-09-02T08:00:00Z", owner_idx:2, owner_asking_price:11500000,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:2 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:3 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:4 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:5 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"pg-lalpur-womens-014", title:"Women's PG in Lalpur with Meals",
    listing_type:"rent", property_type:"pg", bhk:null, bathrooms:3,
    carpet_area_sqft:150, builtup_area_sqft:170, floor:1, total_floors:3,
    furnishing:"semi_furnished", facing:null, age_years:6, display_price:5500,
    deposit:11000, maintenance:null, available_from:"2026-09-01",
    tenant_preference:["Student","Working Professional"], amenities:["Water Supply 24/7","CCTV","Common Area","Power Backup"],
    description:"Managed women's PG in Lalpur with meals included. CCTV, strict visitor policy, clean shared bathrooms.",
    locality:"lalpur", address_area:"Lalpur, Women's Colony Lane", lat:23.362, lng:85.326,
    status:"approved", is_verified:true, switto_score:4, is_featured:false,
    view_count:156, published_at:"2026-09-03T09:00:00Z", owner_idx:3, owner_asking_price:5200,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1583847268964-b28dc8f51f92"), is_cover:false, sort_order:4 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"2bhk-lalpur-rented-015", title:"2 BHK Near Albert Ekka Chowk, Lalpur",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:900, builtup_area_sqft:1050, floor:5, total_floors:8,
    furnishing:"fully_furnished", facing:"South-East", age_years:2, display_price:22000,
    deposit:44000, maintenance:1000, available_from:"2026-11-01",
    tenant_preference:["Working Professional","Family"], amenities:["Lift","Security","CCTV","Power Backup","Air Conditioning","Gym","Modular Kitchen","Balcony"],
    description:"High-floor 2 BHK with panoramic city views. Fully furnished. Gym and rooftop access included.",
    locality:"lalpur", address_area:"Near Albert Ekka Chowk", lat:23.364, lng:85.320,
    status:"rented", is_verified:true, switto_score:5, is_featured:false,
    view_count:340, published_at:"2026-07-15T09:00:00Z", owner_idx:3, owner_asking_price:21000,
    media:[
      { url:img("1556909114-f6e7ad7d3136"), is_cover:true,  sort_order:1 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:2 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:3 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:4 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:5 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:6 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:7 },
    ],
  },
  {
    slug:"3bhk-lalpur-rejected-016", title:"3 BHK Apartment in Lalpur High Rise",
    listing_type:"rent", property_type:"flat", bhk:3, bathrooms:3,
    carpet_area_sqft:1200, builtup_area_sqft:1450, floor:9, total_floors:15,
    furnishing:"unfurnished", facing:"West", age_years:1, display_price:30000,
    deposit:60000, maintenance:1500, available_from:"2026-10-01",
    tenant_preference:["Family"], amenities:["Lift","Security","CCTV","Power Backup","Parking","Gym","Play Area"],
    description:"Brand new high-rise 3 BHK, unfurnished. Society with gym and play area. Rejected due to incomplete docs.",
    locality:"lalpur", address_area:"Lalpur High Rise Society", lat:23.366, lng:85.326,
    status:"rejected", is_verified:false, switto_score:null, is_featured:false,
    view_count:0, published_at:null, owner_idx:3, owner_asking_price:28000,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
    ],
  },
  // ── KANKE (7 listings) ──────────────────────────────────────────────────
  {
    slug:"2bhk-kanke-road-bit-017", title:"2 BHK Near BIT Mesra, Kanke Road",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:820, builtup_area_sqft:980, floor:2, total_floors:4,
    furnishing:"semi_furnished", facing:"East", age_years:6, display_price:14000,
    deposit:28000, maintenance:600, available_from:"2026-09-20",
    tenant_preference:["Family","Working Professional","Student"], amenities:["Parking","Security","Water Supply 24/7","Power Backup","Balcony","Play Area"],
    description:"Spacious 2 BHK on Kanke Road, walking distance from BIT Mesra gate. East-facing with morning sun.",
    locality:"kanke", address_area:"Kanke Road, Near BIT Mesra", lat:23.412, lng:85.307,
    status:"approved", is_verified:true, switto_score:4, is_featured:true,
    view_count:198, published_at:"2026-08-28T08:30:00Z", owner_idx:2, owner_asking_price:13500,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1556909114-f6e7ad7d3136"), is_cover:false, sort_order:4 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:5 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:6 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:7 },
    ],
  },
  {
    slug:"3bhk-independent-house-kanke-018", title:"3 BHK Independent House in Kanke",
    listing_type:"rent", property_type:"independent_house", bhk:3, bathrooms:3,
    carpet_area_sqft:1600, builtup_area_sqft:1900, floor:null, total_floors:2,
    furnishing:"unfurnished", facing:"North", age_years:3, display_price:28000,
    deposit:56000, maintenance:1500, available_from:"2026-10-15",
    tenant_preference:["Family"], amenities:["Parking","Garden","Security","CCTV","Power Backup","Water Supply 24/7","Modular Kitchen"],
    description:"Brand new 3 BHK independent house in a quiet Kanke enclave. Private garden and covered parking for two cars.",
    locality:"kanke", address_area:"Kanke, Near Kanke Dam Road", lat:23.418, lng:85.303,
    status:"approved", is_verified:true, switto_score:5, is_featured:true,
    view_count:287, published_at:"2026-09-01T07:00:00Z", owner_idx:2, owner_asking_price:26500,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:4 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:5 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:6 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:7 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:8 },
    ],
  },
  {
    slug:"2bhk-kanke-furnished-019", title:"Fully Furnished 2 BHK Near Kanke Road",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:900, builtup_area_sqft:1080, floor:3, total_floors:5,
    furnishing:"fully_furnished", facing:"South-West", age_years:4, display_price:20000,
    deposit:40000, maintenance:900, available_from:"2026-09-15",
    tenant_preference:["Working Professional","Family"], amenities:["Lift","Security","CCTV","Power Backup","Air Conditioning","Modular Kitchen","Balcony","Gym"],
    description:"Move-in-ready 2 BHK fully furnished with two ACs, premium modular kitchen, and gym access.",
    locality:"kanke", address_area:"Kanke Road Colony", lat:23.414, lng:85.305,
    status:"approved", is_verified:true, switto_score:null, is_featured:false,
    view_count:156, published_at:"2026-09-02T10:00:00Z", owner_idx:2, owner_asking_price:19000,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1556909114-f6e7ad7d3136"), is_cover:false, sort_order:4 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:5 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"room-kanke-dam-020", title:"Single Room Near Kanke Dam, Kanke",
    listing_type:"rent", property_type:"room", bhk:null, bathrooms:1,
    carpet_area_sqft:140, builtup_area_sqft:160, floor:1, total_floors:2,
    furnishing:"unfurnished", facing:"East", age_years:20, display_price:4500,
    deposit:9000, maintenance:null, available_from:"2026-09-05",
    tenant_preference:["Bachelor","Student"], amenities:["Water Supply 24/7","Power Backup"],
    description:"Peaceful room near Kanke Dam. Ideal for morning walks. Shared bathroom, simple accommodation.",
    locality:"kanke", address_area:"Kanke, Near Dam Road", lat:23.420, lng:85.300,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:38, published_at:"2026-09-03T11:00:00Z", owner_idx:3, owner_asking_price:4200,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1583847268964-b28dc8f51f92"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:4 },
    ],
  },
  {
    slug:"4bhk-kanke-sale-021", title:"4 BHK Bungalow for Sale in Kanke",
    listing_type:"sale", property_type:"independent_house", bhk:4, bathrooms:4,
    carpet_area_sqft:2500, builtup_area_sqft:3000, floor:null, total_floors:2,
    furnishing:"semi_furnished", facing:"East", age_years:7, display_price:8500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Parking","Garden","Security","CCTV","Modular Kitchen","Power Backup","Lift"],
    description:"Spacious 4 BHK bungalow on 3000 sq ft land in Kanke. Double garage, manicured garden.",
    locality:"kanke", address_area:"Kanke Colony, Main Road", lat:23.416, lng:85.306,
    status:"approved", is_verified:true, switto_score:5, is_featured:true,
    view_count:220, published_at:"2026-09-04T08:00:00Z", owner_idx:2, owner_asking_price:8000000,
    media:[
      { url:img("1506905925346-21bda4d32df4"), is_cover:true,  sort_order:1 },
      { url:img("1583847268964-b28dc8f51f92"), is_cover:false, sort_order:2 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:3 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:4 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:5 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:6 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:7 },
    ],
  },
  {
    slug:"pg-kanke-students-022", title:"PG Accommodation for BIT Mesra Students",
    listing_type:"rent", property_type:"pg", bhk:null, bathrooms:3,
    carpet_area_sqft:120, builtup_area_sqft:135, floor:1, total_floors:2,
    furnishing:"semi_furnished", facing:null, age_years:9, display_price:5000,
    deposit:10000, maintenance:null, available_from:"2026-09-01",
    tenant_preference:["Student"], amenities:["Water Supply 24/7","Power Backup","Common Area","CCTV"],
    description:"Managed PG five minutes from BIT Mesra gate. Study room, Wi-Fi ready, 24-hour water and power backup.",
    locality:"kanke", address_area:"Kanke Road, Near BIT Gate 2", lat:23.413, lng:85.308,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:89, published_at:"2026-09-05T10:00:00Z", owner_idx:3, owner_asking_price:4700,
    media:[
      { url:img("1486325212027-8081e485255e"), is_cover:true,  sort_order:1 },
      { url:img("1531835551805-16d864c8d17e"), is_cover:false, sort_order:2 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"2bhk-kanke-draft-023", title:"New 2 BHK Society Apartment, Kanke",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:850, builtup_area_sqft:1000, floor:4, total_floors:6,
    furnishing:"unfurnished", facing:"North", age_years:1, display_price:18000,
    deposit:36000, maintenance:800, available_from:"2026-11-01",
    tenant_preference:["Family","Working Professional"], amenities:["Lift","Security","Parking","Power Backup"],
    description:"Brand new 2 BHK in Kanke's newest society. Unfurnished. Builder fixtures included. Ready soon.",
    locality:"kanke", address_area:"Kanke Township Extension", lat:23.415, lng:85.309,
    status:"draft", is_verified:false, switto_score:null, is_featured:false,
    view_count:0, published_at:null, owner_idx:3, owner_asking_price:17000,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:2 },
    ],
  },
  // ── BARIATU (7 listings) ────────────────────────────────────────────────
  {
    slug:"pg-bariatu-rims-024", title:"PG for Working Professionals Near RIMS",
    listing_type:"rent", property_type:"pg", bhk:null, bathrooms:2,
    carpet_area_sqft:160, builtup_area_sqft:180, floor:1, total_floors:3,
    furnishing:"semi_furnished", facing:"East", age_years:8, display_price:4500,
    deposit:9000, maintenance:null, available_from:"2026-09-05",
    tenant_preference:["Working Professional","Student"], amenities:["Water Supply 24/7","CCTV","Power Backup","Common Area"],
    description:"Managed PG one street behind RIMS hospital. Semi-furnished room with attached bathroom included in rent.",
    locality:"bariatu", address_area:"Bariatu, Near RIMS Hospital", lat:23.353, lng:85.296,
    status:"approved", is_verified:true, switto_score:4, is_featured:true,
    view_count:203, published_at:"2026-09-03T09:00:00Z", owner_idx:0, owner_asking_price:4200,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:2 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1531835551805-16d864c8d17e"), is_cover:false, sort_order:5 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"room-bariatu-rims-025", title:"Shared Room Near RIMS Hospital, Bariatu",
    listing_type:"rent", property_type:"room", bhk:null, bathrooms:1,
    carpet_area_sqft:130, builtup_area_sqft:150, floor:2, total_floors:3,
    furnishing:"unfurnished", facing:null, age_years:14, display_price:5000,
    deposit:10000, maintenance:null, available_from:"2026-09-10",
    tenant_preference:["Student","Bachelor","Working Professional"], amenities:["Water Supply 24/7","Power Backup"],
    description:"Affordable room five minutes walk from RIMS main gate. Shared bathroom, independent entrance.",
    locality:"bariatu", address_area:"Bariatu Road, Near RIMS Gate", lat:23.355, lng:85.294,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:55, published_at:"2026-09-04T11:00:00Z", owner_idx:0, owner_asking_price:4700,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1486325212027-8081e485255e"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"1bhk-bariatu-rims-colony-026", title:"1 BHK Flat in Bariatu, Close to RIMS",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:480, builtup_area_sqft:570, floor:1, total_floors:4,
    furnishing:"semi_furnished", facing:"West", age_years:10, display_price:12000,
    deposit:24000, maintenance:500, available_from:"2026-09-15",
    tenant_preference:["Family","Working Professional"], amenities:["Security","Parking","Water Supply 24/7","Power Backup","Balcony"],
    description:"1 BHK with private balcony in a gated building, walking distance to RIMS hospital.",
    locality:"bariatu", address_area:"Bariatu, RIMS Colony", lat:23.352, lng:85.297,
    status:"approved", is_verified:true, switto_score:3, is_featured:true,
    view_count:164, published_at:"2026-09-05T08:00:00Z", owner_idx:0, owner_asking_price:11500,
    media:[
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:5 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"2bhk-bariatu-doctors-colony-027", title:"2 BHK Near Bariatu Doctors Colony",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:750, builtup_area_sqft:900, floor:2, total_floors:4,
    furnishing:"semi_furnished", facing:"South", age_years:11, display_price:16000,
    deposit:32000, maintenance:700, available_from:"2026-10-01",
    tenant_preference:["Family","Working Professional"], amenities:["Security","Parking","Water Supply 24/7","Power Backup","Balcony","CCTV"],
    description:"2 BHK in the quiet Bariatu doctors colony. Peaceful locality, well-maintained building.",
    locality:"bariatu", address_area:"Bariatu, Doctors Colony Lane", lat:23.354, lng:85.295,
    status:"approved", is_verified:true, switto_score:4, is_featured:false,
    view_count:122, published_at:"2026-09-06T09:00:00Z", owner_idx:1, owner_asking_price:15500,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"bariatu-sale-flat-028", title:"3 BHK Flat for Sale in Bariatu",
    listing_type:"sale", property_type:"flat", bhk:3, bathrooms:2,
    carpet_area_sqft:1050, builtup_area_sqft:1250, floor:3, total_floors:6,
    furnishing:"unfurnished", facing:"East", age_years:6, display_price:5500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Lift","Security","Parking","Power Backup","CCTV"],
    description:"Spacious 3 BHK for sale in Bariatu. Lift access, covered parking, good resale value.",
    locality:"bariatu", address_area:"Bariatu Road, Near Hospital Chowk", lat:23.351, lng:85.298,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:98, published_at:"2026-09-07T10:00:00Z", owner_idx:1, owner_asking_price:5200000,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:2 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:3 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:4 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"room-bariatu-hostel-029", title:"Hostel for Medical Students, Bariatu",
    listing_type:"rent", property_type:"hostel", bhk:null, bathrooms:5,
    carpet_area_sqft:90, builtup_area_sqft:100, floor:1, total_floors:4,
    furnishing:"semi_furnished", facing:null, age_years:12, display_price:3500,
    deposit:7000, maintenance:null, available_from:"2026-09-01",
    tenant_preference:["Student"], amenities:["Water Supply 24/7","Power Backup","Common Area","CCTV"],
    description:"Hostel adjacent to RIMS hospital. Extremely convenient for medical students. Shared, clean bathrooms.",
    locality:"bariatu", address_area:"Bariatu, Opposite RIMS Gate 2", lat:23.353, lng:85.293,
    status:"approved", is_verified:true, switto_score:2, is_featured:false,
    view_count:67, published_at:"2026-09-08T09:00:00Z", owner_idx:1, owner_asking_price:3300,
    media:[
      { url:img("1486325212027-8081e485255e"), is_cover:true,  sort_order:1 },
      { url:img("1531835551805-16d864c8d17e"), is_cover:false, sort_order:2 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"bariatu-2bhk-expired-030", title:"2 BHK Near RIMS Colony (Expired)",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:700, builtup_area_sqft:850, floor:3, total_floors:4,
    furnishing:"fully_furnished", facing:"North", age_years:9, display_price:18000,
    deposit:36000, maintenance:800, available_from:"2026-06-01",
    tenant_preference:["Family","Working Professional"], amenities:["Security","Parking","Water Supply 24/7","Power Backup","Balcony"],
    description:"This listing has expired. The property was fully furnished and well-maintained near RIMS.",
    locality:"bariatu", address_area:"Bariatu, Near RIMS Colony Road", lat:23.354, lng:85.299,
    status:"expired", is_verified:true, switto_score:null, is_featured:false,
    view_count:178, published_at:"2026-06-01T09:00:00Z", owner_idx:0, owner_asking_price:17000,
    media:[
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
    ],
  },
  // ── HARMU (5 listings) ──────────────────────────────────────────────────
  {
    slug:"2bhk-harmu-colony-031", title:"2 BHK in Harmu Colony, Near University",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:800, builtup_area_sqft:950, floor:2, total_floors:4,
    furnishing:"semi_furnished", facing:"East", age_years:9, display_price:14000,
    deposit:28000, maintenance:600, available_from:"2026-09-20",
    tenant_preference:["Family","Working Professional"], amenities:["Parking","Security","Water Supply 24/7","Power Backup","Balcony"],
    description:"2 BHK in quiet Harmu Colony, walking distance from Ranchi University. Bright east-facing flat.",
    locality:"harmu", address_area:"Harmu Colony, Sector B", lat:23.360, lng:85.285,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:76, published_at:"2026-09-06T08:00:00Z", owner_idx:3, owner_asking_price:13500,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"1bhk-harmu-road-032", title:"Affordable 1 BHK on Harmu Road",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:420, builtup_area_sqft:500, floor:1, total_floors:3,
    furnishing:"unfurnished", facing:null, age_years:16, display_price:7500,
    deposit:15000, maintenance:300, available_from:"2026-09-15",
    tenant_preference:["Family","Working Professional","Student"], amenities:["Water Supply 24/7","Security"],
    description:"Ground-floor 1 BHK on Harmu Road. Affordable option near the main transport route.",
    locality:"harmu", address_area:"Harmu Road, Main Road", lat:23.361, lng:85.287,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:43, published_at:"2026-09-07T09:00:00Z", owner_idx:3, owner_asking_price:7200,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1531835551805-16d864c8d17e"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:4 },
    ],
  },
  {
    slug:"3bhk-harmu-sale-033", title:"3 BHK House for Sale in Harmu",
    listing_type:"sale", property_type:"independent_house", bhk:3, bathrooms:3,
    carpet_area_sqft:1400, builtup_area_sqft:1700, floor:null, total_floors:2,
    furnishing:"unfurnished", facing:"West", age_years:14, display_price:4500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Parking","Garden","Security"],
    description:"Well-maintained 3 BHK independent house in Harmu. Large plot, ample parking.",
    locality:"harmu", address_area:"Harmu Housing Colony", lat:23.362, lng:85.284,
    status:"approved", is_verified:true, switto_score:4, is_featured:false,
    view_count:135, published_at:"2026-09-08T10:00:00Z", owner_idx:0, owner_asking_price:4200000,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:3 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:4 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:5 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:6 },
    ],
  },
  {
    slug:"pg-harmu-women-034", title:"Women's PG Near Ranchi University, Harmu",
    listing_type:"rent", property_type:"pg", bhk:null, bathrooms:2,
    carpet_area_sqft:130, builtup_area_sqft:145, floor:2, total_floors:3,
    furnishing:"semi_furnished", facing:null, age_years:7, display_price:5000,
    deposit:10000, maintenance:null, available_from:"2026-09-05",
    tenant_preference:["Student"], amenities:["Water Supply 24/7","CCTV","Common Area","Power Backup"],
    description:"Women's PG steps from Ranchi University main gate. Strict curfew, clean rooms, meals optional.",
    locality:"harmu", address_area:"Harmu, Near University Gate", lat:23.363, lng:85.286,
    status:"approved", is_verified:true, switto_score:4, is_featured:false,
    view_count:88, published_at:"2026-09-09T09:00:00Z", owner_idx:1, owner_asking_price:4800,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1522771739844-6a9f6a5ab7b1"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"office-harmu-035", title:"Office Space in Harmu for Small Business",
    listing_type:"rent", property_type:"office", bhk:null, bathrooms:1,
    carpet_area_sqft:400, builtup_area_sqft:480, floor:3, total_floors:4,
    furnishing:"unfurnished", facing:"South", age_years:8, display_price:10000,
    deposit:30000, maintenance:800, available_from:"2026-10-01",
    tenant_preference:[], amenities:["Parking","Power Backup","Security"],
    description:"Clean office space in Harmu. Suited for small businesses or startups. Flexible lease terms.",
    locality:"harmu", address_area:"Harmu Road Commercial Zone", lat:23.359, lng:85.289,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:52, published_at:"2026-09-10T10:00:00Z", owner_idx:2, owner_asking_price:9500,
    media:[
      { url:img("1564013799819-9f6f0b2bbfd4"), is_cover:true,  sort_order:1 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:2 },
      { url:img("1480714378702-aba56aa814a0"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
    ],
  },
  // ── KADRU (3 listings) ──────────────────────────────────────────────────
  {
    slug:"2bhk-kadru-east-036", title:"2 BHK in Kadru East Township",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:820, builtup_area_sqft:980, floor:3, total_floors:5,
    furnishing:"semi_furnished", facing:"East", age_years:5, display_price:15000,
    deposit:30000, maintenance:700, available_from:"2026-09-25",
    tenant_preference:["Family","Working Professional"], amenities:["Lift","Security","Parking","Power Backup","Balcony"],
    description:"Modern 2 BHK in Kadru East Township. Wide roads, gated society, 15 minutes from city centre.",
    locality:"kadru", address_area:"Kadru East Township", lat:23.356, lng:85.335,
    status:"approved", is_verified:true, switto_score:4, is_featured:false,
    view_count:103, published_at:"2026-09-11T08:00:00Z", owner_idx:2, owner_asking_price:14500,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:4 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"plot-kadru-sale-037", title:"Corner Plot for Sale in Kadru",
    listing_type:"sale", property_type:"plot", bhk:null, bathrooms:0,
    carpet_area_sqft:1500, builtup_area_sqft:0, floor:null, total_floors:0,
    furnishing:"unfurnished", facing:"North-East", age_years:null, display_price:4500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:[],
    description:"Corner plot on Kadru main road. North-east facing. Registry done. Immediate possession.",
    locality:"kadru", address_area:"Kadru Main Road Junction", lat:23.355, lng:85.333,
    status:"approved", is_verified:true, switto_score:null, is_featured:false,
    view_count:79, published_at:"2026-09-12T09:00:00Z", owner_idx:3, owner_asking_price:4200000,
    media:[
      { url:img("1480714378702-aba56aa814a0"), is_cover:true,  sort_order:1 },
      { url:img("1564013799819-9f6f0b2bbfd4"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
    ],
  },
  {
    slug:"1bhk-kadru-budget-038", title:"Budget 1 BHK in Kadru for Singles",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:380, builtup_area_sqft:450, floor:1, total_floors:3,
    furnishing:"unfurnished", facing:"West", age_years:13, display_price:7000,
    deposit:14000, maintenance:250, available_from:"2026-09-15",
    tenant_preference:["Bachelor","Working Professional"], amenities:["Water Supply 24/7","Security"],
    description:"Affordable 1 BHK in Kadru. Close to bus stops and daily necessities. Basic but well-maintained.",
    locality:"kadru", address_area:"Kadru Colony, Lane 4", lat:23.354, lng:85.336,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:34, published_at:"2026-09-13T10:00:00Z", owner_idx:0, owner_asking_price:6700,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:2 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:3 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:4 },
    ],
  },
  // ── DORANDA (3 listings) ─────────────────────────────────────────────────
  {
    slug:"2bhk-doranda-govt-039", title:"2 BHK Near Government Offices, Doranda",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:750, builtup_area_sqft:900, floor:2, total_floors:4,
    furnishing:"semi_furnished", facing:"North", age_years:12, display_price:13000,
    deposit:26000, maintenance:600, available_from:"2026-10-01",
    tenant_preference:["Family","Working Professional"], amenities:["Security","Parking","Water Supply 24/7","Power Backup"],
    description:"Central 2 BHK close to Doranda's government quarter. Convenient for government employees.",
    locality:"doranda", address_area:"Doranda, Near Government Quarter", lat:23.328, lng:85.314,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:67, published_at:"2026-09-14T09:00:00Z", owner_idx:1, owner_asking_price:12500,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"3bhk-doranda-sale-040", title:"3 BHK Independent House for Sale, Doranda",
    listing_type:"sale", property_type:"independent_house", bhk:3, bathrooms:3,
    carpet_area_sqft:1600, builtup_area_sqft:1900, floor:null, total_floors:2,
    furnishing:"unfurnished", facing:"East", age_years:18, display_price:6000000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Parking","Security","Garden"],
    description:"Established 3 BHK independent house in Doranda. Mature locality, reputed schools and markets nearby.",
    locality:"doranda", address_area:"Doranda Main Road", lat:23.329, lng:85.312,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:112, published_at:"2026-09-15T08:00:00Z", owner_idx:2, owner_asking_price:5700000,
    media:[
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:true,  sort_order:1 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:2 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:3 },
      { url:img("1584622366-6568dc1d88dc"), is_cover:false, sort_order:4 },
      { url:img("1480714378702-aba56aa814a0"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"room-doranda-affordable-041", title:"Affordable Room in Doranda for Workers",
    listing_type:"rent", property_type:"room", bhk:null, bathrooms:1,
    carpet_area_sqft:110, builtup_area_sqft:125, floor:1, total_floors:2,
    furnishing:"unfurnished", facing:null, age_years:20, display_price:4000,
    deposit:8000, maintenance:null, available_from:"2026-09-10",
    tenant_preference:["Bachelor","Working Professional"], amenities:["Water Supply 24/7"],
    description:"Simple room in Doranda for working professionals. Near bus stand, affordable monthly rent.",
    locality:"doranda", address_area:"Doranda Bus Stand Road", lat:23.327, lng:85.315,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:28, published_at:"2026-09-16T10:00:00Z", owner_idx:3, owner_asking_price:3800,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
    ],
  },
  // ── HINOO, ASHOK NAGAR, MORABADI, RATU ROAD, ARGORA ─────────────────────
  {
    slug:"2bhk-hinoo-045", title:"2 BHK in Hinoo, Close to Ranchi City",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:780, builtup_area_sqft:930, floor:3, total_floors:5,
    furnishing:"semi_furnished", facing:"South", age_years:8, display_price:13500,
    deposit:27000, maintenance:600, available_from:"2026-10-01",
    tenant_preference:["Family","Working Professional"], amenities:["Parking","Security","Power Backup","Water Supply 24/7","Balcony"],
    description:"Well-connected 2 BHK in Hinoo. Close to city centre and major schools. Society with parking.",
    locality:"hinoo", address_area:"Hinoo, Near Main Road", lat:23.334, lng:85.302,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:85, published_at:"2026-09-17T09:00:00Z", owner_idx:0, owner_asking_price:13000,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:2 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"1bhk-ashok-nagar-046", title:"New 1 BHK in Ashok Nagar",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:480, builtup_area_sqft:560, floor:2, total_floors:4,
    furnishing:"unfurnished", facing:"East", age_years:2, display_price:9500,
    deposit:19000, maintenance:400, available_from:"2026-10-01",
    tenant_preference:["Working Professional","Family"], amenities:["Lift","Security","Parking","Power Backup"],
    description:"New construction 1 BHK in developing Ashok Nagar. Good connectivity to IT hubs.",
    locality:"ashok-nagar", address_area:"Ashok Nagar, New Township", lat:23.372, lng:85.343,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:47, published_at:"2026-09-18T09:00:00Z", owner_idx:1, owner_asking_price:9000,
    media:[
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:true,  sort_order:1 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:4 },
    ],
  },
  {
    slug:"3bhk-morabadi-sale-047", title:"3 BHK Villa for Sale in Morabadi",
    listing_type:"sale", property_type:"independent_house", bhk:3, bathrooms:3,
    carpet_area_sqft:1800, builtup_area_sqft:2200, floor:null, total_floors:2,
    furnishing:"semi_furnished", facing:"North", age_years:5, display_price:9500000,
    deposit:null, maintenance:null, available_from:null,
    tenant_preference:[], amenities:["Parking","Garden","Security","Modular Kitchen","Power Backup"],
    description:"Luxury 3 BHK villa near Morabadi ground. Premium colony, excellent greenery and peace.",
    locality:"morabadi", address_area:"Morabadi, Near Ground Gate", lat:23.381, lng:85.297,
    status:"approved", is_verified:true, switto_score:5, is_featured:true,
    view_count:175, published_at:"2026-09-10T08:00:00Z", owner_idx:2, owner_asking_price:9000000,
    media:[
      { url:img("1583847268964-b28dc8f51f92"), is_cover:true,  sort_order:1 },
      { url:img("1506905925346-21bda4d32df4"), is_cover:false, sort_order:2 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:3 },
      { url:img("1502672777536-5f1ab2a67f2e"), is_cover:false, sort_order:4 },
      { url:img("1560448204-e02f11c3d0e2"), is_cover:false, sort_order:5 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:6 },
      { url:img("1545324418-cc1a3fa490c3"), is_cover:false, sort_order:7 },
    ],
  },
  {
    slug:"2bhk-ratu-road-048", title:"2 BHK on Ratu Road, Affordable",
    listing_type:"rent", property_type:"flat", bhk:2, bathrooms:2,
    carpet_area_sqft:720, builtup_area_sqft:860, floor:2, total_floors:3,
    furnishing:"unfurnished", facing:"East", age_years:10, display_price:11000,
    deposit:22000, maintenance:500, available_from:"2026-09-25",
    tenant_preference:["Family","Working Professional"], amenities:["Security","Parking","Water Supply 24/7","Power Backup"],
    description:"Affordable 2 BHK on Ratu Road development corridor. Good schools and market access.",
    locality:"ratu-road", address_area:"Ratu Road, Near Market", lat:23.396, lng:85.311,
    status:"approved", is_verified:false, switto_score:2, is_featured:false,
    view_count:61, published_at:"2026-09-16T10:00:00Z", owner_idx:3, owner_asking_price:10500,
    media:[
      { url:img("1560448204-e02f11c3d0e2"), is_cover:true,  sort_order:1 },
      { url:img("1555041469-6ae23d3b2bcc"), is_cover:false, sort_order:2 },
      { url:img("1484154218953-bbde7706e8ab"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
      { url:img("1580587771525-78b9dba3b914"), is_cover:false, sort_order:5 },
    ],
  },
  {
    slug:"1bhk-argora-budget-049", title:"Budget 1 BHK in Argora",
    listing_type:"rent", property_type:"flat", bhk:1, bathrooms:1,
    carpet_area_sqft:400, builtup_area_sqft:470, floor:2, total_floors:3,
    furnishing:"unfurnished", facing:"West", age_years:11, display_price:7500,
    deposit:15000, maintenance:300, available_from:"2026-09-20",
    tenant_preference:["Working Professional","Student","Bachelor"], amenities:["Water Supply 24/7","Security","Power Backup"],
    description:"Economical 1 BHK in Argora. Well-connected to both Doranda and Harmu. Simple and clean.",
    locality:"argora", address_area:"Argora Colony, Main Road", lat:23.342, lng:85.299,
    status:"approved", is_verified:false, switto_score:null, is_featured:false,
    view_count:39, published_at:"2026-09-17T10:00:00Z", owner_idx:0, owner_asking_price:7200,
    media:[
      { url:img("1531835551805-16d864c8d17e"), is_cover:true,  sort_order:1 },
      { url:img("1524758631624-e2822132143d"), is_cover:false, sort_order:2 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:3 },
      { url:img("1586023492125-27b2c045efd6"), is_cover:false, sort_order:4 },
    ],
  },
  {
    slug:"shop-argora-commercial-050", title:"Commercial Shop in Argora for Retail",
    listing_type:"rent", property_type:"shop", bhk:null, bathrooms:1,
    carpet_area_sqft:200, builtup_area_sqft:230, floor:0, total_floors:2,
    furnishing:"unfurnished", facing:"South", age_years:7, display_price:8000,
    deposit:24000, maintenance:null, available_from:"2026-09-15",
    tenant_preference:[], amenities:["Parking","Power Backup"],
    description:"Ground-floor shop on Argora main road. High footfall area. Suitable for grocery or pharmacy.",
    locality:"argora", address_area:"Argora, Chowk Market", lat:23.341, lng:85.298,
    status:"approved", is_verified:true, switto_score:3, is_featured:false,
    view_count:58, published_at:"2026-09-18T08:00:00Z", owner_idx:1, owner_asking_price:7500,
    media:[
      { url:img("1564013799819-9f6f0b2bbfd4"), is_cover:true,  sort_order:1 },
      { url:img("1480714378702-aba56aa814a0"), is_cover:false, sort_order:2 },
      { url:img("1493809842364-78817add7ffb"), is_cover:false, sort_order:3 },
      { url:img("1505693416388-ac5ce068fe85"), is_cover:false, sort_order:4 },
    ],
  },
];

async function seedProperties(ownerIds: string[], localityMap: Record<string, string>, cityId: string) {
  for (const p of PROPS) {
    const localityId = localityMap[p.locality];
    if (!localityId) { console.warn("No locality for", p.locality); continue; }
    const ownerId = ownerIds[p.owner_idx];
    if (!ownerId) { console.warn("No owner for index", p.owner_idx); continue; }

    const { data: prop, error: propErr } = await supabase
      .from("properties")
      .upsert({
        owner_id: ownerId, slug: p.slug, title: p.title,
        listing_type: p.listing_type as "rent" | "sale",
        property_type: p.property_type as "flat",
        bhk: p.bhk, bathrooms: p.bathrooms,
        carpet_area_sqft: p.carpet_area_sqft, builtup_area_sqft: p.builtup_area_sqft,
        floor: p.floor, total_floors: p.total_floors,
        furnishing: p.furnishing as "unfurnished",
        facing: p.facing, age_years: p.age_years,
        display_price: p.display_price, deposit: p.deposit,
        maintenance: p.maintenance, available_from: p.available_from,
        tenant_preference: p.tenant_preference, amenities: p.amenities,
        description: p.description, city_id: cityId,
        locality_id: localityId, address_area: p.address_area,
        location: `SRID=4326;POINT(${p.lng} ${p.lat})`,
        status: p.status as "approved",
        is_verified: p.is_verified, switto_score: p.switto_score,
        is_featured: p.is_featured, view_count: p.view_count,
        published_at: p.published_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (propErr) { console.error("Property error:", p.slug, propErr.message); continue; }
    const propId = prop!.id as string;

    // property_owner_contact
    await supabase.from("property_owner_contact").upsert({
      property_id: propId,
      owner_asking_price: p.owner_asking_price,
    }, { onConflict: "property_id" });

    // property_media
    if (p.media.length) {
      await supabase.from("property_media").delete().eq("property_id", propId);
      await supabase.from("property_media").insert(
        p.media.map((m) => ({
          property_id: propId, url: m.url,
          is_cover: m.is_cover, sort_order: m.sort_order,
        }))
      );
    }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Seeding users…");
  const ids = await seedUsers();

  console.log("Seeding city…");
  const cityId = await seedCity();

  console.log("Seeding localities…");
  const localityMap = await seedLocalities(cityId);

  console.log("Seeding amenities…");
  await seedAmenities();

  console.log("Seeding value props…");
  await seedValueProps();

  console.log("Seeding FAQs…");
  await seedFaqs();

  console.log("Seeding settings…");
  await seedSettings();

  console.log("Seeding 50 properties…");
  await seedProperties(ids, localityMap, cityId);

  console.log("✓ Seed complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
