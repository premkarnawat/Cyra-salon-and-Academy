"use client";

import { useEffect, useState } from "react";
import { Users, Gift, Package, Star, Phone } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import type { LeadEntry } from "@/types";

interface Stats { leads: number; banners: number; offers: number; packages: number; }

export default function DashboardPage() {
  const [leads,   setLeads]   = useState<LeadEntry[]>([]);
  const [stats,   setStats]   = useState<Stats>({ leads:0, banners:0, offers:0, packages:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/admin/leads").then(r => r.json()),
      fetch("/api/banners").then(r => r.json()),
      fetch("/api/offers").then(r => r.json()),
      fetch("/api/packages").then(r => r.json()),
    ]).then(([l, b, o, p]) => {
      const leadsData = l.status === "fulfilled" && Array.isArray(l.value) ? l.value : [];
      setLeads(leadsData);
      setStats({
        leads:    leadsData.length,
        banners:  b.status === "fulfilled" && Array.isArray(b.value) ? b.value.length : 0,
        offers:   o.status === "fulfilled" && Array.isArray(o.value) ? o.value.length : 0,
        packages: p.status === "fulfilled" && Array.isArray(p.value) ? p.value.length : 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: "Total Leads",    value: stats.leads,    icon: Users,   color: "from-[#8C6E30] to-[#BFA06A]" },
    { label: "Active Banners", value: stats.banners,  icon: Gift,    color: "from-[#2C5364] to-[#4A9BA8]" },
    { label: "Live Offers",    value: stats.offers,   icon: Star,    color: "from-[#553C9A] to-[#7B68EE]" },
    { label: "Packages",       value: stats.packages, icon: Package, color: "from-[#134E5E] to-[#71B280]" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`rounded-2xl p-5 bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase opacity-75 mb-1">{card.label}</p>
                    <p className="font-jost text-3xl font-bold">{card.value}</p>
                  </div>
                  <Icon size={20} className="opacity-50" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Leads table */}
        <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(191,160,106,0.1)] flex items-center justify-between">
            <h2 className="font-cormorant text-xl text-[#F0E8D8]">Recent Leads</h2>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] font-semibold">{stats.leads} Total</span>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-[rgba(240,232,216,0.3)] text-sm">No leads yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr className="text-left">
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Date of Birth</th>
                    <th>Captured On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 50).map((lead) => (
                    <tr key={lead.id}>
                      <td className="font-medium text-[#F0E8D8]">{lead.name}</td>
                      <td className="text-[rgba(240,232,216,0.6)]">{lead.contact}</td>
                      <td className="text-[rgba(240,232,216,0.6)]">{lead.dob}</td>
                      <td className="text-[rgba(240,232,216,0.4)] text-xs">{formatDate(lead.created_at)}</td>
                      <td>
                        <a
                          href={`tel:${lead.contact}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(191,160,106,0.1)] text-[var(--gold)] text-[11px] hover:bg-[rgba(191,160,106,0.2)] transition-colors"
                        >
                          <Phone size={11} /> Call
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
