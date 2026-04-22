"use client";

import { useEffect, useState } from "react";
import { Phone, Trash2, Search, Download, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Visit { id:string; visited_at:string; user_agent?:string; }

interface UserEntry {
  id:string; name:string; phone:string; dob:string;
  created_at:string; visit_count:number; last_visit_at:string;
  visits:Visit[];
}

export default function LeadsPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [users,    setUsers]    = useState<UserEntry[]>([]);
  const [filtered, setFiltered] = useState<UserEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  async function load() {
    if (!token) return;
    setLoading(true);
    const res = await adminFetch("/api/admin/leads", { token });
    const d   = await res.json();
    if (Array.isArray(d)) { setUsers(d); setFiltered(d); }
    setLoading(false);
  }

  useEffect(() => { if (!authLoading && token) load(); }, [token, authLoading]);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(users.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q)));
  }, [query, users]);

  async function del(id:string) {
    if (!confirm("Delete this user and all their visit records?")) return;
    await adminFetch("/api/admin/leads", { method:"DELETE", body:{ id }, token });
    toast.success("Deleted"); load();
  }

  function toggleExpand(id:string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function formatTime(iso:string) {
    return new Date(iso).toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" });
  }

  function exportCsv() {
    const rows=[["Name","Phone","DOB","First Visit","Total Visits","Last Visit"],
      ...users.map(u=>[u.name,u.phone,u.dob,formatDate(u.created_at),String(u.visit_count),formatDate(u.last_visit_at)])];
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a=Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv"})),download:"cyra-users.csv"});
    a.click();
  }

  const totalVisits = users.reduce((acc,u)=>acc+u.visit_count,0);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Users & Visits</h2>
            <p className="text-sm text-[#6B7280]">{users.length} unique users · {totalVisits} total visits</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name / phone…"
                className="pl-8 pr-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-xl text-[#374151] outline-none focus:border-[var(--gold)] w-48 placeholder:text-[#9CA3AF]" />
            </div>
            <button onClick={exportCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] text-xs font-medium hover:bg-[#F9FAFB]">
              <Download size={13}/> CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {(authLoading||loading)?<LoadingSpinner />:filtered.length===0?(
            <div className="text-center py-12 text-[#9CA3AF] text-sm">No users found</div>
          ):(
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Phone</th><th>DOB</th><th>First Visit</th>
                  <th><div className="flex items-center gap-1"><Clock size={11}/>Visits</div></th>
                  <th>Last Visit</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((u,i)=>{
                    const isOpen = expanded.has(u.id);
                    // ── FIX 6: Sort visits ASCENDING (oldest first = #1, latest last) ──
                    const sortedVisits = [...(u.visits||[])].sort(
                      (a,b)=>new Date(a.visited_at).getTime()-new Date(b.visited_at).getTime()
                    );
                    return (
                      <>
                        <tr key={u.id}>
                          <td className="text-[#9CA3AF] text-xs">{i+1}</td>
                          <td className="font-medium text-[#111827]">{u.name}</td>
                          <td className="text-[#374151]">{u.phone}</td>
                          <td className="text-[#6B7280] text-xs">{u.dob}</td>
                          <td className="text-[#9CA3AF] text-xs">{formatDate(u.created_at)}</td>
                          <td>
                            <button onClick={()=>toggleExpand(u.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                u.visit_count>1
                                  ?"bg-[rgba(191,160,106,0.12)] text-[var(--gold-dark)] hover:bg-[rgba(191,160,106,0.2)]"
                                  :"bg-[#F3F4F6] text-[#6B7280]"
                              }`}>
                              {u.visit_count} {u.visit_count===1?"visit":"visits"}
                              {u.visit_count>1&&(isOpen?<ChevronUp size={11}/>:<ChevronDown size={11}/>)}
                            </button>
                          </td>
                          <td className="text-[#9CA3AF] text-xs">{formatDate(u.last_visit_at)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <a href={`tel:${u.phone}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium border border-green-200 hover:bg-green-100">
                                <Phone size={11}/> Call
                              </a>
                              <button onClick={()=>del(u.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200 hover:bg-red-100">
                                <Trash2 size={11}/>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable visits — chronological order, oldest = #1 */}
                        {isOpen && (
                          <tr key={`${u.id}-v`} className="bg-[#FAFAFA]">
                            <td colSpan={8} className="px-6 py-3">
                              <p className="text-[10px] font-bold text-[var(--gold-dark)] uppercase tracking-widest mb-2">
                                Visit History ({sortedVisits.length})
                              </p>
                              {sortedVisits.length===0?(
                                <p className="text-xs text-[#9CA3AF] italic">No detailed records yet</p>
                              ):(
                                <div className="flex flex-wrap gap-2">
                                  {sortedVisits.map((v,vi)=>(
                                    <div key={v.id} className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#374151]">
                                      <span className="text-[#9CA3AF] font-medium">#{vi+1}</span>
                                      <Clock size={10} className="text-[var(--gold)]"/>
                                      <span>{formatDate(v.visited_at)} {formatTime(v.visited_at)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
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
