"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  label?: string;
  /** Show PDF embed preview instead of just a badge */
  previewPdf?: boolean;
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
      const formData = new FormData();
      formData.append("file",   file);
      formData.append("bucket", bucket);
      formData.append("folder", folder);

      const res  = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
      toast.success("Uploaded successfully ✓");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-[rgba(191,160,106,0.2)] group bg-[var(--cream-100)]">
          {isPdf ? (
            previewPdf ? (
              // Full PDF embed preview
              <div className="relative h-48" onContextMenu={e => e.preventDefault()}>
                <div className="absolute inset-0 z-10 pointer-events-none" />
                <object
                  data={`${value.split("#")[0]}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  type="application/pdf"
                  className="w-full h-full border-0"
                  style={{ pointerEvents: "none" }}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <FileText size={28} className="text-[var(--gold)]" />
                    <span className="text-xs text-[var(--gold)] font-semibold">PDF Uploaded</span>
                  </div>
                </object>
              </div>
            ) : (
              // Simple PDF badge
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(191,160,106,0.1)] flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-[var(--gold-dark)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1C1710] truncate">{value.split("/").pop()}</p>
                  <p className="text-[10px] text-[#8C7A5E]/60 mt-0.5">PDF uploaded</p>
                </div>
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              </div>
            )
          ) : (
            // Image preview
            <div className="relative h-40 w-full">
              <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-red-50 border border-red-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            aria-label="Remove"
          >
            <X size={13} className="text-red-500" />
          </button>
        </div>
      )}

      {/* Drop zone / upload button */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`
          w-full flex flex-col items-center justify-center gap-2
          border-2 border-dashed rounded-xl px-4 py-5 cursor-pointer
          transition-all duration-200
          ${dragging
            ? "border-[var(--gold)] bg-[rgba(191,160,106,0.07)] scale-[1.01]"
            : "border-[rgba(191,160,106,0.25)] hover:border-[rgba(191,160,106,0.5)] hover:bg-[rgba(191,160,106,0.03)]"
          }
          ${uploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        {uploading ? (
          <><Loader2 size={18} className="animate-spin text-[var(--gold)]" /><span className="text-xs text-[#8C7A5E]">Uploading…</span></>
        ) : (
          <><Upload size={16} className="text-[var(--gold-dark)]" /><span className="text-xs text-[#5A4E3C] font-medium">{label}</span><span className="text-[10px] text-[#8C7A5E]/50">or drag & drop</span></>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
