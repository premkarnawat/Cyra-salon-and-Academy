"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Star } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StarRating } from "@/components/ui/StarRating";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import toast from "react-hot-toast";
import type { Review } from "@/types";

const EMPTY:Partial<Review>={customer_name:"",rating:5,review_text:"",service:"",is_active:true,sort_order:0};

export default function ReviewsPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [form,     setForm]     = useState<Partial<Review>>(EMPTY);
  const [editing,  setEditing]  = useState<string|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if(!token) return; setLoading(true);
    const r=await adminFetch("/api/reviews",{token}); const d=await r.json();
    if(Array.isArray(d)) setReviews(d); setLoading(false);
  }
  useEffect(()=>{ if(!authLoading&&token) load(); },[token,authLoading]);

  async function save() {
    if(!form.customer_name||!form.review_text) return toast.error("Name & review required");
    setSaving(true);
    const body=editing?{...form,id:editing}:form;
    const r=await adminFetch("/api/reviews",{method:editing?"PUT":"POST",body:body as Record<string,unknown>,token});
    const d=await r.json();
    if(d.error) toast.error(d.error);
    else{toast.success("Saved!"); setForm(EMPTY); setEditing(null); setShowForm(false); load();}
    setSaving(false);
  }

  async function del(id:string) {
    if(!confirm("Delete?")) return;
    await adminFetch("/api/reviews",{method:"DELETE",body:{id},token});
    toast.success("Deleted"); load();
  }

  const inp="admin-input";

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#111827]">Reviews</h2>
          <button onClick={()=>{setForm(EMPTY);setEditing(null);setShowForm(!showForm);}}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
            <Plus size={14}/> {showForm?"Cancel":"Add Review"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-[#111827]">{editing?"Edit":"New"} Review</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Customer Name *" value={form.customer_name||""} onChange={e=>setForm({...form,customer_name:e.target.value})} className={inp}/>
              <input placeholder="Service (e.g. Keratin)" value={form.service||""} onChange={e=>setForm({...form,service:e.target.value})} className={inp}/>
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className={inp}/>
            </div>
            <div>
              <p className="text-xs font-medium text-[#374151] mb-2">Rating</p>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(n=>(
                  <button key={n} type="button" onClick={()=>setForm({...form,rating:n})}>
                    <Star size={22} fill={n<=(form.rating||0)?"var(--gold)":"none"}
                      className={n<=(form.rating||0)?"text-[var(--gold)]":"text-[#D1D5DB]"}/>
                  </button>
                ))}
                <span className="text-sm text-[#6B7280] ml-2">{form.rating}/5</span>
              </div>
            </div>
            <textarea placeholder="Review text *" rows={3} value={form.review_text||""} onChange={e=>setForm({...form,review_text:e.target.value})} className={`${inp} resize-none`}/>
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
              {saving?"Saving…":editing?"Update":"Add Review"}
            </button>
          </div>
        )}

        {(authLoading||loading) ? <LoadingSpinner/> : reviews.length===0 ? (
          <div className="text-center py-12 text-[#9CA3AF] text-sm bg-white rounded-2xl border border-[#E5E7EB]">No reviews yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map(rev=>(
              <div key={rev.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <StarRating rating={rev.rating}/>
                  <div className="flex gap-1.5">
                    <button onClick={()=>{setForm(rev);setEditing(rev.id);setShowForm(true);}} className="p-1.5 rounded-lg hover:bg-[#F9FAFB] text-[#9CA3AF] hover:text-[var(--gold-dark)]"><Edit size={13}/></button>
                    <button onClick={()=>del(rev.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500"><Trash2 size={13}/></button>
                  </div>
                </div>
                <p className="text-sm text-[#374151] italic leading-relaxed mb-3">"{rev.review_text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold-dark)] to-[var(--gold)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {rev.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{rev.customer_name}</p>
                    {rev.service&&<p className="text-[10px] text-[var(--gold-dark)] uppercase tracking-wide">{rev.service}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
