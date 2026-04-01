"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import type { Offer } from "@/types";

const EMPTY: Partial<Offer> = { tag:"", name:"", discount_text:"", description:"", image_url:"", is_active:true, sort_order:0 };

export default function OffersPage() {
  const [offers,  setOffers]  = useState<Offer[]>([]);
  const [form,    setForm]    = useState<Partial<Offer>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showForm,setShowForm]= useState(false);

  async function load() { setLoading(true); const r=await fetch("/api/offers"); const d=await r.json(); if(Array.isArray(d))setOffers(d); setLoading(false); }
  useEffect(()=>{load();},[]);

  async function save() {
    if (!form.name || !form.discount_text) return toast.error("Name & discount text are required");
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    const r = await fetch("/api/offers", { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.error) toast.error(d.error); else { toast.success("Saved!"); setForm(EMPTY); setEditing(null); setShowForm(false); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if(!confirm("Delete?")) return;
    await fetch("/api/offers", { method:"DELETE", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id}) });
    toast.success("Deleted"); load();
  }

  function startEdit(o: Offer) { setForm(o); setEditing(o.id); setShowForm(true); }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Offers Management</h2>
          <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.15em]">
            <Plus size={14}/> {showForm ? "Cancel" : "Add Offer"}
          </button>
        </div>

        {showForm && (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.15)] p-6 space-y-4">
            <h3 className="font-cormorant text-lg text-[var(--gold-light)]">{editing ? "Edit Offer" : "New Offer"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Tag (e.g. Best Seller)" value={form.tag||""} onChange={e=>setForm({...form,tag:e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}} />
              <input placeholder="Offer Name *" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}} />
              <input placeholder="Discount Text * (e.g. 30% OFF)" value={form.discount_text||""} onChange={e=>setForm({...form,discount_text:e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}} />
              <input placeholder="Description" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}} />
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className="input-luxury" style={{background:"rgba(255,255,255,0.05)",color:"#F0E8D8"}} />
            </div>
            <ImageUpload value={form.image_url} onChange={url=>setForm({...form,image_url:url})} folder="offers" label="Upload Offer Image" />
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-3 rounded-xl text-[11px] tracking-[0.15em]">
              {saving ? "Saving…" : editing ? "Update" : "Add Offer"}
            </button>
          </div>
        )}

        {loading ? <LoadingSpinner /> : (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full admin-table">
                <thead><tr className="text-left"><th>Image</th><th>Tag</th><th>Name</th><th>Discount</th><th>Order</th><th>Actions</th></tr></thead>
                <tbody>
                  {offers.map(o => (
                    <tr key={o.id}>
                      <td>{o.image_url && <div className="relative w-12 h-10 rounded-lg overflow-hidden"><Image src={o.image_url} alt={o.name} fill className="object-cover" unoptimized/></div>}</td>
                      <td className="text-[var(--gold)] text-xs">{o.tag}</td>
                      <td className="text-[#F0E8D8] font-medium">{o.name}</td>
                      <td className="font-bold text-[#F0E8D8]">{o.discount_text}</td>
                      <td className="text-[rgba(240,232,216,0.4)]">{o.sort_order}</td>
                      <td><div className="flex gap-2">
                        <button onClick={()=>startEdit(o)} className="text-[rgba(240,232,216,0.5)] hover:text-[var(--gold)]"><Edit size={14}/></button>
                        <button onClick={()=>remove(o.id)} className="text-[rgba(240,232,216,0.5)] hover:text-red-400"><Trash2 size={14}/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
