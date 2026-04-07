"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";

const FALLBACK = [
  {
    id: "o1",
    tag: "Best Seller",
    name: "Keratin Treatment",
    discount_text: "30% OFF",
    description: "Silky smooth hair",
    image_url: "https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=700&q=65",
  },
  {
    id: "o2",
    tag: "Popular",
    name: "Hair Colouring",
    discount_text: "25% OFF",
    description: "Professional colouring",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=65",
  },
];

const AUTO_MS = 5000;
const SWIPE = 80;

export function OffersSection({ offers }: any) {
  const list = Array.isArray(offers) && offers.length ? offers : FALLBACK;

  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);

  const timer = useRef<any>(null);
  const startX = useRef(0);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setDir(1);
      setCur((c: number) => (c + 1) % list.length);
    }, AUTO_MS);

    return () => clearInterval(timer.current);
  }, [list.length]);

  const goTo = (next: number, direction: number) => {
    setDir(direction);
    setCur((next + list.length) % list.length);
  };

  const handleTouchStart = (e: any) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: any) => {
    const diff = startX.current - e.changedTouches[0].clientX;

    if (diff > SWIPE) goTo(cur + 1, 1);
    else if (diff < -SWIPE) goTo(cur - 1, -1);
  };

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35 },
    }),
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const offer = list[cur];

  return (
    <section className="py-20 bg-[#F8F9FB]">
      <div className="max-w-3xl mx-auto px-4">

        <FadeIn>
          <SectionHeader
            tag="✦ Hot Deals"
            title={<>Exclusive <em className="text-[var(--gold-light)] not-italic">Offers</em></>}
            subtitle="Swipe to explore"
          />
        </FadeIn>

        <div
          className="bg-white rounded-3xl overflow-hidden shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* IMAGE + SLIDE */}
          <div className="relative w-full h-[280px] sm:h-[320px] overflow-hidden">

            <AnimatePresence initial={false} custom={dir}>
              <motion.div
                key={offer.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                <Image
                  src={offer.image_url}
                  alt={offer.name}
                  fill
                  className="object-cover object-top"
                />

                {offer.tag && (
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs">
                    {offer.tag}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CONTENT */}
          <div className="p-6">
            <h3 className="text-xl">{offer.name}</h3>
            <p className="text-2xl text-[var(--gold)] font-bold">{offer.discount_text}</p>
            <p className="text-sm text-gray-500">{offer.description}</p>

            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer.name))}
              className="btn-gold mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <MessageCircle size={14} />
              Book Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
