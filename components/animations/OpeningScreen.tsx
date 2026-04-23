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
  const [loaded, setLoaded] = useState(false); // 🔥 KEY FIX

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 2500);
    const t2 = setTimeout(() => onComplete(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06, filter: "blur(6px) brightness(0.4)" }}
            animate={{ scale: 1.02, filter: "blur(4px) brightness(0.45)" }}
            transition={{ duration: 2.2, ease: "easeOut" }}
          >
            <Image
              src={bgUrl}
              alt=""
              fill
              priority
              className="object-cover"
            />
          </motion.div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* LOGO */}
          <motion.div
            className="relative z-10 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: loaded ? 1 : 0 }} // 🔥 show only after load
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80">
              <Image
                src={logoUrl || "/logo.png"}
                alt="" // 🔥 REMOVE TEXT
                fill
                priority
                unoptimized
                className="object-contain"
                onLoad={() => setLoaded(true)} // 🔥 KEY FIX
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
