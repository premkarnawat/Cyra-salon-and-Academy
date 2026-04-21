import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import type { SiteConfig } from "@/types";

export function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer id="footer" className="bg-[#0C0B09] border-t border-[rgba(191,160,106,0.1)] text-[rgba(240,232,216,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-4 sm:pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Cyra" className="h-10 w-auto object-contain mb-3 opacity-90" />
            ) : (
              <div className="font-cinzel text-2xl sm:text-3xl tracking-[0.2em] text-[var(--gold-light)] mb-2">
                {config.salon_name?.split(" ")[0] || "Cyra"}
              </div>
            )}
            <div className="w-7 h-px bg-gradient-to-r from-[var(--gold)] to-transparent mb-4" />
            <p className="text-[13px] leading-relaxed font-light text-[rgba(240,232,216,0.42)] max-w-[200px]">
              {config.tagline || "Pune's premier luxury salon & academy."}
            </p>
            <div className="flex gap-3 mt-5">
              {config.instagram_url && (
                <a href={config.instagram_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-[rgba(191,160,106,0.2)] flex items-center justify-center text-[var(--gold)] hover:bg-[rgba(191,160,106,0.12)] transition-colors">
                  <Instagram size={15} />
                </a>
              )}
              {config.facebook_url && (
                <a href={config.facebook_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-[rgba(191,160,106,0.2)] flex items-center justify-center text-[var(--gold)] hover:bg-[rgba(191,160,106,0.12)] transition-colors">
                  <Facebook size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] tracking-[0.28em] uppercase text-[var(--gold)] font-semibold mb-4 sm:mb-5">Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.slice(0, 6).map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-[13px] hover:text-[var(--gold)] transition-colors font-light">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="hidden sm:block">
            <h4 className="text-[10px] tracking-[0.28em] uppercase text-[var(--gold)] font-semibold mb-4 sm:mb-5">Services</h4>
            <ul className="space-y-2.5 text-[13px] font-light">
              {["Haircut & Styling","Hair Colour","Keratin","Bridal","Hair Spa","Academy"].map(s => (
                <li key={s} className="hover:text-[var(--gold)] transition-colors cursor-default">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] tracking-[0.28em] uppercase text-[var(--gold)] font-semibold mb-4 sm:mb-5">Contact</h4>
            <ul className="space-y-3">
              {config.phone && (
                <li className="flex items-start gap-2.5 text-[13px] font-light">
                  <Phone size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <a href={`tel:${config.phone}`} className="hover:text-[var(--gold)] transition-colors">{config.phone}</a>
                </li>
              )}
              {config.email && (
                <li className="flex items-start gap-2.5 text-[13px] font-light">
                  <Mail size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${config.email}`} className="hover:text-[var(--gold)] transition-colors break-all">{config.email}</a>
                </li>
              )}
              {config.address && (
                <li className="flex items-start gap-2.5 text-[13px] font-light">
                  <MapPin size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{config.address}</span>
                </li>
              )}
              {config.opening_hours && (
                <li className="flex items-start gap-2.5 text-[13px] font-light">
                  <Clock size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                  <span>{config.opening_hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(191,160,106,0.1)] pt-5 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[12px] text-[rgba(240,232,216,0.28)]">
              {config.footer_copyright || `© ${new Date().getFullYear()} Cyra Salon & Academy. All rights reserved.`}
            </p>
            <p className="text-[12px] text-[rgba(191,160,106,0.4)]">Crafted with ♥ in Pune</p>
          </div>
          {/* Developer credit */}
          <p className="text-center text-[11px] text-[rgba(240,232,216,0.18)] tracking-wide">
            Design and Developed by: Prem Karnawat
          </p>
        </div>
      </div>
    </footer>
  );
}
