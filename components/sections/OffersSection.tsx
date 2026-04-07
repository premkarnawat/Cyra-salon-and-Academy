"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";

/* SAFE FALLBACK */
const FALLBACK = [
  {
    id: "o1",
    tag: "Best Seller",
    name: "Keratin Treatment",
    discount_text: "30% OFF",
    description: "Silky smooth hair",
    image_url: "https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=800&q=70",
  },
  {
    id: "o2",
    tag: "Popular",
    name: "Hair Colouring",
    discount_text: "25% OFF",
    description: "Professional colouring",
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=70",
  },
];

const AUTO_MS = 5000;
const SWIPE = 70;

export function OffersSection({ offers }: any) {
  const list = Array.isArray(offers) && offers.length ? offers : FALLBACK;

  const [cur, setCur] = useState(0);

  const timer = useRef<any>(null);
  const startX = useRef(0);

  /* AUTO SLIDE */
  useEffect(() => {
    if (timer.current) clearInterval(timer.current);

    timer.current = setInterval(() => {
      setCur((c: number) => (c + 1) % list.length);
    }, AUTO_MS);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [list.length]);

  /* SWIPE */
  const handleTouchStart = (e: any) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: any) => {
    const diff = startX.current - e.changedTouches[0].clientX;

    if (diff > SWIPE) {
      setCur((c: number) => (c + 1) % list.length);
    } else if (diff < -SWIPE) {
      setCur((c: number) => (c - 1 + list.length) % list.length);
    }
  };

  const offer = list[cur] || FALLBACK[0];

  return (
    <section className="py-20 bg-[#F8F9FB]">
      <div className="max-w-3xl mx-auto px-4">

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

        <div
          className="bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-500"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* IMAGE (SMOOTH FADE INSTEAD OF SLIDE = SAFE) */}
          <div className="relative w-full h-[280px] sm:h-[320px]">

            <Image
              key={offer.id} // 🔥 important for animation
              src={offer.image_url}
              alt={offer.name}
              fill
              className="object-cover object-top transition-opacity duration-500 opacity-100"
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
          <div className="p-6 transition-all duration-300">
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
              } rounded-full transition-all`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
