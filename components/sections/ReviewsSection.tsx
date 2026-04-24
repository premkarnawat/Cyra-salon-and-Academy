"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StarRating } from "@/components/ui/StarRating";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Review } from "@/types";

const FALLBACK_REVIEWS: Review[] = [
  { id:"r1", customer_name:"Priya S.", rating:5, review_text:"Absolutely loved my keratin treatment! My hair is so smooth now. The staff is professional and the salon has such a luxurious feel.", service:"Keratin Treatment", is_active:true, sort_order:1, created_at:"" },
  { id:"r2", customer_name:"Meera K.", rating:5, review_text:"Got my balayage done here and I couldn't be happier. The colour is exactly what I envisioned. Will definitely come back!", service:"Balayage", is_active:true, sort_order:2, created_at:"" },
  { id:"r3", customer_name:"Ananya R.", rating:5, review_text:"The bridal package was worth every rupee. The whole team made my wedding day look absolutely stunning. Highly recommend!", service:"Bridal Package", is_active:true, sort_order:3, created_at:"" },
  { id:"r4", customer_name:"Divya M.", rating:4, review_text:"Great ambiance and experienced stylists. My hair spa left my hair feeling incredible. Booking again next month!", service:"Hair Spa", is_active:true, sort_order:4, created_at:"" },
  { id:"r5", customer_name:"Sneha P.", rating:5, review_text:"The team is super skilled and very warm. Got a haircut and style — turned out exactly as I wanted. Love this place!", service:"Cut & Style", is_active:true, sort_order:5, created_at:"" },
];

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const list = reviews.length ? reviews : FALLBACK_REVIEWS;
  const trackRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const CARD_W = 360;

  function slide(dir: number) {
    const track = trackRef.current;
    if (!track) return;
    const max = Math.max(0, track.scrollWidth - track.parentElement!.clientWidth);
    const next = Math.max(0, Math.min(pos + dir * CARD_W, max));
    setPos(next);
    track.style.transform = `translateX(-${next}px)`;
  }

  const avg = list.reduce((a, r) => a + r.rating, 0) / list.length;

  return (
    <section id="reviews" className="py-20 md:py-28 bg-[var(--cream-100)] dark:bg-[var(--dark-800)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            title={<>What Our Clients <em className="text-[var(--gold-light)]">Say</em></>}
          />
        </FadeIn>

        <div className="relative">
          <div className="overflow-hidden px-1 py-3">
            <div
              ref={trackRef}
              className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            >
              {list.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-[340px] bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] rounded-3xl p-7 card-gold-border hover:shadow-gold transition-all duration-300"
                >
                  <StarRating rating={review.rating} />
                  <blockquote className="mt-4 font-cormorant text-lg text-[var(--dark-900)] dark:text-[#F0E8D8] leading-relaxed italic">
                    "{review.review_text}"
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--gold-dark)] to-[var(--gold-light)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.customer_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-jost font-semibold text-sm text-[var(--dark-900)] dark:text-[#F0E8D8]">
                        {review.customer_name}
                      </div>
                      {review.service && (
                        <div className="text-[10px] text-[var(--gold)] tracking-wide uppercase mt-0.5">
                          {review.service}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => slide(-1)} className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] shadow-md flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark-900)] transition-all z-10">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => slide(1)} className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] shadow-md flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--dark-900)] transition-all z-10">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
