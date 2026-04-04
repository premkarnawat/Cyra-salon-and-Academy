"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Offer } from "@/types";

const FALLBACK_OFFERS: Offer[] = [
  { id:"o1", tag:"Best Seller", name:"Keratin Treatment", discount_text:"30% OFF", description:"Silky smooth, frizz-free hair lasting 4–6 months", image_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=600&q=80", is_active:true, sort_order:1, created_at:"" },
  { id:"o2", tag:"Popular", name:"Hair Colouring", discount_text:"25% OFF", description:"Global colour, highlights & balayage by experts", image_url:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80", is_active:true, sort_order:2, created_at:"" },
  { id:"o3", tag:"Limited", name:"Bridal Package", discount_text:"₹999 ONLY", description:"Complete hair + makeup + styling for your special day", image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80", is_active:true, sort_order:3, created_at:"" },
  { id:"o4", tag:"Relax", name:"Hair Spa", discount_text:"20% OFF", description:"Deep conditioning with scalp massage & nourishment", image_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&q=80", is_active:true, sort_order:4, created_at:"" },
  { id:"o5", tag:"Quick Deal", name:"Cut & Style", discount_text:"15% OFF", description:"Expert cut with salon-finish blow dry", image_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=80", is_active:true, sort_order:5, created_at:"" },
];

export function OffersSection({ offers }: { offers: Offer[] }) {
  const list = offers.length ? offers : FALLBACK_OFFERS;
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const CARD_W = 308; // card width + gap

  function slide(dir: number) {
    const track = trackRef.current;
    if (!track) return;
    const max = Math.max(0, track.scrollWidth - track.parentElement!.clientWidth);
    const next = Math.max(0, Math.min(pos + dir * CARD_W, max));
    setPos(next);
    track.style.transform = `translateX(-${next}px)`;
  }

  return (
    <section id="offers" className="py-20 md:py-28 bg-[var(--cream-100)] dark:bg-[var(--dark-800)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            tag="✦ Hot Deals"
            title={<>Exclusive <em className="text-[var(--gold-light)]">Offers</em></>}
            subtitle="Limited time — grab yours before they're gone"
          />
        </FadeIn>

        <div className="relative">
          <div className="overflow-hidden px-1 py-2">
            <div
              ref={trackRef}
              className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            >
              {list.map((offer) => (
                <div
                  key={offer.id}
                  className="flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] card-gold-border hover:shadow-gold hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={offer.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"}
                      alt={offer.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <div className="p-5">
                    {offer.tag && (
                      <span className="section-tag mb-2">{offer.tag}</span>
                    )}
                    <div className="font-cormorant text-lg text-[var(--dark-900)] dark:text-[#F0E8D8] mb-1">
                      {offer.name}
                    </div>
                    <div className="font-jost text-3xl font-black text-[#F5EFE4] dark:text-[#E8D5B0] leading-none mb-1"
                      {offer.discount_text}
                    </div>
                    {offer.description && (
                      <p className="text-xs text-[var(--dark-600)] dark:text-[rgba(240,232,216,0.45)] mt-1 font-light">
                        {offer.description}
                      </p>
                    )}
                    <a
                      href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer.name))}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gold inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-[10px] tracking-[0.18em]"
                    >
                      <MessageCircle size={12} /> Book Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrows */}
          <button onClick={() => slide(-1)} className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] shadow-md flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark-900)] hover:border-[var(--gold)] transition-all z-10">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => slide(1)} className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] shadow-md flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark-900)] hover:border-[var(--gold)] transition-all z-10">
            <ChevronRight size={18} />
          </button>
        </div>

        <FadeIn className="text-center mt-10">
          <a href="#packages" onClick={(e) => { e.preventDefault(); document.querySelector("#packages")?.scrollIntoView({ behavior: "smooth" }); }}
            className="btn-ghost-gold inline-block px-8 py-3 rounded-full text-xs tracking-[0.2em]">
            View All Packages ↓
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
