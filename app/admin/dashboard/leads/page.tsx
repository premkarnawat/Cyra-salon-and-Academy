"use client";

import { useEffect, useState } from "react";
import { Phone, Trash2, Search, Download, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { LeadEntry } from "@/types";

interface LeadWithVisits extends LeadEntry {
  visit_count?: number;
  last_visit_at?: string;
  visits?: { id: string; visited_at: string; session_id?: string }[];
}

export default function LeadsPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [leads,    setLeads]    = useState<LeadWithVisits[]>([]);
  const [filtered, setFiltered] = useState<LeadWithVisits[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  async function load() {
    if (!token) return;
    setLoading(true);
    const res = await adminFetch("/api/admin/leads", { token });
    const d   = await res.json();
    if (Array.isArray(d)) { setLeads(d); setFiltered(d); }
    setLoading(false);
  }

  useEffect(() => { if (!authLoading && token) load(); }, [token, authLoading]);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(leads.filter(l => l.name.toLowerCase().includes(q) || l.contact.includes(q)));
  }, [query, leads]);

  async function del(id: string) {
    if (!confirm("Delete this lead and all their visit records?")) return;
    await adminFetch("/api/admin/leads", { method:"DELETE", body:{ id }, token });
    toast.success("Deleted");
    load();
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const rows = [
      ["Name","Contact","DOB","First Visit","Total Visits","Last Visit"],
      ...leads.map(l => [l.name, l.contact, l.dob, formatDate(l.created_at), String(l.visit_count||1), l.last_visit_at ? formatDate(l.last_visit_at) : "-"]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const a   = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type:"text/csv" })),
      download: "cyra-leads.csv",
    });
    a.click();
  }

  const totalVisits = leads.reduce((acc, l) => acc + (l.visit_count || 1), 0);

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Leads</h2>
            <p className="text-sm text-[#6B7280]">
              {leads.length} unique users &nbsp;·&nbsp; {totalVisits} total visits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name / phone…"
                className="pl-8 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-xl text-[#374151] outline-none focus:border-[var(--gold)] w-48 placeholder:text-[#9CA3AF]" />
            </div>
            <button onClick={exportCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] text-xs font-medium hover:bg-[#F9FAFB] transition-colors">
              <Download size={13}/> CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {(authLoading||loading) ? <LoadingSpinner /> : filtered.length===0 ? (
            <div className="text-center py-12 text-[#9CA3AF] text-sm">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>DOB</th>
                    <th>First Visit</th>
                    <th>
                      <div className="flex items-center gap-1">
                        <Clock size={11}/> Visits
                      </div>
                    </th>
                    <th>Last Visit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => {
                    const isOpen   = expanded.has(l.id);
                    const visits   = l.visits || [];
                    const vc       = l.visit_count || 1;

                    return (
                      <>
                        <tr key={l.id}>
                          <td className="text-[#9CA3AF] text-xs">{i+1}</td>
                          <td className="font-medium text-[#111827]">{l.name}</td>
                          <td className="text-[#374151]">{l.contact}</td>
                          <td className="text-[#6B7280] text-xs">{l.dob}</td>
                          <td className="text-[#9CA3AF] text-xs">{formatDate(l.created_at)}</td>
                          <td>
                            {/* Visit count badge — click to expand */}
                            <button
                              onClick={() => toggleExpand(l.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                vc > 1
                                  ? "bg-[rgba(191,160,106,0.12)] text-[var(--gold-dark)] hover:bg-[rgba(191,160,106,0.2)]"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              }`}
                            >
                              {vc} {vc===1?"visit":"visits"}
                              {vc > 1 && (isOpen ? <ChevronUp size={11}/> : <ChevronDown size={11}/>)}
                            </button>
                          </td>
                          <td className="text-[#9CA3AF] text-xs">
                            {l.last_visit_at ? formatDate(l.last_visit_at) : "-"}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <a href={`tel:${l.contact}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-200 hover:bg-green-100">
                                <Phone size={11}/> Call
                              </a>
                              <button onClick={()=>del(l.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200 hover:bg-red-100">
                                <Trash2 size={11}/>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable visit timestamps row */}
                        {isOpen && visits.length > 0 && (
                          <tr key={`${l.id}-visits`} className="bg-[#FAFAFA]">
                            <td colSpan={8} className="px-6 py-3">
                              <p className="text-[10px] font-semibold text-[var(--gold-dark)] uppercase tracking-widest mb-2">
                                Visit History ({visits.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {visits.map((v, vi) => (
                                  <div key={v.id} className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#374151]">
                                    <span className="text-[#9CA3AF]">#{vi+1}</span>
                                    <Clock size={10} className="text-[var(--gold)]"/>
                                    {formatDate(v.visited_at)} {new Date(v.visited_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* If no detailed visit records but visit_count > 1 */}
                        {isOpen && visits.length === 0 && vc > 1 && (
                          <tr key={`${l.id}-novisits`} className="bg-[#FAFAFA]">
                            <td colSpan={8} className="px-6 py-3 text-xs text-[#9CA3AF] italic">
                              {vc} visits recorded. Detailed timestamps available for visits after the schema upgrade.
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
