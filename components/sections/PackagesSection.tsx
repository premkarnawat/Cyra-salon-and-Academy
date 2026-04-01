"use client";

import Image from "next/image";
import { Check, MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/animations/FadeIn";
import { formatPrice, getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Package } from "@/types";

const FALLBACK_PACKAGES: Package[] = [
  { id:"p1", name:"Glow", actual_price:2000, offer_price:1499, discount_percent:25, badge:"Starter", image_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80", features:["Hair Spa + Scalp Massage","Basic Cut & Blow Dry","Eyebrow Threading","Face Clean-Up"], is_active:true, sort_order:1, created_at:"" },
  { id:"p2", name:"Luxe", actual_price:5500, offer_price:3999, discount_percent:27, badge:"Most Popular", image_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", features:["Keratin / Smoothening","Global Hair Colour","Hair Spa Treatment","Cut, Style & Blow Dry","Face Bleach + Threading"], is_active:true, sort_order:2, created_at:"" },
  { id:"p3", name:"Bridal", actual_price:12000, offer_price:7999, discount_percent:33, badge:"Elite", image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80", features:["Pre-Bridal Facial","Full Hair Colour + Treatment","HD Bridal Makeup","Saree / Lehenga Draping","Photoshoot Styling","2 Trial Sessions"], is_active:true, sort_order:3, created_at:"" },
];

export function PackagesSection({ packages }: { packages: Package[] }) {
  const list = packages.length ? packages : FALLBACK_PACKAGES;
  const featuredId = list.find((_, i) => i === 1)?.id;

  return (
    <section id="packages" className="py-20 md:py-28 bg-[var(--cream-50)] dark:bg-[var(--dark-900)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            tag="💎 Value Bundles"
            title={<>Our <em className="text-[var(--gold-light)]">Packages</em></>}
            subtitle="Curated luxury treatments for every occasion"
          />
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((pkg) => {
            const isFeatured = pkg.id === featuredId;
            return (
              <StaggerItem key={pkg.id}>
                <div className={`rounded-3xl overflow-hidden border card-gold-border hover:shadow-gold-lg hover:-translate-y-2 transition-all duration-350 bg-white dark:bg-[var(--dark-600)] ${isFeatured ? "border-[rgba(191,160,106,0.4)]" : "border-[var(--border-light)]"}`}>
                  {/* Image */}
                  {pkg.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <Image src={pkg.image_url} alt={pkg.name} fill className="object-cover" unoptimized />
                      {/* Discount badge on image */}
                      <div className="absolute top-3 right-3 bg-[var(--gold)] text-[var(--dark-900)] text-[10px] font-black px-3 py-1.5 rounded-full tracking-wide">
                        {pkg.discount_percent}% OFF
                      </div>
                      {pkg.badge && (
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm border border-white/20 text-white text-[9px] px-2.5 py-1 rounded-full tracking-[0.15em] uppercase">
                          {pkg.badge}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="font-cormorant text-2xl text-[var(--dark-900)] dark:text-[#F0E8D8] mb-3">
                      {pkg.name}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-jost text-3xl font-black text-[var(--dark-900)] dark:text-[#F0E8D8]">
                        {formatPrice(pkg.offer_price)}
                      </span>
                      <span className="font-jost text-sm line-through text-[var(--dark-600)]/40 dark:text-[rgba(240,232,216,0.3)]">
                        {formatPrice(pkg.actual_price)}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--dark-600)] dark:text-[rgba(240,232,216,0.6)] font-light">
                          <Check size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(`${pkg.name} Package`))}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] tracking-[0.2em]"
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
