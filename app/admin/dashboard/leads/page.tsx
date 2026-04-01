"use client";

import { useEffect, useState } from "react";
import { Phone, Trash2, Search, Download } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { LeadEntry } from "@/types";

export default function LeadsPage() {
  const [leads,   setLeads]   = useState<LeadEntry[]>([]);
  const [filtered, setFiltered] = useState<LeadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    if (Array.isArray(data)) { setLeads(data); setFiltered(data); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(leads.filter(l =>
      l.name.toLowerCase().includes(q) || l.contact.includes(q)
    ));
  }, [query, leads]);

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead entry?")) return;
    const res = await fetch("/api/admin/leads", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    if ((await res.json()).success) {
      toast.success("Deleted");
      load();
    }
  }

  function exportCSV() {
    const rows = [["Name","Contact","DOB","Date"], ...leads.map(l => [l.name, l.contact, l.dob, formatDate(l.created_at)])];
    const csv  = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "cyra-leads.csv"; a.click();
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Lead Entries</h2>
            <p className="text-xs text-[rgba(240,232,216,0.4)] mt-1">{leads.length} total captures</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(191,160,106,0.5)]" />
              <input
                type="text"
                placeholder="Search leads…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm bg-[var(--dark-700)] border border-[rgba(191,160,106,0.2)] rounded-xl text-[#F0E8D8] outline-none focus:border-[var(--gold)] placeholder:text-[rgba(240,232,216,0.3)] w-44 md:w-56"
              />
            </div>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(191,160,106,0.25)] text-[var(--gold)] text-xs hover:bg-[rgba(191,160,106,0.08)] transition-colors">
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden">
          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <div className="text-center py-12 text-[rgba(240,232,216,0.3)] text-sm">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr className="text-left">
                    <th>#</th><th>Name</th><th>Contact</th><th>DOB</th><th>Captured</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr key={lead.id}>
                      <td className="text-[rgba(240,232,216,0.3)] text-xs">{i+1}</td>
                      <td className="font-medium text-[#F0E8D8]">{lead.name}</td>
                      <td className="text-[rgba(240,232,216,0.6)]">{lead.contact}</td>
                      <td className="text-[rgba(240,232,216,0.5)] text-xs">{lead.dob}</td>
                      <td className="text-[rgba(240,232,216,0.4)] text-xs">{formatDate(lead.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <a href={`tel:${lead.contact}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(37,211,102,0.1)] text-[#25D366] text-[11px] hover:bg-[rgba(37,211,102,0.2)] transition-colors">
                            <Phone size={11} /> Call
                          </a>
                          <button onClick={() => deleteLead(lead.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[rgba(239,68,68,0.08)] text-red-400 text-[11px] hover:bg-[rgba(239,68,68,0.16)] transition-colors">
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
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
