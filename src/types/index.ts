export interface PropertyMedia {
  url: string;
  isCover: boolean;
  sortOrder: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  listingType: "rent" | "sale";
  propertyType:
    | "flat"
    | "independent_house"
    | "room"
    | "pg"
    | "hostel"
    | "shop"
    | "office"
    | "plot";
  bhk: number | null;
  bathrooms: number | null;
  carpetAreaSqft: number | null;
  builtupAreaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished" | null;
  facing: string | null;
  ageYears: number | null;
  displayPrice: number;
  deposit: number | null;
  maintenance: number | null;
  availableFrom: string | null;
  tenantPreference: string[];
  amenities: string[];
  description: string;
  localitySlug: string;
  addressArea: string;
  lat: number | null;
  lng: number | null;
  isVerified: boolean;
  swiitoScore: 1 | 2 | 3 | 4 | 5 | null;
  isFeatured: boolean;
  viewCount: number;
  publishedAt: string;
  media: PropertyMedia[];
}

export interface Locality {
  slug: string;
  name: string;
  description: string;
  listingCount: number;
  imageUrl: string;
  lat: number;
  lng: number;
}

export interface ValueProp {
  id: string;
  icon: string;
  title: string;
  body: string;
  sortOrder: number;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface PropertyFilters {
  localities?: string[];
  types?: string[];
  listing?: "rent" | "sale";
  minPrice?: number;
  maxPrice?: number;
  bhk?: number[];
  furnishing?: string[];
  amenities?: string[];
  verified?: boolean;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "score";
  page?: number;
  perPage?: number;
  q?: string;
}

export interface PropertyPage {
  properties: Property[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface LocalityDetail extends Locality {
  id: string;
  metaTitle: string | null;
  metaDescription: string | null;
  faqs: Faq[];
}

export interface PriceContext {
  rentMin: number | null;
  rentAvg: number | null;
  saleMin: number | null;
  saleAvg: number | null;
}

export interface MapPin {
  id: string;
  slug: string;
  title: string;
  displayPrice: number;
  listingType: "rent" | "sale";
  lat: number;
  lng: number;
  coverUrl: string | null;
  bhk: number | null;
  propertyType: Property["propertyType"];
}

export interface Testimonial {
  id: string;
  authorName: string;
  locality: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  avatarUrl: string;
}

export interface PropertyDetail extends Property {
  localityName: string;
  localityId: string;
}

export interface Lead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  source: string | null;
  status: "new" | "contacted" | "connected" | "closed_won" | "closed_lost" | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "seeker" | "owner" | "admin" | null;
}

export type PropertyStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "rented"
  | "sold"
  | "expired";

export interface OwnerListing {
  id: string;
  slug: string;
  title: string;
  status: PropertyStatus;
  listingType: "rent" | "sale";
  propertyType: Property["propertyType"];
  addressArea: string;
  localityId: string | null;
  displayPrice: number;
  viewCount: number;
  enquiryCount: number;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  coverUrl: string | null;
}

export interface OwnerListingFull extends OwnerListing {
  bhk: number | null;
  bathrooms: number | null;
  carpetAreaSqft: number | null;
  builtupAreaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished" | null;
  ageYears: number | null;
  facing: string | null;
  amenities: string[];
  description: string;
  deposit: number | null;
  maintenance: number | null;
  availableFrom: string | null;
  tenantPreference: string[];
  askingPrice: number;
  fullAddress: string;
  media: { id: string; url: string; isCover: boolean; sortOrder: number }[];
}

export interface OwnerStats {
  total: number;
  live: number;
  pending: number;
  totalViews: number;
  totalEnquiries: number;
}

export interface AdminStats {
  pendingApprovals: number;
  newLeads: number;
  staleListings: number;
  unverifiedOwners: number;
}

export interface AdminPendingListing {
  id: string;
  title: string;
  listingType: "rent" | "sale";
  propertyType: Property["propertyType"];
  addressArea: string;
  localityName: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  askingPrice: number;
  photoCount: number;
  createdAt: string;
}

export interface AdminListingFull {
  id: string;
  slug: string;
  title: string;
  status: PropertyStatus;
  listingType: "rent" | "sale";
  propertyType: Property["propertyType"];
  addressArea: string;
  localityId: string | null;
  localityName: string | null;
  displayPrice: number;
  bhk: number | null;
  bathrooms: number | null;
  carpetAreaSqft: number | null;
  builtupAreaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished" | null;
  ageYears: number | null;
  facing: string | null;
  amenities: string[];
  description: string;
  deposit: number | null;
  maintenance: number | null;
  availableFrom: string | null;
  tenantPreference: string[];
  swiitoScore: number | null;
  isVerified: boolean;
  isFeatured: boolean;
  rejectionReason: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  viewCount: number;
  enquiryCount: number;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  ownerAskingPrice: number;
  fullAddress: string | null;
  media: { id: string; url: string; isCover: boolean; sortOrder: number }[];
}

export interface AdminPropertyRow {
  id: string;
  slug: string;
  title: string;
  status: PropertyStatus;
  listingType: "rent" | "sale";
  propertyType: Property["propertyType"];
  addressArea: string;
  localityName: string | null;
  displayPrice: number;
  askingPrice: number;
  viewCount: number;
  enquiryCount: number;
  createdAt: string;
  ownerName: string | null;
}

export interface AdminPropertyPage {
  properties: AdminPropertyRow[];
  total: number;
  page: number;
  perPage: number;
}

export interface AdminPropertyFilters {
  status?: PropertyStatus | "all";
  listingType?: "rent" | "sale" | "all";
  search?: string;
  stale?: boolean;
  page?: number;
  perPage?: number;
}

export interface AdminUser {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: "seeker" | "owner" | "admin" | null;
  isOwner: boolean;
  isVerified: boolean;
  listingCount: number;
  leadCount: number;
  createdAt: string;
}

export interface AdminUserPage {
  users: AdminUser[];
  total: number;
  page: number;
  perPage: number;
}

export interface AdminUserFilters {
  role?: "seeker" | "owner" | "admin" | "all";
  search?: string;
  page?: number;
  perPage?: number;
}

export interface AdminLead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  seekerName: string | null;
  seekerPhone: string | null;
  seekerEmail: string | null;
  source: string | null;
  status: "new" | "contacted" | "connected" | "closed_won" | "closed_lost" | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminLeadPage {
  leads: AdminLead[];
  total: number;
  page: number;
  perPage: number;
}

export interface AdminLeadFilters {
  status?: "new" | "contacted" | "connected" | "closed_won" | "closed_lost" | "all";
  search?: string;
  page?: number;
  perPage?: number;
}

export interface AuditEntry {
  id: number;
  actorId: string | null;
  action: string;
  tableName: string;
  recordId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  page: number;
  perPage: number;
}

export interface AuditFilters {
  tableName?: string;
  action?: string;
  page?: number;
  perPage?: number;
}

export interface AdminTestimonial {
  id: string;
  authorName: string;
  locality: string | null;
  rating: number | null;
  body: string;
  avatarUrl: string | null;
  isActive: boolean;
  sortOrder: number | null;
}

export interface AdminContent {
  faqs: Faq[];
  valueProps: ValueProp[];
  testimonials: AdminTestimonial[];
}
