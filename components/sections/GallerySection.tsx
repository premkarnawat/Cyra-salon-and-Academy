"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import type { GalleryItem } from "@/types";

const FALLBACK: GalleryItem[] = [
  { id:"g1", title:"Balayage",   media_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=90",  media_type:"image", sort_order:1, is_active:true, created_at:"" },
  { id:"g2", title:"Keratin",    media_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1200&q=90",    media_type:"image", sort_order:2, is_active:true, created_at:"" },
  { id:"g3", title:"Styling",    media_url:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=90", media_type:"image", sort_order:3, is_active:true, created_at:"" },
  { id:"g4", title:"Colour",     media_url:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=90", media_type:"image", sort_order:4, is_active:true, created_at:"" },
  { id:"g5", title:"Spa",        media_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=1200&q=90", media_type:"image", sort_order:5, is_active:true, created_at:"" },
  { id:"g6", title:"Blowout",    media_url:"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=90",   media_type:"image", sort_order:6, is_active:true, created_at:"" },
  { id:"g7", title:"Bridal",     media_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1200&q=90", media_type:"image", sort_order:7, is_active:true, created_at:"" },
  { id:"g8", title:"Highlights", media_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&q=90", media_type:"image", sort_order:8, is_active:true, created_at:"" },
];

const AUTO_MS  = 10000;
const SWIPE_MIN = 48;

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  const list   = gallery.length ? gallery : FALLBACK;
  const total  = list.length;
  const [cur,  setCur]  = useState(0);
  const [dir,  setDir]  = useState(1);
  const dragX  = useMotionValue(0);
  const timer  = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setDir(1); setCur(c => (c + 1) % total);
    }, AUTO_MS);
  }, [total]);

  useEffect(() => { resetTimer(); return () => { if (timer.current) clearInterval(timer.current); }; }, [resetTimer]);

  function goTo(next: number, direction: number) {
    setDir(direction); setCur((next + total) % total); resetTimer();
  }

  function onDragEnd(_: unknown, info: { offset: { x: number } }) {
    if      (info.offset.x < -SWIPE_MIN) goTo(cur + 1,  1);
    else if (info.offset.x >  SWIPE_MIN) goTo(cur - 1, -1);
    animate(dragX, 0, { duration: 0.25 });
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(cur + 1,  1);
      if (e.key === "ArrowLeft")  goTo(cur - 1, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cur]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.6, ease: [0.4,0,0.2,1] } },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.4 } }),
  };

  const item = list[cur];

  return (
    <section id="gallery" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeader
            tag="📸 Transformations"
            title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Gallery</em></>}
            subtitle="Swipe to explore real client transformations"
          />
        </FadeIn>

        <div className="rounded-3xl overflow-hidden shadow-[0_16px_60px_rgba(0,0,0,0.1)] border border-[rgba(191,160,106,0.12)] bg-[#F8F9FB] select-none">

          {/* FIXED HEIGHT */}
          <div
            className="relative overflow-hidden"
            style={{ height: "clamp(320px, 65vw, 700px)" }}
          >
            <AnimatePresence initial={false} custom={dir} mode="sync">
              <motion.div
                key={item.id}
                custom={dir}
                variants={variants}
                initial="enter" animate="center" exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={onDragEnd}
                style={{ x: dragX, cursor: "grab", position: "absolute", inset: 0 }}
                whileDrag={{ cursor: "grabbing" }}
              >
                {item.media_type === "video" ? (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src={item.media_url}
                      className="w-full h-full object-cover"
                      muted playsInline controls controlsList="nodownload"
                    />
                  </div>
                ) : (
                  <>
                    {/* FIXED IMAGE */}
                    <Image
                      src={item.media_url}
                      alt={item.title || "Gallery"}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 80vw, 1200px"
                      priority={cur === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                  </>
                )}

                {item.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play size={22} className="text-white ml-0.5" />
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10 pointer-events-none">
                  <div className="flex items-end justify-between">
                    <div>
                      {item.title && (
                        <p className="font-cormorant text-xl text-white drop-shadow">{item.title}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="font-jost text-xs text-white/80">{String(cur+1).padStart(2,"0")}</span>
                      <span className="w-3 h-px bg-white/40" />
                      <span className="font-jost text-xs text-white/50">{String(total).padStart(2,"0")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="h-[3px] bg-[rgba(191,160,106,0.12)]">
            <motion.div
              key={cur}
              className="h-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > cur ? 1 : -1)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === cur ? "w-8 h-2.5 bg-[var(--gold)]" : "w-2.5 h-2.5 bg-[rgba(191,160,106,0.25)] hover:bg-[rgba(191,160,106,0.5)]"
              }`}
            />
          ))}
        </div>

        <p className="text-center mt-2 font-jost text-[11px] text-[#9CA3AF]">
          ← Swipe or drag to navigate →
        </p>
      </div>
    </section>
  );
}
