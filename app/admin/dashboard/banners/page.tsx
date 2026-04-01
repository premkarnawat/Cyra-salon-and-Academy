"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import type { Banner } from "@/types";

const EMPTY: Partial<Banner> = { title:"", subtitle:"", discount_text:"", cta_text:"Explore Offers", image_url:"", is_active:true, sort_order:0 };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form,    setForm]    = useState<Partial<Banner>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/banners"); const d = await r.json();
    if (Array.isArray(d)) setBanners(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.title || !form.image_url) return toast.error("Title & image are required");
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    const r = await fetch("/api/banners", { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
    const d = await r.json();
    if (d.error) toast.error(d.error); else { toast.success(editing ? "Updated!" : "Added!"); setForm(EMPTY); setEditing(null); setShowForm(false); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this banner?")) return;
    await fetch("/api/banners", { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id }) });
    toast.success("Deleted"); load();
  }

  async function toggle(banner: Banner) {
    await fetch("/api/banners", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: banner.id, is_active: !banner.is_active }) });
    load();
  }

  function startEdit(banner: Banner) { setForm(banner); setEditing(banner.id); setShowForm(true); }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Banner Management</h2>
          <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.15em]">
            <Plus size={14} /> {showForm ? "Cancel" : "Add Banner"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.15)] p-6 space-y-4">
            <h3 className="font-cormorant text-lg text-[var(--gold-light)]">{editing ? "Edit Banner" : "New Banner"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Title *" value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})} className="input-luxury dark:text-[#F0E8D8]" style={{background:"rgba(255,255,255,0.05)"}} />
              <input placeholder="Subtitle" value={form.subtitle||""} onChange={e=>setForm({...form,subtitle:e.target.value})} className="input-luxury dark:text-[#F0E8D8]" style={{background:"rgba(255,255,255,0.05)"}} />
              <input placeholder="Discount Text (e.g. 30% OFF)" value={form.discount_text||""} onChange={e=>setForm({...form,discount_text:e.target.value})} className="input-luxury dark:text-[#F0E8D8]" style={{background:"rgba(255,255,255,0.05)"}} />
              <input placeholder="CTA Text" value={form.cta_text||""} onChange={e=>setForm({...form,cta_text:e.target.value})} className="input-luxury dark:text-[#F0E8D8]" style={{background:"rgba(255,255,255,0.05)"}} />
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className="input-luxury dark:text-[#F0E8D8]" style={{background:"rgba(255,255,255,0.05)"}} />
            </div>
            <ImageUpload value={form.image_url} onChange={url=>setForm({...form,image_url:url})} bucket="banners" label="Upload Banner Image *" />
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-3 rounded-xl text-[11px] tracking-[0.15em]">
              {saving ? "Saving…" : editing ? "Update Banner" : "Add Banner"}
            </button>
          </div>
        )}

        {/* List */}
        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map(b => (
              <div key={b.id} className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden">
                <div className="relative h-36">
                  <Image src={b.image_url} alt={b.title} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white font-cormorant text-lg">{b.title}</p>
                    {b.discount_text && <p className="text-[var(--gold-light)] text-sm font-bold">{b.discount_text}</p>}
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center gap-3">
                  <button onClick={() => toggle(b)} className="text-[rgba(240,232,216,0.4)] hover:text-[var(--gold)]">
                    {b.is_active ? <ToggleRight size={20} className="text-[var(--gold)]" /> : <ToggleLeft size={20} />}
                  </button>
                  <span className="text-xs text-[rgba(240,232,216,0.3)] flex-1">{b.is_active ? "Active" : "Hidden"}</span>
                  <button onClick={() => startEdit(b)} className="text-[rgba(240,232,216,0.5)] hover:text-[var(--gold)]"><Edit size={15} /></button>
                  <button onClick={() => remove(b.id)} className="text-[rgba(240,232,216,0.5)] hover:text-red-400"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
