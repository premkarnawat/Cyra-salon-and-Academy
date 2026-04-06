"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";

/* ── FALLBACK (SAFE DATA) ── */
const FALLBACK = [
  {
    id: "o1",
    tag: "Best Seller",
    name: "Keratin Treatment",
    discount_text: "30% OFF",
    description: "Silky smooth, frizz-free hair",
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
const SWIPE_THRESHOLD = 70;

export function OffersSection({ offers }: any) {
  /* ✅ SAFE DATA HANDLING */
  const list = Array.isArray(offers) && offers.length ? offers : FALLBACK;

  const [cur, setCur] = useState(0);

  /* ✅ SAFE TIMER (NO NODE TYPE) */
  const timer = useRef<any>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setCur((c: number) => (c + 1) % list.length);
    }, AUTO_MS);

    return () => clearInterval(timer.current);
  }, [list.length]);

  /* ✅ SIMPLE TOUCH SWIPE (NO TS ERRORS) */
  let startX = 0;

  const handleTouchStart = (e: any) => {
    startX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: any) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > SWIPE_THRESHOLD) {
      setCur((c: number) => (c + 1) % list.length);
    } else if (diff < -SWIPE_THRESHOLD) {
      setCur((c: number) => (c - 1 + list.length) % list.length);
    }
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
                <em className="text-[var(--gold-light)] not-italic">
                  Offers
                </em>
              </>
            }
            subtitle="Swipe to explore"
          />
        </FadeIn>

        {/* CARD */}
        <div
          className="bg-white rounded-3xl overflow-hidden shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* IMAGE */}
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={offer.image_url || FALLBACK[0].image_url}
              alt={offer.name || "Offer"}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority
            />

            {offer.tag && (
              <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-xs font-semibold">
                {offer.tag}
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-6">
            <h3 className="text-xl mb-2">{offer.name}</h3>

            <p className="text-2xl font-bold text-[var(--gold)] mb-2">
              {offer.discount_text}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              {offer.description}
            </p>

            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer.name))}
              target="_blank"
              rel="noreferrer"
              className="btn-gold px-6 py-3 rounded-xl inline-flex items-center gap-2"
            >
              <MessageCircle size={14} />
              Book Now
            </a>
          </div>
        </div>

        {/* DOTS */}
        <div className="flex justify-center mt-4 gap-2">
          {list.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCur(i)}
              className={`${
                i === cur ? "w-6 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-gray-300"
              } rounded-full`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
