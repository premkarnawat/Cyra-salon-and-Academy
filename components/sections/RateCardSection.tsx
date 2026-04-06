// components/sections/RateCardSection.tsx
"use client";

import { useState, useCallback, useEffect, memo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { BookOpen } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import type { RateCard } from "@/types";

/* ── Split Data ───────────────── */
function partition(cards: RateCard[]) {
  return {
    images: cards.filter(c => c.file_type === "image"),
    pdfs: cards.filter(c => c.file_type === "pdf"),
  };
}

/* ── ⚡ FAST IMAGE ───────────────── */
const FastImage = memo(function FastImage({
  src,
  alt,
  priority
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover object-top"
      sizes="(max-width:480px) 95vw,(max-width:768px) 60vw,420px"
      priority={priority}
      quality={70}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
    />
  );
});

/* ── 📖 SPIRAL BOOK ───────────────── */
function SpiralBook({ images }: { images: RateCard[] }) {
  const total = images.length;
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const dragX = useMotionValue(0);

  const SWIPE = 40;

  function goTo(next: number, d: number) {
    if (next < 0 || next >= total) return;
    setDir(d);
    setPage(next);
  }

  const onDragEnd = useCallback((_: any, info: any) => {
    if (info.offset.x < -SWIPE && page < total - 1) goTo(page + 1, 1);
    else if (info.offset.x > SWIPE && page > 0) goTo(page - 1, -1);
    animate(dragX, 0, { duration: 0.2 });
  }, [page, total]);

  /* ⚡ Preload next + prev images */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const preload = (src: string) => {
      const img = new window.Image();
      img.src = src;
    };

    const next = images[page + 1]?.file_url;
    const prev = images[page - 1]?.file_url;

    if (next) preload(next);
    if (prev) preload(prev);
  }, [page, images]);

  if (!total) return null;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.25 } },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div style={{ maxWidth:420, margin:"0 auto", userSelect:"none" }}>

      {/* Book */}
      <div style={{
        position:"relative",
        paddingTop:"133.33%",
        borderRadius:16,
        overflow:"hidden",
        boxShadow:"0 10px 30px rgba(0,0,0,0.12)"
      }}>

        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={page}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left:0, right:0 }}
            dragElastic={0.08}
            onDragEnd={onDragEnd}
            style={{ x: dragX }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >

            {/* Image */}
            <FastImage
              src={images[page].file_url}
              alt={images[page].title || `Page ${page + 1}`}
              priority={page === 0}
            />

            {/* ✅ LIGHT overlay (no dark issue) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Title */}
            {images[page].title && (
              <div className="absolute bottom-4 left-4 text-white text-lg">
                {images[page].title}
              </div>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 right-4 bg-black/30 text-white text-xs px-3 py-1 rounded-full">
              {page + 1}/{total}
            </div>

            {/* Cover Badge */}
            {page === 0 && (
              <div className="absolute top-3 left-3 bg-[var(--gold)] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <BookOpen size={12} />
                Cover
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > page ? 1 : -1)}
            className={`rounded-full transition-all ${
              i === page ? "w-6 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {total > 1 && (
        <p className="text-center text-xs text-gray-400 mt-2">
          ← Swipe to turn pages →
        </p>
      )}
    </div>
  );
}

/* ── EMPTY ───────────────── */
function Empty() {
  return (
    <div className="text-center py-20 text-gray-400">
      Rate cards coming soon
    </div>
  );
}

/* ── MAIN ───────────────── */
export function RateCardSection({ rateCards = [] }: { rateCards?: RateCard[] }) {
  const { images } = partition(rateCards);
  const hasContent = images.length > 0;

  return (
    <section id="services" className="py-20 bg-[#F8F9FB]">
      <div className="max-w-4xl mx-auto px-4">

        <FadeIn>
          <h2 className="text-center text-3xl font-semibold mb-10">
            Rate Cards
          </h2>
        </FadeIn>

        {!hasContent ? (
          <Empty />
        ) : (
          <FadeIn>
            <SpiralBook images={images} />
          </FadeIn>
        )}

      </div>
    </section>
  );
}
