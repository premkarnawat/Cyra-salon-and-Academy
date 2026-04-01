"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Package } from "@/types";

const EMPTY: Partial<Package> = { name:"", description:"", actual_price:0, offer_price:0, discount_percent:0, badge:"", image_url:"", features:[], is_active:true, sort_order:0 };

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [form,     setForm]     = useState<Partial<Package>>(EMPTY);
  const [editing,  setEditing]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [featInput, setFeatInput] = useState("");

  async function load() { setLoading(true); const r=await fetch("/api/packages"); const d=await r.json(); if(Array.isArray(d))setPackages(d); setLoading(false); }
  useEffect(()=>{load();},[]);

  function addFeature() {
    if (!featInput.trim()) return;
    setForm(f => ({ ...f, features: [...(f.features||[]), featInput.trim()] }));
    setFeatInput("");
  }
  function removeFeature(i: number) { setForm(f => ({ ...f, features: f.features?.filter((_,idx)=>idx!==i) })); }

  async function save() {
    if (!form.name || !form.offer_price) return toast.error("Name & offer price required");
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    const r = await fetch("/api/packages", { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.error) toast.error(d.error); else { toast.success("Saved!"); setForm(EMPTY); setEditing(null); setShowForm(false); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if(!confirm("Delete?")) return;
    await fetch("/api/packages", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    toast.success("Deleted"); load();
  }

  function startEdit(p: Package) { setForm(p); setEditing(p.id); setShowForm(true); }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Packages Management</h2>
          <button onClick={()=>{setForm(EMPTY);setEditing(null);setShowForm(!showForm);}} className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.15em]">
            <Plus size={14}/> {showForm?"Cancel":"Add Package"}
          </button>
        </div>

        {showForm && (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.15)] p-6 space-y-4">
            <h3 className="font-cormorant text-lg text-[var(--gold-light)]">{editing?"Edit Package":"New Package"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Package Name *" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
              <input placeholder="Badge (e.g. Most Popular)" value={form.badge||""} onChange={e=>setForm({...form,badge:e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
              <input type="number" placeholder="Actual Price (₹)" value={form.actual_price||""} onChange={e=>setForm({...form,actual_price:+e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
              <input type="number" placeholder="Offer Price (₹) *" value={form.offer_price||""} onChange={e=>setForm({...form,offer_price:+e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
              <input type="number" placeholder="Discount %" value={form.discount_percent||""} onChange={e=>setForm({...form,discount_percent:+e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
              <textarea placeholder="Description" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} rows={2} className="input-luxury md:col-span-2" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8",paddingTop:"0.8rem"}}/>
            </div>
            {/* Features */}
            <div>
              <p className="text-xs text-[var(--gold)] mb-2 tracking-wide uppercase">Features Included</p>
              <div className="flex gap-2 mb-2">
                <input value={featInput} onChange={e=>setFeatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addFeature())} placeholder="Add feature & press Enter" className="flex-1 input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}}/>
                <button onClick={addFeature} className="btn-ghost-gold px-4 py-2 rounded-xl text-xs">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.features?.map((f,i)=>(
                  <span key={i} className="flex items-center gap-1.5 bg-[rgba(191,160,106,0.1)] border border-[rgba(191,160,106,0.2)] px-3 py-1 rounded-full text-xs text-[var(--gold-light)]">
                    {f}
                    <button onClick={()=>removeFeature(i)} className="text-[rgba(191,160,106,0.5)] hover:text-red-400 text-xs">×</button>
                  </span>
                ))}
              </div>
            </div>
            <ImageUpload value={form.image_url} onChange={url=>setForm({...form,image_url:url})} folder="packages" label="Upload Package Image"/>
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-3 rounded-xl text-[11px] tracking-[0.15em]">
              {saving?"Saving…":editing?"Update Package":"Add Package"}
            </button>
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(p=>(
              <div key={p.id} className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden">
                {p.image_url && <div className="relative h-36"><Image src={p.image_url} alt={p.name} fill className="object-cover" unoptimized/><div className="absolute top-2 right-2 bg-[var(--gold)] text-[var(--dark-900)] text-[10px] font-black px-2.5 py-1 rounded-full">{p.discount_percent}% OFF</div></div>}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-cormorant text-lg text-[#F0E8D8]">{p.name}</p>
                      {p.badge && <span className="text-[10px] text-[var(--gold)] tracking-wide uppercase">{p.badge}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(p)} className="text-[rgba(240,232,216,0.4)] hover:text-[var(--gold)]"><Edit size={14}/></button>
                      <button onClick={()=>remove(p.id)} className="text-[rgba(240,232,216,0.4)] hover:text-red-400"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-jost font-bold text-xl text-[#F0E8D8]">{formatPrice(p.offer_price)}</span>
                    <span className="text-sm line-through text-[rgba(240,232,216,0.3)]">{formatPrice(p.actual_price)}</span>
                  </div>
                  <ul className="mt-2 space-y-1">{p.features?.slice(0,3).map((f,i)=><li key={i} className="text-xs text-[rgba(240,232,216,0.5)]">• {f}</li>)}</ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
