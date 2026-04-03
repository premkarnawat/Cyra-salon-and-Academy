"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Trash2, Loader2, FileText,
  GripVertical, Edit2, Check, X as XIcon,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import type { RateCard } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fileType(file: File): "image" | "pdf" {
  return file.type === "application/pdf" ? "pdf" : "image";
}

const ALLOWED_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const ALLOWED_EXT    = ["jpg", "jpeg", "png", "webp", "pdf"];

// ─── Pending upload item (before it's sent to server) ────────────────────────
interface PendingItem {
  localId: string;
  file: File;
  preview: string;          // object URL for images; empty for PDFs
  type: "image" | "pdf";
  title: string;
  uploading: boolean;
  error?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RateCardsAdminPage() {
  const [cards,   setCards]   = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Inline-edit state ──────────────────────────────────────────────────────
  const [editId,    setEditId]    = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // ── Load existing rate cards ───────────────────────────────────────────────
  async function load() {
    setLoading(true);
    const r = await fetch("/api/rate-cards");
    const d = await r.json();
    if (Array.isArray(d)) setCards(d);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // ── File validation ────────────────────────────────────────────────────────
  function validateFile(file: File): string | null {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) return `"${file.name}" — only JPG, PNG, WebP, PDF allowed`;
    if (file.size > 20 * 1024 * 1024) return `"${file.name}" — max file size is 20 MB`;
    return null;
  }

  // ── Queue files for upload ─────────────────────────────────────────────────
  function queueFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const newItems: PendingItem[] = [];

    for (const file of arr) {
      const err = validateFile(file);
      if (err) { toast.error(err); continue; }
      const type    = fileType(file);
      const preview = type === "image" ? URL.createObjectURL(file) : "";
      newItems.push({
        localId:   crypto.randomUUID(),
        file,
        preview,
        type,
        title:     file.name.replace(/\.[^.]+$/, ""), // default = filename without ext
        uploading: false,
      });
    }

    setPending(prev => [...prev, ...newItems]);
  }

  // ── Upload a single pending item ───────────────────────────────────────────
  async function uploadItem(localId: string) {
    const item = pending.find(p => p.localId === localId);
    if (!item) return;

    setPending(prev => prev.map(p => p.localId === localId ? { ...p, uploading: true, error: undefined } : p));

    try {
      const formData = new FormData();
      formData.append("file",       item.file);
      formData.append("title",      item.title.trim());
      formData.append("sort_order", String(cards.length + pending.indexOf(item)));

      const res  = await fetch("/api/rate-cards", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");

      // Revoke object URL
      if (item.preview) URL.revokeObjectURL(item.preview);

      // Remove from pending, add to cards
      setPending(prev => prev.filter(p => p.localId !== localId));
      setCards(prev => [...prev, data]);
      toast.success("Rate card uploaded!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setPending(prev => prev.map(p => p.localId === localId ? { ...p, uploading: false, error: msg } : p));
      toast.error(msg);
    }
  }

  // ── Upload all pending at once ─────────────────────────────────────────────
  async function uploadAll() {
    for (const item of pending.filter(p => !p.uploading)) {
      await uploadItem(item.localId);
    }
  }

  // ── Remove a pending item (not yet uploaded) ───────────────────────────────
  function removePending(localId: string) {
    setPending(prev => {
      const item = prev.find(p => p.localId === localId);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(p => p.localId !== localId);
    });
  }

  // ── Delete saved card from DB + storage ───────────────────────────────────
  async function deleteCard(id: string) {
    if (!confirm("Delete this rate card? This cannot be undone.")) return;
    const res  = await fetch("/api/rate-cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.error) return toast.error(data.error);
    toast.success("Deleted");
    setCards(prev => prev.filter(c => c.id !== id));
  }

  // ── Inline title edit ──────────────────────────────────────────────────────
  async function saveTitle(card: RateCard) {
    if (editTitle.trim() === (card.title ?? "")) { setEditId(null); return; }
    const res  = await fetch("/api/rate-cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: card.id, title: editTitle.trim() }),
    });
    const data = await res.json();
    if (data.error) return toast.error(data.error);
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, title: editTitle.trim() } : c));
    setEditId(null);
    toast.success("Title updated");
  }

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function onDragLeave()                  { setDragging(false); }
  function onDrop(e: React.DragEvent)     {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) queueFiles(e.dataTransfer.files);
  }

  const inputStyle: React.CSSProperties = { background: "rgba(255,255,255,0.05)", color: "#F0E8D8" };

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* ── Page header ── */}
        <div>
          <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Rate Card Manager</h2>
          <p className="text-xs text-[rgba(240,232,216,0.4)] mt-1 leading-relaxed">
            Upload your designed rate card posters (JPG, PNG, WebP or PDF).
            Each upload becomes one poster card on the website.
          </p>
        </div>

        {/* ── Drop zone ── */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center
            min-h-[160px] rounded-2xl cursor-pointer
            border-2 border-dashed transition-all duration-250
            ${dragging
              ? "border-[var(--gold)] bg-[rgba(191,160,106,0.08)] scale-[1.01]"
              : "border-[rgba(191,160,106,0.25)] hover:border-[rgba(191,160,106,0.5)] hover:bg-[rgba(191,160,106,0.04)]"
            }
          `}
        >
          <Upload size={28} className="text-[var(--gold)] opacity-60 mb-3" />
          <p className="font-jost text-sm text-[rgba(240,232,216,0.6)]">
            {dragging ? "Drop files here" : "Click or drag & drop files here"}
          </p>
          <p className="font-jost text-[11px] text-[rgba(240,232,216,0.3)] mt-1.5 tracking-wide">
            JPG · PNG · WebP · PDF · Max 20 MB each · Multiple files supported
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_ACCEPT}
            multiple
            className="hidden"
            onChange={e => { if (e.target.files) queueFiles(e.target.files); e.target.value = ""; }}
          />
        </div>

        {/* ── Pending queue ── */}
        <AnimatePresence>
          {pending.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-cormorant text-lg text-[var(--gold-light)]">
                  Ready to upload ({pending.length})
                </h3>
                <button
                  onClick={uploadAll}
                  className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] tracking-[0.15em]"
                >
                  <Upload size={13} /> Upload All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map(item => (
                  <motion.div
                    key={item.localId}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.12)] overflow-hidden"
                  >
                    {/* Preview */}
                    <div className="relative bg-[var(--dark-600)]" style={{ aspectRatio: "3/4" }}>
                      {item.type === "image" && item.preview ? (
                        <Image src={item.preview} alt={item.title} fill className="object-contain p-2" unoptimized />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <FileText size={32} className="text-[var(--gold)] opacity-50" />
                          <span className="font-jost text-xs text-[rgba(240,232,216,0.4)] tracking-wide">PDF</span>
                        </div>
                      )}
                      {item.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 size={24} className="text-[var(--gold)] animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="p-3 space-y-2">
                      <input
                        value={item.title}
                        onChange={e => setPending(prev => prev.map(p => p.localId === item.localId ? { ...p, title: e.target.value } : p))}
                        placeholder="Optional title / caption"
                        className="input-luxury text-sm w-full"
                        style={inputStyle}
                      />
                      {item.error && (
                        <p className="text-[11px] text-red-400 font-jost">{item.error}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => uploadItem(item.localId)}
                          disabled={item.uploading}
                          className="flex-1 flex items-center justify-center gap-1.5 btn-gold py-2 rounded-lg text-[11px] tracking-[0.12em] disabled:opacity-50"
                        >
                          {item.uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          Upload
                        </button>
                        <button
                          onClick={() => removePending(item.localId)}
                          disabled={item.uploading}
                          className="w-9 h-9 rounded-lg border border-[rgba(239,68,68,0.3)] text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors disabled:opacity-40"
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Saved cards ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-cormorant text-xl text-[#F0E8D8]">
              Published Cards
              <span className="ml-2 font-jost text-sm font-normal text-[rgba(240,232,216,0.3)]">
                ({cards.length})
              </span>
            </h3>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : cards.length === 0 ? (
            <div className="text-center py-14 text-[rgba(240,232,216,0.25)] text-sm font-jost">
              No rate cards yet — upload your first one above
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cards.map(card => (
                <motion.div
                  key={card.id}
                  layout
                  className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.1)] overflow-hidden group"
                >
                  {/* Preview */}
                  <div
                    className="relative bg-[var(--dark-600)]"
                    style={{ aspectRatio: "3/4" }}
                    onContextMenu={e => e.preventDefault()}
                  >
                    {card.file_type === "pdf" ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 pointer-events-none">
                        <FileText size={30} className="text-[var(--gold)] opacity-40" />
                        <span className="font-jost text-[10px] text-[rgba(240,232,216,0.3)] tracking-widest uppercase">PDF</span>
                      </div>
                    ) : (
                      <Image
                        src={card.file_url}
                        alt={card.title || "Rate card"}
                        fill
                        className="object-contain p-2"
                        unoptimized
                        draggable={false}
                      />
                    )}

                    {/* Delete overlay */}
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="
                        absolute top-2 right-2
                        w-8 h-8 rounded-full
                        bg-red-500/80 hover:bg-red-500
                        flex items-center justify-center text-white
                        opacity-0 group-hover:opacity-100 transition-all
                        shadow-lg
                      "
                      aria-label="Delete"
                    >
                      <Trash2 size={13} />
                    </button>

                    {/* File type badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                      <span className="font-jost text-[9px] uppercase tracking-widest text-[rgba(255,255,255,0.5)]">
                        {card.file_type}
                      </span>
                    </div>
                  </div>

                  {/* Title with inline edit */}
                  <div className="px-3 py-3">
                    {editId === card.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveTitle(card); if (e.key === "Escape") setEditId(null); }}
                          className="flex-1 text-xs bg-[rgba(255,255,255,0.07)] text-[#F0E8D8] rounded-lg px-2 py-1.5 border border-[rgba(191,160,106,0.3)] outline-none"
                        />
                        <button onClick={() => saveTitle(card)} className="text-[var(--gold)] hover:text-[var(--gold-light)]"><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} className="text-[rgba(240,232,216,0.4)] hover:text-red-400"><XIcon size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-cormorant text-sm text-[rgba(240,232,216,0.7)] truncate flex-1">
                          {card.title || <span className="italic opacity-40">No title</span>}
                        </p>
                        <button
                          onClick={() => { setEditId(card.id); setEditTitle(card.title ?? ""); }}
                          className="text-[rgba(240,232,216,0.3)] hover:text-[var(--gold)] transition-colors flex-shrink-0"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
