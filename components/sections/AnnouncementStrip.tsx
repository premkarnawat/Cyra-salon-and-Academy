"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AnnouncementStripProps {
  message?: string;
}

export function AnnouncementStrip({
  message = "✦ Limited Time — Flat 30% Off on All Hair Treatments · Book Now & Save",
}: AnnouncementStripProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-center gap-3 px-4 py-2.5"
      style={{
        background: "linear-gradient(90deg, #110e00, #1e1700, #110e00)",
        borderBottom: "1px solid rgba(191,160,106,0.2)",
      }}
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <span
        className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--gold)] animate-pulse"
        aria-hidden="true"
      />
      <p className="font-jost text-[11px] tracking-[0.2em] uppercase text-[#D4B483] text-center">
        {message}
      </p>
      <span
        className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--gold)] animate-pulse"
        aria-hidden="true"
      />
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-[rgba(212,180,131,0.4)] hover:text-[var(--gold)] text-lg leading-none transition-colors"
        aria-label="Close"
      >
        ×
      </button>
    </motion.div>
  );
}
