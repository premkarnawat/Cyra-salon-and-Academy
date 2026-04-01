"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, MessageCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS } from "@/lib/constants";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { SiteConfig } from "@/types";

interface NavbarProps {
  config: SiteConfig;
  onExploreOffers?: () => void;
}

export function Navbar({ config, onExploreOffers }: NavbarProps) {
  const { theme, toggle, mounted } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function handleNavClick(href: string) {
    setSidebarOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      {/* Navbar */}
      <header
        className={`fixed top-9 left-0 right-0 z-[900] transition-all duration-400 ${
          scrolled
            ? "bg-[var(--cream-50)]/90 dark:bg-[var(--dark-900)]/90 backdrop-blur-xl border-b border-[var(--border-light)] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl border border-[var(--border-light)] hover:border-[var(--gold)] hover:bg-[var(--gold-pale)]/30 transition-all"
              aria-label="Open menu"
            >
              <span className="w-[18px] h-px bg-[var(--gold)] rounded" />
              <span className="w-[18px] h-px bg-[var(--gold)] rounded" />
              <span className="w-[12px] h-px bg-[var(--gold)] rounded self-start ml-[3px]" />
            </button>
            <a
              href="#home"
              onClick={() => handleNavClick("#home")}
              className="font-cinzel text-xl tracking-[0.18em] text-[var(--gold-dark)] dark:text-[var(--gold-light)]"
            >
              {config.salon_name.split(" ")[0]}
            </a>
          </div>

          {/* Center links (desktop) */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.slice(0, 5).map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="font-jost text-[11px] tracking-[0.2em] uppercase text-[var(--dark-600)] dark:text-[rgba(240,232,216,0.6)] hover:text-[var(--gold)] dark:hover:text-[var(--gold)] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={toggle}
                className="w-10 h-10 rounded-xl border border-[var(--border-light)] hover:border-[var(--gold)] flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold-pale)]/30 transition-all"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <a
              href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px]"
            >
              <MessageCircle size={14} />
              Book Now
            </a>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[990] bg-black/50"
              style={{ backdropFilter: "blur(3px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[1000] w-[min(300px,85vw)] bg-[var(--cream-50)] dark:bg-[var(--dark-800)] border-r border-[var(--border-light)] flex flex-col shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Sidebar header */}
              <div className="px-7 pt-10 pb-6 border-b border-[var(--border-light)]">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-[var(--border-light)] flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold-pale)]/30 transition-all"
                >
                  <X size={15} />
                </button>
                <div className="font-cinzel text-3xl tracking-[0.2em] text-[var(--gold-dark)] dark:text-[var(--gold-light)]">
                  {config.salon_name.split(" ")[0]}
                </div>
                <div className="text-[10px] tracking-[0.3em] text-[var(--gold)]/60 uppercase mt-1">
                  Salon &amp; Academy
                </div>
                <div className="w-8 h-px bg-gradient-to-r from-[var(--gold)] to-transparent mt-3" />
              </div>

              {/* Sidebar links */}
              <nav className="flex-1 py-5 overflow-y-auto">
                <div className="px-4 mb-2">
                  <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--gold)]/50 font-semibold px-3">
                    Navigation
                  </span>
                </div>
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left flex items-center gap-3 px-7 py-3 text-sm font-medium text-[var(--dark-600)] dark:text-[rgba(240,232,216,0.65)] hover:text-[var(--gold)] hover:bg-[var(--gold-pale)]/20 dark:hover:bg-[rgba(191,160,106,0.08)] border-l-2 border-transparent hover:border-[var(--gold)] transition-all"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.label}
                    {link.label === "Offers" && (
                      <span className="ml-auto text-[9px] bg-[var(--gold)] text-[var(--dark-900)] px-2 py-0.5 rounded-full font-bold tracking-wide">
                        LIVE
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Sidebar footer */}
              <div className="px-7 py-6 border-t border-[var(--border-light)]">
                <div className="text-xs text-[var(--dark-600)] dark:text-[rgba(240,232,216,0.4)] space-y-1 mb-4">
                  <div className="font-semibold text-[var(--gold-light)]">{config.phone}</div>
                  <div>{config.opening_hours}</div>
                  <div className="text-[11px] leading-relaxed">{config.address}</div>
                </div>
                <a
                  href={getWhatsAppLink(WHATSAPP_MESSAGES.general)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 w-full bg-[#25D366] text-white rounded-xl px-4 py-3 text-xs font-semibold tracking-wide justify-center hover:bg-[#20b858] transition-colors"
                >
                  <MessageCircle size={15} /> Chat on WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
