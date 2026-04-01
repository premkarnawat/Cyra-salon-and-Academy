"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "media",
  folder = "",
  accept = "image/*",
  label = "Upload Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onChange(data.url);
      toast.success("Uploaded successfully");
    } catch (e: unknown) {
      toast.error(String(e));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-[var(--border-light)] group">
          {value.endsWith(".pdf") ? (
            <div className="flex items-center gap-3 p-4 bg-[var(--cream-100)] dark:bg-[var(--dark-600)]">
              <span className="text-[var(--gold)] font-semibold text-sm">PDF</span>
              <span className="text-xs text-gray-500 truncate">{value.split("/").pop()}</span>
            </div>
          ) : (
            <div className="relative h-40 w-full">
              <Image src={value} alt="Preview" fill className="object-cover" />
            </div>
          )}
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-[var(--border-light)] rounded-xl p-4 text-sm text-[var(--gold)] hover:bg-[var(--gold-pale)]/20 transition-colors"
      >
        {uploading ? (
          <><Loader2 size={16} className="animate-spin" /> Uploading…</>
        ) : (
          <><Upload size={16} /> {label}</>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
