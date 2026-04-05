import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import type { SiteConfig } from "@/types";

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer id="footer" className="bg-[#0C0B09] border-t border-[rgba(191,160,106,0.1)] text-[rgba(240,232,216,0.55)]">
      {/* Main grid — reduced padding on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="font-cinzel text-2xl sm:text-3xl tracking-[0.2em] text-[var(--gold-light)] mb-2">
              {config.salon_name?.split(" ")[0] || "Cyra"}
            </div>
            <div className="w-7 h-px bg-gradient-to-r from-[var(--gold)] to-transparent mb-3" />
            <p className="text-[11px] leading-relaxed font-light text-[rgba(240,232,216,0.38)] max-w-[180px]">
              {config.tagline || "Pune's premier luxury salon & academy."}
            </p>
            <div className="flex gap-2.5 mt-4">
              {config.instagram_url && (
                <a href={config.instagram_url} target="_blank" rel="noreferrer"
                  className="w-8 h-8 rounded-xl border border-[rgba(191,160,106,0.18)] flex items-center justify-center text-[var(--gold)] hover:bg-[rgba(191,160,106,0.1)] transition-colors">
                  <Instagram size={13} />
                </a>
              )}
              {config.facebook_url && (
                <a href={config.facebook_url} target="_blank" rel="noreferrer"
                  className="w-8 h-8 rounded-xl border border-[rgba(191,160,106,0.18)] flex items-center justify-center text-[var(--gold)] hover:bg-[rgba(191,160,106,0.1)] transition-colors">
                  <Facebook size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[8.5px] tracking-[0.28em] uppercase text-[var(--gold)] font-semibold mb-3 sm:mb-4">Links</h4>
            <ul className="space-y-1.5">
              {NAV_LINKS.slice(0, 5).map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-[11px] hover:text-[var(--gold)] transition-colors font-light">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="hidden sm:block">
            <h4 className="text-[8.5px] tracking-[0.28em] uppercase text-[var(--gold)] font-semibold mb-3 sm:mb-4">Services</h4>
            <ul className="space-y-1.5 text-[11px] font-light">
              {["Haircut & Styling","Hair Colour","Keratin","Bridal","Hair Spa"].map(s => (
                <li key={s} className="hover:text-[var(--gold)] transition-colors cursor-default">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[8.5px] tracking-[0.28em] uppercase text-[var(--gold)] font-semibold mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2">
              {config.phone && (
                <li className="flex items-start gap-2 text-[11px] font-light">
                  <Phone size={11} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <a href={`tel:${config.phone}`} className="hover:text-[var(--gold)] transition-colors">{config.phone}</a>
                </li>
              )}
              {config.email && (
                <li className="flex items-start gap-2 text-[11px] font-light">
                  <Mail size={11} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${config.email}`} className="hover:text-[var(--gold)] transition-colors break-all">{config.email}</a>
                </li>
              )}
              {config.address && (
                <li className="flex items-start gap-2 text-[11px] font-light">
                  <MapPin size={11} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{config.address}</span>
                </li>
              )}
              {config.opening_hours && (
                <li className="flex items-start gap-2 text-[11px] font-light">
                  <Clock size={11} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <span>{config.opening_hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(191,160,106,0.08)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-[rgba(240,232,216,0.22)]">{config.footer_copyright}</p>
          <p className="text-[10px] text-[rgba(191,160,106,0.35)]">Crafted with ♥ in Pune</p>
        </div>
      </div>
    </footer>
  );
}
