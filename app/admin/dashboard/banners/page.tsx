"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import toast from "react-hot-toast";
import type { Banner } from "@/types";

const EMPTY:Partial<Banner> = { title:"",subtitle:"",discount_text:"",cta_text:"Explore Offers",image_url:"",is_active:true,sort_order:0 };

export default function BannersPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [form,     setForm]     = useState<Partial<Banner>>(EMPTY);
  const [editing,  setEditing]  = useState<string|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    const r = await adminFetch("/api/banners",{token}); const d=await r.json();
    if (Array.isArray(d)) setBanners(d);
    setLoading(false);
  }
  useEffect(()=>{ if(!authLoading&&token) load(); },[token,authLoading]);

  async function save() {
    if (!form.title||!form.image_url) return toast.error("Title & image required");
    setSaving(true);
    const body = editing ? {...form,id:editing} : form;
    const r = await adminFetch("/api/banners",{method:editing?"PUT":"POST",body:body as Record<string,unknown>,token});
    const d = await r.json();
    if (d.error) toast.error(d.error);
    else { toast.success("Saved!"); setForm(EMPTY); setEditing(null); setShowForm(false); load(); }
    setSaving(false);
  }

  async function del(id:string) {
    if(!confirm("Delete?")) return;
    await adminFetch("/api/banners",{method:"DELETE",body:{id},token});
    toast.success("Deleted"); load();
  }

  async function toggle(b:Banner) {
    await adminFetch("/api/banners",{method:"PUT",body:{id:b.id,is_active:!b.is_active},token});
    load();
  }

  const inp = "admin-input";

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#111827]">Banners</h2>
          <button onClick={()=>{setForm(EMPTY);setEditing(null);setShowForm(!showForm);}}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
            <Plus size={14}/> {showForm?"Cancel":"Add Banner"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-[#111827]">{editing?"Edit Banner":"New Banner"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Title *" value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp}/>
              <input placeholder="Subtitle" value={form.subtitle||""} onChange={e=>setForm({...form,subtitle:e.target.value})} className={inp}/>
              <input placeholder="Discount Text (e.g. 30% OFF)" value={form.discount_text||""} onChange={e=>setForm({...form,discount_text:e.target.value})} className={inp}/>
              <input placeholder="CTA Text" value={form.cta_text||""} onChange={e=>setForm({...form,cta_text:e.target.value})} className={inp}/>
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className={inp}/>
            </div>
            <ImageUpload value={form.image_url} onChange={url=>setForm({...form,image_url:url})} bucket="banners" label="Upload Banner Image *"/>
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
              {saving?"Saving…":editing?"Update":"Add Banner"}
            </button>
          </div>
        )}

        {loading ? <LoadingSpinner/> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b=>(
              <div key={b.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="relative h-36">
                  <Image src={b.image_url} alt={b.title} fill className="object-cover" unoptimized/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-semibold text-sm">{b.title}</p>
                    {b.discount_text&&<p className="text-[var(--gold-light)] text-xs">{b.discount_text}</p>}
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center gap-2">
                  <button onClick={()=>toggle(b)} className="text-[#9CA3AF] hover:text-[var(--gold-dark)]">
                    {b.is_active ? <ToggleRight size={20} className="text-green-500"/> : <ToggleLeft size={20}/>}
                  </button>
                  <span className="text-xs text-[#6B7280] flex-1">{b.is_active?"Active":"Hidden"}</span>
                  <button onClick={()=>{setForm(b);setEditing(b.id);setShowForm(true);}} className="p-1.5 rounded-lg hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[var(--gold-dark)]"><Edit size={14}/></button>
                  <button onClick={()=>del(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
            {banners.length===0&&<div className="col-span-2 text-center py-12 text-[#9CA3AF] text-sm">No banners yet</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
