"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, MessageCircle, Home, Phone, Clock, MapPin } from "lucide-react";
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
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  function handleNavClick(href: string) {
    setSidebarOpen(false);
    if (href.startsWith("#")) {
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior:"smooth", block:"start" }), 310);
    }
  }

  const brandWord = (config.salon_name || "Cyra Salon").split(" ")[0].toUpperCase();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[900] transition-all duration-500
          ${scrolled
            ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[rgba(191,160,106,0.18)]"
            : "bg-white/95 backdrop-blur-md border-b border-[rgba(191,160,106,0.1)]"
          }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-3">

            {/* LEFT */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setSidebarOpen(true)} aria-label="Open menu"
                className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl border border-[rgba(191,160,106,0.3)] hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)] transition-all">
                <span className="block w-[17px] h-[1.5px] rounded-full bg-[#1F2937]" />
                <span className="block w-[17px] h-[1.5px] rounded-full bg-[#1F2937]" />
                <span className="block w-[11px] h-[1.5px] rounded-full bg-[#1F2937] self-start ml-[3px]" />
              </button>
              <button onClick={() => handleNavClick("#home")} aria-label="Home"
                className="w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.3)] hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)] flex items-center justify-center text-[#1F2937] transition-all">
                <Home size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* CENTER — "CYRA" with constrained subheading */}
            <button onClick={() => handleNavClick("#home")} className="flex flex-col items-center leading-none select-none" aria-label="Go home">
              {/* Logo image if set */}
              {config.logo_url ? (
                <img src={config.logo_url} alt={brandWord} className="h-9 w-auto object-contain" />
              ) : (
                <>
                  {/* CYRA heading */}
                  <span className="font-cinzel text-[1.3rem] sm:text-[1.5rem] tracking-[0.22em] text-[var(--gold-dark)] hover:text-[var(--gold)] transition-colors leading-none">
                    {brandWord}
                  </span>
                  {/*
                    Fix: subheading is sized so it NEVER exceeds the width of CYRA.
                    letter-spacing and font-size tuned to fit inside CYRA's visual width.
                  */}
                  <span
                    className="font-marcellus uppercase text-[var(--gold)] opacity-70 mt-[3px] block"
                    style={{ fontSize:"0.38rem", letterSpacing:"0.55em", maxWidth:"100%" }}
                  >
                    Salon &amp; Academy
                  </span>
                </>
              )}
            </button>

            {/* RIGHT */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {mounted && (
                <button onClick={toggle} aria-label="Toggle theme"
                  className="w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.3)] hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)] flex items-center justify-center text-[#1F2937] dark:text-[var(--gold-light)] transition-all">
                  {theme === "dark" ? <Sun size={16} strokeWidth={1.8}/> : <Moon size={16} strokeWidth={1.8}/>}
                </button>
              )}
              <a href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)} target="_blank" rel="noreferrer"
                className="hidden sm:flex items-center gap-2 btn-gold text-[10.5px] tracking-[0.16em] px-4 py-2.5 rounded-xl">
                <MessageCircle size={13} strokeWidth={2} /> Book Now
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="h-16" aria-hidden="true" />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div key="backdrop" className="fixed inset-0 z-[990] bg-black/35"
              style={{ backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)" }}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.28 }} onClick={() => setSidebarOpen(false)} />

            <motion.aside key="panel"
              className="fixed top-0 left-0 bottom-0 z-[1000] w-[min(310px,88vw)] bg-white flex flex-col shadow-[12px_0_60px_rgba(0,0,0,0.12)] border-r border-[rgba(191,160,106,0.15)]"
              initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }}
              transition={{ type:"spring", damping:26, stiffness:260 }}>

              {/* Sidebar header */}
              <div className="relative px-7 pt-10 pb-7 border-b border-[rgba(191,160,106,0.1)]">
                <button onClick={() => setSidebarOpen(false)} aria-label="Close"
                  className="absolute top-5 right-5 w-9 h-9 rounded-xl border border-[rgba(191,160,106,0.2)] flex items-center justify-center text-[#6B7280] hover:text-[var(--gold-dark)] hover:border-[var(--gold)] transition-all">
                  <X size={15} strokeWidth={2}/>
                </button>
                {config.logo_url ? (
                  <img src={config.logo_url} alt={brandWord} className="h-10 w-auto object-contain mb-2" />
                ) : (
                  <>
                    <div className="font-cinzel text-[1.8rem] tracking-[0.2em] text-[var(--gold-dark)]">{brandWord}</div>
                    <div className="font-marcellus text-[0.58rem] tracking-[0.42em] uppercase text-[var(--gold)] opacity-70 mt-1">Salon &amp; Academy</div>
                  </>
                )}
                <div className="mt-4 w-10 h-px bg-gradient-to-r from-[var(--gold)] to-transparent"/>
              </div>

              {/* Nav — NO icons, larger font, better spacing */}
              <nav className="flex-1 py-4 overflow-y-auto" aria-label="Site navigation">
                <p className="px-7 mb-3 pt-1 text-[9px] tracking-[0.32em] uppercase text-[rgba(191,160,106,0.5)] font-semibold">Menu</p>
                {NAV_LINKS.map((link, i) => (
                  <motion.button key={link.href} onClick={() => handleNavClick(link.href)}
                    className="w-full text-left flex items-center justify-between px-7 py-[15px] font-jost text-[15px] font-medium text-[#374151] hover:text-[var(--gold-dark)] hover:bg-[rgba(191,160,106,0.06)] border-l-[2.5px] border-transparent hover:border-[var(--gold)] transition-all"
                    initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:i*0.045, duration:0.32 }}>
                    {/* Label only — no emoji icons */}
                    <span>{link.label}</span>
                    {link.label === "Offers" && (
                      <span className="text-[9px] bg-[var(--gold)] text-white px-2.5 py-[3px] rounded-full font-bold tracking-wide">LIVE</span>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Bottom contact + WhatsApp — larger, more prominent */}
              <div className="px-7 py-6 border-t border-[rgba(191,160,106,0.1)] bg-[rgba(191,160,106,0.03)]">
                <div className="space-y-3 mb-5">
                  {config.phone && (
                    <a href={`tel:${config.phone}`} className="flex items-center gap-3 text-[14px] text-[#4B5563] hover:text-[var(--gold-dark)] transition-colors font-medium">
                      <Phone size={14} className="text-[var(--gold)] flex-shrink-0"/>{config.phone}
                    </a>
                  )}
                  {config.opening_hours && (
                    <div className="flex items-center gap-3 text-[13px] text-[#6B7280]">
                      <Clock size={13} className="text-[var(--gold)] flex-shrink-0"/>{config.opening_hours}
                    </div>
                  )}
                  {config.address && (
                    <div className="flex items-start gap-3 text-[13px] text-[#6B7280]">
                      <MapPin size={13} className="text-[var(--gold)] flex-shrink-0 mt-0.5"/><span className="leading-relaxed">{config.address}</span>
                    </div>
                  )}
                </div>
                {/* Larger, more prominent WhatsApp CTA */}
                <a href={getWhatsAppLink(WHATSAPP_MESSAGES.general)} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1eb956] text-white rounded-2xl px-4 py-4 text-[15px] font-bold transition-colors shadow-md">
                  <MessageCircle size={17}/> Chat on WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
