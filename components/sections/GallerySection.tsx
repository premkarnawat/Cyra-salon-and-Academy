"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import type { GalleryItem } from "@/types";

const FALLBACK: GalleryItem[] = [
  { id:"g1", title:"Balayage", media_url:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80", media_type:"image", sort_order:1, is_active:true, created_at:"" },
  { id:"g2", title:"Keratin", media_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=1200&q=80", media_type:"image", sort_order:2, is_active:true, created_at:"" },
  { id:"g3", title:"Styling", media_url:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80", media_type:"image", sort_order:3, is_active:true, created_at:"" },
  { id:"g4", title:"Colour", media_url:"https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=80", media_type:"image", sort_order:4, is_active:true, created_at:"" },
];

const AUTO_MS = 7000;
const SWIPE_MIN = 50;

export function GallerySection({ gallery = [] }: { gallery?: GalleryItem[] }) {
  const list = gallery.length ? gallery : FALLBACK;
  const total = list.length;

  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);

  const dragX = useMotionValue(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setDir(1);
      setCur((c) => (c + 1) % total);
    }, AUTO_MS);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => timer.current && clearInterval(timer.current);
  }, [resetTimer]);

  function goTo(next: number, direction: number) {
    setDir(direction);
    setCur((next + total) % total);
    resetTimer();
  }

  function onDragEnd(_: any, info: any) {
    if (info.offset.x < -SWIPE_MIN) goTo(cur + 1, 1);
    else if (info.offset.x > SWIPE_MIN) goTo(cur - 1, -1);
    animate(dragX, 0, { duration: 0.25 });
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const item = list[cur];

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <FadeIn>
          <SectionHeader
            tag="📸 Transformations"
            title={<>Our <em className="text-[var(--gold-light)] not-italic font-normal">Gallery</em></>}
            subtitle="Swipe to explore luxury transformations"
          />
        </FadeIn>

        {/* 🔥 MAIN CARD */}
        <div className="rounded-3xl overflow-hidden border shadow-xl bg-[#F8F9FB]">

          {/* ✅ AUTO FIT IMAGE (SAME AS PACKAGES) */}
          <div className="relative w-full aspect-[4/3] overflow-hidden">

            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={item.id}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                onDragEnd={onDragEnd}
                style={{ x: dragX }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >

                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <Image
                    src={item.media_url}
                    alt={item.title || "Gallery"}
                    fill
                    className="object-cover object-top transition-transform duration-500 hover:scale-105"
                    sizes="100vw"
                    priority={cur === 0}
                    quality={75}
                  />
                )}

                {/* 🔥 PREMIUM OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* TITLE */}
                <div className="absolute bottom-5 left-5 text-white">
                  <p className="text-xl font-cormorant tracking-wide">{item.title}</p>
                </div>

                {/* COUNTER */}
                <div className="absolute bottom-5 right-5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                  {cur + 1}/{total}
                </div>

                {/* PLAY ICON */}
                {item.media_type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={42} className="text-white" />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* 🔥 PROGRESS BAR */}
          <div className="h-[3px] bg-gray-200">
            <motion.div
              key={cur}
              className="h-full bg-[var(--gold)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
              style={{ transformOrigin: "left" }}
            />
          </div>

        </div>

        {/* DOTS */}
        <div className="mt-5 flex justify-center gap-2">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > cur ? 1 : -1)}
              className={`rounded-full transition-all ${
                i === cur ? "w-8 h-2 bg-[var(--gold)]" : "w-2 h-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        <p className="text-center mt-2 text-xs text-gray-400">
          ← Swipe or drag →
        </p>

      </div>
    </section>
  );
}
