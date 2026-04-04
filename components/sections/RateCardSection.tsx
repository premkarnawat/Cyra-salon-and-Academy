"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, FileText } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import type { RateCard } from "@/types";

// ─── PDF on cards: blocked (no open/download)
// ─── PDF in lightbox: SCROLLABLE — user can scroll through all pages
// The key difference: card has pointer-events:none + overlay blocker,
// lightbox iframe has pointer-events:auto + overflow:auto

// ── Card PDF preview — locked, first-page only ────────────────────────────────
function CardPdf({ url }: { url: string }) {
  const clean = url.split("#")[0];
  const src   = `${clean}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&view=FitH&zoom=page-fit`;
  return (
    <div className="relative w-full h-full" onContextMenu={e => e.preventDefault()}>
      {/* Blocker overlay — prevents any click/open on card */}
      <div className="absolute inset-0 z-10 cursor-default" aria-hidden="true" />
      <object
        data={src}
        type="application/pdf"
        className="w-full h-full border-0 select-none"
        style={{ pointerEvents: "none", display: "block" }}
        aria-label="Rate card preview"
      >
        <div className="flex flex-col items-center justify-center h-full gap-3 bg-[var(--cream-200)] dark:bg-[var(--dark-700)]">
          <FileText size={32} className="text-[var(--gold)] opacity-50" />
          <span className="font-jost text-xs text-[var(--gold)] font-semibold tracking-widest uppercase">PDF</span>
        </div>
      </object>
    </div>
  );
}

// ── Lightbox PDF — FULLY SCROLLABLE, all pages visible ───────────────────────
function LightboxPdf({ url }: { url: string }) {
  const clean = url.split("#")[0];
  // toolbar=0 hides toolbar but scrollbar=1 keeps scroll, height=100% shows all pages
  const src = `${clean}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;
  return (
    <div className="w-full h-full" style={{ minHeight: "60vh" }}>
      <iframe
        src={src}
        className="w-full h-full border-0"
        style={{
          display: "block",
          minHeight: "60vh",
          // Allow pointer events so user can scroll
          pointerEvents: "auto",
          overflow: "auto",
        }}
        title="Rate card PDF"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ card, onClose }: { card: RateCard; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9500] flex items-center justify-center p-3 md:p-8"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{
        background: "rgba(8,7,5,0.92)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      }} />

      {/* Modal box */}
      <motion.div
        className="relative z-10 w-full bg-white dark:bg-[var(--dark-700)] rounded-3xl shadow-[0_48px_120px_rgba(0,0,0,0.6)] flex flex-col"
        style={{ maxWidth: "min(760px,94vw)", maxHeight: "92vh" }}
        initial={{ scale: 0.88, opacity: 0, y: 28 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.93, opacity: 0, y: 16 }}
        transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Gold bar */}
        <div className="h-[3px] rounded-t-3xl bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)] flex-shrink-0" />

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/25 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
          aria-label="Close">
          <X size={16} strokeWidth={2} />
        </button>

        {/* Media — scrollable container */}
        <div className="flex-1 overflow-hidden rounded-b-3xl bg-[#F9FAFB] dark:bg-[var(--dark-600)]"
          style={{ minHeight: "50vh" }}>
          {card.file_type === "pdf" ? (
            // ✅ PDF is scrollable here — no blocker overlay
            <LightboxPdf url={card.file_url} />
          ) : (
            <div className="relative w-full h-full" style={{ minHeight: "50vh" }}>
              <Image
                src={card.file_url}
                alt={card.title || "Rate card"}
                fill className="object-contain p-3"
                unoptimized draggable={false}
              />
            </div>
          )}
        </div>

        {/* Caption */}
        {card.title && (
          <div className="px-6 py-3.5 border-t border-[rgba(191,160,106,0.12)] flex-shrink-0">
            <p className="font-cormorant text-lg text-[#1C1710] dark:text-[#F0E8D8] text-center">{card.title}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Rate Card Poster (grid card) ──────────────────────────────────────────────
function RateCardPoster({ card, onOpen }: { card: RateCard; onOpen: () => void }) {
  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-[var(--dark-600)] border border-[rgba(191,160,106,0.15)] shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(191,160,106,0.2)] hover:-translate-y-2 transition-all duration-400"
      onClick={onOpen}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
    >
      {/* Visual area — 3:4 poster ratio */}
      <div className="relative overflow-hidden bg-[var(--cream-100)] dark:bg-[var(--dark-700)]"
        style={{ aspectRatio: "3/4" }}
        onContextMenu={e => e.preventDefault()}>

        {card.file_type === "pdf" ? (
          <CardPdf url={card.file_url} />
        ) : (
          <>
            <Image src={card.file_url} alt={card.title || "Rate card"} fill
              className="object-contain group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
              unoptimized draggable={false} onContextMenu={e => e.preventDefault()} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
          </>
        )}

        {/* File type badge */}
        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-lg bg-white/85 dark:bg-black/55 backdrop-blur-sm border border-[rgba(191,160,106,0.2)] flex items-center gap-1">
          {card.file_type === "pdf"
            ? <FileText size={9} className="text-[var(--gold-dark)]" />
            : <span className="text-[7px] text-[var(--gold-dark)]">IMG</span>}
          <span className="font-jost text-[8px] tracking-[0.12em] uppercase text-[var(--gold-dark)] dark:text-[var(--gold-light)] font-semibold">
            {card.file_type.toUpperCase()}
          </span>
        </div>

        {/* Zoom hint */}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-black/65 backdrop-blur-sm shadow-lg flex items-center justify-center">
            <ZoomIn size={17} className="text-[var(--gold-dark)]" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* Caption */}
      {card.title && (
        <div className="px-4 py-3 border-t border-[rgba(191,160,106,0.1)]">
          <p className="font-cormorant text-[1rem] leading-snug text-[#1C1710] dark:text-[#F0E8D8] group-hover:text-[var(--gold-dark)] dark:group-hover:text-[var(--gold-light)] transition-colors text-center">
            {card.title}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(191,160,106,0.08)] border border-[rgba(191,160,106,0.15)] flex items-center justify-center mb-4">
        <FileText size={26} className="text-[var(--gold)] opacity-40" />
      </div>
      <p className="font-cormorant text-xl text-[#3D3527] dark:text-[rgba(240,232,216,0.5)]">Rate cards coming soon</p>
      <p className="font-jost text-xs text-[#8C7A5E]/50 tracking-wide mt-1">Visit again soon or contact us directly</p>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function RateCardSection({ rateCards }: { rateCards: RateCard[] }) {
  const [lightboxCard, setLightboxCard] = useState<RateCard | null>(null);

  return (
    <>
      <section id="services" className="py-20 md:py-28 bg-[var(--cream-100)] dark:bg-[var(--dark-800)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <SectionHeader
              tag="✂️ Services & Rates"
              title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Rate Cards</em></>}
              subtitle="Tap any card to view full size — scroll through multi-page PDFs"
            />
          </FadeIn>

          {rateCards.length === 0 ? (
            <FadeIn><div className="grid grid-cols-1"><EmptyState /></div></FadeIn>
          ) : (
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              staggerDelay={0.08}
            >
              {rateCards.map(card => (
                <StaggerItem key={card.id}>
                  <RateCardPoster card={card} onOpen={() => setLightboxCard(card)} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightboxCard && (
          <Lightbox card={lightboxCard} onClose={() => setLightboxCard(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
