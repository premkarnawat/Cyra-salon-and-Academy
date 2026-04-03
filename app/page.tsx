"use client";

import { useEffect, useState, useCallback } from "react";
import { OpeningScreen } from "@/components/animations/OpeningScreen";
import { Navbar } from "@/components/sections/Navbar";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { OffersSection } from "@/components/sections/OffersSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { RateCardSection } from "@/components/sections/RateCardSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { WhatsAppButton } from "@/components/sections/WhatsAppButton";
import { Footer } from "@/components/sections/Footer";
import { FormLockModal } from "@/components/sections/FormLockModal";
import { useFormLock } from "@/hooks/useFormLock";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DEFAULT_CONFIG } from "@/lib/constants";
import type { Banner, Offer, Package, RateCard, GalleryItem, Review } from "@/types";

export default function HomePage() {
  const [showOpening, setShowOpening] = useState(true);
  const [mounted,     setMounted]     = useState(false);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [offers,    setOffers]    = useState<Offer[]>([]);
  const [packages,  setPackages]  = useState<Package[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [gallery,   setGallery]   = useState<GalleryItem[]>([]);
  const [reviews,   setReviews]   = useState<Review[]>([]);

  const { config } = useSiteSettings();
  const { isLocked, isSubmitted, triggerByClick, onFormSuccess } = useFormLock();

  // ── Fetch all data on mount ────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    Promise.allSettled([
      fetch("/api/banners").then(r => r.json()),
      fetch("/api/offers").then(r => r.json()),
      fetch("/api/packages").then(r => r.json()),
      fetch("/api/rate-cards").then(r => r.json()),   // ← new endpoint
      fetch("/api/gallery").then(r => r.json()),
      fetch("/api/reviews").then(r => r.json()),
    ]).then(([b, o, p, rc, g, r]) => {
      if (b.status  === "fulfilled" && Array.isArray(b.value))  setBanners(b.value);
      if (o.status  === "fulfilled" && Array.isArray(o.value))  setOffers(o.value);
      if (p.status  === "fulfilled" && Array.isArray(p.value))  setPackages(p.value);
      if (rc.status === "fulfilled" && Array.isArray(rc.value)) setRateCards(rc.value);
      if (g.status  === "fulfilled" && Array.isArray(g.value))  setGallery(g.value);
      if (r.status  === "fulfilled" && Array.isArray(r.value))  setReviews(r.value);
    });
  }, []);

  const handleOpeningComplete = useCallback(() => setShowOpening(false), []);

  if (!mounted) return null;

  return (
    <>
      {/* Opening animation */}
      {showOpening && (
        <OpeningScreen
          bgUrl={config.opening_bg_url || DEFAULT_CONFIG.opening_bg_url}
          logoUrl={config.opening_logo_url}
          salonName={config.salon_name?.split(" ")[0] || "Cyra"}
          onComplete={handleOpeningComplete}
        />
      )}

      {/* Form lock modal */}
      <FormLockModal
        isOpen={isLocked && !isSubmitted}
        onSuccess={onFormSuccess}
      />

      {/* Main site — hidden during opening */}
      <div className={`transition-opacity duration-700 ${showOpening ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <Navbar config={config} onExploreOffers={triggerByClick} />

        <main>
          <HeroBanner   banners={banners}     onExploreCTA={isSubmitted ? undefined : triggerByClick} />
          <OffersSection  offers={offers} />
          <PackagesSection packages={packages} />
          <RateCardSection rateCards={rateCards} />   {/* ← replaces ServicesSection */}
          <GallerySection  gallery={gallery} />
          <ReviewsSection  reviews={reviews} />
        </main>

        <Footer config={config} />
        <WhatsAppButton />
      </div>
    </>
  );
}
