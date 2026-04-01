import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import type { SiteConfig } from "@/types";

interface FooterProps { config: SiteConfig; }

export function Footer({ config }: FooterProps) {
  return (
    <footer id="footer" className="bg-[var(--dark-900)] border-t border-[rgba(191,160,106,0.12)] text-[rgba(240,232,216,0.6)] pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="font-cinzel text-3xl tracking-[0.2em] text-[var(--gold-light)] mb-3">
              {config.salon_name.split(" ")[0]}
            </div>
            <div className="w-8 h-px bg-gradient-to-r from-[var(--gold)] to-transparent mb-4" />
            <p className="text-xs leading-relaxed font-light max-w-[200px] text-[rgba(240,232,216,0.4)]">
              {config.tagline || "Pune's destination for luxury hair & beauty transformations."}
            </p>
            <div className="flex gap-3 mt-5">
              {config.instagram_url && (
                <a href={config.instagram_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-[rgba(191,160,106,0.2)] flex items-center justify-center text-[var(--gold)] hover:bg-[rgba(191,160,106,0.1)] transition-colors">
                  <Instagram size={15} />
                </a>
              )}
              {config.facebook_url && (
                <a href={config.facebook_url} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-xl border border-[rgba(191,160,106,0.2)] flex items-center justify-center text-[var(--gold)] hover:bg-[rgba(191,160,106,0.1)] transition-colors">
                  <Facebook size={15} />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[9px] tracking-[0.3em] uppercase text-[var(--gold)] font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-xs hover:text-[var(--gold)] transition-colors font-light">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[9px] tracking-[0.3em] uppercase text-[var(--gold)] font-semibold mb-5">Services</h4>
            <ul className="space-y-2.5 text-xs font-light">
              {["Haircut & Styling","Hair Colour","Keratin Treatment","Bridal Packages","Hair Spa","Academy Courses"].map((s) => (
                <li key={s} className="hover:text-[var(--gold)] transition-colors cursor-default">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] tracking-[0.3em] uppercase text-[var(--gold)] font-semibold mb-5">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-xs font-light">
                <Phone size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <a href={`tel:${config.phone}`} className="hover:text-[var(--gold)] transition-colors">{config.phone}</a>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-light">
                <Mail size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <a href={`mailto:${config.email}`} className="hover:text-[var(--gold)] transition-colors">{config.email}</a>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-light">
                <MapPin size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs font-light">
                <Clock size={13} className="text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <span>{config.opening_hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(191,160,106,0.1)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[rgba(240,232,216,0.25)]">
            {config.footer_copyright}
          </p>
          <p className="text-[11px] text-[rgba(191,160,106,0.4)]">
            Crafted with ♥ in Pune
          </p>
        </div>
      </div>
    </footer>
  );
}
