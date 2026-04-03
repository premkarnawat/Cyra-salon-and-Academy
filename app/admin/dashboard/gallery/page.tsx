"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import toast from "react-hot-toast";
import type { GalleryItem } from "@/types";

const EMPTY:Partial<GalleryItem>={title:"",media_url:"",media_type:"image",sort_order:0,is_active:true};

export default function GalleryPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [items,   setItems]   = useState<GalleryItem[]>([]);
  const [form,    setForm]    = useState<Partial<GalleryItem>>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showForm,setShowForm]= useState(false);

  async function load() {
    if(!token) return; setLoading(true);
    const r=await adminFetch("/api/gallery",{token}); const d=await r.json();
    if(Array.isArray(d)) setItems(d); setLoading(false);
  }
  useEffect(()=>{ if(!authLoading&&token) load(); },[token,authLoading]);

  async function save() {
    if(!form.media_url) return toast.error("Please upload media first");
    setSaving(true);
    const r=await adminFetch("/api/gallery",{method:"POST",body:form as Record<string,unknown>,token});
    const d=await r.json();
    if(d.error) toast.error(d.error);
    else{toast.success("Added!"); setForm(EMPTY); setShowForm(false); load();}
    setSaving(false);
  }

  async function del(id:string) {
    if(!confirm("Remove from gallery?")) return;
    await adminFetch("/api/gallery",{method:"DELETE",body:{id},token});
    toast.success("Removed"); setItems(i=>i.filter(x=>x.id!==id));
  }

  const inp="admin-input";

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Gallery</h2>
            <p className="text-sm text-[#6B7280]">Upload images and videos for the public gallery</p>
          </div>
          <button onClick={()=>{setForm(EMPTY);setShowForm(!showForm);}}
            className="flex items-center gap-2 btn-gold px-4 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
            <Plus size={14}/> {showForm?"Cancel":"Add Media"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-[#111827]">Add Gallery Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Title (optional)" value={form.title||""} onChange={e=>setForm({...form,title:e.target.value})} className={inp}/>
              <input type="number" placeholder="Sort Order" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:+e.target.value})} className={inp}/>
            </div>
            <div className="flex gap-4 mb-2">
              {(["image","video"] as const).map(t=>(
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-[#374151]">
                  <input type="radio" name="media_type" value={t} checked={form.media_type===t} onChange={()=>setForm({...form,media_type:t})} className="accent-[var(--gold)]"/>
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
            <ImageUpload value={form.media_url} onChange={url=>setForm({...form,media_url:url})} bucket="gallery" folder="gallery"
              accept={form.media_type==="video"?"video/mp4,video/mov,video/*":"image/*"}
              label={`Upload ${form.media_type==="video"?"Video (MP4/MOV)":"Image (JPG/PNG/WebP)"}`}/>
            <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
              {saving?"Saving…":"Add to Gallery"}
            </button>
          </div>
        )}

        {(authLoading||loading) ? <LoadingSpinner/> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.map(item=>(
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] aspect-square bg-[#F9FAFB]">
                {item.media_type==="video"
                  ?<div className="flex items-center justify-center h-full"><span className="text-3xl">🎬</span></div>
                  :<Image src={item.media_url} alt={item.title||"gallery"} fill className="object-cover" unoptimized/>
                }
                <button onClick={()=>del(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={12}/>
                </button>
                {item.title&&<div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4"><p className="text-[10px] text-white truncate">{item.title}</p></div>}
              </div>
            ))}
            {items.length===0&&<div className="col-span-5 text-center py-12 text-[#9CA3AF] text-sm">No gallery items yet</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
