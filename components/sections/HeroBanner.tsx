"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";

const FALLBACK_BANNERS: Banner[] = [
  { id:"f1", title:"Flat 30% Off", subtitle:"On All Hair Treatments", discount_text:"30% OFF", image_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1800&q=85", cta_text:"Explore Offers", cta_link:"#offers", sort_order:1, is_active:true, created_at:"" },
  { id:"f2", title:"Bridal Package", subtitle:"Complete Hair · Makeup · Styling", discount_text:"₹7,999 ONLY", image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1800&q=85", cta_text:"Book Now", cta_link:"#packages", sort_order:2, is_active:true, created_at:"" },
  { id:"f3", title:"Keratin Treatment", subtitle:"Silky Smooth · Lasts 4–6 Months", discount_text:"25% OFF", image_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1800&q=85", cta_text:"Know More", cta_link:"#services", sort_order:3, is_active:true, created_at:"" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0, scale: 1.04 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { x:{ duration:0.85, ease:[0.4,0,0.2,1] }, opacity:{ duration:0.55 }, scale:{ duration:0.85, ease:[0.4,0,0.2,1] } } },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, scale: 0.97, transition: { x:{ duration:0.85, ease:[0.4,0,0.2,1] }, opacity:{ duration:0.4 }, scale:{ duration:0.85 } } }),
};
const cv = { hidden:{ opacity:0, y:28 }, show:{ opacity:1, y:0, transition:{ duration:0.65, ease:[0.4,0,0.2,1] } } };

function ProgressBar({ duration=10000, running }: { duration?:number; running:boolean }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
      <motion.div
        key={String(running)}
        className="h-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]"
        initial={{ scaleX:0 }}
        animate={running ? { scaleX:1 } : { scaleX:0 }}
        transition={{ duration: duration/1000, ease:"linear" }}
        style={{ transformOrigin:"left" }}
      />
    </div>
  );
}

const SLIDE_DURATION = 10000;

interface HeroBannerProps {
  banners: Banner[];
  onExploreCTA?: () => void;
}

export function HeroBanner({ banners, onExploreCTA }: HeroBannerProps) {
  const list    = banners.length > 0 ? banners : FALLBACK_BANNERS;
  const total   = list.length;
  const [current, setCurrent] = useState(0);
  const [dir,     setDir]     = useState(1);
  const [running, setRunning] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    requestAnimationFrame(() => {
      setRunning(true);
      timerRef.current = setInterval(() => {
        setDir(1); setCurrent(c => (c+1)%total);
        setRunning(false); requestAnimationFrame(() => setRunning(true));
      }, SLIDE_DURATION);
    });
  }, [total]);

  useEffect(() => { startTimer(); return () => { if(timerRef.current) clearInterval(timerRef.current); }; }, [startTimer]);

  function goTo(next:number, direction:number) {
    if (next===current) return;
    setDir(direction); setCurrent((next+total)%total); startTimer();
  }

  function handleCTA(banner:Banner) {
    onExploreCTA?.();
    setTimeout(() => { document.querySelector(banner.cta_link||"#offers")?.scrollIntoView({behavior:"smooth",block:"start"}); }, 420);
  }

  const banner = list[current];

  return (
    <section id="home" className="relative h-[100svh] min-h-[600px] max-h-[1000px] overflow-hidden bg-black" aria-label="Hero banner">
      <AnimatePresence initial={false} custom={dir} mode="sync">
        <motion.div key={banner.id} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0">
          <motion.div className="absolute inset-0" initial={{ scale:1.06 }} animate={{ scale:1 }} transition={{ duration:SLIDE_DURATION/1000, ease:"linear" }}>
            <Image src={banner.image_url} alt={banner.title} fill className="object-cover object-center" priority={current===0} unoptimized />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/88" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${banner.id}`}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 sm:px-10 z-10"
          initial="hidden" animate="show" exit="hidden"
          variants={{ hidden:{}, show:{ transition:{ staggerChildren:0.1 } } }}
        >
          {/* Eyebrow */}
          <motion.div variants={cv} className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-5 py-2 rounded-full border border-[rgba(191,160,106,0.4)] bg-[rgba(191,160,106,0.12)] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
            <span className="font-jost text-[10.5px] tracking-[0.28em] uppercase text-[var(--gold-light)]">Today's Special Offer</span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={cv} className="font-cormorant font-bold leading-[1.0] text-[clamp(2.8rem,9vw,6.5rem)] text-white mb-3">
            {banner.title}
          </motion.h1>

          {/* Subtitle */}
          {banner.subtitle && (
            <motion.p variants={cv} className="font-marcellus text-[clamp(0.85rem,2.2vw,1.15rem)] text-white/65 tracking-[0.12em] mb-4">
              {banner.subtitle}
            </motion.p>
          )}

          {/* ── Discount badge — OFF-WHITE / GOLD (not red) ── */}
          {banner.discount_text && (
            <motion.div
              variants={{ hidden:{ opacity:0, scale:0.75 }, show:{ opacity:1, scale:1, transition:{ duration:0.55, ease:[0.175,0.885,0.32,1.275] } } }}
              className="relative inline-block font-jost font-black text-[clamp(2.4rem,8vw,5.5rem)] leading-none tracking-tight my-3 sm:my-4"
            >
              {/* Soft gold glow — no red */}
              <span className="absolute inset-0 blur-2xl opacity-35" style={{ background:"radial-gradient(ellipse, rgba(191,160,106,0.6) 0%, transparent 70%)" }} aria-hidden="true" />
              {/* Off-white text with gold shadow */}
              <span className="relative text-[#F5EFE4] drop-shadow-[0_2px_32px_rgba(191,160,106,0.5)]">
                {banner.discount_text}
              </span>
            </motion.div>
          )}

          {/* Divider */}
          <motion.div variants={cv} className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent my-4 sm:my-5" />

          {/* CTA */}
          <motion.button
            variants={cv}
            onClick={() => handleCTA(banner)}
            whileHover={{ scale:1.04, y:-3 }} whileTap={{ scale:0.97 }}
            className="btn-gold px-10 sm:px-14 py-4 sm:py-5 rounded-2xl text-[11px] sm:text-[12px] tracking-[0.28em] shadow-[0_12px_40px_rgba(191,160,106,0.35)] hover:shadow-[0_18px_50px_rgba(191,160,106,0.45)] transition-shadow duration-300"
          >
            {banner.cta_text || "Explore Offers"} &nbsp;→
          </motion.button>

          {/* WhatsApp */}
          <motion.a variants={cv}
            href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)} target="_blank" rel="noreferrer"
            className="mt-5 font-jost text-[11px] tracking-[0.15em] text-white/35 hover:text-[var(--gold-light)] underline underline-offset-4 transition-colors duration-300">
            💬 Chat on WhatsApp
          </motion.a>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button onClick={() => goTo(current-1,-1)} aria-label="Previous"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-[var(--gold)]/85 border border-white/20 hover:border-[var(--gold)] flex items-center justify-center text-white backdrop-blur-sm transition-all group">
        <ChevronLeft size={18} className="group-hover:scale-110 transition-transform" />
      </button>
      <button onClick={() => goTo(current+1, 1)} aria-label="Next"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-[var(--gold)]/85 border border-white/20 hover:border-[var(--gold)] flex items-center justify-center text-white backdrop-blur-sm transition-all group">
        <ChevronRight size={18} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {list.map((_,i) => (
          <button key={i} onClick={() => goTo(i, i>current?1:-1)} aria-label={`Slide ${i+1}`}
            className={`rounded-full transition-all duration-400 ${i===current?"w-7 h-[7px] bg-[var(--gold)]":"w-[7px] h-[7px] bg-white/35 hover:bg-white/60"}`} />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5">
        <span className="font-jost text-white font-semibold text-sm leading-none">{String(current+1).padStart(2,"0")}</span>
        <span className="w-5 h-px bg-white/30" />
        <span className="font-jost text-white/40 text-xs leading-none">{String(total).padStart(2,"0")}</span>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-5 z-20 hidden sm:flex flex-col items-center gap-2">
        <span className="text-[8px] tracking-[0.35em] uppercase text-white/30" style={{ writingMode:"vertical-rl", transform:"rotate(180deg)" }}>Scroll</span>
        <motion.div className="w-px h-10 bg-gradient-to-b from-[var(--gold)] to-transparent"
          animate={{ scaleY:[0,1,0] }} transition={{ duration:1.8, repeat:Infinity, ease:"easeInOut" }} style={{ transformOrigin:"top" }} />
      </div>

      <ProgressBar duration={SLIDE_DURATION} running={running} />
    </section>
  );
}
