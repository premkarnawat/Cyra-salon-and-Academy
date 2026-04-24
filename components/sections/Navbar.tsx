"use client";

import { useState, useEffect, useCallback } from "react";
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

// 🔥 UPDATED: Logo ONLY (text removed)
function BrandBlock({
  logoUrl,
  showLogo,
  size = "navbar",
}: {
  logoUrl?: string;
  showLogo: boolean;
  size?: "navbar" | "sidebar";
}) {
  const isNavbar = size === "navbar";

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {showLogo && logoUrl && (
        <img
          src={logoUrl}
          alt="Cyra logo"
          style={{
            height: isNavbar ? "4.8rem" : "6rem",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
          draggable={false}
        />
      )}
    </div>
  );
}

export function Navbar({ config, onExploreOffers }: NavbarProps) {
  const { theme, toggle, mounted } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" }), 310);
    }
  }

  const placement = config.logo_placement ?? "none";
  const navbarLogo = config.navbar_logo_url || config.logo_url;
  const showNavbarLogo = !!navbarLogo && (placement === "navbar" || placement === "both");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[900] transition-all duration-500
          ${scrolled
            ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[rgba(191,160,106,0.18)]"
            : "bg-white/95 backdrop-blur-md border-b border-[rgba(191,160,106,0.1)]"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between gap-3">

            {/* LEFT */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl border border-[rgba(191,160,106,0.3)] hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)] transition-all">
                <span className="block w-[17px] h-[1.5px] bg-[#1F2937]" />
                <span className="block w-[17px] h-[1.5px] bg-[#1F2937]" />
                <span className="block w-[11px] h-[1.5px] bg-[#1F2937] self-start ml-[3px]" />
              </button>

              <button onClick={() => handleNavClick("#home")}
                className="w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.3)] hover:border-[var(--gold)] hover:bg-[rgba(191,160,106,0.07)] flex items-center justify-center">
                <Home size={16} />
              </button>
            </div>

            {/* CENTER LOGO ONLY */}
            <button onClick={() => handleNavClick("#home")}>
              <BrandBlock
                logoUrl={navbarLogo}
                showLogo={showNavbarLogo}
                size="navbar"
              />
            </button>

            {/* RIGHT */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {mounted && (
                <button onClick={toggle}
                  className="w-10 h-10 rounded-xl border border-[rgba(191,160,106,0.3)] flex items-center justify-center">
                  {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}
                </button>
              )}

              <a href={getWhatsAppLink(WHATSAPP_MESSAGES.offers)} target="_blank"
                className="hidden sm:flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl">
                <MessageCircle size={13}/> Book Now
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="h-20" />

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div className="fixed inset-0 z-[990] bg-black/35"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} />

            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[1000] w-[min(310px,88vw)] bg-white flex flex-col"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            >
              <div className="relative px-7 pt-10 pb-7 border-b">
                <button onClick={() => setSidebarOpen(false)}
                  className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center">
                  <X size={15}/>
                </button>

                {/* SIDEBAR LOGO ONLY */}
                <BrandBlock
                  logoUrl={navbarLogo}
                  showLogo={showNavbarLogo}
                  size="sidebar"
                />
              </div>

              <nav className="flex-1 py-3">
                {NAV_LINKS.map((link) => (
                  <button key={link.href} onClick={() => handleNavClick(link.href)}
                    className="w-full text-left px-7 py-[13px]">
                    {link.label}
                  </button>
                ))}
              </nav>

              <div className="px-7 py-6 border-t">
                <a href={getWhatsAppLink(WHATSAPP_MESSAGES.general)} target="_blank"
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white rounded-xl px-4 py-4">
                  <MessageCircle size={15}/> Chat on WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
