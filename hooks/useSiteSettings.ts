"use client";

import { useState, useEffect } from "react";
import { SiteConfig } from "@/types";
import { DEFAULT_CONFIG } from "@/lib/constants";

function buildFontUrl(fonts: string[]): string {
  const unique = [...new Set(fonts.filter(Boolean))];
  if (!unique.length) return "";
  const families = unique.map(f => `family=${encodeURIComponent(f)}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function injectFontLink(url: string) {
  if (!url || typeof document === "undefined") return;
  let el = document.getElementById("cyra-dynamic-fonts") as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link") as HTMLLinkElement;
    el.id  = "cyra-dynamic-fonts";
    el.rel = "stylesheet";
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Applies the brand + body fonts from the admin settings to the live page.
 *
 * Strategy:
 * 1. Inject Google Fonts <link> so the font file is loaded.
 * 2. Set CSS custom properties on <html> — picked up by Tailwind utilities
 *    AND by the explicit CSS rules added below.
 * 3. Directly mutate body.style.fontFamily so the body font applies immediately
 *    without waiting for a CSS cascade.
 */
function applyFonts(brand?: string, body?: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (brand) {
    // Set CSS variable (used by .font-cinzel override in globals.css)
    root.style.setProperty("--applied-brand-font", `'${brand}', serif`);
    // Also inject a <style> tag so every font-cinzel element switches instantly
    let style = document.getElementById("cyra-brand-font-override") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style") as HTMLStyleElement;
      style.id = "cyra-brand-font-override";
      document.head.appendChild(style);
    }
    style.textContent = `
      .font-cinzel, [class*="font-cinzel"] {
        font-family: '${brand}', serif !important;
      }
    `;
  }

  if (body) {
    root.style.setProperty("--applied-body-font", `'${body}', sans-serif`);
    // Apply to body immediately
    document.body.style.fontFamily = `'${body}', sans-serif`;
    // Inject override style
    let style = document.getElementById("cyra-body-font-override") as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style") as HTMLStyleElement;
      style.id = "cyra-body-font-override";
      document.head.appendChild(style);
    }
    style.textContent = `
      body, .font-jost, [class*="font-jost"],
      button, input, textarea, select, a {
        font-family: '${body}', sans-serif !important;
      }
    `;
  }
}

export function useSiteSettings() {
  const [config,  setConfig]  = useState<SiteConfig>(DEFAULT_CONFIG as SiteConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          const merged = { ...DEFAULT_CONFIG, ...data } as SiteConfig;
          setConfig(merged);

          const brandFont = (merged as SiteConfig & { brand_font?: string }).brand_font;
          const bodyFont  = (merged as SiteConfig & { body_font?: string }).body_font;

          // Load all non-default fonts (Marcellus already loaded in layout.tsx head)
          const PRELOADED = ["Jost", "Marcellus", "Cinzel Decorative", "Cormorant Garamond"];
          const toLoad: string[] = [];
          if (brandFont && !PRELOADED.includes(brandFont)) toLoad.push(brandFont);
          if (bodyFont  && !PRELOADED.includes(bodyFont))  toLoad.push(bodyFont);
          if (toLoad.length) injectFontLink(buildFontUrl(toLoad));

          // Apply — wait one tick so the link tag is in DOM first
          requestAnimationFrame(() => applyFonts(brandFont, bodyFont));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
