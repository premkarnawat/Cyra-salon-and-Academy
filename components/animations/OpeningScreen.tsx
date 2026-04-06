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
              delay: 0.25, // slight delay prevents font flash
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
              <>
                {/* CYRA — ONLY Cinzel Decorative */}
                <span
                  className="font-cinzel text-5xl md:text-7xl text-[#D4B483] tracking-[0.22em] leading-none"
                  style={{
                    textShadow: "0 0 50px rgba(212,180,131,0.45)",
                    fontFamily: "'Cinzel Decorative', serif",
                  }}
                >
                  {brandWord}
                </span>

                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#BFA06A] to-transparent" />

                {/* FIXED: Removed marcellus → only cinzel */}
                <span className="font-cinzel text-sm md:text-base tracking-[0.38em] text-[rgba(212,180,131,0.65)] uppercase">
                  Salon &amp; Academy
                </span>
              </>
            )}

            {/* Animated underline */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-[#BFA06A] to-transparent"
              initial={{ width: 0 }}
              animate={{ width: [0, 100, 0] }}
              transition={{
                duration: 2,
                delay: 0.9,
                ease: "easeInOut",
              }}
              style={{ width: "100px" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
