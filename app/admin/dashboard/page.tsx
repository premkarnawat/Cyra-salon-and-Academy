"use client";

import { useEffect, useState } from "react";
import { Users, Image, Gift, Package, Phone, TrendingUp } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import type { LeadEntry } from "@/types";

export default function DashboardPage() {
  const { token, loading: authLoading } = useAdminAuth();
  const [leads,   setLeads]   = useState<LeadEntry[]>([]);
  const [stats,   setStats]   = useState({ leads:0, banners:0, offers:0, packages:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || token === null) return;
    Promise.allSettled([
      adminFetch("/api/admin/leads",   { token }).then(r=>r.json()),
      adminFetch("/api/banners",       { token }).then(r=>r.json()),
      adminFetch("/api/offers",        { token }).then(r=>r.json()),
      adminFetch("/api/packages",      { token }).then(r=>r.json()),
    ]).then(([l,b,o,p]) => {
      const ld = l.status==="fulfilled"&&Array.isArray(l.value) ? l.value : [];
      setLeads(ld);
      setStats({
        leads:    ld.length,
        banners:  b.status==="fulfilled"&&Array.isArray(b.value) ? b.value.length : 0,
        offers:   o.status==="fulfilled"&&Array.isArray(o.value) ? o.value.length : 0,
        packages: p.status==="fulfilled"&&Array.isArray(p.value) ? p.value.length : 0,
      });
    }).finally(() => setLoading(false));
  }, [token, authLoading]);

  const STAT_CARDS = [
    { label:"Total Leads",    value:stats.leads,    icon:Users,   color:"bg-blue-50   border-blue-200   text-blue-600" },
    { label:"Active Banners", value:stats.banners,  icon:Image,   color:"bg-amber-50  border-amber-200  text-amber-600" },
    { label:"Live Offers",    value:stats.offers,   icon:Gift,    color:"bg-green-50  border-green-200  text-green-600" },
    { label:"Packages",       value:stats.packages, icon:Package, color:"bg-purple-50 border-purple-200 text-purple-600" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-7">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827] tracking-tight">Overview</h2>
            <p className="text-sm text-[#6B7280] mt-0.5">Welcome back to Cyra Admin</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <TrendingUp size={15} className="text-[var(--gold-dark)]" />
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={`rounded-2xl border p-5 ${c.color} bg-opacity-60`}>
                <div className="flex items-start justify-between mb-3">
                  <Icon size={18} strokeWidth={1.8} />
                  <span className="text-2xl font-bold text-[#111827]">{c.value}</span>
                </div>
                <p className="text-xs font-medium text-[#374151] tracking-wide">{c.label}</p>
              </div>
            );
          })}
        </div>

        {/* Recent leads */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
            <h3 className="font-semibold text-[#111827]">Recent Leads</h3>
            <span className="text-xs text-[#6B7280] bg-[#F9FAFB] px-3 py-1 rounded-full border border-[#E5E7EB]">
              {stats.leads} total
            </span>
          </div>
          {(authLoading || loading) ? <LoadingSpinner /> : leads.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF] text-sm">No leads yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead><tr><th>Name</th><th>Contact</th><th>DOB</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {leads.slice(0,20).map(lead => (
                    <tr key={lead.id}>
                      <td className="font-medium text-[#111827]">{lead.name}</td>
                      <td className="text-[#374151]">{lead.contact}</td>
                      <td className="text-[#6B7280]">{lead.dob}</td>
                      <td className="text-[#9CA3AF] text-xs">{formatDate(lead.created_at)}</td>
                      <td>
                        <a href={`tel:${lead.contact}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors border border-green-200">
                          <Phone size={11}/> Call
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
