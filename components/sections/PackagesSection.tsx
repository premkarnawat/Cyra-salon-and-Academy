"use client";

import Image from "next/image";
import { Check, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/animations/FadeIn";
import { formatPrice, getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Package } from "@/types";

const FALLBACK: Package[] = [
  { id:"p1", name:"Glow",   actual_price:2000,  offer_price:1499, discount_percent:25, badge:"Starter",      image_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85", features:["Hair Spa + Scalp Massage","Basic Cut & Blow Dry","Eyebrow Threading","Face Clean-Up"], is_active:true, sort_order:1, created_at:"" },
  { id:"p2", name:"Luxe",   actual_price:5500,  offer_price:3999, discount_percent:27, badge:"Most Popular", image_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85", features:["Keratin / Smoothening","Global Hair Colour","Hair Spa Treatment","Cut, Style & Blow Dry","Face Bleach + Threading"], is_active:true, sort_order:2, created_at:"" },
  { id:"p3", name:"Bridal", actual_price:12000, offer_price:7999, discount_percent:33, badge:"Elite",        image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=85", features:["Pre-Bridal Facial","Full Hair Colour + Treatment","HD Bridal Makeup","Saree / Lehenga Draping","Photoshoot Styling","2 Trial Sessions"], is_active:true, sort_order:3, created_at:"" },
];

export function PackagesSection({ packages }: { packages: Package[] }) {
  const list       = packages.length ? packages : FALLBACK;
  const featuredId = list[1]?.id;

  return (
    <section id="packages" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            tag="💎 Value Bundles"
            title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Packages</em></>}
            subtitle="Curated luxury treatments for every occasion"
          />
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(pkg => {
            const featured = pkg.id === featuredId;
            return (
              <StaggerItem key={pkg.id}>
                <div className={`rounded-3xl overflow-hidden bg-[#F8F9FB] border hover:shadow-[0_16px_48px_rgba(191,160,106,0.18)] hover:-translate-y-2 transition-all duration-350 ${featured ? "border-[rgba(191,160,106,0.4)] shadow-[0_4px_24px_rgba(191,160,106,0.1)]" : "border-[rgba(191,160,106,0.15)]"}`}>

                  {/* Image — object-cover, no overflow */}
                  {pkg.image_url && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <Image
                        src={pkg.image_url}
                        alt={pkg.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 400px"
                        unoptimized
                      />
                    </div>
                      {/* Discount */}
                      <div className="absolute top-3 right-3 bg-[var(--gold)] text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-wide shadow-md">
                        {pkg.discount_percent}% OFF
                      </div>
                      {/* Badge */}
                      {pkg.badge && (
                        <div className="absolute top-3 left-3 bg-white/85 backdrop-blur-sm border border-[rgba(191,160,106,0.3)] text-[var(--gold-dark)] text-[9px] px-2.5 py-1 rounded-full tracking-[0.15em] uppercase font-semibold">
                          {pkg.badge}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="font-cormorant text-2xl text-[#1F2937] mb-3">{pkg.name}</div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-jost text-3xl font-black text-[#1F2937]">{formatPrice(pkg.offer_price)}</span>
                      <span className="font-jost text-sm line-through text-[#9CA3AF]">{formatPrice(pkg.actual_price)}</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#4B5563] font-light">
                          <Check size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(`${pkg.name} Package`))}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] tracking-[0.18em]"
                    >
                      <MessageCircle size={13} /> Book via WhatsApp
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
