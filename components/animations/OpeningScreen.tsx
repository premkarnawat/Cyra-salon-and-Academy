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
  salonName = "",
  onComplete,
}: OpeningScreenProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 800);
    const t2 = setTimeout(() => setPhase("out"), 2600);
    const t3 = setTimeout(() => onComplete(), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "out" ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.15, filter: "blur(12px) brightness(0.3)" }}
            animate={{ scale: 1.05, filter: "blur(6px) brightness(0.28)" }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          >
            <Image
              src={bgUrl}
              alt=""
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </motion.div>

          {/* Vignette */}
          <div className="absolute inset-0 bg-radial-dark" style={{
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.72) 100%)"
          }} />

          {/* Noise */}
          <div className="noise-overlay" />

          {/* Logo content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 px-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            {logoUrl ? (
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <Image src={logoUrl} alt={salonName} fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span
                  className="font-cinzel text-5xl md:text-7xl text-[#D4B483] tracking-[0.2em]"
                  style={{ textShadow: "0 0 60px rgba(212,180,131,0.4)" }}
                >
                  {salonName}
                </span>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#BFA06A] to-transparent" />
                <span className="font-jost text-xs tracking-[0.35em] text-[rgba(212,180,131,0.6)] uppercase">
                  Salon &amp; Academy
                </span>
              </div>
            )}

            {/* Shimmer line */}
            <motion.div
              className="mt-4 h-px w-0 bg-gradient-to-r from-transparent via-[#BFA06A] to-transparent"
              animate={{ width: ["0px", "120px", "0px"] }}
              transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
