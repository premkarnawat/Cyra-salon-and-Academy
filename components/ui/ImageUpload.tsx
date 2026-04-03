"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  label?: string;
  previewPdf?: boolean;
}

/** Gets the current Supabase access_token from the client session */
async function getToken(): Promise<string | null> {
  try {
    const sb = createClient();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token ?? null;
  } catch { return null; }
}

export function ImageUpload({
  value,
  onChange,
  bucket = "media",
  folder = "",
  accept = "image/*",
  label = "Upload Image",
  previewPdf = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging,  setDragging]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPdf = value?.toLowerCase().endsWith(".pdf") ?? false;

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const token   = await getToken();
      const formData = new FormData();
      formData.append("file",   file);
      formData.append("bucket", bucket);
      formData.append("folder", folder);

      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res  = await fetch("/api/admin/upload", { method: "POST", headers, body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
      toast.success("Uploaded ✓");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-[rgba(191,160,106,0.2)] group bg-[#FDFAF4]">
          {isPdf ? (
            previewPdf ? (
              <div className="relative h-44" onContextMenu={e => e.preventDefault()}>
                <div className="absolute inset-0 z-10 pointer-events-none" />
                <object data={`${value.split("#")[0]}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  type="application/pdf" className="w-full h-full border-0" style={{ pointerEvents:"none" }}>
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <FileText size={26} className="text-[var(--gold)]" />
                    <span className="text-xs text-[var(--gold)] font-semibold">PDF Uploaded</span>
                  </div>
                </object>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(191,160,106,0.1)] flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-[var(--gold-dark)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1C1710] truncate">{value.split("/").pop()}</p>
                  <p className="text-[10px] text-[#6B7280] mt-0.5">PDF uploaded</p>
                </div>
                <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
              </div>
            )
          ) : (
            <div className="relative h-36 w-full">
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}
          <button type="button" onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-white hover:bg-red-50 border border-red-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            aria-label="Remove">
            <X size={12} className="text-red-500" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          w-full flex flex-col items-center justify-center gap-1.5
          border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer
          transition-all duration-200
          ${dragging ? "border-[var(--gold)] bg-[rgba(191,160,106,0.06)]" : "border-[rgba(191,160,106,0.25)] hover:border-[rgba(191,160,106,0.5)] hover:bg-[rgba(191,160,106,0.03)]"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        {uploading
          ? <><Loader2 size={17} className="animate-spin text-[var(--gold)]" /><span className="text-xs text-[#6B7280]">Uploading…</span></>
          : <><Upload size={15} className="text-[var(--gold-dark)]" /><span className="text-xs text-[#374151] font-medium">{label}</span><span className="text-[10px] text-[#9CA3AF]">or drag & drop</span></>
        }
      </div>

      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value=""; }} />
    </div>
  );
}
