"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Offer } from "@/types";

/* ── FALLBACK ── */
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

const AUTO_MS = 6000;
const SWIPE_THRESHOLD = 80;

export function OffersSection({ offers }: { offers?: Offer[] }) {
  const safeOffers = Array.isArray(offers) ? offers : [];
  const list = safeOffers.length ? safeOffers : FALLBACK;
  const total = list.length;

  const [cur, setCur] = useState(0);
  const startX = useRef<number | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);

  /* ── AUTO SLIDE ── */
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setCur((c) => (c + 1) % total);
    }, AUTO_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [total]);

  /* ── SWIPE HANDLERS (PURE TOUCH, NO BUGS) ── */
  function handleTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (startX.current === null) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;

    if (diff > SWIPE_THRESHOLD) {
      setCur((c) => (c + 1) % total);
    } else if (diff < -SWIPE_THRESHOLD) {
      setCur((c) => (c - 1 + total) % total);
    }

    startX.current = null;
  }

  const offer = list[cur] || FALLBACK[0];

  return (
    <section id="offers" className="py-20 bg-[#F8F9FB]">
      <div className="max-w-3xl mx-auto px-4">

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
        <div
          className="rounded-3xl overflow-hidden bg-white shadow-lg border"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* IMAGE */}
          <div className="relative w-full aspect-[4/3]">
            <AnimatePresence mode="wait">
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={offer.image_url || FALLBACK[0].image_url}
                  alt={offer.name}
                  fill
                  className="object-cover object-top"
                  sizes="100vw"
                  priority={cur === 0}
                />

                {offer.tag && (
                  <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold">
                    {offer.tag}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            <h3 className="text-xl text-gray-800 mb-2">{offer.name}</h3>

            <p className="text-3xl font-bold text-[var(--gold)] mb-2">
              {offer.discount_text}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              {offer.description}
            </p>

            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer.name))}
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
              onClick={() => setCur(i)}
              className={`rounded-full ${
                i === cur ? "w-6 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-center mt-2 text-xs text-gray-400">
          ← Swipe to explore →
        </p>

      </div>
    </section>
  );
}
