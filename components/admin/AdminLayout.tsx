"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Image, Gift, Package,
  Scissors, GalleryHorizontal, Star, Settings,
  LogOut, Menu, X, ChevronRight, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin/dashboard",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/dashboard/leads",     label: "Leads",      icon: Users },
  { href: "/admin/dashboard/banners",   label: "Banners",    icon: Image },
  { href: "/admin/dashboard/offers",    label: "Offers",     icon: Gift },
  { href: "/admin/dashboard/packages",  label: "Packages",   icon: Package },
  { href: "/admin/dashboard/services",  label: "Rate Cards", icon: Scissors },
  { href: "/admin/dashboard/gallery",   label: "Gallery",    icon: GalleryHorizontal },
  { href: "/admin/dashboard/reviews",   label: "Reviews",    icon: Star },
  { href: "/admin/dashboard/settings",  label: "Settings",   icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open,    setOpen]    = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { if (d?.logo_url) setLogoUrl(d.logo_url); })
      .catch(() => {});
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/admin/login");
    router.refresh();
  }

  const currentLabel = NAV_ITEMS.find(n => n.href === pathname)?.label ?? "Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[rgba(191,160,106,0.12)]">
      {/* Brand — Task 2: logo if available, text fallback */}
      <div className="px-6 py-7 border-b border-[rgba(191,160,106,0.1)]">
        {logoUrl ? (
          <>
            <img src={logoUrl} alt="Cyra" className="h-10 w-auto object-contain" />
            <div className="mt-3 w-8 h-px bg-gradient-to-r from-[var(--gold)] to-transparent" />
          </>
        ) : (
          <>
            <div className="font-cinzel text-xl tracking-[0.22em] text-[var(--gold-dark)]">CYRA</div>
            <div className="font-marcellus text-[0.5rem] tracking-[0.38em] uppercase text-[var(--gold)] opacity-70 mt-0.5">Admin Panel</div>
            <div className="mt-3 w-8 h-px bg-gradient-to-r from-[var(--gold)] to-transparent" />
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <p className="px-6 mb-2 text-[8.5px] tracking-[0.3em] uppercase text-[var(--gold)]/40 font-semibold">Menu</p>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setOpen(false); }}
              className={`
                w-full flex items-center px-6 py-3 text-[13px] font-medium
                border-l-2 transition-all duration-200
                ${active
                  ? "border-[var(--gold)] bg-[rgba(191,160,106,0.07)] text-[var(--gold-dark)]"
                  : "border-transparent text-[#5A4E3C] hover:text-[var(--gold-dark)] hover:bg-[rgba(191,160,106,0.04)] hover:border-[rgba(191,160,106,0.3)]"
                }
              `}
            >
              <span style={{ fontFamily: "'Marcellus', serif" }} className="tracking-wide">{item.label}</span>
              {active && <ChevronRight size={12} className="ml-auto text-[var(--gold)]" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[rgba(191,160,106,0.1)] space-y-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-xs text-[#8C7A5E] hover:text-[var(--gold-dark)] transition-colors"
        >
          <ExternalLink size={13} /> View Live Site
        </a>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-[#8C7A5E] hover:text-red-500 transition-colors w-full"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex" style={{ fontFamily: "'Marcellus', serif" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 flex-shrink-0 fixed top-0 bottom-0 left-0 z-50 shadow-[2px_0_20px_rgba(0,0,0,0.05)]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30"
              style={{ backdropFilter: "blur(2px)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-50 w-52 shadow-2xl"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 z-10 text-[#8C7A5E] hover:text-[var(--gold-dark)]"><X size={18} /></button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-52 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[rgba(191,160,106,0.12)] shadow-[0_1px_12px_rgba(0,0,0,0.04)] px-4 md:px-8 h-14 flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="lg:hidden text-[#8C7A5E] hover:text-[var(--gold-dark)]">
            <Menu size={20} />
          </button>
          <div className="flex-1 flex items-center gap-3">
            <h1 className="font-cormorant text-xl text-[#1C1710]">{currentLabel}</h1>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 md:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
