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
import { AboutSection }    from "@/components/sections/AboutSection";
import { WhatsAppButton }  from "@/components/sections/WhatsAppButton";
import { Footer }          from "@/components/sections/Footer";
import { FormLockModal }   from "@/components/sections/FormLockModal";
import { useFormLock }     from "@/hooks/useFormLock";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { Banner, Offer, Package, RateCard, GalleryItem, Review, SiteConfig } from "@/types";

// All data fetched server-side and passed as props — no client fetching needed
interface HomeClientProps {
  initialBanners:   Banner[];
  initialOffers:    Offer[];
  initialPackages:  Package[];
  initialRateCards: RateCard[];
  initialGallery:   GalleryItem[];
  initialReviews:   Review[];
  initialConfig:    SiteConfig;
}

export function HomeClient({
  initialBanners,
  initialOffers,
  initialPackages,
  initialRateCards,
  initialGallery,
  initialReviews,
  initialConfig,
}: HomeClientProps) {
  const [showOpening, setShowOpening] = useState(true);
  const [mounted,     setMounted]     = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Data starts as server-fetched values — no loading flash
  const [banners,   setBanners]   = useState<Banner[]>(initialBanners);
  const [offers,    setOffers]    = useState<Offer[]>(initialOffers);
  const [packages,  setPackages]  = useState<Package[]>(initialPackages);
  const [rateCards, setRateCards] = useState<RateCard[]>(initialRateCards);
  const [gallery,   setGallery]   = useState<GalleryItem[]>(initialGallery);
  const [reviews,   setReviews]   = useState<Review[]>(initialReviews);

  // useSiteSettings still used for live config updates (theme toggle etc.)
  // but seeded with server-fetched initialConfig so first paint is instant
  const { config, loading } = useSiteSettings(initialConfig);

  const {
    isLocked,
    isSubmitted,
    returningName,
    triggerByClick,
    onFormSuccess,
  } = useFormLock();

  // Welcome banner: show for exactly 3 seconds then auto-hide
  useEffect(() => {
    if (isSubmitted && returningName && !showOpening) {
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isSubmitted, returningName, showOpening]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpeningComplete = useCallback(() => setShowOpening(false), []);

  if (!mounted) return null;

  const placement = config.logo_placement ?? "none";

  return (
    <>
      {/* While config is loading: show a plain dark screen — no flicker, no Unsplash */}
      {showOpening && loading && (
        <div className="fixed inset-0 z-[9999] bg-[#0C0B09]" />
      )}

      {/* Once config is ready: single clean splash — DB image + logo + text together */}
      {showOpening && !loading && (
        <OpeningScreen
          bgUrl={config.opening_bg_url || undefined}
          logoUrl={config.opening_logo_url || config.logo_url || undefined}
          salonName={config.salon_name?.split(" ")[0] || "Cyra"}
          onComplete={handleOpeningComplete}
        />
      )}

      {/* Pass logo_placement so FormLockModal knows whether to show logo */}
      <FormLockModal
        isOpen={isLocked && !isSubmitted}
        onSuccess={onFormSuccess}
        logoUrl={config.form_logo_url || config.logo_url}
        logoPlacement={placement}
      />

      <div className={`transition-opacity duration-700 ${showOpening ? "opacity-0 pointer-events-none" : "opacity-100"}`}>

        {/* Welcome back banner — auto-hides after exactly 3 seconds */}
        <AnimatePresence>
          {showWelcome && returningName && (
            <motion.div
              initial={{ opacity:0, y:-48 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-48 }}
              transition={{ duration:0.4, ease:[0.4,0,0.2,1] }}
              style={{
                position:"fixed",
                top:"5rem",
                left:0,
                right:0,
                zIndex:800,
                pointerEvents:"none",
                display:"flex",
                justifyContent:"center",
                padding:"0 1rem",
              }}
            >
              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 20px", borderRadius:99,
                background:"rgba(255,255,255,0.96)",
                backdropFilter:"blur(16px)",
                WebkitBackdropFilter:"blur(16px)",
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
          <HeroBanner      banners={banners}     onExploreCTA={isSubmitted ? undefined : triggerByClick} />
          <OffersSection   offers={offers} />
          <PackagesSection packages={packages} />
          <AboutSection    aboutText={config.about_text} aboutImageUrl={config.about_image_url} />
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
