"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { FileText, BookOpen } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import type { RateCard } from "@/types";

function partition(cards: RateCard[]) {
  return {
    images: cards.filter(c => c.file_type === "image"),
    pdfs:   cards.filter(c => c.file_type === "pdf"),
  };
}

// ── PDF Poster — FIXED (scroll + no block + faster) ───────────────────────────
function PdfPoster({ card }: { card: RateCard }) {
  const src = `${card.file_url.split("#")[0]}#toolbar=0&navpanes=0`;

  return (
    <div className="bg-white rounded-3xl border border-[rgba(191,160,106,0.18)] shadow-[0_8px_40px_rgba(0,0,0,0.07)] overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />
      <div className="p-4">
        {card.title && (
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-[var(--gold-dark)]" />
            <span className="font-jost text-sm font-semibold text-[#374151] tracking-wide">{card.title}</span>
          </div>
        )}

        {/* FIX: better height + lazy load */}
        <div
          className="rounded-2xl overflow-hidden border border-[rgba(191,160,106,0.1)] bg-[#F8F9FB]"
          style={{ height: "75vh" }}
        >
          <iframe
            src={src}
            className="w-full h-full border-0"
            loading="lazy"
            style={{ display: "block" }}
            title={card.title || "Rate card"}
          />
        </div>
      </div>
    </div>
  );
}

// ── Spiral Book ───────────────────────────────────────────────────────────────
function SpiralBook({ images }: { images: RateCard[] }) {
  const total  = images.length;
  const [page, setPage] = useState(0);
  const [dir,  setDir]  = useState(1);
  const dragX  = useMotionValue(0);
  const SWIPE  = 45;

  function goTo(next: number, direction: number) {
    if (next < 0 || next >= total) return;
    setDir(direction);
    setPage(next);
  }

  const onDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    if      (info.offset.x < -SWIPE && page < total - 1) goTo(page + 1,  1);
    else if (info.offset.x >  SWIPE && page > 0)         goTo(page - 1, -1);
    animate(dragX, 0, { duration: 0.3 });
  }, [page, total]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1,  1);
      if (e.key === "ArrowLeft")  goTo(page - 1, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [page]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "55%" : "-55%", opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.42, ease: [0.4,0,0.2,1] } },
    exit:  (d: number) => ({ x: d > 0 ? "-55%" : "55%", opacity: 0, scale: 0.96, transition: { duration: 0.32 } }),
  };

  if (total === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto select-none">
      <div className="relative">

        {/* Spiral holes */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-[22px] z-20 flex items-center gap-[10px] pointer-events-none">
          {Array.from({ length: 13 }).map((_, i) => (
            <div key={i} className="w-[14px] h-[14px] rounded-full border-[2px] border-[var(--gold)] bg-white shadow-[0_1px_3px_rgba(191,160,106,0.3)]" />
          ))}
        </div>

        {/* Book page */}
        <div className="rounded-2xl overflow-hidden shadow-[0_20px_56px_rgba(0,0,0,0.13)] border border-[rgba(191,160,106,0.18)] bg-white">
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
              dragElastic={0.13}
              onDragEnd={onDragEnd}
              style={{ x: dragX }}
              whileDrag={{ cursor: "grabbing" }}
              className="relative w-full aspect-[3/4] flex items-center justify-center p-6"
            >
              {/* INNER PAGE FIX (IMPORTANT) */}
              <div className="relative w-full h-full bg-white rounded-md overflow-hidden shadow-inner">

                <Image
                  src={images[page].file_url}
                  alt={images[page].title || `Page ${page + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width:640px) 95vw, 448px"
                  draggable={false}
                  priority={page === 0}
                />

              </div>

              {/* Page number */}
              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-sm">
                <span className="font-jost text-[10px] text-white/85 tracking-wide">
                  {page + 1} / {total}
                </span>
              </div>

              {/* Title */}
              {images[page].title && (
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="font-cormorant text-sm text-white drop-shadow">
                    {images[page].title}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stacked pages */}
        {page < total - 1 && (
          <>
            <div className="absolute inset-x-3 -bottom-1.5 h-full rounded-2xl bg-[#EDE8DF] border border-[rgba(191,160,106,0.13)] -z-10" />
            <div className="absolute inset-x-5 -bottom-3 h-full rounded-2xl bg-[#E5DDCF] -z-20" />
          </>
        )}
      </div>

      {/* Dots */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > page ? 1 : -1)}
              className={`rounded-full transition-all duration-300 ${
                i === page
                  ? "w-7 h-2.5 bg-[var(--gold)]"
                  : "w-2.5 h-2.5 bg-[rgba(191,160,106,0.28)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────
function Empty() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[rgba(191,160,106,0.08)] border border-[rgba(191,160,106,0.15)] flex items-center justify-center mb-4">
        <BookOpen size={24} className="text-[var(--gold)] opacity-50" />
      </div>
      <p className="font-cormorant text-xl text-[#374151]">Rate cards coming soon</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function RateCardSection({ rateCards }: { rateCards: RateCard[] }) {
  const { images, pdfs } = partition(rateCards);
  const hasContent = images.length > 0 || pdfs.length > 0;

  return (
    <section id="services" className="py-16 md:py-24 bg-[#F8F9FB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        <FadeIn>
          <div className="text-center mb-14">
            <h2 className="font-cinzel text-[clamp(2.2rem,6vw,4rem)] text-[#1F2937] tracking-[0.18em]">
              Rate Cards
            </h2>
          </div>
        </FadeIn>

        {!hasContent ? (
          <Empty />
        ) : (
          <div className="space-y-14">

            {images.length > 0 && (
              <FadeIn>
                <SpiralBook images={images} />
              </FadeIn>
            )}

            {pdfs.length > 0 && (
              <FadeIn>
                <div className="grid gap-6">
                  {pdfs.map(card => <PdfPoster key={card.id} card={card} />)}
                </div>
              </FadeIn>
            )}

          </div>
        )}
      </div>
    </section>
  );
}
