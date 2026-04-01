"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Service } from "@/types";

const EMPTY: Partial<Service> = {
  name: "", category: "", starting_price: 0, description: "",
  image_url: "", rate_card_url: "", file_type: "image",
  is_active: true, sort_order: 0,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form,     setForm]     = useState<Partial<Service>>(EMPTY);
  const [editing,  setEditing]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/services");
    const d = await r.json();
    if (Array.isArray(d)) setServices(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name) return toast.error("Service name is required");
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    const r = await fetch("/api/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (d.error) toast.error(d.error);
    else { toast.success("Saved!"); setForm(EMPTY); setEditing(null); setShowForm(false); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    await fetch("/api/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    load();
  }

  function startEdit(s: Service) { setForm(s); setEditing(s.id); setShowForm(true); }

  const inputStyle = { background: "rgba(255,255,255,0.05)", color: "#F0E8D8" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Services & Rate Cards</h2>
            <p className="text-xs text-[rgba(240,232,216,0.35)] mt-1">Upload JPG / PNG / PDF — PDFs display as image preview (not downloadable)</p>
          </div>
          <button
            onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.15em]"
          >
            <Plus size={14} /> {showForm ? "Cancel" : "Add Service"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.15)] p-6 space-y-4">
            <h3 className="font-cormorant text-lg text-[var(--gold-light)]">
              {editing ? "Edit Service" : "New Service"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Service Name *"
                value={form.name || ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-luxury"
                style={inputStyle}
              />
              <input
                placeholder="Category (e.g. Hair, Skin)"
                value={form.category || ""}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="input-luxury"
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Starting Price (₹)"
                value={form.starting_price || ""}
                onChange={e => setForm({ ...form, starting_price: +e.target.value })}
                className="input-luxury"
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Sort Order"
                value={form.sort_order || 0}
                onChange={e => setForm({ ...form, sort_order: +e.target.value })}
                className="input-luxury"
                style={inputStyle}
              />
              <textarea
                placeholder="Description"
                value={form.description || ""}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input-luxury md:col-span-2"
                style={{ ...inputStyle, paddingTop: "0.8rem" }}
              />
            </div>

            {/* Service image */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] mb-2">Service Image</p>
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm({ ...form, image_url: url })}
                folder="services"
                label="Upload Service Image (JPG/PNG)"
              />
            </div>

            {/* Rate card */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] mb-2">
                Rate Card (JPG / PNG / PDF)
              </p>
              <div className="flex gap-3 mb-3">
                {(["image", "pdf"] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="file_type"
                      value={t}
                      checked={form.file_type === t}
                      onChange={() => setForm({ ...form, file_type: t })}
                      className="accent-[var(--gold)]"
                    />
                    <span className="text-xs text-[rgba(240,232,216,0.6)] uppercase tracking-wide">{t}</span>
                  </label>
                ))}
              </div>
              <ImageUpload
                value={form.rate_card_url}
                onChange={url => setForm({ ...form, rate_card_url: url })}
                bucket="ratecard"
                folder="rate-cards"
                accept={form.file_type === "pdf" ? "application/pdf" : "image/*"}
                label={`Upload Rate Card (${form.file_type === "pdf" ? "PDF" : "Image"})`}
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="btn-gold px-6 py-3 rounded-xl text-[11px] tracking-[0.15em]"
            >
              {saving ? "Saving…" : editing ? "Update Service" : "Add Service"}
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map(svc => (
              <div
                key={svc.id}
                className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden"
              >
                {/* Image */}
                {svc.image_url ? (
                  <div className="relative h-32 overflow-hidden">
                    <Image src={svc.image_url} alt={svc.name} fill className="object-cover" unoptimized />
                  </div>
                ) : svc.rate_card_url ? (
                  <div className="h-32 flex items-center justify-center bg-[var(--dark-600)]">
                    {svc.file_type === "pdf" ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">📄</span>
                        <span className="text-[10px] text-[var(--gold)] uppercase tracking-wide">Rate Card PDF</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image src={svc.rate_card_url} alt="Rate card" fill className="object-contain p-2" unoptimized />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-[var(--dark-600)]">
                    <span className="text-3xl">✂️</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-cormorant text-base text-[#F0E8D8]">{svc.name}</p>
                      {svc.category && (
                        <span className="text-[9px] text-[var(--gold)] tracking-[0.2em] uppercase">{svc.category}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(svc)} className="text-[rgba(240,232,216,0.4)] hover:text-[var(--gold)] transition-colors">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => remove(svc.id)} className="text-[rgba(240,232,216,0.4)] hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {svc.starting_price ? (
                    <p className="font-jost font-bold text-[var(--gold)] mt-1">{formatPrice(svc.starting_price)}+</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
