# Cyra Salon & Academy — Production Website

A full-stack, high-conversion luxury salon website built with **Next.js 14**, **Tailwind CSS**, **Framer Motion**, and **Supabase**.

---

## ✨ Features

| Area | Features |
|------|----------|
| **Public Site** | Opening animation, Form-lock lead capture, Hero banner carousel, Offers, Packages, Services (PDF rate card), Gallery (images + video), Reviews, WhatsApp quick-chat |
| **Admin Panel** | Protected dashboard, Lead management + CSV export + click-to-call, Banner / Offer / Package / Service / Gallery / Review CRUD, Site settings, Opening screen control |
| **Backend** | Supabase Auth, Postgres DB with RLS, Storage buckets for all media |
| **UX** | Dark / light theme toggle, Framer Motion animations, Glassmorphism form, Fully responsive (mobile-first) |

---

## 🗂️ Project Structure

```
cyra-salon/
├── app/
│   ├── page.tsx                    ← Public homepage
│   ├── layout.tsx                  ← Root layout + fonts
│   ├── globals.css                 ← Design system CSS
│   ├── api/
│   │   ├── banners/route.ts
│   │   ├── offers/route.ts
│   │   ├── packages/route.ts
│   │   ├── services/route.ts
│   │   ├── gallery/route.ts
│   │   ├── reviews/route.ts
│   │   ├── settings/route.ts
│   │   ├── lead-capture/route.ts
│   │   └── admin/
│   │       ├── leads/route.ts
│   │       └── upload/route.ts
│   └── admin/
│       ├── login/page.tsx
│       └── dashboard/
│           ├── page.tsx            ← Dashboard overview
│           ├── leads/page.tsx
│           ├── banners/page.tsx
│           ├── offers/page.tsx
│           ├── packages/page.tsx
│           ├── services/page.tsx
│           ├── gallery/page.tsx
│           ├── reviews/page.tsx
│           └── settings/page.tsx
├── components/
│   ├── animations/
│   │   ├── OpeningScreen.tsx
│   │   └── FadeIn.tsx
│   ├── sections/
│   │   ├── Navbar.tsx
│   │   ├── AnnouncementStrip.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── OffersSection.tsx
│   │   ├── PackagesSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── GallerySection.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── FormLockModal.tsx
│   │   ├── WhatsAppButton.tsx
│   │   └── Footer.tsx
│   ├── admin/
│   │   └── AdminLayout.tsx
│   └── ui/
│       ├── GoldDivider.tsx
│       ├── SectionHeader.tsx
│       ├── StarRating.tsx
│       ├── LoadingSpinner.tsx
│       └── ImageUpload.tsx
├── hooks/
│   ├── useTheme.ts
│   ├── useFormLock.ts
│   ├── useInView.ts
│   └── useSiteSettings.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── types/index.ts
├── middleware.ts
└── supabase/schema.sql
```

---

## 🚀 Setup & Deployment

### Step 1 — Clone / Download

```bash
# If using git:
git clone <your-repo-url>
cd cyra-salon

# Or unzip the downloaded project
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note down:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role key** → `SUPABASE_SERVICE_ROLE_KEY` *(Settings → API)*

### Step 4 — Run SQL schema

1. Open Supabase Dashboard → **SQL Editor**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

This creates all tables, RLS policies, and seeds demo data.

### Step 5 — Create Storage buckets

In Supabase → **Storage** → create these **public** buckets:

| Bucket name | Purpose |
|-------------|---------|
| `media`     | General media |
| `banners`   | Hero banner images |
| `gallery`   | Gallery images & videos |
| `ratecard`  | Service rate card PDFs/images |
| `settings`  | Logo, opening background |

For each bucket → **Policies** → add:
- `SELECT` for `anon` (public read)
- `INSERT` for `authenticated` (admin upload)

### Step 6 — Create admin user

In Supabase → **Authentication** → **Users** → **Add User**

Enter your admin email and password.

### Step 7 — Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_ADMIN_EMAIL=admin@cyrasalon.in
```

### Step 8 — Run locally

```bash
npm run dev
# → http://localhost:3000         (public site)
# → http://localhost:3000/admin   (admin login)
```

### Step 9 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, then add env variables in Vercel dashboard
```

Or connect your GitHub repo in [vercel.com](https://vercel.com) and it auto-deploys.

**Add environment variables** in Vercel → Project → Settings → Environment Variables.

---

## 🔐 Admin Access

- URL: `https://your-domain.vercel.app/admin/login`
- Use the email/password you created in Supabase Auth
- Session lasts **30 days** (configured in Supabase)
- Manual logout button in sidebar

---

## 📱 User Flow

```
QR Code Scan
    ↓
Opening Animation (3s logo reveal)
    ↓
Homepage (partial content visible)
    ↓
User scrolls OR clicks "Explore Offers"
    ↓
Form Lock Modal appears (glassmorphism)
  • Name
  • Contact Number
  • Date of Birth
    ↓
Form submitted → Lead saved to Supabase
    ↓
Full site unlocked (session-scoped)
    ↓
On browser close / new tab → Form required again
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Gold primary | `#BFA06A` |
| Gold light | `#D4B483` |
| Gold dark | `#8C6E30` |
| Dark bg | `#0C0B09` |
| Cream bg | `#FDFAF4` |
| Brand font | Cinzel Decorative |
| Display font | Cormorant Garamond |
| Body font | Jost |

---

## ⚙️ Customisation

### Change WhatsApp number
Edit `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

### Change announcement strip text
Edit `components/sections/AnnouncementStrip.tsx` → `message` prop default.

### Change fallback data (shown before DB loads)
Edit the `FALLBACK_*` arrays in each section component.

### Add new admin pages
1. Create `app/admin/dashboard/[page]/page.tsx`
2. Add to `NAV_ITEMS` in `components/admin/AdminLayout.tsx`
3. Create API route in `app/api/[resource]/route.ts`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Vercel |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## 🆘 Troubleshooting

**Form not submitting?**
→ Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in env.

**Images not loading?**
→ Ensure storage buckets are set to **public** in Supabase.

**Admin login not working?**
→ Verify the user was created in Supabase Auth → Users.

**RLS blocking reads?**
→ Re-run the policy section of `schema.sql` in SQL Editor.

**Build errors on Vercel?**
→ Check all env variables are added in Vercel project settings.

---

Made with ♥ for Cyra Salon & Academy, Pune.
