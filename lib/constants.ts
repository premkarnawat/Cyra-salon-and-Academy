// Default/fallback site config
export const DEFAULT_CONFIG = {
  salon_name:       "Cyra Salon",
  tagline:          "Salon & Academy · Pune",
  phone:            "+91 98765 43210",
  whatsapp:         "919876543210",
  email:            "hello@cyrasalon.in",
  address:          "Koregaon Park, Pune, Maharashtra 411001",
  opening_hours:    "10 AM – 8 PM · All Days",
  logo_url:         "",
  opening_bg_url:   "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1800&q=85",
  opening_logo_url: "",
  footer_copyright: "© 2025 Cyra Salon & Academy. All rights reserved.",
  instagram_url:    "https://instagram.com/cyrasalon",
  facebook_url:     "https://facebook.com/cyrasalon",
  logo_placement:   "none" as "none" | "navbar" | "form" | "both",
  address2:         "",
  navbar_logo_url:  "",
  form_logo_url:    "",
  footer_logo_url:  "",
  about_text:       "",
  about_image_url:  "",
};

export const NAV_LINKS = [
  { label: "Home",     href: "#home" },
  { label: "Offers",   href: "#offers" },
  { label: "Packages", href: "#packages" },
  { label: "Services", href: "#services" },
  { label: "Gallery",  href: "#gallery" },
  { label: "Reviews",  href: "#reviews" },
  { label: "Contact",  href: "#footer" },
];

export const BUCKETS = {
  media:    "media",
  banners:  "banners",
  gallery:  "gallery",
  ratecard: "ratecard",
  settings: "settings",
};

export const STAGGER = {
  fast:   0.05,
  normal: 0.1,
  slow:   0.15,
};
