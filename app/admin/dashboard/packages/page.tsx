"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Package } from "@/types";

const EMPTY:Partial<Package>={name:"",description:"",actual_price:0,offer_price:0,discount_percent:0,badge:"",image_url:"",features:[],is_active:true,sort_order:0};

export default function PackagesPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [form,     setForm]     = useState<Partial<Package>>(EMPTY);
  const [editing,  setEditing]  = useState<string|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [featInput,setFeatInput]= useState("");

  async function load() {
    if(!token) return; setLoading(true);
    const r=await adminFetch("/api/packages",{token}); const d=await r.json();
    if(Array.isArray(d)) setPackages(d); setLoading(false);
  }
  useEffect(()=>{ if(!authLoading&&token) load(); },[token,authLoading]);

  function addFeat(){ if(!featInput.trim()) return; setForm(f=>({...f,features:[...(f.features||[]),featInput.trim()]})); setFeatInput(""); }
  function remFeat(i:number){ setForm(f=>({...f,features:f.features?.filter((_,idx)=>idx!==i)})); }

  async function save() {
    if(!form.name||!form.offer_price) return toast.error("Name & offer price required");
    setSaving(true);
    const body=editing?{...form,id:editing}:form;
    const r=await adminFetch("/api/packages",{method:editing?"PUT":"POST",body:body as Record<string,unknown>,token});
    const d=await r.json();
    if(d.error) toast.error(d.error);
    else{toast.success("Saved!"); setForm(EMPTY); setEditing(null); setShowForm(false); load();}
    setSaving(false);
  }

  async function del(id:string) {
    if(!confirm("Delete?")) return;
    await adminFetch("/api/packages",{method:"DELETE",body:{id},token});
    toast.success("Deleted"); load();
  }

  const inp="admin-input";

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#111827]">Packages</h2>
          <button onClick={()=>{setForm(EMPTY);setEditing(null);setShowForm(!showForm);}}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
            <Plus size={14}/> {showForm?"Cancel":"Add Package"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-[#111827]">{editing?"Edit":"New"} Package</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Package Name *" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} className={inp}/>
              <input placeholder="Badge (e.g. Most Popular)" value={form.badge||""} onChange={e=>setForm({...form,badge:e.target.value})} className={inp}/>
              <input type="number" placeholder="Actual Price ₹" value={form.actual_price||""} onChange={e=>setForm({...form,actual_price:+e.target.value})} className={inp}/>
              <input type="number" placeholder="Offer Price ₹ *" value={form.offer_price||""} onChange={e=>setForm({...form,offer_price:+e.target.value})} className={inp}/>
              <input type="number" placeholder="Discount %" value={form.discount_percent||""} onChange={e=>setForm({...form,discount_percent:+e.target.value})} className={inp}/>
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className={inp}/>
              <textarea placeholder="Description" rows={2} value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} className={`${inp} md:col-span-2 resize-none`}/>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#374151] mb-2">Features</p>
              <div className="flex gap-2 mb-2">
                <input value={featInput} onChange={e=>setFeatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addFeat())} placeholder="Add feature, press Enter" className={`flex-1 ${inp}`}/>
                <button onClick={addFeat} className="px-4 py-2 rounded-xl border border-[var(--gold)] text-[var(--gold-dark)] text-xs font-medium hover:bg-[var(--gold-pale)]/30">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.features?.map((f,i)=>(
                  <span key={i} className="flex items-center gap-1.5 bg-[#F3F4F6] px-3 py-1 rounded-full text-xs text-[#374151]">
                    {f}<button onClick={()=>remFeat(i)} className="text-[#9CA3AF] hover:text-red-500"><X size={11}/></button>
                  </span>
                ))}
              </div>
            </div>
            <ImageUpload value={form.image_url} onChange={url=>setForm({...form,image_url:url})} folder="packages" label="Upload Package Image"/>
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
              {saving?"Saving…":editing?"Update":"Add Package"}
            </button>
          </div>
        )}

        {loading ? <LoadingSpinner/> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(p=>(
              <div key={p.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                {p.image_url&&<div className="relative h-32"><Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized/>
                  <div className="absolute top-2 right-2 bg-[var(--gold)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{p.discount_percent}% OFF</div>
                </div>}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#111827]">{p.name}</p>
                      {p.badge&&<span className="text-[10px] text-[var(--gold-dark)] tracking-wide">{p.badge}</span>}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={()=>{setForm(p);setEditing(p.id);setShowForm(true);}} className="p-1.5 rounded-lg hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[var(--gold-dark)]"><Edit size={13}/></button>
                      <button onClick={()=>del(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B7280] hover:text-red-500"><Trash2 size={13}/></button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg text-[#111827]">{formatPrice(p.offer_price)}</span>
                    <span className="text-sm line-through text-[#9CA3AF]">{formatPrice(p.actual_price)}</span>
                  </div>
                  <ul className="mt-2 space-y-1">{p.features?.slice(0,3).map((f,i)=><li key={i} className="text-xs text-[#6B7280]">• {f}</li>)}</ul>
                </div>
              </div>
            ))}
            {packages.length===0&&<div className="col-span-3 text-center py-12 text-[#9CA3AF] text-sm">No packages yet</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
