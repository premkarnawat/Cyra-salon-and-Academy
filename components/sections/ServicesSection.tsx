"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ZoomIn } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import { formatPrice, getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Service } from "@/types";

// ─── Fallback: image-based services only ─────────────────────────────────────
const FALLBACK_SERVICES: Service[] = [
  {
    id: "s1", name: "Haircut & Style", category: "Hair", starting_price: 299,
    image_url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&q=85",
    is_active: true, sort_order: 1, created_at: "",
  },
  {
    id: "s2", name: "Hair Colour", category: "Colour", starting_price: 799,
    image_url: "https://images.unsplash.com/photo-1470259078422-826894b933aa?w=800&q=85",
    is_active: true, sort_order: 2, created_at: "",
  },
  {
    id: "s3", name: "Keratin Treatment", category: "Treatment", starting_price: 2999,
    image_url: "https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=800&q=85",
    is_active: true, sort_order: 3, created_at: "",
  },
  {
    id: "s4", name: "Balayage", category: "Colour", starting_price: 3499,
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=85",
    is_active: true, sort_order: 4, created_at: "",
  },
  {
    id: "s5", name: "Hair Spa", category: "Treatment", starting_price: 499,
    image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=85",
    is_active: true, sort_order: 5, created_at: "",
  },
  {
    id: "s6", name: "Bridal Makeup", category: "Bridal", starting_price: 4999,
    image_url: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=85",
    is_active: true, sort_order: 6, created_at: "",
  },
  {
    id: "s7", name: "Nail Art", category: "Nail", starting_price: 399,
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=85",
    is_active: true, sort_order: 7, created_at: "",
  },
  {
    id: "s8", name: "Threading & Waxing", category: "Skin", starting_price: 99,
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=85",
    is_active: true, sort_order: 8, created_at: "",
  },
];

// ─── What to display as the primary visual ───────────────────────────────────
// Priority: rate_card_url (image/pdf) → image_url → placeholder
function getPrimaryMedia(svc: Service): { url: string; type: "image" | "pdf" | "placeholder" } {
  if (svc.rate_card_url) {
    return { url: svc.rate_card_url, type: svc.file_type === "pdf" ? "pdf" : "image" };
  }
  if (svc.image_url) return { url: svc.image_url, type: "image" };
  return { url: "", type: "placeholder" };
}

// ─── PDF viewer — renders PDF inline, no toolbar, no download ────────────────
function PdfPreview({ url, title }: { url: string; title: string }) {
  // Strip fragment then re-add our lock params
  const clean = url.split("#")[0];
  const src   = `${clean}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      // Overlay stops user from right-clicking / opening context menu on PDF
      onContextMenu={e => e.preventDefault()}
    >
      {/* Invisible overlay — blocks clicks so PDF cannot be interacted with */}
      <div className="absolute inset-0 z-10 cursor-default" aria-hidden="true" />
      <object
        data={src}
        type="application/pdf"
        aria-label={`${title} rate card`}
        className="w-full h-full border-0 pointer-events-none select-none"
        style={{ display: "block" }}
      >
        {/* Fallback for browsers that can't embed PDF */}
        <div className="flex flex-col items-center justify-center h-full gap-3 bg-[var(--cream-200)]">
          <span className="text-4xl">📄</span>
          <span className="font-jost text-xs tracking-[0.15em] uppercase text-[var(--gold)] font-semibold">
            Rate Card
          </span>
          <span className="font-jost text-[10px] text-[#8C7A5E]/60">{title}</span>
        </div>
      </object>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  svc,
  onClose,
}: {
  svc: Service;
  onClose: () => void;
}) {
  const media = getPrimaryMedia(svc);

  return (
    <motion.div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(12,11,9,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-3xl bg-white dark:bg-[var(--dark-700)] rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)]"
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div className="h-[3px] bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-20
            w-9 h-9 rounded-full
            bg-black/20 hover:bg-black/40
            dark:bg-white/10 dark:hover:bg-white/20
            flex items-center justify-center
            text-white transition-colors
          "
          aria-label="Close"
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* Media area — fixed height, no scrollbar, no controls */}
        <div
          className="relative bg-[var(--cream-100)] dark:bg-[var(--dark-600)]"
          style={{ height: "min(65vh, 520px)" }}
          onContextMenu={e => e.preventDefault()}
        >
          {media.type === "pdf" ? (
            <PdfPreview url={media.url} title={svc.name} />
          ) : media.type === "image" ? (
            <Image
              src={media.url}
              alt={svc.name}
              fill
              className="object-contain p-4"
              unoptimized
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl opacity-20">✂️</span>
            </div>
          )}
        </div>

        {/* Info bar */}
        <div className="px-6 py-5 flex items-center justify-between gap-4 border-t border-[rgba(191,160,106,0.12)]">
          <div>
            {svc.category && (
              <span className="font-jost text-[9.5px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold block mb-1">
                {svc.category}
              </span>
            )}
            <h3 className="font-cormorant text-xl text-[#1C1710] dark:text-[#F0E8D8]">
              {svc.name}
            </h3>
            {svc.starting_price ? (
              <p className="font-jost text-sm font-bold text-[var(--gold)] mt-0.5">
                Starting {formatPrice(svc.starting_price)}
                <span className="text-[10px] font-normal text-[#8C7A5E]/60 ml-1">
                  *varies by hair length
                </span>
              </p>
            ) : null}
          </div>

          <a
            href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(svc.name))}
            target="_blank"
            rel="noreferrer"
            className="
              btn-gold flex-shrink-0
              flex items-center gap-2
              px-5 py-3 rounded-xl
              text-[11px] tracking-[0.18em]
              whitespace-nowrap
            "
          >
            <MessageCircle size={13} strokeWidth={2} />
            Book Now
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ svc, onOpen }: { svc: Service; onOpen: () => void }) {
  const media = getPrimaryMedia(svc);

  return (
    <motion.div
      className="
        group relative rounded-2xl overflow-hidden
        bg-white dark:bg-[var(--dark-600)]
        border border-[rgba(191,160,106,0.15)]
        shadow-[0_2px_16px_rgba(0,0,0,0.05)]
        hover:shadow-[0_12px_40px_rgba(191,160,106,0.18)]
        hover:-translate-y-1.5
        transition-all duration-350 ease-out
        cursor-pointer
      "
      onClick={onOpen}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* ── Visual area ── */}
      <div
        className="relative overflow-hidden bg-[var(--cream-100)] dark:bg-[var(--dark-700)]"
        style={{ aspectRatio: "3/4" }}
        onContextMenu={e => e.preventDefault()}
      >
        {media.type === "pdf" ? (
          // PDF: full embedded preview — no interaction allowed
          <div className="w-full h-full">
            <PdfPreview url={media.url} title={svc.name} />
          </div>
        ) : media.type === "image" ? (
          <>
            <Image
              src={media.url}
              alt={svc.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
              draggable={false}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
          </>
        ) : (
          // Placeholder
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-15 group-hover:scale-110 transition-transform duration-300">✂️</span>
          </div>
        )}

        {/* Zoom hint — appears on hover */}
        <div className="
          absolute inset-0 flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10
        ">
          <div className="
            w-10 h-10 rounded-full
            bg-white/90 dark:bg-black/60
            backdrop-blur-sm
            flex items-center justify-center
            shadow-lg
          ">
            <ZoomIn size={16} className="text-[var(--gold-dark)]" strokeWidth={2} />
          </div>
        </div>

        {/* Category pill — top left */}
        {svc.category && (
          <div className="
            absolute top-2.5 left-2.5 z-10
            px-2.5 py-1 rounded-full
            bg-white/85 dark:bg-black/50
            backdrop-blur-sm
            border border-[rgba(191,160,106,0.25)]
          ">
            <span className="font-jost text-[9px] tracking-[0.18em] uppercase text-[var(--gold-dark)] dark:text-[var(--gold-light)] font-semibold">
              {svc.category}
            </span>
          </div>
        )}

        {/* PDF badge — top right */}
        {media.type === "pdf" && (
          <div className="
            absolute top-2.5 right-2.5 z-20
            px-2 py-1 rounded-md
            bg-[var(--gold)] text-white
            text-[8px] font-bold tracking-[0.1em] uppercase
          ">
            PDF
          </div>
        )}
      </div>

      {/* ── Info strip ── */}
      <div className="px-4 py-3.5 border-t border-[rgba(191,160,106,0.1)]">
        <div className="font-cormorant text-[1.05rem] text-[#1C1710] dark:text-[#F0E8D8] leading-tight mb-1 group-hover:text-[var(--gold-dark)] dark:group-hover:text-[var(--gold-light)] transition-colors">
          {svc.name}
        </div>
        <div className="flex items-center justify-between">
          {svc.starting_price ? (
            <span className="font-jost font-bold text-[var(--gold)] text-[0.9rem]">
              {formatPrice(svc.starting_price)}+
            </span>
          ) : (
            <span className="font-jost text-xs text-[#8C7A5E]/50 tracking-wide">Tap to view</span>
          )}
          <span className="text-[9px] text-[#8C7A5E]/40 font-jost tracking-wide">tap to view</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────
export function ServicesSection({ services }: { services: Service[] }) {
  const list = services.length ? services : FALLBACK_SERVICES;
  const [lightboxSvc, setLightboxSvc] = useState<Service | null>(null);

  return (
    <>
      <section
        id="services"
        className="py-20 md:py-28 bg-[var(--cream-50)] dark:bg-[var(--dark-900)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <FadeIn>
            <SectionHeader
              tag="✂️ Services & Rate Cards"
              title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Services</em></>}
              subtitle="Tap any card to view the full rate card — JPG, PNG & PDF supported"
            />
          </FadeIn>

          {/* Grid */}
          <StaggerContainer
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
            staggerDelay={0.07}
          >
            {list.map(svc => (
              <StaggerItem key={svc.id}>
                <ServiceCard
                  svc={svc}
                  onOpen={() => setLightboxSvc(svc)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Footnote */}
          <FadeIn>
            <p className="text-center mt-10 font-jost text-[11px] text-[#8C7A5E]/50 tracking-[0.12em]">
              * All prices are starting rates and may vary based on hair length, thickness & customisation
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSvc && (
          <Lightbox
            svc={lightboxSvc}
            onClose={() => setLightboxSvc(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
