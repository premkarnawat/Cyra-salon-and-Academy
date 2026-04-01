-- ================================================================
-- CYRA SALON — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── LEADS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  contact     TEXT NOT NULL,
  dob         TEXT NOT NULL,
  session_id  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BANNERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  subtitle        TEXT,
  discount_text   TEXT,
  image_url       TEXT NOT NULL,
  cta_text        TEXT DEFAULT 'Explore Offers',
  cta_link        TEXT DEFAULT '#offers',
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── OFFERS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag             TEXT,
  name            TEXT NOT NULL,
  discount_text   TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PACKAGES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  description       TEXT,
  actual_price      NUMERIC(10,2) DEFAULT 0,
  offer_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percent  INTEGER DEFAULT 0,
  image_url         TEXT,
  badge             TEXT,
  features          TEXT[] DEFAULT '{}',
  is_active         BOOLEAN DEFAULT TRUE,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  category        TEXT,
  starting_price  NUMERIC(10,2),
  description     TEXT,
  image_url       TEXT,
  rate_card_url   TEXT,
  file_type       TEXT DEFAULT 'image' CHECK (file_type IN ('image', 'pdf')),
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GALLERY ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT,
  media_url       TEXT NOT NULL,
  media_type      TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  thumbnail_url   TEXT,
  sort_order      INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REVIEWS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name   TEXT NOT NULL,
  rating          INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT NOT NULL,
  avatar_url      TEXT,
  service         TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SITE SETTINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;

-- LEADS: anyone can insert (lead capture), only auth can read/delete
CREATE POLICY "leads_insert_anon"   ON leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "leads_select_auth"   ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "leads_delete_auth"   ON leads FOR DELETE TO authenticated USING (true);

-- BANNERS: public can read active ones; auth can do everything
CREATE POLICY "banners_select_anon" ON banners FOR SELECT TO anon    USING (is_active = true);
CREATE POLICY "banners_all_auth"    ON banners FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- OFFERS
CREATE POLICY "offers_select_anon"  ON offers FOR SELECT TO anon    USING (is_active = true);
CREATE POLICY "offers_all_auth"     ON offers FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- PACKAGES
CREATE POLICY "packages_select_anon" ON packages FOR SELECT TO anon   USING (is_active = true);
CREATE POLICY "packages_all_auth"    ON packages FOR ALL   TO authenticated USING (true) WITH CHECK (true);

-- SERVICES
CREATE POLICY "services_select_anon" ON services FOR SELECT TO anon   USING (is_active = true);
CREATE POLICY "services_all_auth"    ON services FOR ALL   TO authenticated USING (true) WITH CHECK (true);

-- GALLERY
CREATE POLICY "gallery_select_anon"  ON gallery FOR SELECT TO anon    USING (is_active = true);
CREATE POLICY "gallery_all_auth"     ON gallery FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- REVIEWS
CREATE POLICY "reviews_select_anon"  ON reviews FOR SELECT TO anon    USING (is_active = true);
CREATE POLICY "reviews_all_auth"     ON reviews FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- SITE SETTINGS: anyone can read, only auth can write
CREATE POLICY "settings_select_anon" ON site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "settings_all_auth"    ON site_settings FOR ALL  TO authenticated USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard > Storage > New Bucket
-- Or via SQL below (requires storage extension):
-- ═══════════════════════════════════════════════════════════════

-- Note: Create the following buckets in Supabase Dashboard > Storage
-- with "Public bucket" enabled:
--   • media     (general media)
--   • banners   (hero banner images)
--   • gallery   (gallery images/videos)
--   • ratecard  (service rate card PDFs/images)
--   • settings  (logo, opening background)

-- Storage RLS — allow public read, auth upload
-- Set each bucket to PUBLIC in the Supabase dashboard
-- Then add this policy to each bucket:
-- "Allow public read"  → SELECT for anon
-- "Allow auth upload"  → INSERT for authenticated

-- ═══════════════════════════════════════════════════════════════
-- SEED: Default site settings
-- ═══════════════════════════════════════════════════════════════

INSERT INTO site_settings (key, value) VALUES
  ('salon_name',       'Cyra Salon'),
  ('tagline',          'Salon & Academy · Pune'),
  ('phone',            '+91 98765 43210'),
  ('whatsapp',         '919876543210'),
  ('email',            'hello@cyrasalon.in'),
  ('address',          'Koregaon Park, Pune, Maharashtra 411001'),
  ('opening_hours',    '10 AM – 8 PM · All Days'),
  ('footer_copyright', '© 2025 Cyra Salon & Academy. All rights reserved.'),
  ('instagram_url',    'https://instagram.com/cyrasalon'),
  ('facebook_url',     'https://facebook.com/cyrasalon'),
  ('opening_bg_url',   'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1800&q=85'),
  ('opening_logo_url', '')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SEED: Sample banners
-- ═══════════════════════════════════════════════════════════════

INSERT INTO banners (title, subtitle, discount_text, image_url, cta_text, sort_order) VALUES
  ('Flat 30% Off',      'On All Hair Treatments',               '30% OFF',    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1800&q=85', 'Explore Offers', 1),
  ('Bridal Package',    'Complete Hair, Makeup & Styling',      '₹7,999 ONLY','https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1800&q=85', 'Book Now',       2),
  ('Keratin Treatment', 'Silky Smooth Hair · Lasts 4–6 Months','25% OFF',    'https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1800&q=85',    'Know More',      3)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SEED: Sample offers
-- ═══════════════════════════════════════════════════════════════

INSERT INTO offers (tag, name, discount_text, description, image_url, sort_order) VALUES
  ('Best Seller', 'Keratin Treatment', '30% OFF',    'Silky smooth, frizz-free hair lasting 4–6 months', 'https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=600&q=80', 1),
  ('Popular',     'Hair Colouring',   '25% OFF',    'Global colour, highlights & balayage by experts',   'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80', 2),
  ('Limited',     'Bridal Package',   '₹999 ONLY',  'Complete hair + makeup + styling for your big day', 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80', 3),
  ('Relax',       'Hair Spa',         '20% OFF',    'Deep conditioning with scalp massage & nourishment','https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&q=80', 4),
  ('Quick Deal',  'Cut & Style',      '15% OFF',    'Expert cut with salon-finish blow dry',             'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80', 5)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SEED: Sample packages
-- ═══════════════════════════════════════════════════════════════

INSERT INTO packages (name, actual_price, offer_price, discount_percent, badge, image_url, features, sort_order) VALUES
  ('Glow',   2000,  1499, 25, 'Starter',      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',  ARRAY['Hair Spa + Scalp Massage','Basic Cut & Blow Dry','Eyebrow Threading','Face Clean-Up'], 1),
  ('Luxe',   5500,  3999, 27, 'Most Popular', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', ARRAY['Keratin / Smoothening','Global Hair Colour','Hair Spa Treatment','Cut Style & Blow Dry','Face Bleach + Threading'], 2),
  ('Bridal', 12000, 7999, 33, 'Elite',        'https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80', ARRAY['Pre-Bridal Facial','Full Hair Colour + Treatment','HD Bridal Makeup','Saree / Lehenga Draping','Photoshoot Styling','2 Trial Sessions'], 3)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SEED: Sample reviews
-- ═══════════════════════════════════════════════════════════════

INSERT INTO reviews (customer_name, rating, review_text, service, sort_order) VALUES
  ('Priya S.',  5, 'Absolutely loved my keratin treatment! My hair is so smooth now. The staff is professional and the salon has such a luxurious feel.', 'Keratin Treatment', 1),
  ('Meera K.',  5, 'Got my balayage done here and I couldn''t be happier. The colour is exactly what I envisioned. Will definitely come back!',           'Balayage',         2),
  ('Ananya R.', 5, 'The bridal package was worth every rupee. The whole team made my wedding day absolutely stunning. Highly recommend!',                 'Bridal Package',   3),
  ('Divya M.',  4, 'Great ambiance and experienced stylists. My hair spa left my hair feeling incredible. Booking again next month!',                     'Hair Spa',         4),
  ('Sneha P.',  5, 'The team is super skilled and very warm. Got a haircut and style — turned out exactly as I wanted. Love this place!',                 'Cut & Style',      5)
ON CONFLICT DO NOTHING;
