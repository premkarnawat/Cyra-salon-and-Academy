"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { FileText, BookOpen } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import type { RateCard } from "@/types";

// ─── Separate images from PDFs ────────────────────────────────────────────────
function partition(cards: RateCard[]) {
  const images = cards.filter(c => c.file_type === "image");
  const pdfs   = cards.filter(c => c.file_type === "pdf");
  return { images, pdfs };
}

// ─── PDF Poster Card — scrollable, no download ───────────────────────────────
function PdfPosterCard({ card }: { card: RateCard }) {
  const clean = card.file_url.split("#")[0];
  const src   = `${clean}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  return (
    <div className="bg-white rounded-3xl border border-[rgba(191,160,106,0.2)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Header strip */}
      <div className="h-[3px] bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />

      <div className="p-4">
        {/* Label row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[rgba(191,160,106,0.1)] border border-[rgba(191,160,106,0.2)] flex items-center justify-center flex-shrink-0">
            <FileText size={13} className="text-[var(--gold-dark)]" />
          </div>
          <span className="font-jost text-xs font-semibold text-[#374151] tracking-wide">
            {card.title || "Rate Card"}
          </span>
        </div>

        {/* PDF embed — scrollable, no interaction to open/download */}
        <div className="relative rounded-2xl overflow-hidden bg-[#F8F9FB] border border-[rgba(191,160,106,0.12)]"
          style={{ height: "clamp(400px, 65vh, 680px)" }}>
          <iframe
            src={src}
            className="w-full h-full border-0"
            style={{ display:"block", pointerEvents:"auto" }}
            title={card.title || "Rate card"}
            sandbox="allow-scripts allow-same-origin"
          />
          {/* Thin overlay on top-right to block the PDF toolbar/header area */}
          <div className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// ─── Spiral Book Component ────────────────────────────────────────────────────
// Images only. First image = cover. Swipe left/right to turn pages.
function SpiralBook({ images }: { images: RateCard[] }) {
  const [page,    setPage]    = useState(0);
  const [dir,     setDir]     = useState(0);  // -1 prev, 1 next
  const total = images.length;

  // Touch/drag state
  const dragX      = useMotionValue(0);
  const SWIPE_MIN  = 50;

  function goTo(nextPage: number) {
    if (nextPage < 0 || nextPage >= total) return;
    setDir(nextPage > page ? 1 : -1);
    setPage(nextPage);
  }

  // Drag handlers
  const onDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    const dx = info.offset.x;
    if (dx < -SWIPE_MIN && page < total - 1) goTo(page + 1);
    else if (dx > SWIPE_MIN && page > 0)     goTo(page - 1);
    animate(dragX, 0, { duration: 0.3 });
  }, [page, total]);

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft")  goTo(page - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [page]);

  if (total === 0) return null;

  const isCover = page === 0;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0, scale: 0.94, rotateY: d > 0 ? 8 : -8 }),
    center: { x: 0, opacity: 1, scale: 1, rotateY: 0, transition: { duration: 0.45, ease: [0.4,0,0.2,1] } },
    exit:  (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0, scale: 0.94, rotateY: d > 0 ? -8 : 8, transition: { duration: 0.35 } }),
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none" style={{ perspective: "1200px" }}>
      {/* Book wrapper */}
      <div className="relative">
        {/* Spiral binding decoration */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-5 z-20 flex items-center gap-[11px]">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="w-4 h-4 rounded-full border-[2.5px] border-[var(--gold)] bg-white shadow-[0_1px_4px_rgba(191,160,106,0.25)]" />
          ))}
        </div>

        {/* Page */}
        <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[rgba(191,160,106,0.18)]">
          <AnimatePresence initial={false} custom={dir} mode="wait">
            <motion.div
              key={page}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={onDragEnd}
              style={{ x: dragX, cursor: "grab" }}
              whileDrag={{ cursor: "grabbing" }}
              className="relative bg-white"
              style={{ aspectRatio: "3/4" }}
            >
              {/* Cover badge */}
              {isCover && (
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold)] shadow-md">
                  <BookOpen size={11} className="text-white" />
                  <span className="font-jost text-[9px] font-bold text-white tracking-[0.15em] uppercase">Cover</span>
                </div>
              )}

              <Image
                src={images[page].file_url}
                alt={images[page].title || `Page ${page + 1}`}
                fill
                className="object-contain"
                sizes="(max-width:640px) 95vw, 500px"
                unoptimized
                draggable={false}
                priority={page === 0}
              />

              {/* Page number */}
              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                <span className="font-jost text-[10px] text-white/80 tracking-wide">
                  {page + 1} / {total}
                </span>
              </div>

              {/* Title if exists */}
              {images[page].title && (
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="font-cormorant text-sm text-white drop-shadow">{images[page].title}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page shadow stack for depth effect */}
        {page < total - 1 && (
          <>
            <div className="absolute inset-x-3 -bottom-1.5 h-full rounded-2xl bg-[#F0E8D8] border border-[rgba(191,160,106,0.15)] -z-10 shadow-sm" />
            <div className="absolute inset-x-5 -bottom-3 h-full rounded-2xl bg-[#EDE0C8] border border-[rgba(191,160,106,0.1)] -z-20" />
          </>
        )}
      </div>

      {/* Swipe hint / dots */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === page ? "w-6 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-[rgba(191,160,106,0.3)] hover:bg-[rgba(191,160,106,0.6)]"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        {/* Swipe hint — only show on first visit */}
        {total > 1 && (
          <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] font-jost">
            <span>←</span>
            <span>Swipe or drag to turn pages</span>
            <span>→</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(191,160,106,0.08)] border border-[rgba(191,160,106,0.15)] flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-[var(--gold)] opacity-50" />
      </div>
      <p className="font-cormorant text-xl text-[#374151]">Rate cards coming soon</p>
      <p className="font-jost text-xs text-[#9CA3AF] mt-1">Visit again soon or contact us directly</p>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function RateCardSection({ rateCards }: { rateCards: RateCard[] }) {
  const { images, pdfs } = partition(rateCards);
  const hasContent = images.length > 0 || pdfs.length > 0;

  return (
    <section id="services" className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── No "Services" heading, no "Rate" text — visual only ── */}
        {/* Section tag only — minimal label */}
        <FadeIn>
          <div className="text-center mb-12">
            <span className="section-tag">✂️ Rate Cards</span>
            <div className="gold-divider" />
          </div>
        </FadeIn>

        {!hasContent ? (
          <EmptyState />
        ) : (
          <div className="space-y-16">
            {/* ── BOOK: image rate cards ── */}
            {images.length > 0 && (
              <FadeIn>
                <SpiralBook images={images} />
              </FadeIn>
            )}

            {/* ── PDF POSTERS: one card each ── */}
            {pdfs.length > 0 && (
              <FadeIn>
                <div className={`grid gap-6 ${pdfs.length === 1 ? "max-w-lg mx-auto" : "grid-cols-1 md:grid-cols-2"}`}>
                  {pdfs.map(card => (
                    <PdfPosterCard key={card.id} card={card} />
                  ))}
                </div>
              </FadeIn>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
