"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface OpeningScreenProps {
  bgUrl?: string;       // DB image — undefined means no background
  logoUrl?: string;     // DB logo  — undefined means text-only brand
  salonName?: string;
  onComplete: () => void;
}

export function OpeningScreen({
  bgUrl,
  logoUrl,
  salonName = "Cyra",
  onComplete,
}: OpeningScreenProps) {
  const brandWord = salonName.split(" ")[0].toUpperCase();

  const [visible, setVisible] = useState(true);
  const started   = useRef(false);

  // Preload bg image in JS before rendering anything visible.
  // ready=true immediately when no bgUrl (text-only splash).
  const [ready, setReady] = useState(!bgUrl);

  useEffect(() => {
    if (!bgUrl) { setReady(true); return; }
    const img = new window.Image();
    img.onload  = () => setReady(true);
    img.onerror = () => setReady(true);
    img.src = bgUrl;
  }, [bgUrl]);

  // Start countdown only once, after image is ready
  useEffect(() => {
    if (!ready || started.current) return;
    started.current = true;
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(() => onComplete(),       3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [ready, onComplete]);

  // While preloading: plain dark screen — no text, no logo, no flicker
  if (!ready) {
    return <div className="fixed inset-0 z-[9999] bg-[#0C0B09]" />;
  }

  // Single splash — logo + text animate in TOGETHER as one unit
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0C0B09]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Background — DB image only, no fallback/Unsplash */}
          {bgUrl && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1, filter: "blur(12px) brightness(0.28)" }}
              animate={{ scale: 1.04, filter: "blur(6px) brightness(0.26)" }}
              transition={{ duration: 2.8, ease: "easeOut" }}
            >
              <Image
                src={bgUrl}
                alt=""
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.72) 100%)",
            }}
          />

          {/* Brand — logo + text as ONE animated unit, appear together */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-5 px-8 text-center"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.175, 0.885, 0.32, 1.2] }}
          >
            {/* Logo (only when provided) */}
            {logoUrl && (
              <div className="relative w-28 h-28 md:w-36 md:h-36">
                <Image
                  src={logoUrl}
                  alt={brandWord}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}

            {/* Text brand */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "clamp(2.6rem, 9vw, 4.8rem)",
                  letterSpacing: "0.22em",
                  color: "#D4B483",
                  lineHeight: 1,
                  textShadow: "0 0 50px rgba(212,180,131,0.4)",
                  whiteSpace: "nowrap",
                }}
              >
                {brandWord}
              </div>

              <div style={{
                margin: "0.85rem auto",
                width: "4rem",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #BFA06A, transparent)",
              }} />

              <div
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: "clamp(0.52rem, 1.4vw, 0.72rem)",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(212,180,131,0.72)",
                  whiteSpace: "nowrap",
                }}
              >
                Salon &amp; Academy
              </div>
            </div>

            {/* Animated gold underline */}
            <motion.div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, #BFA06A, transparent)",
              }}
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
