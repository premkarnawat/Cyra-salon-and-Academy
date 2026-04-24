"use client";

import Image from "next/image";
import { Check, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/animations/FadeIn";
import { formatPrice, getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Package } from "@/types";

const FALLBACK: Package[] = [
  { id:"p1", name:"Glow", actual_price:2000, offer_price:1499, discount_percent:25, badge:"Starter", image_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85", features:["Hair Spa"], is_active:true, sort_order:1, created_at:"" }
];

export function PackagesSection({ packages = [] }: { packages?: Package[] }) {
  const list = packages.length ? packages : FALLBACK;
  const featuredId = list[1]?.id;
  if (!list.length) return null;

  return (
    <section id="packages" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <FadeIn>
          <SectionHeader
            title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Packages</em></>}
            subtitle="Curated luxury treatments for every occasion"
          />
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {list.map(pkg => {
            const featured = pkg.id === featuredId;

            const offer  = pkg.offer_price ?? 0;
            const actual = pkg.actual_price ?? 0;
            const discount = pkg.discount_percent ?? 0;

            const hasPrice = offer > 0 || actual > 0;
            const mainPrice = offer > 0 ? offer : actual;

            return (
              <StaggerItem key={pkg.id}>
                <div className={`rounded-3xl overflow-hidden bg-[#F8F9FB] border transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(191,160,106,0.18)] flex flex-col h-full ${
                  featured ? "border-[rgba(191,160,106,0.4)] shadow-[0_4px_24px_rgba(191,160,106,0.1)]" : "border-[rgba(191,160,106,0.15)]"
                }`}>

                  {/* IMAGE */}
                  {pkg.image_url && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
                      <Image src={pkg.image_url} alt={pkg.name} fill className="object-cover object-top" />

                      {/* ✅ SHOW ONLY IF DISCOUNT > 0 */}
                      {discount > 0 && (
                        <div className="absolute top-3 right-3 bg-[var(--gold)] text-white text-[11px] font-black px-3 py-1.5 rounded-full">
                          {discount}% OFF
                        </div>
                      )}

                      {/* ✅ B1G1 CLEAN STRIP */}
                      {pkg.offer_type === "buy1get1" && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[12px] px-4 py-2 font-semibold">
                          🎁 Buy 1 Get 1 Free
                        </div>
                      )}

                      {pkg.badge && (
                        <div className="absolute top-3 left-3 bg-white/88 text-[var(--gold-dark)] text-[10px] px-2.5 py-1 rounded-full uppercase">
                          {pkg.badge}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">

                    {/* NAME */}
                    <div className="font-cormorant text-[1.65rem] text-[#1F2937] mb-1">
                      {pkg.name}
                    </div>

                    {/* DESCRIPTION */}
                    {pkg.description && (
                      <p className="text-[14px] text-[#4B5563] mb-3">
                        {pkg.description}
                      </p>
                    )}

                    {/* ✅ FIXED PRICE */}
                    {hasPrice && (
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="font-jost text-[2rem] font-black text-[#1F2937]">
                          {formatPrice(mainPrice)}
                        </span>

                        {/* CUT PRICE ONLY IF REAL */}
                        {offer > 0 && actual > 0 && actual !== offer && (
                          <span className="font-jost text-[15px] line-through text-[#9CA3AF]">
                            {formatPrice(actual)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* ✅ B1G1 DESCRIPTION */}
                    {pkg.offer_type === "buy1get1" && pkg.free_offer_description && (
                      <p className="text-[13px] text-[var(--gold-dark)] mb-4">
                        🎁 {pkg.free_offer_description}
                      </p>
                    )}

                    {/* FEATURES */}
                    <ul className="space-y-3 mb-6 flex-1">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex gap-3">
                          <Check size={15} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(`${pkg.name} Package`))}
                      target="_blank"
                      className="flex items-center justify-center gap-2 bg-[#C9973A] text-white rounded-xl py-3"
                    >
                      <MessageCircle size={14} />
                      Book via WhatsApp
                    </a>

                  </div>
                </div>
              </StaggerItem>
            );
          })}

        </StaggerContainer>
      </div>
    </section>
  );
}
