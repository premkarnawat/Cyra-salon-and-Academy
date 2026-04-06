// components/sections/OffersSection.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/animations/FadeIn";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { Offer } from "@/types";

const FALLBACK: Offer[] = [
  { id:"o1", tag:"Best Seller",  name:"Keratin Treatment", discount_text:"30% OFF",    description:"Silky smooth, frizz-free hair lasting 4–6 months",    image_url:"https://images.unsplash.com/photo-1562322140-8baeababf0ba?w=900&q=85", is_active:true, sort_order:1, created_at:"" },
  { id:"o2", tag:"Popular",      name:"Hair Colouring",    discount_text:"25% OFF",    description:"Global colour, highlights & balayage by experts",     image_url:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=85", is_active:true, sort_order:2, created_at:"" },
  { id:"o3", tag:"Limited",      name:"Bridal Package",    discount_text:"₹999 ONLY",  description:"Complete hair + makeup + styling for your big day",   image_url:"https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=900&q=85", is_active:true, sort_order:3, created_at:"" },
  { id:"o4", tag:"Relax",        name:"Hair Spa",           discount_text:"20% OFF",   description:"Deep conditioning with scalp massage & nourishment",   image_url:"https://images.unsplash.com/photo-1470259078422-826894b933aa?w=900&q=85", is_active:true, sort_order:4, created_at:"" },
  { id:"o5", tag:"Quick Deal",   name:"Cut & Style",        discount_text:"15% OFF",   description:"Expert cut with salon-finish blow dry",                image_url:"https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=85", is_active:true, sort_order:5, created_at:"" },
];

const SWIPE_MIN = 44;
const AUTO_MS   = 6000;

export function OffersSection({ offers }: { offers: Offer[] }) {
  const list   = offers.length ? offers : FALLBACK;
  const total  = list.length;
  const [cur,  setCur] = useState(0);
  const [dir,  setDir] = useState(1);
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
    animate(dragX, 0, { duration: 0.25 });
  }

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.4,0,0.2,1] } },
    exit:   (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.32 } }),
  };

  const offer = list[cur];

  return (
    <section id="offers" style={{ background:"#F8F9FB", padding:"clamp(3rem,8vw,5rem) 0" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 clamp(1rem,4vw,2.5rem)" }}>
        <FadeIn>
          <SectionHeader
            tag="✦ Hot Deals"
            title={<>Exclusive <em style={{ color:"var(--gold-light)", fontStyle:"normal", fontWeight:400 }}>Offers</em></>}
            subtitle="Swipe to explore · Limited time deals"
          />
        </FadeIn>

        <div style={{ maxWidth:680, margin:"0 auto", userSelect:"none" }}>
          {/* Card */}
          <div style={{
            borderRadius:24,
            overflow:"hidden",
            boxShadow:"0 12px 48px rgba(0,0,0,0.1)",
            border:"1px solid rgba(191,160,106,0.15)",
            background:"#fff",
          }}>
            <AnimatePresence initial={false} custom={dir} mode="wait">
              <motion.div
                key={offer.id}
                custom={dir}
                variants={variants}
                initial="enter" animate="center" exit="exit"
                drag="x"
                dragConstraints={{ left:0, right:0 }}
                dragElastic={0.1}
                onDragEnd={onDragEnd}
                style={{ x: dragX, cursor:"grab" }}
                whileDrag={{ cursor:"grabbing" }}
              >
                {/* Image — object-cover, fixed height, no gaps */}
                <div style={{ position:"relative", width:"100%", height:"clamp(180px,38vw,320px)", overflow:"hidden", background:"#e8e0d8" }}>
                  <Image
                    src={offer.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=85"}
                    alt={offer.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 80vw,680px"
                    priority={cur === 0}
                    quality={85}
                    draggable={false}
                  />
                  {/* Tag */}
                  {offer.tag && (
                    <div style={{ position:"absolute", top:14, left:14, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(8px)", border:"1px solid rgba(191,160,106,0.3)", borderRadius:99, padding:"5px 12px" }}>
                      <span style={{ fontFamily:"'Jost',sans-serif", fontSize:9, fontWeight:700, color:"var(--gold-dark)", letterSpacing:"0.18em", textTransform:"uppercase" }}>{offer.tag}</span>
                    </div>
                  )}
                  {/* Gradient overlay bottom */}
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 50%)", pointerEvents:"none" }} />
                </div>

                {/* Content */}
                <div style={{ padding:"clamp(16px,4vw,28px)" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(1.1rem,2.5vw,1.4rem)", color:"#1F2937", marginBottom:6 }}>{offer.name}</p>
                  <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:900, fontSize:"clamp(1.8rem,5vw,2.8rem)", lineHeight:1, color:"#C8A87A", marginBottom:8 }}>{offer.discount_text}</p>
                  {offer.description && (
                    <p style={{ fontFamily:"'Jost',sans-serif", fontSize:13, color:"#6B7280", fontWeight:400, marginBottom:18, lineHeight:1.5 }}>{offer.description}</p>
                  )}
                  
                    href={getWhatsAppLink(WHATSAPP_MESSAGES.booking(offer.name))}
                    target="_blank" rel="noreferrer"
                    className="btn-gold"
                    style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:11, letterSpacing:"0.18em", padding:"11px 22px", borderRadius:12, textDecoration:"none" }}
                  >
                    <MessageCircle size={13} /> Book Now
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots — no buttons */}
          <div style={{ marginTop:18, display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
            {list.map((_,i) => (
              <button key={i} onClick={() => goTo(i, i > cur ? 1 : -1)} aria-label={`Offer ${i+1}`}
                style={{ borderRadius:99, height:8, width:i===cur?28:8, background:i===cur?"var(--gold)":"rgba(191,160,106,0.3)", border:"none", cursor:"pointer", transition:"all 0.3s" }} />
            ))}
          </div>
          <p style={{ textAlign:"center", marginTop:8, fontFamily:"'Jost',sans-serif", fontSize:11, color:"#9CA3AF" }}>← Swipe to navigate →</p>
        </div>

        <FadeIn>
          <div style={{ textAlign:"center", marginTop:40 }}>
            <a href="#packages" onClick={e => { e.preventDefault(); document.querySelector("#packages")?.scrollIntoView({ behavior:"smooth" }); }}
              className="btn-ghost-gold" style={{ display:"inline-block", padding:"10px 28px", borderRadius:99, fontSize:11, letterSpacing:"0.2em", textDecoration:"none" }}>
              View All Packages ↓
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
