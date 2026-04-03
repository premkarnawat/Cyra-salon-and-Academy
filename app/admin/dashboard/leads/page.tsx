"use client";

import { useEffect, useState } from "react";
import { Phone, Trash2, Search, Download } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { LeadEntry } from "@/types";

export default function LeadsPage() {
  const { token, loading: authLoading } = useAdminAuth();
  const [leads,    setLeads]    = useState<LeadEntry[]>([]);
  const [filtered, setFiltered] = useState<LeadEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");

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
    if (!confirm("Delete this lead?")) return;
    await adminFetch("/api/admin/leads", { method:"DELETE", body:{ id }, token });
    toast.success("Deleted");
    load();
  }

  function exportCsv() {
    const rows = [["Name","Contact","DOB","Date"], ...leads.map(l => [l.name,l.contact,l.dob,formatDate(l.created_at)])];
    const csv  = rows.map(r=>r.join(",")).join("\n");
    const a    = Object.assign(document.createElement("a"), { href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})), download:"cyra-leads.csv" });
    a.click();
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Leads</h2>
            <p className="text-sm text-[#6B7280]">{leads.length} total captures</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-xl text-[#374151] outline-none focus:border-[var(--gold)] w-44 placeholder:text-[#9CA3AF]" />
            </div>
            <button onClick={exportCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] text-xs font-medium hover:bg-[#F9FAFB] transition-colors">
              <Download size={13}/> CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {(authLoading||loading) ? <LoadingSpinner /> : filtered.length===0 ? (
            <div className="text-center py-12 text-[#9CA3AF] text-sm">No leads found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead><tr><th>#</th><th>Name</th><th>Contact</th><th>DOB</th><th>Captured</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((l,i) => (
                    <tr key={l.id}>
                      <td className="text-[#9CA3AF] text-xs">{i+1}</td>
                      <td className="font-medium text-[#111827]">{l.name}</td>
                      <td className="text-[#374151]">{l.contact}</td>
                      <td className="text-[#6B7280] text-xs">{l.dob}</td>
                      <td className="text-[#9CA3AF] text-xs">{formatDate(l.created_at)}</td>
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
