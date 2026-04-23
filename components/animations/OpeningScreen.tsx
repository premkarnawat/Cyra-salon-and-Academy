"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DEFAULT_CONFIG } from "@/lib/constants";

interface OpeningScreenProps {
  bgUrl?: string;
  logoUrl?: string;
  salonName?: string;
  onComplete: () => void;
}

export function OpeningScreen({
  bgUrl = DEFAULT_CONFIG.opening_bg_url,
  logoUrl,
  salonName = "Cyra",
  onComplete,
}: OpeningScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2800);
    const t2 = setTimeout(() => onComplete(), 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  const brandWord = salonName.split(" ")[0].toUpperCase();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12, filter: "blur(14px) brightness(0.28)" }}
            animate={{ scale: 1.04, filter: "blur(7px) brightness(0.26)" }}
            transition={{ duration: 2.8, ease: "easeOut" }}
          >
            <Image
              src={bgUrl}
              alt="Cyra Salon"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%)",
            }}
          />

          {/* Brand */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 px-8 text-center"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.85,
              delay: 0.25,
              ease: [0.175, 0.885, 0.32, 1.275],
            }}
          >
            {logoUrl ? (
              <div className="relative w-28 h-28 md:w-36 md:h-36">
                <Image
                  src={logoUrl}
                  alt={brandWord}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              /* Text-only opening brand — same font rules */
              <div style={{ textAlign: "center" }}>
                {/* CYRA — Cinzel Decorative only */}
                <div
                  style={{
                    fontFamily: "'Cinzel Decorative', serif",
                    fontSize: "clamp(2.8rem, 10vw, 5rem)",
                    letterSpacing: "0.22em",
                    color: "#D4B483",
                    lineHeight: 1,
                    textShadow: "0 0 50px rgba(212,180,131,0.45)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {brandWord}
                </div>

                {/* Thin gold divider */}
                <div style={{
                  margin: "1rem auto",
                  width: "4rem",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #BFA06A, transparent)",
                }} />

                {/* SALON & ACADEMY — Marcellus (NOT cinzel) */}
                <div
                  style={{
                    fontFamily: "'Marcellus', serif",
                    fontSize: "clamp(0.55rem, 1.5vw, 0.75rem)",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(212,180,131,0.72)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Salon &amp; Academy
                </div>
              </div>
            )}

            {/* Animated underline */}
            <motion.div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, #BFA06A, transparent)",
              }}
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 1.6, delay: 0.9, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
