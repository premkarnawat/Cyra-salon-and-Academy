"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate, MotionValue } from "framer-motion";
import { Play } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
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

// ✅ (kept but no longer used for layout — safe to keep)
function useNaturalAspect(src: string, type: string) {
  const [aspect, setAspect] = useState<number | null>(null);

  useEffect(() => {
    if (type !== "image") return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspect(img.naturalHeight / img.naturalWidth);
      }
    };
    img.src = src;
  }, [src, type]);

  return aspect;
}

// ✅ FIXED COMPONENT
function SlideItem({
  item,
  priority,
  dragX,
  onDragEnd,
  variants,
  dir,
}: {
  item: GalleryItem;
  priority: boolean;
  dragX: MotionValue<number>;
  onDragEnd: (_: unknown, info: { offset: { x: number } }) => void;
  variants: Record<string, unknown>;
  dir: number;
}) {
  return (
    <motion.div
      custom={dir}
      variants={variants as any}
      initial="enter"
      animate="center"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
      style={{ x: dragX, cursor: "grab", willChange: "transform" }}
      whileDrag={{ cursor: "grabbing" }}
      className="w-full"
    >
      {item.media_type === "video" ? (
        <div className="relative w-full">
          <video
            src={item.media_url}
            className="w-full h-auto"
            muted
            playsInline
            controls
            controlsList="nodownload"
          />
        </div>
      ) : (
        // 🔥 FINAL FIX: IMAGE CONTROLS FRAME (NO CROP, NO GAPS)
        <div className="w-full flex justify-center bg-white rounded-t-3xl overflow-hidden">
          <Image
            src={item.media_url}
            alt={item.title || "Gallery"}
            width={1200}
            height={800}
            className="w-full h-auto object-contain"
            sizes="(max-width:640px) 100vw,(max-width:1280px) 95vw,1200px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={85}
            draggable={false}
          />

          {/* Title Overlay */}
          {item.title && (
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "0 20px 16px",
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: "clamp(1rem,2.5vw,1.3rem)",
                  color: "#fff",
                  textShadow: "0 1px 6px rgba(0,0,0,0.6)",
                  margin: 0,
                }}
              >
                {item.title}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  const list   = (gallery && gallery.length) ? gallery : FALLBACK;
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

  useEffect(() => {
    resetTimer();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [resetTimer]);

  function goTo(next: number, d: number) {
    setDir(d); setCur((next + total) % total); resetTimer();
  }

  function onDragEnd(_: unknown, info: { offset: { x: number } }) {
    if      (info.offset.x < -SWIPE_MIN) goTo(cur + 1,  1);
    else if (info.offset.x >  SWIPE_MIN) goTo(cur - 1, -1);
    animate(dragX, 0, { duration: 0.22 });
  }

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const item = list[cur];

  return (
    <section id="gallery">
      <AnimatePresence mode="wait">
        <SlideItem
          key={item.id}
          item={item}
          priority={cur === 0}
          dragX={dragX}
          onDragEnd={onDragEnd}
          variants={variants}
          dir={dir}
        />
      </AnimatePresence>
    </section>
  );
}
