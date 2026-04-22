"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
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

// ── Per-slide natural dimensions ──────────────────────────────────────────────
// We detect each image's natural aspect ratio then resize the frame to match.
// This way portrait images get a tall frame, landscape get a wide frame — no gaps.
function useNaturalAspect(src: string, type: string) {
  const [aspect, setAspect] = useState<number | null>(null);

  useEffect(() => {
    if (type !== "image") return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspect(img.naturalHeight / img.naturalWidth); // height / width ratio
      }
    };
    img.src = src;
  }, [src, type]);

  return aspect;
}

// ── Single slide wrapper that sizes itself to the image ───────────────────────
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
  dragX: ReturnType<typeof useMotionValue>;
  onDragEnd: (_: unknown, info: { offset: { x: number } }) => void;
  variants: Record<string, unknown>;
  dir: number;
}) {
  const aspect = useNaturalAspect(item.media_url, item.media_type);

  // Clamp aspect ratio: min 9:16 (portrait) → max 16:9 (landscape)
  // Converts to padding-top % for CSS aspect-ratio trick
  const clampedRatio = aspect
    ? Math.min(Math.max(aspect, 0.5625), 1.7778) // 9/16 to 16/9
    : 0.5625; // default to 16:9 while loading

  return (
    <motion.div
      custom={dir}
      variants={variants as Parameters<typeof motion.div>[0]["variants"]}
      initial="enter" animate="center" exit="exit"
      drag="x"
      dragConstraints={{ left:0, right:0 }}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
      style={{ x: dragX, cursor:"grab", willChange:"transform" }}
      whileDrag={{ cursor:"grabbing" }}
      className="w-full"
    >
      {item.media_type === "video" ? (
        <div className="relative w-full" style={{ paddingTop:"56.25%" }}>
          <div className="absolute inset-0">
            <video src={item.media_url} className="w-full h-full object-cover" muted playsInline controls controlsList="nodownload" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div style={{ width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.18)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Play size={22} style={{ color:"#fff", marginLeft:3 }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /*
          Dynamic frame — padding-top % = aspect ratio (h/w × 100)
          Frame adjusts TO the image, not the other way around.
          object-cover fills the frame completely — NO black sides, NO gaps.
        */
        <div className="relative w-full overflow-hidden rounded-t-3xl" style={{ paddingTop:`${clampedRatio * 100}%` }}>
          <Image
            src={item.media_url}
            alt={item.title || "Gallery"}
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw,(max-width:1280px) 95vw,1200px"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            quality={90}
            draggable={false}
          />
          {/* Gradient overlay for title readability only */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:90, background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%)", pointerEvents:"none" }} />

          {/* Title */}
          {item.title && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 20px 16px", pointerEvents:"none" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1rem,2.5vw,1.3rem)", color:"#fff", textShadow:"0 1px 6px rgba(0,0,0,0.6)", margin:0 }}>
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

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(cur + 1,  1);
      if (e.key === "ArrowLeft")  goTo(cur - 1, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cur]);

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.4,0,0.2,1] } },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.35 } }),
  };

  const item = list[cur];

  return (
    <section id="gallery" style={{ background:"#FFFFFF", padding:"clamp(3rem,8vw,5rem) 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(1rem,4vw,2.5rem)" }}>
        <FadeIn>
          <SectionHeader
            tag="📸 Transformations"
            title={<>Our <em style={{ color:"var(--gold-light)", fontStyle:"normal", fontWeight:400 }}>Gallery</em></>}
            subtitle="Swipe to explore luxury transformations"
          />
        </FadeIn>

        {/*
          Outer wrapper: white bg, rounded, shadow.
          NO fixed height — the inner slide controls its own height dynamically.
          This means portrait images make the container taller, landscape makes it shorter.
          Frame always perfectly matches the image. No black gaps. No blur background.
        */}
        <div style={{
          borderRadius:24,
          overflow:"hidden",
          boxShadow:"0 16px 60px rgba(0,0,0,0.1)",
          border:"1px solid rgba(191,160,106,0.12)",
          background:"#F8F9FB",
          userSelect:"none",
        }}>
          <div style={{ overflow:"hidden" }}>
            <AnimatePresence initial={false} custom={dir} mode="wait">
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
          </div>

          {/* Counter bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 20px" }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:"#6B7280" }}>
              {item.title || ""}
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.06)", borderRadius:99, padding:"4px 12px" }}>
              <span style={{ fontFamily:"'Jost',sans-serif", fontSize:11, color:"#374151" }}>{String(cur+1).padStart(2,"0")}</span>
              <div style={{ width:12, height:1, background:"rgba(0,0,0,0.2)" }} />
              <span style={{ fontFamily:"'Jost',sans-serif", fontSize:11, color:"#9CA3AF" }}>{String(total).padStart(2,"0")}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height:3, background:"rgba(191,160,106,0.12)" }}>
            <motion.div
              key={cur}
              style={{ height:"100%", background:"linear-gradient(90deg,#8C6E30,#BFA06A,#D4B483)", transformOrigin:"left", willChange:"transform" }}
              initial={{ scaleX:0 }}
              animate={{ scaleX:1 }}
              transition={{ duration:AUTO_MS/1000, ease:"linear" }}
            />
          </div>
        </div>

        {/* Dots */}
        <div style={{ marginTop:18, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          {list.map((_,i) => (
            <button key={i} onClick={() => goTo(i, i>cur?1:-1)} aria-label={`Slide ${i+1}`}
              style={{ borderRadius:99, height:8, width:i===cur?28:8, background:i===cur?"var(--gold)":"rgba(191,160,106,0.28)", border:"none", cursor:"pointer", transition:"all 0.3s ease", padding:0 }} />
          ))}
        </div>
        <p style={{ textAlign:"center", marginTop:8, fontFamily:"'Jost',sans-serif", fontSize:11, color:"#9CA3AF" }}>← Swipe or drag to navigate →</p>
      </div>
    </section>
  );
}
