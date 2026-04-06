"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Offer } from "@/types";

const FALLBACK: Offer[] = [
  { id:"o1", tag:"Best Seller",  name:"Keratin Treatment", discount_text:"30% OFF",    description:"Silky smooth, frizz-free hair lasting 4–6 months",   image_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=800&q=85", is_active:true, sort_order:1, created_at:"" },
  { id:"o2", tag:"Popular",      name:"Hair Colouring",    discount_text:"25% OFF",    description:"Global colour, highlights & balayage by experts",    image_url:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=85", is_active:true, sort_order:2, created_at:"" },
  { id:"o3", tag:"Limited",      name:"Bridal Package",    discount_text:"₹999 ONLY",  description:"Complete hair + makeup + styling for your special day",image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=85", is_active:true, sort_order:3, created_at:"" },
  { id:"o4", tag:"Relax",        name:"Hair Spa",           discount_text:"20% OFF",   description:"Deep conditioning with scalp massage & nourishment",  image_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=800&q=85", is_active:true, sort_order:4, created_at:"" },
  { id:"o5", tag:"Quick Deal",   name:"Cut & Style",        discount_text:"15% OFF",   description:"Expert cut with salon-finish blow dry",               image_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=85", is_active:true, sort_order:5, created_at:"" },
];

const SWIPE_MIN = 50;

export function OffersSection({ offers }: { offers: Offer[] }) {
  const list  = offers.length ? offers : FALLBACK;
  const total = list.length;
  const [cur, setCur]   = useState(0);
  const [dir, setDir]   = useState(1);
  const dragX           = useMotionValue(0);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDir(1);
      setCur(c => (c + 1) % total);
    }, 6000);
  }, [total]);

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [resetTimer]);

  function goTo(next: number, direction: number) {
    setDir(direction);
    setCur((next + total) % total);
    resetTimer();
  }

  function onDragEnd(_: unknown, info: { offset: { x: number } }) {
    const dx = info.offset.x;
    if      (dx < -SWIPE_MIN) goTo(cur + 1,  1);
    else if (dx >  SWIPE_MIN) goTo(cur - 1, -1);
    animate(dragX, 0, { duration: 0.25 });
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.4 } }),
  };

  const offer = list[cur];

  return (
    <section id="offers" className="py-16 md:py-24 bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            tag="✦ Hot Deals"
            title={<>Exclusive <em className="text-[var(--gold-light)] not-italic font-normal">Offers</em></>}
            subtitle="Swipe to explore · Limited time deals"
          />
        </FadeIn>

        {/* Carousel — full width card, swipe only */}
        <div className="relative max-w-2xl mx-auto select-none">
          <div className="rounded-3xl overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.1)] border border-[rgba(191,160,106,0.15)] bg-white">
            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={offer.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={onDragEnd}
                style={{ x: dragX, cursor: "grab" }}
                whileDrag={{ cursor: "grabbing" }}
              >
                {/* Image — object-cover, full width, fixed height */}
                <div className="relative w-full overflow-hidden bg-[#F8F9FB]" style={{ height: "clamp(200px, 40vw, 340px)" }}>
                  <Image
                    src={offer.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85"}
                    alt={offer.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 100vw, 672px"
                    unoptimized
                    priority={cur === 0}
                  />
                  {/* Tag badge */}
                  {offer.tag && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[var(--gold-dark)] text-[9px] font-bold px-3 py-1.5 rounded-full tracking-[0.18em] uppercase border border-[rgba(191,160,106,0.3)]">
                      {offer.tag}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <div className="font-cormorant text-xl text-[#1F2937] mb-1">{offer.name}</div>

                  {/* Discount text — darker off-white tone for readability */}
                  <div
                    className="font-jost font-black leading-none mb-2"
                    style={{
                      fontSize: "clamp(2rem, 6vw, 3rem)",
                      color: "#C8A87A",          /* darker gold-off-white — readable */
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {offer.discount_text}
                  </div>

                  {offer.description && (
                    <p className="text-sm text-[#6B7280] font-light mb-4">{offer.description}</p>
                  )}

                  <a
                    href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer.name))}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-gold inline-flex items-center gap-2 text-[11px] tracking-[0.18em] px-5 py-2.5 rounded-xl"
                  >
                    <MessageCircle size={13} /> Book Now
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots — no buttons */}
          <div className="mt-5 flex items-center justify-center gap-2">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > cur ? 1 : -1)}
                aria-label={`Offer ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === cur ? "w-7 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-[rgba(191,160,106,0.3)] hover:bg-[rgba(191,160,106,0.55)]"
                }`}
              />
            ))}
          </div>

          <p className="text-center mt-2 font-jost text-[11px] text-[#9CA3AF]">← Swipe to navigate →</p>
        </div>

        <FadeIn className="text-center mt-10">
          <a
            href="#packages"
            onClick={e => { e.preventDefault(); document.querySelector("#packages")?.scrollIntoView({ behavior:"smooth" }); }}
            className="btn-ghost-gold inline-block px-8 py-3 rounded-full text-xs tracking-[0.2em]"
          >
            View All Packages ↓
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
