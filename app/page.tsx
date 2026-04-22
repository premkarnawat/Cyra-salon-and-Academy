"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OpeningScreen }   from "@/components/animations/OpeningScreen";
import { Navbar }          from "@/components/sections/Navbar";
import { HeroBanner }      from "@/components/sections/HeroBanner";
import { OffersSection }   from "@/components/sections/OffersSection";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { RateCardSection } from "@/components/sections/RateCardSection";
import { GallerySection }  from "@/components/sections/GallerySection";
import { ReviewsSection }  from "@/components/sections/ReviewsSection";
import { WhatsAppButton }  from "@/components/sections/WhatsAppButton";
import { Footer }          from "@/components/sections/Footer";
import { FormLockModal }   from "@/components/sections/FormLockModal";
import { useFormLock }     from "@/hooks/useFormLock";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { DEFAULT_CONFIG }  from "@/lib/constants";
import type { Banner, Offer, Package, RateCard, GalleryItem, Review } from "@/types";

export default function HomePage() {
  const [showOpening, setShowOpening] = useState(true);
  const [mounted,     setMounted]     = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [banners,   setBanners]   = useState<Banner[]>([]);
  const [offers,    setOffers]    = useState<Offer[]>([]);
  const [packages,  setPackages]  = useState<Package[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [gallery,   setGallery]   = useState<GalleryItem[]>([]);
  const [reviews,   setReviews]   = useState<Review[]>([]);

  const { config } = useSiteSettings();
  const {
    isLocked,
    isSubmitted,
    returningName,
    triggerByClick,
    onFormSuccess,
  } = useFormLock();

  // ── Welcome banner: show for EXACTLY 5 seconds then auto-hide ────────────
  useEffect(() => {
    if (isSubmitted && returningName && !showOpening) {
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 5000); // 5s exactly
      return () => clearTimeout(t);
    }
  }, [isSubmitted, returningName, showOpening]);

  useEffect(() => {
    setMounted(true);
    Promise.allSettled([
      fetch("/api/banners").then(r => r.json()),
      fetch("/api/offers").then(r => r.json()),
      fetch("/api/packages").then(r => r.json()),
      fetch("/api/rate-cards").then(r => r.json()),
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

  const placement = config.logo_placement ?? "none";

  return (
    <>
      {showOpening && (
        <OpeningScreen
          bgUrl={config.opening_bg_url || DEFAULT_CONFIG.opening_bg_url}
          logoUrl={config.opening_logo_url || config.logo_url}
          salonName={config.salon_name?.split(" ")[0] || "Cyra"}
          onComplete={handleOpeningComplete}
        />
      )}

      {/* Pass logo_placement so FormLockModal knows whether to show logo */}
      <FormLockModal
        isOpen={isLocked && !isSubmitted}
        onSuccess={onFormSuccess}
        logoUrl={config.logo_url}
        logoPlacement={placement}
      />

      <div className={`transition-opacity duration-700 ${showOpening ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        {/* Welcome back banner — 5 seconds then gone */}
        <AnimatePresence>
          {showWelcome && returningName && (
            <motion.div
              initial={{ opacity:0, y:-48 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-48 }}
              transition={{ duration:0.4, ease:[0.4,0,0.2,1] }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[800] pointer-events-none"
            >
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 20px", borderRadius:99,
                background:"rgba(255,255,255,0.96)",
                backdropFilter:"blur(16px)",
                border:"1px solid rgba(191,160,106,0.3)",
                boxShadow:"0 8px 28px rgba(191,160,106,0.2)",
                whiteSpace:"nowrap",
              }}>
                <span style={{ fontSize:18 }}>✨</span>
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:500, color:"#4B3C2A" }}>
                  Welcome back,{" "}
                  <strong style={{ color:"var(--gold-dark)", fontWeight:700 }}>
                    {returningName.split(" ")[0]}
                  </strong>!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Navbar config={config} onExploreOffers={triggerByClick} />

        <main>
          <HeroBanner      banners={banners}      onExploreCTA={isSubmitted ? undefined : triggerByClick} />
          <OffersSection   offers={offers} />
          <PackagesSection packages={packages} />
          <RateCardSection rateCards={rateCards} />
          <GallerySection  gallery={gallery} />
          <ReviewsSection  reviews={reviews} />
        </main>

        <Footer config={config} />
        <WhatsAppButton />
      </div>
    </>
  );
}
