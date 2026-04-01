"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";

const QUICK_MESSAGES = [
  { label: "Offers & Packages",  message: WHATSAPP_MESSAGES.offers },
  { label: "Rates & Services",   message: WHATSAPP_MESSAGES.services },
  { label: "General Inquiry",    message: WHATSAPP_MESSAGES.general },
];

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-5 z-[800] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            className="bg-white dark:bg-[var(--dark-600)] rounded-2xl shadow-luxury border border-[var(--border-light)] overflow-hidden w-60"
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 py-3 bg-[#25D366] flex items-center gap-2">
              <MessageCircle size={16} className="text-white" />
              <span className="text-white font-jost font-semibold text-xs tracking-wide">
                Chat with us
              </span>
            </div>
            <div className="p-2 space-y-1">
              {QUICK_MESSAGES.map((item) => (
                <a
                  key={item.label}
                  href={getWhatsAppLink(item.message)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[var(--cream-200)] dark:hover:bg-[var(--dark-500)] transition-colors text-xs text-[var(--dark-700)] dark:text-[rgba(240,232,216,0.7)] font-jost"
                >
                  <span className="text-[#25D366] text-sm">💬</span>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-[var(--border-light)]">
              <p className="text-[9px] text-[var(--dark-600)]/40 dark:text-[rgba(240,232,216,0.25)] text-center">
                Usually replies within minutes
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#25D366] shadow-[0_8px_28px_rgba(37,211,102,0.45)] flex items-center justify-center text-white animate-pulse-gold"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="WhatsApp"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
