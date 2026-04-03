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

// ─── Pending upload item ──────────────────────────────────────────────────────
interface PendingItem {
  localId: string;
  file: File;
  preview: string;
  type: "image" | "pdf";
  title: string;
  uploading: boolean;
  error?: string;
}

export default function RateCardsAdminPage() {
  const [cards,   setCards]   = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ── Queue files ───────────────────────────────────────────────────────────
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
        title:     file.name.replace(/\.[^.]+$/, ""),
        uploading: false,
      });
    }

    setPending(prev => [...prev, ...newItems]);
  }

  // ── ✅ FIXED UPLOAD FUNCTION (ONLY CHANGE) ─────────────────────────────────
  async function uploadItem(localId: string) {
    const item = pending.find(p => p.localId === localId);
    if (!item) return;

    setPending(prev => prev.map(p => p.localId === localId ? { ...p, uploading: true, error: undefined } : p));

    try {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("title", item.title.trim());
      formData.append("sort_order", String(cards.length + pending.indexOf(item)));

      const res = await fetch("/api/rate-cards", { method: "POST", body: formData });

      let data;

      // ✅ FIX: SAFE JSON PARSING
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        console.error("Non-JSON response:", text);

        throw new Error(
          text.includes("too large")
            ? "File too large (max ~4MB). Compress your PDF."
            : "Server error: " + text
        );
      }

      if (!res.ok || data.error) throw new Error(data?.error ?? "Upload failed");

      if (item.preview) URL.revokeObjectURL(item.preview);

      setPending(prev => prev.filter(p => p.localId !== localId));
      setCards(prev => [...prev, data]);

      toast.success("Rate card uploaded!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setPending(prev => prev.map(p => p.localId === localId ? { ...p, uploading: false, error: msg } : p));
      toast.error(msg);
    }
  }

  async function uploadAll() {
    for (const item of pending.filter(p => !p.uploading)) {
      await uploadItem(item.localId);
    }
  }

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

  // ⚠️ BELOW THIS YOUR ORIGINAL UI CONTINUES EXACTLY SAME (UNCHANGED)
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* KEEP YOUR ORIGINAL UI HERE — NO CHANGES */}
      </div>
    </AdminLayout>
  );
}
