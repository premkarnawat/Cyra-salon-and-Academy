"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, MessageCircle, Home, Phone, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS } from "@/lib/constants";
import { getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/utils";
import type { SiteConfig } from "@/types";

const NAV_ICONS: Record<string, string> = {
  Home:"🏠", Offers:"🔥", Packages:"💎", Services:"✂️",
  Gallery:"📸", Reviews:"⭐", Contact:"📍",
};

interface NavbarProps {
  config: SiteConfig;
  onExploreOffers?: () => void;
}

// ✅ FIXED BRAND BLOCK
function BrandBlock({
  brandWord,
  logoUrl,
  showLogo,
  size = "navbar",
}: {
  brandWord: string;
  logoUrl?: string;
  showLogo: boolean;
  size?: "navbar" | "sidebar";
}) {
  const cyraSize   = size === "navbar"  ? "text-[1.5rem] sm:text-[1.7rem]" : "text-[2rem]";
  const subSize    = size === "navbar"  ? "text-[0.45rem] sm:text-[0.5rem]" : "text-[0.6rem]";
  const logoHeight = size === "navbar"  ? "h-9 sm:h-10" : "h-12";

  return (
    <div className="flex items-center gap-2.5 leading-none select-none">

      {/* Logo */}
      {showLogo && logoUrl && (
        <img
          src={logoUrl}
          alt="Cyra logo"
          className={`${logoHeight} w-auto object-contain flex-shrink-0`}
          draggable={false}
        />
      )}

      {/* Text */}
      <div className="flex flex-col items-start">

        {/* CYRA */}
        <span className={`font-cinzel ${cyraSize} tracking-[0.22em] text-[var(--gold-dark)] leading-none`}>
          {brandWord}
        </span>

        {/* 🔥 FIXED SUBHEADING */}
        <span
          className={`font-marcellus ${subSize} uppercase text-[var(--gold)] opacity-70 mt-[2px] block`}
          style={{
            letterSpacing: "0.28em",
            maxWidth: "85%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          SALON &amp; ACADEMY
        </span>

      </div>
    </div>
  );
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

  const brandWord      = (config.salon_name || "Cyra Salon").split(" ")[0].toUpperCase();
  const placement      = config.logo_placement ?? "none";
  const showNavbarLogo = !!config.logo_url && (placement === "navbar" || placement === "both");

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

            <button onClick={() => handleNavClick("#home")} aria-label="Go home" className="flex-shrink-0">
              <BrandBlock
                brandWord={brandWord}
                logoUrl={config.logo_url}
                showLogo={showNavbarLogo}
                size="navbar"
              />
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {mounted && (
                <button onClick={toggle} aria-label="Toggle theme"
                  className="w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.3)] hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)] flex items-center justify-center text-[#1F2937] dark:text-[var(--gold-light)] transition-all">
                  {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}
                </button>
              )}
              <a href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)} target="_blank" rel="noreferrer"
                className="hidden sm:flex items-center gap-2 btn-gold text-[10.5px] tracking-[0.16em] px-4 py-2.5 rounded-xl">
                <MessageCircle size={13}/> Book Now
              </a>
            </div>

          </div>
        </div>
      </header>

      <div className="h-16" aria-hidden="true" />

      {/* Sidebar remains unchanged */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 z-[990] bg-black/35"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSidebarOpen(false)} />

            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[1000] w-[min(310px,88vw)] bg-white flex flex-col shadow-[12px_0_60px_rgba(0,0,0,0.12)]"
              initial={{ x:"-100%" }} animate={{ x:0 }} exit={{ x:"-100%" }}>

              <div className="px-7 pt-10 pb-7">
                <BrandBlock
                  brandWord={brandWord}
                  logoUrl={config.logo_url}
                  showLogo={showNavbarLogo}
                  size="sidebar"
                />
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
