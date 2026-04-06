// components/sections/RateCardSection.tsx
"use client";

import { useState, useCallback, useEffect, memo } from "react";
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

/* ── PDF Poster ─────────────────────────────────────────────────────────────── */
const PdfPoster = memo(function PdfPoster({ card }: { card: RateCard }) {
  const src = `${card.file_url.split("#")[0]}#toolbar=0&navpanes=0&scrollbar=1`;
  return (
    <div style={{
      background: "#fff",
      borderRadius: 24,
      border: "1px solid rgba(191,160,106,0.18)",
      boxShadow: "0 8px 36px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#8C6E30,#BFA06A,#D4B483)" }} />
      {card.title && (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderBottom:"1px solid rgba(191,160,106,0.1)" }}>
          <FileText size={14} style={{ color:"var(--gold-dark)", flexShrink:0 }} />
          <span style={{ fontFamily:"'Jost',sans-serif", fontSize:14, fontWeight:600, color:"#374151" }}>{card.title}</span>
        </div>
      )}
      {/* scrollable PDF — no new tab, no download */}
      <div style={{ height:"75vh", maxHeight:700, overflow:"hidden", background:"#F8F9FB" }}>
        <iframe
          src={src}
          title={card.title || "Rate card"}
          style={{ width:"100%", height:"100%", border:"none", display:"block" }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
});

/* ── Spiral Book ────────────────────────────────────────────────────────────── */
function SpiralBook({ images }: { images: RateCard[] }) {
  const total  = images.length;
  const [page, setPage] = useState(0);
  const [dir,  setDir]  = useState(1);
  const dragX  = useMotionValue(0);
  const SWIPE  = 44;

  function goTo(next: number, d: number) {
    if (next < 0 || next >= total) return;
    setDir(d); setPage(next);
  }

  const onDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    if      (info.offset.x < -SWIPE && page < total - 1) goTo(page + 1,  1);
    else if (info.offset.x >  SWIPE && page > 0)         goTo(page - 1, -1);
    animate(dragX, 0, { duration: 0.25 });
  }, [page, total]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1,  1);
      if (e.key === "ArrowLeft")  goTo(page - 1, -1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [page]);

  if (total === 0) return null;

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.4,0,0.2,1] } },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.28 } }),
  };

  return (
    <div style={{ width:"100%", maxWidth:420, margin:"0 auto", userSelect:"none" }}>
      {/* Spiral holes */}
      <div style={{ display:"flex", justifyContent:"center", gap:10, paddingBottom:0, height:22, alignItems:"center" }} aria-hidden>
        {Array.from({length:13}).map((_,i) => (
          <div key={i} style={{ width:14, height:14, borderRadius:"50%", border:"2.5px solid var(--gold)", background:"#fff", boxShadow:"0 1px 3px rgba(191,160,106,0.28)", flexShrink:0 }} />
        ))}
      </div>

      {/* Book */}
      <div style={{ position:"relative" }}>
        {/* Depth pages */}
        {page < total - 1 && (
          <>
            <div style={{ position:"absolute", inset:"0 14px -6px", borderRadius:16, background:"#EDE8DF", border:"1px solid rgba(191,160,106,0.12)", zIndex:-1 }} />
            <div style={{ position:"absolute", inset:"0 22px -12px", borderRadius:16, background:"#E5DDCF", zIndex:-2 }} />
          </>
        )}

        {/* Page — 3:4 ratio, image fills 100%, zero padding, object-cover */}
        <div style={{
          position:"relative", width:"100%", paddingTop:"133.33%", /* 3:4 */
          borderRadius:16, overflow:"hidden",
          boxShadow:"0 16px 50px rgba(0,0,0,0.15)",
          border:"1px solid rgba(191,160,106,0.18)",
          background:"#111",
        }}>
          <AnimatePresence initial={false} custom={dir} mode="wait">
            <motion.div
              key={page}
              custom={dir}
              variants={variants}
              initial="enter" animate="center" exit="exit"
              drag="x"
              dragConstraints={{ left:0, right:0 }}
              dragElastic={0.1}
              onDragEnd={onDragEnd}
              style={{ x:dragX, cursor:"grab", position:"absolute", inset:0 }}
              whileDrag={{ cursor:"grabbing" }}
            >
              {/* object-cover — fills entire page, no gaps, no padding */}
              <Image
                src={images[page].file_url}
                alt={images[page].title || `Page ${page + 1}`}
                fill
                className="object-cover"
                sizes="(max-width:480px) 95vw,(max-width:768px) 60vw,420px"
                priority={page === 0}
                quality={85}
                draggable={false}
              />

              {/* Cover badge */}
              {page === 0 && (
                <div style={{ position:"absolute", top:12, left:12, zIndex:10, display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:99, background:"var(--gold)", boxShadow:"0 2px 8px rgba(0,0,0,0.22)" }}>
                  <BookOpen size={9} style={{ color:"#fff" }} />
                  <span style={{ fontFamily:"'Jost',sans-serif", fontSize:8, fontWeight:700, color:"#fff", letterSpacing:"0.15em", textTransform:"uppercase" }}>Cover</span>
                </div>
              )}

              {/* Counter */}
              <div style={{ position:"absolute", bottom:12, right:12, zIndex:10, padding:"3px 10px", borderRadius:99, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(6px)" }}>
                <span style={{ fontFamily:"'Jost',sans-serif", fontSize:10, color:"rgba(255,255,255,0.85)", letterSpacing:"0.06em" }}>{page + 1} / {total}</span>
              </div>

              {/* Title overlay */}
              {images[page].title && (
                <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:10, padding:"32px 16px 40px", background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 100%)" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, color:"#fff", textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>{images[page].title}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dots */}
      <div style={{ marginTop:24, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {images.map((_,i) => (
            <button key={i} onClick={() => goTo(i, i > page ? 1 : -1)} aria-label={`Page ${i+1}`}
              style={{ borderRadius:99, height:8, width:i===page?28:8, background:i===page?"var(--gold)":"rgba(191,160,106,0.3)", border:"none", cursor:"pointer", transition:"all 0.3s" }} />
          ))}
        </div>
        {total > 1 && (
          <p style={{ fontFamily:"'Jost',sans-serif", fontSize:11, color:"#9CA3AF", textAlign:"center" }}>← Swipe to turn pages →</p>
        )}
      </div>
    </div>
  );
}

/* ── Empty ──────────────────────────────────────────────────────────────────── */
function Empty() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", textAlign:"center" }}>
      <div style={{ width:56, height:56, borderRadius:16, background:"rgba(191,160,106,0.08)", border:"1px solid rgba(191,160,106,0.15)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
        <BookOpen size={24} style={{ color:"var(--gold)", opacity:0.5 }} />
      </div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:"#374151" }}>Rate cards coming soon</p>
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export function RateCardSection({ rateCards }: { rateCards: RateCard[] }) {
  const { images, pdfs } = partition(rateCards);
  const hasContent = images.length > 0 || pdfs.length > 0;

  return (
    <section id="services" style={{ background:"#F8F9FB", padding:"clamp(3rem,8vw,5rem) 0" }}>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"0 clamp(1rem,4vw,2.5rem)" }}>

        {/* Cinzel heading */}
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:"clamp(2.5rem,6vw,4rem)" }}>
            <h2 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:"clamp(1.6rem,4.5vw,3rem)", fontWeight:700, color:"#1F2937", letterSpacing:"0.18em", lineHeight:1.2 }}>
              Rate Cards
            </h2>
            <div style={{ width:64, height:1, background:"linear-gradient(90deg,transparent,var(--gold),transparent)", margin:"1rem auto 0" }} />
          </div>
        </FadeIn>

        {!hasContent ? <Empty /> : (
          <div style={{ display:"flex", flexDirection:"column", gap:"clamp(3rem,8vw,5rem)" }}>
            {images.length > 0 && <FadeIn><SpiralBook images={images} /></FadeIn>}
            {pdfs.length > 0 && (
              <FadeIn>
                <div style={{
                  display:"grid",
                  gridTemplateColumns: pdfs.length === 1 ? "minmax(0,520px)" : "repeat(auto-fit,minmax(300px,1fr))",
                  gap:"1.5rem",
                  margin: pdfs.length === 1 ? "0 auto" : undefined,
                  width:"100%",
                }}>
                  {pdfs.map(c => <PdfPoster key={c.id} card={c} />)}
                </div>
              </FadeIn>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
