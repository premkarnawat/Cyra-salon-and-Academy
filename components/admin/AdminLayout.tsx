"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Image, Gift, Package,
  Scissors, GalleryHorizontal, Star, Settings,
  LogOut, Menu, X, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin/dashboard",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/dashboard/leads",      label: "Leads",       icon: Users },
  { href: "/admin/dashboard/banners",    label: "Banners",     icon: Image },
  { href: "/admin/dashboard/offers",     label: "Offers",      icon: Gift },
  { href: "/admin/dashboard/packages",   label: "Packages",    icon: Package },
  { href: "/admin/dashboard/services",   label: "Services",    icon: Scissors },
  { href: "/admin/dashboard/gallery",    label: "Gallery",     icon: GalleryHorizontal },
  { href: "/admin/dashboard/reviews",    label: "Reviews",     icon: Star },
  { href: "/admin/dashboard/settings",   label: "Settings",    icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/admin/login");
    router.refresh();
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-[rgba(191,160,106,0.1)]">
        <div className="font-cinzel text-2xl tracking-[0.2em] text-[var(--gold-light)]">CYRA</div>
        <div className="text-[9px] tracking-[0.3em] uppercase text-[rgba(191,160,106,0.4)] mt-1">Admin Panel</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-2">
          <span className="text-[8px] tracking-[0.3em] uppercase text-[rgba(191,160,106,0.35)] font-semibold px-3">Management</span>
        </div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon   = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all border-l-2 ${
                active
                  ? "bg-[rgba(191,160,106,0.1)] border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[rgba(240,232,216,0.5)] hover:text-[var(--gold)] hover:bg-[rgba(191,160,106,0.06)] hover:border-[rgba(191,160,106,0.3)]"
              }`}
            >
              <Icon size={15} />
              <span className="font-jost font-medium tracking-wide">{item.label}</span>
              {active && <ChevronRight size={12} className="ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-[rgba(191,160,106,0.1)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 text-xs text-[rgba(240,232,216,0.4)] hover:text-red-400 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--dark-900)] text-[#F0E8D8] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0 bg-[var(--dark-800)] border-r border-[rgba(191,160,106,0.1)] fixed top-0 bottom-0 left-0 z-50">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-50 w-56 bg-[var(--dark-800)] border-r border-[rgba(191,160,106,0.1)]"
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-[rgba(240,232,216,0.4)] hover:text-[var(--gold)]">
                <X size={18} />
              </button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[var(--dark-800)]/90 backdrop-blur-md border-b border-[rgba(191,160,106,0.1)] px-4 md:px-8 h-14 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[rgba(240,232,216,0.6)] hover:text-[var(--gold)]"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="font-cormorant text-xl text-[#F0E8D8]">
              {NAV_ITEMS.find(n => n.href === pathname)?.label || "Admin"}
            </h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer"
            className="text-[10px] tracking-[0.15em] uppercase text-[rgba(191,160,106,0.5)] hover:text-[var(--gold)] transition-colors">
            View Site →
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
