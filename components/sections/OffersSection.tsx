// components/sections/OffersSection.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Offer } from "@/types";

/* ── FALLBACK DATA ── */
const FALLBACK: Offer[] = [
  {
    id: "o1",
    tag: "Best Seller",
    name: "Keratin Treatment",
    discount_text: "30% OFF",
    description: "Silky smooth, frizz-free hair lasting 4–6 months",
    image_url: "https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=700&q=65",
    is_active: true,
    sort_order: 1,
    created_at: "",
  },
  {
    id: "o2",
    tag: "Popular",
    name: "Hair Colouring",
    discount_text: "25% OFF",
    description: "Global colour, highlights & balayage by experts",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=65",
    is_active: true,
    sort_order: 2,
    created_at: "",
  },
  {
    id: "o3",
    tag: "Limited",
    name: "Bridal Package",
    discount_text: "₹999 ONLY",
    description: "Complete hair + makeup + styling for your big day",
    image_url: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=700&q=65",
    is_active: true,
    sort_order: 3,
    created_at: "",
  },
];

const SWIPE_MIN = 44;
const AUTO_MS = 6000;

/* ── MAIN COMPONENT ── */
export function OffersSection(props: { offers?: Offer[] }) {
  const offers = props.offers ?? [];

  const list =
    Array.isArray(offers) && offers.length ? offers : FALLBACK;

  const total = list.length;

  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);

  const dragX = useMotionValue(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── AUTO SLIDE ── */
  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setDir(1);
      setCur((c) => (c + 1) % total);
    }, AUTO_MS);
  }, [total]);

  useEffect(() => {
    resetTimer();

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [resetTimer]);

  /* ── NAVIGATION ── */
  function goTo(next: number, d: number) {
    setDir(d);
    setCur((next + total) % total);
    resetTimer();
  }

  function onDragEnd(_: any, info: any) {
    if (info.offset.x < -SWIPE_MIN) goTo(cur + 1, 1);
    else if (info.offset.x > SWIPE_MIN) goTo(cur - 1, -1);
    animate(dragX, 0, { duration: 0.2 });
  }

  /* ── FAST ANIMATION ── */
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const offer = list[cur] || FALLBACK[0];

  return (
    <section id="offers" className="py-20 bg-[#F8F9FB]">
      <div className="max-w-3xl mx-auto px-4">

        {/* HEADER */}
        <FadeIn>
          <SectionHeader
            tag="✦ Hot Deals"
            title={
              <>
                Exclusive{" "}
                <em className="text-[var(--gold-light)] not-italic font-normal">
                  Offers
                </em>
              </>
            }
            subtitle="Swipe to explore · Limited time deals"
          />
        </FadeIn>

        {/* CARD */}
        <div className="rounded-3xl overflow-hidden bg-white shadow-lg border">

          {/* IMAGE */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={offer?.id || cur}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={onDragEnd}
                style={{ x: dragX }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >

                <Image
                  src={
                    offer?.image_url ||
                    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&q=65"
                  }
                  alt={offer?.name || "Offer"}
                  fill
                  className="object-cover object-top"
                  sizes="100vw"
                  priority={cur === 0}
                  quality={70}
                />

                {/* TAG */}
                {offer?.tag && (
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold shadow">
                    {offer.tag}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            <h3 className="text-xl text-gray-800 mb-2">
              {offer?.name}
            </h3>

            <p className="text-3xl font-bold text-[var(--gold)] mb-2">
              {offer?.discount_text}
            </p>

            {offer?.description && (
              <p className="text-sm text-gray-500 mb-4">
                {offer.description}
              </p>
            )}

            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer?.name || "Offer"))}
              target="_blank"
              rel="noreferrer"
              className="btn-gold inline-flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <MessageCircle size={14} />
              Book Now
            </a>
          </div>
        </div>

        {/* DOTS */}
        <div className="flex justify-center mt-4 gap-2">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > cur ? 1 : -1)}
              className={`rounded-full transition-all ${
                i === cur
                  ? "w-6 h-2 bg-[var(--gold)]"
                  : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* SWIPE TEXT */}
        <p className="text-center mt-2 text-xs text-gray-400">
          ← Swipe to explore →
        </p>

      </div>
    </section>
  );
}
