"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Star } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StarRating } from "@/components/ui/StarRating";
import toast from "react-hot-toast";
import type { Review } from "@/types";

const EMPTY: Partial<Review> = {
  customer_name: "", rating: 5, review_text: "",
  service: "", is_active: true, sort_order: 0,
};

export default function ReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [form,     setForm]     = useState<Partial<Review>>(EMPTY);
  const [editing,  setEditing]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/reviews");
    const d = await r.json();
    if (Array.isArray(d)) setReviews(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.customer_name || !form.review_text) return toast.error("Name & review text required");
    setSaving(true);
    const method = editing ? "PUT" : "POST";
    const body   = editing ? { ...form, id: editing } : form;
    const r = await fetch("/api/reviews", {
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
    if (!confirm("Delete this review?")) return;
    await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Deleted");
    load();
  }

  function startEdit(r: Review) { setForm(r); setEditing(r.id); setShowForm(true); }

  const inputStyle = { background: "rgba(255,255,255,0.05)", color: "#F0E8D8" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Reviews Management</h2>
          <button
            onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(!showForm); }}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.15em]"
          >
            <Plus size={14} /> {showForm ? "Cancel" : "Add Review"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.15)] p-6 space-y-4">
            <h3 className="font-cormorant text-lg text-[var(--gold-light)]">
              {editing ? "Edit Review" : "New Review"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Customer Name *"
                value={form.customer_name || ""}
                onChange={e => setForm({ ...form, customer_name: e.target.value })}
                className="input-luxury"
                style={inputStyle}
              />
              <input
                placeholder="Service (e.g. Keratin Treatment)"
                value={form.service || ""}
                onChange={e => setForm({ ...form, service: e.target.value })}
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

            {/* Star selector */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] mb-2">Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      fill={n <= (form.rating || 0) ? "var(--gold)" : "none"}
                      className={n <= (form.rating || 0) ? "text-[var(--gold)]" : "text-[rgba(191,160,106,0.3)]"}
                    />
                  </button>
                ))}
                <span className="text-sm text-[rgba(240,232,216,0.5)] ml-2">{form.rating}/5</span>
              </div>
            </div>

            {/* Review text */}
            <textarea
              placeholder="Review text *"
              value={form.review_text || ""}
              onChange={e => setForm({ ...form, review_text: e.target.value })}
              rows={3}
              className="input-luxury w-full"
              style={{ ...inputStyle, paddingTop: "0.8rem" }}
            />

            <button
              onClick={save}
              disabled={saving}
              className="btn-gold px-6 py-3 rounded-xl text-[11px] tracking-[0.15em]"
            >
              {saving ? "Saving…" : editing ? "Update Review" : "Add Review"}
            </button>
          </div>
        )}

        {/* Review cards */}
        {loading ? (
          <LoadingSpinner />
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-[rgba(240,232,216,0.3)] text-sm">No reviews yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <StarRating rating={rev.rating} />
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(rev)} className="text-[rgba(240,232,216,0.4)] hover:text-[var(--gold)]">
                      <Edit size={13} />
                    </button>
                    <button onClick={() => remove(rev.id)} className="text-[rgba(240,232,216,0.4)] hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p className="font-cormorant italic text-[rgba(240,232,216,0.7)] text-sm leading-relaxed mb-3">
                  "{rev.review_text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--gold-dark)] to-[var(--gold-light)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {rev.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0E8D8]">{rev.customer_name}</p>
                    {rev.service && (
                      <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--gold)]">{rev.service}</p>
                    )}
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
