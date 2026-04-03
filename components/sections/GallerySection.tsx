"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import type { GalleryItem } from "@/types";

const FALLBACK: GalleryItem[] = [
  { id:"g1", title:"Balayage",   media_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=85", media_type:"image", sort_order:1, is_active:true, created_at:"" },
  { id:"g2", title:"Keratin",    media_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=900&q=85",   media_type:"image", sort_order:2, is_active:true, created_at:"" },
  { id:"g3", title:"Styling",    media_url:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=85", media_type:"image", sort_order:3, is_active:true, created_at:"" },
  { id:"g4", title:"Colour",     media_url:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=900&q=85", media_type:"image", sort_order:4, is_active:true, created_at:"" },
  { id:"g5", title:"Spa",        media_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=900&q=85", media_type:"image", sort_order:5, is_active:true, created_at:"" },
  { id:"g6", title:"Blowout",    media_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=85",   media_type:"image", sort_order:6, is_active:true, created_at:"" },
  { id:"g7", title:"Bridal",     media_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=900&q=85", media_type:"image", sort_order:7, is_active:true, created_at:"" },
  { id:"g8", title:"Highlights", media_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=85", media_type:"image", sort_order:8, is_active:true, created_at:"" },
  { id:"g9", title:"Texture",    media_url:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=85", media_type:"image", sort_order:9, is_active:true, created_at:"" },
];

// Aspect ratio pattern for masonry feel
const RATIOS = ["aspect-[3/4]","aspect-square","aspect-square","aspect-[3/4]","aspect-square","aspect-[3/4]","aspect-square","aspect-square","aspect-[3/4]"];

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ list, index, onClose }: { list: GalleryItem[]; index: number; onClose: () => void }) {
  const [cur,     setCur]     = useState(index);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const go = useCallback((dir: number) => {
    setCur(c => (c + dir + list.length) % list.length);
  }, [list.length]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => go(1), 4000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, go]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft")  go(-1);
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, onClose]);

  const item = list[cur];

  return (
    <motion.div
      className="fixed inset-0 z-[9500] flex items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/94 cursor-pointer"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        onClick={onClose}
      />

      {/* Media */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="relative z-10 flex items-center justify-center w-full h-full p-4 md:p-12"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{   opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.4,0,0.2,1] }}
          onClick={e => e.stopPropagation()}
        >
          {item.media_type === "video" ? (
            <video
              src={item.media_url}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              controls autoPlay controlsList="nodownload"
            />
          ) : (
            <div className="relative max-h-[85vh] max-w-[90vw] w-full" style={{ aspectRatio: "auto" }}>
              <Image
                src={item.media_url}
                alt={item.title || "Gallery"}
                width={1200} height={900}
                className="rounded-2xl object-contain max-h-[85vh] w-auto mx-auto shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                unoptimized
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button onClick={onClose} className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"><X size={18}/></button>
      <button onClick={() => go(-1)} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[var(--gold)]/80 border border-white/15 flex items-center justify-center text-white transition-colors"><ChevronLeft size={20}/></button>
      <button onClick={() => go(1)}  className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-[var(--gold)]/80 border border-white/15 flex items-center justify-center text-white transition-colors"><ChevronRight size={20}/></button>
      <button onClick={() => setPlaying(p => !p)} className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs tracking-widest transition-colors">
        {playing ? <><Pause size={12}/> Pause</> : <><Play size={12}/> Play</>}
      </button>

      {/* Title */}
      {item.title && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 text-center">
          <span className="font-cormorant text-lg text-white/80 tracking-[0.1em]">{item.title}</span>
        </div>
      )}

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 translate-x-8">
        {list.map((_, i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`rounded-full transition-all duration-300 ${i === cur ? "w-6 h-[6px] bg-[var(--gold)]" : "w-[6px] h-[6px] bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="absolute top-5 left-5 z-20 font-jost text-xs text-white/40 tracking-widest">
        {String(cur+1).padStart(2,"0")} / {String(list.length).padStart(2,"0")}
      </div>
    </motion.div>
  );
}

// ── Main Section ───────────────────────────────────────────────────────────────
export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  const list = gallery.length ? gallery : FALLBACK;
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <>
      <section id="gallery" className="py-20 md:py-28 bg-[var(--cream-50)] dark:bg-[var(--dark-900)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <SectionHeader
              tag="📸 Transformations"
              title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Gallery</em></>}
              subtitle="Real results, real clients — tap any photo to explore"
            />
          </FadeIn>

          {/* Instagram-style masonry grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4 [column-fill:balance]">
            {list.map((item, i) => (
              <motion.div
                key={item.id}
                className={`relative overflow-hidden rounded-2xl mb-3 md:mb-4 break-inside-avoid cursor-pointer group border border-[rgba(191,160,106,0.1)] ${RATIOS[i % RATIOS.length]}`}
                onClick={() => setLightboxIdx(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: (i % 4) * 0.07, ease: [0.4,0,0.2,1] }}
                whileHover={{ scale: 1.02 }}
              >
                {item.media_type === "video" ? (
                  <>
                    <video src={item.media_url} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play size={18} className="text-[var(--gold-dark)] ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Image
                      src={item.media_url}
                      alt={item.title || "Gallery"}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-600"
                      sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw, 25vw"
                      unoptimized
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350" />
                  </>
                )}

                {/* Label on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
                  initial={{ y: "100%" }}
                  whileHover={{ y: 0 }}
                  transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}
                >
                  {item.title && (
                    <span className="font-jost text-[10px] tracking-[0.22em] uppercase text-[var(--gold-light)] font-medium drop-shadow">
                      {item.title}
                    </span>
                  )}
                </motion.div>

                {/* Video badge */}
                {item.media_type === "video" && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                    <span className="font-jost text-[8px] uppercase tracking-widest text-white/70">Video</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox list={list} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
