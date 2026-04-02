"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, MessageCircle, Home, Phone, Clock, MapPin } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS } from "@/lib/constants";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { SiteConfig } from "@/types";

const NAV_ICONS: Record<string, string> = {
  Home:       "🏠",
  Offers:     "🔥",
  Packages:   "💎",
  Services:   "✂️",
  Gallery:    "📸",
  Reviews:    "⭐",
  Contact:    "📍",
};

interface NavbarProps {
  config: SiteConfig;
  onExploreOffers?: () => void;
}

export function Navbar({ config, onExploreOffers }: NavbarProps) {
  const { theme, toggle, mounted } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  function handleNavClick(href: string) {
    setSidebarOpen(false);
    if (href.startsWith("#")) {
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 310);
    }
  }

  const brandName = (config.salon_name || "Cyra Salon").split(" ")[0].toUpperCase();

  return (
    <>
      {/* ══════════════════════════════════════════
          HEADER — sticky, light-first, non-overlapping
      ══════════════════════════════════════════ */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-[900]
          transition-all duration-500 ease-out
          ${scrolled
            ? "bg-white/97 dark:bg-[#0C0B09]/97 backdrop-blur-2xl shadow-[0_2px_28px_rgba(0,0,0,0.07)] border-b border-[rgba(191,160,106,0.2)]"
            : "bg-white/85 dark:bg-[#0C0B09]/85 backdrop-blur-lg border-b border-[rgba(191,160,106,0.1)]"
          }
        `}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[68px] flex items-center justify-between gap-3">

            {/* ── LEFT: Hamburger + Home ── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                className="
                  w-10 h-10 flex flex-col items-center justify-center gap-[5px]
                  rounded-xl border border-[rgba(191,160,106,0.22)]
                  hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)]
                  transition-all duration-200 group flex-shrink-0
                "
              >
                <span className="block w-[17px] h-[1.5px] rounded-full bg-[var(--gold-dark)] dark:bg-[var(--gold-light)] transition-all duration-200" />
                <span className="block w-[17px] h-[1.5px] rounded-full bg-[var(--gold-dark)] dark:bg-[var(--gold-light)]" />
                <span className="block w-[11px] h-[1.5px] rounded-full bg-[var(--gold-dark)] dark:bg-[var(--gold-light)] self-start ml-[3px] group-hover:w-[17px] transition-all duration-200" />
              </button>

              {/* Home icon button */}
              <button
                onClick={() => handleNavClick("#home")}
                aria-label="Go to homepage"
                className="
                  w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.22)]
                  hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)]
                  flex items-center justify-center
                  text-[var(--gold-dark)] dark:text-[var(--gold-light)]
                  transition-all duration-200 flex-shrink-0
                "
              >
                <Home size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* ── CENTER: Brand Lockup ── */}
            <button
              onClick={() => handleNavClick("#home")}
              className="flex flex-col items-center leading-none select-none group min-w-0"
              aria-label="Cyra Salon — go home"
            >
              {/* CYRA — Cinzel Decorative */}
              <span
                className="
                  font-cinzel leading-none tracking-[0.22em]
                  text-[1.35rem] sm:text-[1.55rem]
                  text-[var(--gold-dark)] dark:text-[var(--gold-light)]
                  group-hover:text-[var(--gold)] transition-colors duration-300
                "
              >
                {brandName}
              </span>
              {/* SALON & ACADEMY — Marcellus */}
              <span
                className="
                  font-marcellus tracking-[0.42em] uppercase
                  text-[0.5rem] sm:text-[0.57rem]
                  text-[var(--gold)] opacity-80
                  mt-[3px] leading-none
                "
              >
                Salon &amp; Academy
              </span>
            </button>

            {/* ── RIGHT: Theme toggle + Book Now ── */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Dark / light toggle */}
              {mounted && (
                <button
                  onClick={toggle}
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  className="
                    w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.22)]
                    hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)]
                    flex items-center justify-center
                    text-[var(--gold-dark)] dark:text-[var(--gold-light)]
                    transition-all duration-200
                  "
                >
                  {theme === "dark"
                    ? <Sun  size={16} strokeWidth={1.8} />
                    : <Moon size={16} strokeWidth={1.8} />
                  }
                </button>
              )}

              {/* Book Now — hidden on xs */}
              <a
                href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)}
                target="_blank"
                rel="noreferrer"
                className="
                  hidden sm:flex items-center gap-2
                  btn-gold px-4 py-[10px] rounded-xl text-[10.5px] tracking-[0.18em]
                "
              >
                <MessageCircle size={13} strokeWidth={2} />
                Book Now
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Header spacer — prevents content from hiding under fixed header */}
      <div className="h-[68px]" aria-hidden="true" />

      {/* ══════════════════════════════════════════
          SIDEBAR DRAWER
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dim backdrop */}
            <motion.div
              key="sb-backdrop"
              className="fixed inset-0 z-[990]"
              style={{ background: "rgba(12,11,9,0.4)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Drawer panel */}
            <motion.aside
              key="sb-panel"
              className="
                fixed top-0 left-0 bottom-0 z-[1000]
                w-[min(310px,88vw)]
                bg-white dark:bg-[#0E0D0A]
                border-r border-[rgba(191,160,106,0.15)]
                flex flex-col
                shadow-[12px_0_60px_rgba(0,0,0,0.12)]
              "
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              {/* Panel header — brand + close */}
              <div className="relative px-7 pt-10 pb-7 border-b border-[rgba(191,160,106,0.1)]">
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="
                    absolute top-5 right-5 w-9 h-9 rounded-xl
                    border border-[rgba(191,160,106,0.2)]
                    flex items-center justify-center
                    text-[#8C7040] dark:text-[var(--gold-light)]
                    hover:bg-[rgba(191,160,106,0.1)] hover:border-[var(--gold)]
                    transition-all
                  "
                >
                  <X size={15} strokeWidth={2} />
                </button>

                <div className="font-cinzel text-[1.7rem] tracking-[0.2em] leading-none text-[var(--gold-dark)] dark:text-[var(--gold-light)]">
                  {brandName}
                </div>
                <div className="font-marcellus text-[0.6rem] tracking-[0.42em] uppercase text-[var(--gold)] opacity-75 mt-1.5">
                  Salon &amp; Academy
                </div>
                <div className="mt-4 w-10 h-px bg-gradient-to-r from-[var(--gold)] to-transparent" />
              </div>

              {/* Nav links */}
              <nav className="flex-1 py-3 overflow-y-auto" aria-label="Site navigation">
                <p className="px-7 mb-2 pt-1 text-[9px] tracking-[0.32em] uppercase text-[var(--gold)]/45 font-semibold">
                  Menu
                </p>
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className="
                      w-full text-left flex items-center gap-4
                      px-7 py-[13px]
                      font-jost text-[13px] font-medium tracking-wide
                      text-[#3D3527] dark:text-[rgba(240,232,216,0.62)]
                      hover:text-[var(--gold)] dark:hover:text-[var(--gold)]
                      hover:bg-[rgba(191,160,106,0.06)]
                      border-l-[2.5px] border-transparent hover:border-[var(--gold)]
                      transition-all duration-200
                    "
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, duration: 0.32, ease: "easeOut" }}
                  >
                    <span className="w-5 text-center text-[14px]" aria-hidden="true">
                      {NAV_ICONS[link.label] ?? "✦"}
                    </span>
                    <span>{link.label}</span>
                    {link.label === "Offers" && (
                      <span className="ml-auto text-[8.5px] bg-[var(--gold)] text-white px-2 py-[2px] rounded-full font-bold tracking-[0.08em]">
                        LIVE
                      </span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Panel footer */}
              <div className="px-7 py-6 border-t border-[rgba(191,160,106,0.1)] bg-[rgba(191,160,106,0.025)]">
                {/* Contact info */}
                <div className="space-y-2.5 mb-5">
                  {config.phone && (
                    <a
                      href={`tel:${config.phone}`}
                      className="flex items-center gap-2.5 text-[12px] text-[#5A4E3C] dark:text-[rgba(240,232,216,0.5)] hover:text-[var(--gold)] transition-colors"
                    >
                      <Phone size={12} className="text-[var(--gold)] flex-shrink-0" />
                      <span className="font-medium">{config.phone}</span>
                    </a>
                  )}
                  {config.opening_hours && (
                    <div className="flex items-center gap-2.5 text-[12px] text-[#5A4E3C] dark:text-[rgba(240,232,216,0.45)]">
                      <Clock size={12} className="text-[var(--gold)] flex-shrink-0" />
                      <span>{config.opening_hours}</span>
                    </div>
                  )}
                  {config.address && (
                    <div className="flex items-start gap-2.5 text-[12px] text-[#5A4E3C] dark:text-[rgba(240,232,216,0.45)]">
                      <MapPin size={12} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{config.address}</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={getWhatsAppLink(WHATSAPP_MESSAGES.general)}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center justify-center gap-2 w-full
                    bg-[#25D366] hover:bg-[#1eb956] active:bg-[#18a44d]
                    text-white rounded-xl px-4 py-3
                    text-[12px] font-semibold tracking-[0.06em]
                    transition-colors duration-200
                    shadow-[0_4px_18px_rgba(37,211,102,0.28)]
                  "
                >
                  <MessageCircle size={14} /> Chat on WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
