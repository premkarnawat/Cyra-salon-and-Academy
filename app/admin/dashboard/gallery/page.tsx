"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import type { GalleryItem } from "@/types";

const EMPTY: Partial<GalleryItem> = {
  title: "", media_url: "", media_type: "image",
  thumbnail_url: "", sort_order: 0, is_active: true,
};

export default function GalleryPage() {
  const [items,    setItems]    = useState<GalleryItem[]>([]);
  const [form,     setForm]     = useState<Partial<GalleryItem>>(EMPTY);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/gallery");
    const d = await r.json();
    if (Array.isArray(d)) setItems(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.media_url) return toast.error("Please upload media");
    setSaving(true);
    const r = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (d.error) toast.error(d.error);
    else { toast.success("Added to gallery!"); setForm(EMPTY); setShowForm(false); load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Remove from gallery?")) return;
    await fetch("/api/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Removed");
    load();
  }

  const inputStyle = { background: "rgba(255,255,255,0.05)", color: "#F0E8D8" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Gallery</h2>
            <p className="text-xs text-[rgba(240,232,216,0.35)] mt-1">
              Upload images and videos — they appear in the public gallery
            </p>
          </div>
          <button
            onClick={() => { setForm(EMPTY); setShowForm(!showForm); }}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.15em]"
          >
            <Plus size={14} /> {showForm ? "Cancel" : "Add Media"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.15)] p-6 space-y-4">
            <h3 className="font-cormorant text-lg text-[var(--gold-light)]">Add Gallery Item</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Title (optional)"
                value={form.title || ""}
                onChange={e => setForm({ ...form, title: e.target.value })}
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
            </div>

            {/* Media type selector */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] mb-2">Media Type</p>
              <div className="flex gap-4">
                {(["image", "video"] as const).map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="media_type"
                      value={t}
                      checked={form.media_type === t}
                      onChange={() => setForm({ ...form, media_type: t })}
                      className="accent-[var(--gold)]"
                    />
                    <span className="text-xs text-[rgba(240,232,216,0.6)] capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <ImageUpload
              value={form.media_url}
              onChange={url => setForm({ ...form, media_url: url })}
              bucket="gallery"
              folder="gallery"
              accept={form.media_type === "video" ? "video/mp4,video/mov,video/*" : "image/*"}
              label={`Upload ${form.media_type === "video" ? "Video (MP4/MOV)" : "Image (JPG/PNG/WebP)"}`}
            />

            {form.media_type === "video" && (
              <ImageUpload
                value={form.thumbnail_url}
                onChange={url => setForm({ ...form, thumbnail_url: url })}
                bucket="gallery"
                folder="thumbnails"
                label="Upload Video Thumbnail (optional)"
              />
            )}

            <button
              onClick={save}
              disabled={saving}
              className="btn-gold px-6 py-3 rounded-xl text-[11px] tracking-[0.15em]"
            >
              {saving ? "Uploading…" : "Add to Gallery"}
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map(item => (
              <div
                key={item.id}
                className="relative group rounded-xl overflow-hidden border border-[rgba(191,160,106,0.1)] aspect-square bg-[var(--dark-700)]"
              >
                {item.media_type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--dark-600)]">
                    {item.thumbnail_url ? (
                      <Image src={item.thumbnail_url} alt={item.title || "video"} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl">🎬</span>
                        <span className="text-[10px] text-[var(--gold)]">Video</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                        <span className="text-white text-sm ml-0.5">▶</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.media_url}
                    alt={item.title || "gallery"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}

                {/* Title overlay */}
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-4">
                    <p className="text-[10px] text-[var(--gold-light)] truncate">{item.title}</p>
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {items.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-[rgba(240,232,216,0.3)] text-sm">
                No gallery items yet. Add some!
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
