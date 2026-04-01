"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";

// Fallback banners shown when DB is empty
const FALLBACK_BANNERS: Banner[] = [
  {
    id: "f1",
    title: "Flat 30% Off",
    subtitle: "On All Hair Treatments",
    discount_text: "30% OFF",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1800&q=85",
    cta_text: "Explore Offers",
    cta_link: "#offers",
    sort_order: 1,
    is_active: true,
    created_at: "",
  },
  {
    id: "f2",
    title: "Bridal Package",
    subtitle: "Complete Hair, Makeup & Styling",
    discount_text: "₹7,999 ONLY",
    image_url: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1800&q=85",
    cta_text: "Book Now",
    cta_link: "#packages",
    sort_order: 2,
    is_active: true,
    created_at: "",
  },
  {
    id: "f3",
    title: "Keratin Treatment",
    subtitle: "Silky Smooth Hair · Lasts 4–6 Months",
    discount_text: "25% OFF",
    image_url: "https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1800&q=85",
    cta_text: "Know More",
    cta_link: "#services",
    sort_order: 3,
    is_active: true,
    created_at: "",
  },
];

interface HeroBannerProps {
  banners: Banner[];
  onExploreCTA?: () => void;
}

export function HeroBanner({ banners, onExploreCTA }: HeroBannerProps) {
  const list = banners.length > 0 ? banners : FALLBACK_BANNERS;
  const trackRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const totalRef = useRef(list.length);

  function goTo(idx: number) {
    const track = trackRef.current;
    if (!track) return;
    currentRef.current = (idx + totalRef.current) % totalRef.current;
    track.style.transform = `translateX(-${currentRef.current * 100}%)`;
    // Update dots
    document.querySelectorAll(".hero-dot").forEach((d, i) => {
      d.classList.toggle("opacity-100", i === currentRef.current);
      d.classList.toggle("opacity-30", i !== currentRef.current);
      d.classList.toggle("w-6", i === currentRef.current);
      d.classList.toggle("w-2", i !== currentRef.current);
    });
  }

  useEffect(() => {
    totalRef.current = list.length;
    const timer = setInterval(() => goTo(currentRef.current + 1), 5000);
    return () => clearInterval(timer);
  }, [list.length]);

  function handleCTA(banner: Banner) {
    if (!onExploreCTA) return;
    onExploreCTA();
    if (banner.cta_link?.startsWith("#")) {
      setTimeout(() => {
        document.querySelector(banner.cta_link!)?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  }

  return (
    <section
      id="home"
      className="relative h-[100svh] min-h-[580px] overflow-hidden"
    >
      {/* Slides track */}
      <div
        ref={trackRef}
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: `${list.length * 100}%` }}
      >
        {list.map((banner) => (
          <div
            key={banner.id}
            className="relative flex-shrink-0"
            style={{ width: `${100 / list.length}%` }}
          >
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/90" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              {/* Eyebrow */}
              <motion.div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[rgba(191,160,106,0.3)] bg-[rgba(191,160,106,0.1)] backdrop-blur-sm mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                <span className="font-jost text-[11px] tracking-[0.25em] uppercase text-[var(--gold-light)]">
                  Today's Special
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="font-cormorant text-[clamp(3rem,10vw,7rem)] font-bold text-white leading-[1] mb-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {banner.title}
              </motion.h1>

              {/* Subtitle */}
              {banner.subtitle && (
                <motion.p
                  className="font-jost text-[clamp(0.9rem,2.5vw,1.25rem)] text-white/70 tracking-[0.08em] mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {banner.subtitle}
                </motion.p>
              )}

              {/* Discount badge */}
              {banner.discount_text && (
                <motion.div
                  className="font-jost text-[clamp(2rem,6vw,4rem)] font-black text-[#F5EFE4] my-3 tracking-tight"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.55, type: "spring", stiffness: 200 }}
                  style={{ textShadow: "0 0 40px rgba(245,239,228,0.35)" }}
                >
                  {banner.discount_text}
                </motion.div>
              )}

              {/* CTA */}
              <motion.button
                onClick={() => handleCTA(banner)}
                className="btn-gold mt-6 px-10 py-4 rounded-2xl text-[11px] tracking-[0.25em]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {banner.cta_text || "Explore Offers"} →
              </motion.button>

              {/* WhatsApp quick link */}
              <motion.a
                href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 font-jost text-xs tracking-[0.15em] text-white/40 hover:text-[var(--gold-light)] underline underline-offset-4 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                💬 Chat on WhatsApp
              </motion.a>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => goTo(currentRef.current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-[var(--gold)]/80 border border-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => goTo(currentRef.current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-[var(--gold)]/80 border border-white/20 flex items-center justify-center text-white transition-all backdrop-blur-sm z-10"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`hero-dot h-2 rounded-full bg-[var(--gold)] transition-all duration-300 ${
              i === 0 ? "opacity-100 w-6" : "opacity-30 w-2"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-6 flex flex-col items-center gap-2 z-10">
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/30 writing-mode-vertical">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--gold)] to-transparent animate-pulse" />
      </div>
    </section>
  );
}
