"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, FileText } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations/FadeIn";
import type { RateCard } from "@/types";

// ─── No hardcoded fallbacks — section simply shows empty state if no uploads ──

// ─── PDF embedded preview ─────────────────────────────────────────────────────
// Renders first page only, no toolbar, no download, no open-in-browser
function EmbeddedPdf({
  url,
  height = "100%",
}: {
  url: string;
  height?: string | number;
}) {
  const clean = url.split("#")[0];
  const src   = `${clean}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH&zoom=page-fit`;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Invisible interaction-blocker — prevents opening, right-click, drag */}
      <div
        className="absolute inset-0 z-10"
        style={{ cursor: "default" }}
        aria-hidden="true"
        onContextMenu={e => e.preventDefault()}
      />
      <object
        data={src}
        type="application/pdf"
        className="w-full h-full border-0 select-none"
        style={{ pointerEvents: "none", display: "block" }}
        aria-label="Rate card PDF preview"
      >
        {/* Browser fallback if PDF can't be embedded */}
        <div className="flex flex-col items-center justify-center h-full gap-3 bg-[var(--cream-200)] dark:bg-[var(--dark-700)]">
          <FileText size={36} className="text-[var(--gold)] opacity-60" />
          <span className="font-jost text-xs tracking-[0.2em] uppercase text-[var(--gold)] font-semibold">
            Rate Card
          </span>
          <span className="font-jost text-[10px] text-[#8C7A5E]/50">
            PDF preview unavailable in this browser
          </span>
        </div>
      </object>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ card, onClose }: { card: RateCard; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9500] flex items-center justify-center p-4 md:p-8"
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
          background: "rgba(8,7,5,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full bg-white dark:bg-[var(--dark-700)] rounded-3xl overflow-hidden shadow-[0_48px_120px_rgba(0,0,0,0.6)]"
        style={{ maxWidth: "min(720px, 92vw)" }}
        initial={{ scale: 0.86, opacity: 0, y: 28 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.42, ease: [0.175, 0.885, 0.32, 1.275] }}
        onClick={e => e.stopPropagation()}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Gold accent bar */}
        <div className="h-[3px] bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/20 hover:bg-black/50 dark:bg-white/10 dark:hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2} />
        </button>

        {/* Media */}
        <div
          className="relative bg-[var(--cream-100)] dark:bg-[var(--dark-600)]"
          style={{ height: "min(70vh, 580px)" }}
          onContextMenu={e => e.preventDefault()}
        >
          {card.file_type === "pdf" ? (
            <EmbeddedPdf url={card.file_url} height="100%" />
          ) : (
            <Image
              src={card.file_url}
              alt={card.title || "Rate card"}
              fill
              className="object-contain"
              unoptimized
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
          )}
        </div>

        {/* Caption */}
        {card.title && (
          <div className="px-6 py-4 border-t border-[rgba(191,160,106,0.12)]">
            <p className="font-cormorant text-lg text-[#1C1710] dark:text-[#F0E8D8] text-center">
              {card.title}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Rate Card Poster ─────────────────────────────────────────────────────────
function RateCardPoster({
  card,
  onOpen,
}: {
  card: RateCard;
  onOpen: () => void;
}) {
  return (
    <motion.div
      className="
        group relative rounded-2xl overflow-hidden cursor-pointer
        bg-white dark:bg-[var(--dark-600)]
        border border-[rgba(191,160,106,0.15)]
        shadow-[0_2px_20px_rgba(0,0,0,0.06)]
        hover:shadow-[0_16px_48px_rgba(191,160,106,0.2)]
        hover:-translate-y-2
        transition-all duration-400 ease-out
      "
      onClick={onOpen}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.975 }}
    >
      {/* ── Visual area — full aspect ratio, no cropping ── */}
      <div
        className="relative overflow-hidden bg-[var(--cream-100)] dark:bg-[var(--dark-700)]"
        onContextMenu={e => e.preventDefault()}
        style={{
          // A3/A4 portrait ratio — looks like a real rate card poster
          aspectRatio: "3 / 4",
        }}
      >
        {card.file_type === "pdf" ? (
          <EmbeddedPdf url={card.file_url} height="100%" />
        ) : (
          <>
            <Image
              src={card.file_url}
              alt={card.title || "Rate card"}
              fill
              className="object-contain group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
          </>
        )}

        {/* File type badge — top right */}
        <div className="
          absolute top-3 right-3 z-10
          px-2.5 py-1 rounded-lg
          bg-white/85 dark:bg-black/55
          backdrop-blur-sm
          border border-[rgba(191,160,106,0.2)]
          flex items-center gap-1.5
        ">
          {card.file_type === "pdf"
            ? <FileText size={10} className="text-[var(--gold-dark)]" />
            : <span className="text-[8px] text-[var(--gold-dark)]">IMG</span>
          }
          <span className="font-jost text-[8.5px] tracking-[0.15em] uppercase text-[var(--gold-dark)] dark:text-[var(--gold-light)] font-semibold">
            {card.file_type.toUpperCase()}
          </span>
        </div>

        {/* Zoom hint on hover */}
        <div className="
          absolute inset-0 flex items-center justify-center z-10
          opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ">
          <div className="
            w-12 h-12 rounded-full
            bg-white/90 dark:bg-black/65
            backdrop-blur-sm shadow-lg
            flex items-center justify-center
          ">
            <ZoomIn size={18} className="text-[var(--gold-dark)]" strokeWidth={1.8} />
          </div>
        </div>
      </div>

      {/* ── Caption strip ── */}
      {card.title && (
        <div className="px-4 py-3 border-t border-[rgba(191,160,106,0.1)]">
          <p className="
            font-cormorant text-[1rem] leading-snug
            text-[#1C1710] dark:text-[#F0E8D8]
            group-hover:text-[var(--gold-dark)] dark:group-hover:text-[var(--gold-light)]
            transition-colors text-center
          ">
            {card.title}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(191,160,106,0.08)] border border-[rgba(191,160,106,0.15)] flex items-center justify-center mb-5">
        <FileText size={28} className="text-[var(--gold)] opacity-50" />
      </div>
      <p className="font-cormorant text-xl text-[#3D3527] dark:text-[rgba(240,232,216,0.5)] mb-2">
        Rate cards coming soon
      </p>
      <p className="font-jost text-xs text-[#8C7A5E]/50 tracking-wide">
        Visit again soon or contact us directly
      </p>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function RateCardSection({ rateCards }: { rateCards: RateCard[] }) {
  const [lightboxCard, setLightboxCard] = useState<RateCard | null>(null);

  return (
    <>
      <section
        id="services"
        className="py-20 md:py-28 bg-[var(--cream-100)] dark:bg-[var(--dark-800)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <FadeIn>
            <SectionHeader
              tag="✂️ Services & Rates"
              title={
                <>Our <em className="text-[var(--gold-light)] not-italic font-normal">Rate Cards</em></>
              }
              subtitle="Tap any card to view full size — JPG, PNG & PDF supported"
            />
          </FadeIn>

          {/* Grid
              Desktop : 3 per row
              Tablet  : 2 per row
              Mobile  : 1 per row
          */}
          {rateCards.length === 0 ? (
            <FadeIn>
              <div className="grid grid-cols-1">
                <EmptyState />
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              staggerDelay={0.08}
            >
              {rateCards.map(card => (
                <StaggerItem key={card.id}>
                  <RateCardPoster
                    card={card}
                    onOpen={() => setLightboxCard(card)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxCard && (
          <Lightbox
            card={lightboxCard}
            onClose={() => setLightboxCard(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
