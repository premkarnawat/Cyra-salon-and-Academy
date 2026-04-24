"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryItem } from "@/types";

const FALLBACK: GalleryItem[] = [
  { id:"g1", title:"Balayage",   media_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=90",  media_type:"image", sort_order:1, is_active:true, created_at:"" },
  { id:"g2", title:"Keratin",    media_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1400&q=90",    media_type:"image", sort_order:2, is_active:true, created_at:"" },
  { id:"g3", title:"Styling",    media_url:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1400&q=90", media_type:"image", sort_order:3, is_active:true, created_at:"" },
  { id:"g4", title:"Colour",     media_url:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1400&q=90", media_type:"image", sort_order:4, is_active:true, created_at:"" },
  { id:"g5", title:"Spa",        media_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=1400&q=90", media_type:"image", sort_order:5, is_active:true, created_at:"" },
  { id:"g6", title:"Blowout",    media_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=90",   media_type:"image", sort_order:6, is_active:true, created_at:"" },
  { id:"g7", title:"Bridal",     media_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1400&q=90", media_type:"image", sort_order:7, is_active:true, created_at:"" },
  { id:"g8", title:"Highlights", media_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1400&q=90", media_type:"image", sort_order:8, is_active:true, created_at:"" },
];

const AUTO_MS   = 10000;
const SWIPE_MIN = 44;

// Pure crossfade variants — zero x-movement = zero layout shift / bounce
const FADE_VARIANTS = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.55, ease: "easeInOut" } },
  exit:   { opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } },
};

function SlideItem({
  item,
  priority,
}: {
  item: GalleryItem;
  priority: boolean;
}) {
  return (
    // absolute so entering/exiting slides stack — no layout reflow
    <motion.div
      key={item.id}
      variants={FADE_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 w-full h-full"
      style={{ willChange: "opacity" }}
    >
      {item.media_type === "video" ? (
        <video
          src={item.media_url}
          className="w-full h-full object-contain"
          muted
          playsInline
          controls
          controlsList="nodownload"
        />
      ) : (
        <>
          {/* Theme-aware background */}
          <div className="absolute inset-0 bg-white dark:bg-[#0C0B09]" />
          <Image
            src={item.media_url}
            alt={item.title || "Gallery"}
            fill
            className="object-contain"
            sizes="(max-width:640px) 100vw,(max-width:1280px) 95vw,1200px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={85}
            draggable={false}
          />
          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pointer-events-none z-10">
              <p style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(1rem,2.5vw,1.3rem)",
                color: "#fff",
                textShadow: "0 1px 6px rgba(0,0,0,0.6)",
                margin: 0,
              }}>
                {item.title}
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  const list  = (gallery && gallery.length) ? gallery : FALLBACK;
  const total = list.length;
  const [cur, setCur] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCur(c => (c + 1) % total);
    }, AUTO_MS);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [resetTimer]);

  function goTo(next: number) {
    setCur((next + total) % total);
    resetTimer();
  }

  const item = list[cur];

  return (
    <section id="gallery">
      {/* ── FIXED-HEIGHT CONTAINER — overflow:hidden + isolate prevents any layout bounce ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16/9", isolation: "isolate", cursor: "grab" }}
        onPointerDown={(e) => {
          const startX = e.clientX;
          const onUp = (ev: PointerEvent) => {
            const dx = ev.clientX - startX;
            if      (dx < -SWIPE_MIN) goTo(cur + 1);
            else if (dx >  SWIPE_MIN) goTo(cur - 1);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointerup", onUp, { once: true });
        }}
      >
        <AnimatePresence mode="sync">
          <SlideItem
            key={item.id}
            item={item}
            priority={cur === 0}
          />
        </AnimatePresence>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300"
                style={{
                  width:  i === cur ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "999px",
                  background: i === cur ? "var(--gold)" : "rgba(255,255,255,0.45)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
