// ─── Database Types ──────────────────────────────────────────────────────────

export interface LeadEntry {
  id: string;
  name: string;
  contact: string;
  dob: string;
  created_at: string;
  session_id?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  discount_text?: string;
  image_url: string;
  cta_text?: string;
  cta_link?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  tag?: string;
  name: string;
  discount_text: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  actual_price: number;
  offer_price: number;
  discount_percent: number;
  image_url?: string;
  badge?: string;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  category?: string;
  starting_price?: number;
  description?: string;
  image_url?: string;       // jpg/png
  rate_card_url?: string;   // pdf or image
  file_type?: "image" | "pdf";
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title?: string;
  media_url: string;
  media_type: "image" | "video";
  thumbnail_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  avatar_url?: string;
  service?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

// ─── Settings Keys ───────────────────────────────────────────────────────────

export interface SiteConfig {
  salon_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  opening_hours: string;
  logo_url: string;
  opening_bg_url: string;
  opening_logo_url: string;
  footer_copyright: string;
  instagram_url: string;
  facebook_url: string;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface FormLockState {
  isLocked: boolean;
  isSubmitted: boolean;
  triggerType: "scroll" | "cta" | null;
}

export type ThemeMode = "light" | "dark";
