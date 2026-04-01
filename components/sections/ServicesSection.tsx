"use client";

import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/animations/FadeIn";
import { formatPrice, getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Service } from "@/types";

const FALLBACK_SERVICES: Service[] = [
  { id:"s1", name:"Haircut & Style",    starting_price:299,  image_url:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80", is_active:true, sort_order:1, created_at:"" },
  { id:"s2", name:"Hair Colour",        starting_price:799,  image_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=600&q=80", is_active:true, sort_order:2, created_at:"" },
  { id:"s3", name:"Keratin Treatment",  starting_price:2999, image_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=600&q=80", is_active:true, sort_order:3, created_at:"" },
  { id:"s4", name:"Balayage",           starting_price:3499, image_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80", is_active:true, sort_order:4, created_at:"" },
  { id:"s5", name:"Hair Spa",           starting_price:499,  image_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80", is_active:true, sort_order:5, created_at:"" },
  { id:"s6", name:"Bridal Makeup",      starting_price:4999, image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80", is_active:true, sort_order:6, created_at:"" },
  { id:"s7", name:"Nail Art",           starting_price:399,  image_url:"https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80", is_active:true, sort_order:7, created_at:"" },
  { id:"s8", name:"Threading & Waxing", starting_price:99,   image_url:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80", is_active:true, sort_order:8, created_at:"" },
];

export function ServicesSection({ services }: { services: Service[] }) {
  const list = services.length ? services : FALLBACK_SERVICES;

  return (
    <section id="services" className="py-20 md:py-28 bg-[var(--cream-100)] dark:bg-[var(--dark-800)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            tag="✂️ Services & Rates"
            title={<>What We <em className="text-[var(--gold-light)]">Offer</em></>}
            subtitle="Starting prices — customised to your hair type & length"
          />
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {list.map((svc) => (
            <StaggerItem key={svc.id}>
              <a
                href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(svc.name))}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-2xl overflow-hidden bg-white dark:bg-[var(--dark-600)] border border-[var(--border-light)] card-gold-border hover:shadow-gold hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Rate card (PDF shown as image preview) */}
                {svc.rate_card_url ? (
                  <div className="relative h-40 overflow-hidden bg-[var(--cream-200)] dark:bg-[var(--dark-500)] flex items-center justify-center">
                    {svc.file_type === "pdf" ? (
                      // PDF: show as image embed (no download allowed)
                      <object
                        data={`${svc.rate_card_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        type="application/pdf"
                        className="w-full h-full pointer-events-none"
                        aria-label={svc.name}
                      >
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <span className="text-2xl">📄</span>
                          <span className="text-xs text-[var(--gold)] font-semibold">Rate Card</span>
                        </div>
                      </object>
                    ) : (
                      <Image src={svc.rate_card_url} alt={`${svc.name} rate card`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    )}
                  </div>
                ) : svc.image_url ? (
                  <div className="relative h-40 overflow-hidden">
                    <Image src={svc.image_url} alt={svc.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  </div>
                ) : null}

                <div className="p-4">
                  <div className="font-cormorant text-base text-[var(--dark-900)] dark:text-[#F0E8D8] mb-1">
                    {svc.name}
                  </div>
                  {svc.starting_price && (
                    <div className="font-jost font-bold text-[var(--gold)] text-base">
                      {formatPrice(svc.starting_price)}+
                    </div>
                  )}
                  <p className="text-[10px] text-[var(--dark-600)]/50 dark:text-[rgba(240,232,216,0.3)] mt-1 leading-relaxed">
                    *Price varies by hair length & customisation
                  </p>
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
