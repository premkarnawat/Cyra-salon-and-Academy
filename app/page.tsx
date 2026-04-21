"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OpeningScreen }    from "@/components/animations/OpeningScreen";
import { Navbar }           from "@/components/sections/Navbar";
import { HeroBanner }       from "@/components/sections/HeroBanner";
import { OffersSection }    from "@/components/sections/OffersSection";
import { PackagesSection }  from "@/components/sections/PackagesSection";
import { RateCardSection }  from "@/components/sections/RateCardSection";
import { GallerySection }   from "@/components/sections/GallerySection";
import { ReviewsSection }   from "@/components/sections/ReviewsSection";
import { WhatsAppButton }   from "@/components/sections/WhatsAppButton";
import { Footer }           from "@/components/sections/Footer";
import { FormLockModal }    from "@/components/sections/FormLockModal";
import { useFormLock }      from "@/hooks/useFormLock";
import { useSiteSettings }  from "@/hooks/useSiteSettings";
import { DEFAULT_CONFIG }   from "@/lib/constants";
import type { Banner, Offer, Package, RateCard, GalleryItem, Review } from "@/types";

export default function HomePage() {
  const [showOpening, setShowOpening] = useState(true);
  const [mounted,     setMounted]     = useState(false);

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

  return (
    <>
      {showOpening && (
        <OpeningScreen
          bgUrl={config.opening_bg_url || DEFAULT_CONFIG.opening_bg_url}
          logoUrl={config.opening_logo_url}
          salonName={config.salon_name?.split(" ")[0] || "Cyra"}
          onComplete={handleOpeningComplete}
        />
      )}

      {/* Form — new signature: onSuccess(name, contact) */}
      <FormLockModal
        isOpen={isLocked && !isSubmitted}
        onSuccess={onFormSuccess}
      />

      <div className={`transition-opacity duration-700 ${showOpening ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        {/* Welcome back banner for returning users */}
        <AnimatePresence>
          {isSubmitted && returningName && !showOpening && (
            <motion.div
              initial={{ opacity:0, y:-40 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-40 }}
              transition={{ duration:0.5, delay:0.3 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-[800] pointer-events-none"
            >
              <div
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(191,160,106,0.3)",
                  boxShadow: "0 8px 24px rgba(191,160,106,0.18)",
                }}
              >
                <span style={{ fontSize:16 }}>✨</span>
                <span className="font-jost text-[12px] font-medium text-[#5A4E3C] tracking-wide">
                  Welcome back, <strong className="text-[var(--gold-dark)]">{returningName.split(" ")[0]}</strong>!
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
