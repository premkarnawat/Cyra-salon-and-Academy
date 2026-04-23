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

          {/* Brand — ONLY logo OR text brand, never both */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1.1,
              delay: 0.3,
              ease: [0.175, 0.885, 0.32, 1.1],
            }}
          >
            {logoUrl ? (
              /* LOGO ONLY — large, no text alongside */
              <div className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72">
                <Image
                  src={logoUrl}
                  alt={brandWord}
                  fill
                  className="object-contain drop-shadow-[0_0_40px_rgba(212,180,131,0.35)]"
                  priority
                />
              </div>
            ) : (

            {/* Animated underline */}
            <motion.div
              style={{
                height: "1px",
                background: "linear-gradient(90deg, transparent, #BFA06A, transparent)",
              }}
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1.8, delay: 1.0, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
