"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, FileText, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import toast from "react-hot-toast";
import type { RateCard } from "@/types";

const ALLOWED = "image/jpeg,image/png,image/webp,application/pdf";

interface Pending {
  localId:string; file:File; preview:string;
  type:"image"|"pdf"; title:string; uploading:boolean; error?:string;
}

export default function RateCardsPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [cards,   setCards]   = useState<RateCard[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging,setDragging]= useState(false);
  const [editId,  setEditId]  = useState<string|null>(null);
  const [editTitle,setEditTitle]=useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if(!token) return; setLoading(true);
    const r=await adminFetch("/api/rate-cards",{token}); const d=await r.json();
    if(Array.isArray(d)) setCards(d); setLoading(false);
  }
  useEffect(()=>{ if(!authLoading&&token) load(); },[token,authLoading]);

  function queue(files:FileList|File[]) {
    Array.from(files).forEach(file=>{
      const ext=file.name.split(".").pop()?.toLowerCase()??"";
      if(!["jpg","jpeg","png","webp","pdf"].includes(ext)){ toast.error(`${file.name} — unsupported type`); return; }
      if(file.size>20*1024*1024){ toast.error(`${file.name} — max 20 MB`); return; }
      const type=ext==="pdf"?"pdf":"image";
      const preview=type==="image"?URL.createObjectURL(file):"";
      setPending(p=>[...p,{localId:crypto.randomUUID(),file,preview,type,title:file.name.replace(/\.[^.]+$/,""),uploading:false}]);
    });
  }

  async function uploadOne(localId:string) {
    const item=pending.find(p=>p.localId===localId); if(!item) return;
    setPending(p=>p.map(x=>x.localId===localId?{...x,uploading:true,error:undefined}:x));
    try {
      const fd=new FormData();
      fd.append("file",item.file);
      fd.append("title",item.title.trim());
      fd.append("sort_order",String(cards.length));
      const headers: HeadersInit = {};
      if (token) headers["Authorization"]=`Bearer ${token}`;
      const res=await fetch("/api/rate-cards",{method:"POST",headers,body:fd});
      const data=await res.json();
      if(!res.ok||data.error) throw new Error(data.error??"Upload failed");
      if(item.preview) URL.revokeObjectURL(item.preview);
      setPending(p=>p.filter(x=>x.localId!==localId));
      setCards(c=>[...c,data]);
      toast.success("Uploaded!");
    } catch(e:unknown) {
      const msg=e instanceof Error?e.message:"Upload failed";
      setPending(p=>p.map(x=>x.localId===localId?{...x,uploading:false,error:msg}:x));
      toast.error(msg);
    }
  }

  async function uploadAll() { for(const i of pending.filter(p=>!p.uploading)) await uploadOne(i.localId); }

  async function del(id:string) {
    if(!confirm("Delete this rate card?")) return;
    await adminFetch("/api/rate-cards",{method:"DELETE",body:{id},token});
    toast.success("Deleted"); setCards(c=>c.filter(x=>x.id!==id));
  }

  async function saveTitle(card:RateCard) {
    if(editTitle.trim()===(card.title??"")){ setEditId(null); return; }
    const r=await adminFetch("/api/rate-cards",{method:"PATCH",body:{id:card.id,title:editTitle.trim()},token});
    const d=await r.json();
    if(d.error) return toast.error(d.error);
    setCards(c=>c.map(x=>x.id===card.id?{...x,title:editTitle.trim()}:x));
    setEditId(null); toast.success("Updated");
  }

  return (
    <AdminLayout>
      <div className="space-y-7">
        <div>
          <h2 className="text-xl font-semibold text-[#111827]">Rate Cards</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Upload designed rate card posters — JPG, PNG, WebP or PDF</p>
        </div>

        {/* Drop zone */}
        <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}
          onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files.length) queue(e.dataTransfer.files);}}
          onClick={()=>fileRef.current?.click()}
          className={`flex flex-col items-center justify-center min-h-[140px] rounded-2xl cursor-pointer border-2 border-dashed transition-all ${dragging?"border-[var(--gold)] bg-[rgba(191,160,106,0.05)]":"border-[rgba(191,160,106,0.3)] hover:border-[rgba(191,160,106,0.55)] hover:bg-[rgba(191,160,106,0.02)]"}`}>
          <Upload size={24} className="text-[var(--gold-dark)] opacity-70 mb-2"/>
          <p className="text-sm font-medium text-[#374151]">{dragging?"Drop here":"Click or drag & drop"}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">JPG · PNG · WebP · PDF · Max 20 MB</p>
          <input ref={fileRef} type="file" accept={ALLOWED} multiple className="hidden" onChange={e=>{if(e.target.files) queue(e.target.files); e.target.value="";}}/>
        </div>

        {/* Pending queue */}
        <AnimatePresence>
          {pending.length>0 && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#111827]">Ready to Upload ({pending.length})</h3>
                <button onClick={uploadAll} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-xl text-xs tracking-[0.12em]"><Upload size={12}/>Upload All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map(item=>(
                  <div key={item.localId} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                    <div className="relative bg-[#F9FAFB]" style={{aspectRatio:"3/4"}}>
                      {item.type==="image"&&item.preview
                        ?<Image src={item.preview} alt={item.title} fill className="object-contain p-2" unoptimized/>
                        :<div className="flex flex-col items-center justify-center h-full gap-2"><FileText size={28} className="text-[var(--gold-dark)] opacity-50"/><span className="text-xs text-[#6B7280]">PDF</span></div>
                      }
                      {item.uploading&&<div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--gold)]"/></div>}
                    </div>
                    <div className="p-3 space-y-2">
                      <input value={item.title} onChange={e=>setPending(p=>p.map(x=>x.localId===item.localId?{...x,title:e.target.value}:x))}
                        placeholder="Caption (optional)" className="admin-input text-sm w-full"/>
                      {item.error&&<p className="text-xs text-red-500">{item.error}</p>}
                      <div className="flex gap-2">
                        <button onClick={()=>uploadOne(item.localId)} disabled={item.uploading}
                          className="flex-1 flex items-center justify-center gap-1.5 btn-gold py-2 rounded-lg text-xs tracking-[0.1em] disabled:opacity-50">
                          {item.uploading?<Loader2 size={11} className="animate-spin"/>:<Upload size={11}/>}Upload
                        </button>
                        <button onClick={()=>{if(item.preview) URL.revokeObjectURL(item.preview); setPending(p=>p.filter(x=>x.localId!==item.localId));}}
                          className="w-9 h-9 rounded-lg border border-[#E5E7EB] text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 flex items-center justify-center">
                          <X size={13}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Published cards */}
        <div>
          <h3 className="font-semibold text-[#111827] mb-4">Published ({cards.length})</h3>
          {(authLoading||loading) ? <LoadingSpinner/> : cards.length===0 ? (
            <div className="text-center py-12 text-[#9CA3AF] text-sm bg-white rounded-2xl border border-[#E5E7EB]">No rate cards yet</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cards.map(card=>(
                <div key={card.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden group">
                  <div className="relative bg-[#F9FAFB]" style={{aspectRatio:"3/4"}}>
                    {card.file_type==="pdf"
                      ?<div className="flex flex-col items-center justify-center h-full gap-1"><FileText size={24} className="text-[var(--gold-dark)] opacity-40"/><span className="text-[9px] text-[#9CA3AF] uppercase tracking-widest">PDF</span></div>
                      :<Image src={card.file_url} alt={card.title||"Rate card"} fill className="object-contain p-1.5" unoptimized/>
                    }
                    <button onClick={()=>del(card.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                  <div className="px-3 py-2.5">
                    {editId===card.id ? (
                      <div className="flex items-center gap-1">
                        <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter") saveTitle(card); if(e.key==="Escape") setEditId(null);}}
                          className="flex-1 text-xs border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[#374151] outline-none focus:border-[var(--gold)]"/>
                        <button onClick={()=>saveTitle(card)} className="text-green-500 hover:text-green-600"><Check size={13}/></button>
                        <button onClick={()=>setEditId(null)} className="text-[#9CA3AF] hover:text-red-500"><X size={13}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-[#374151] truncate flex-1">{card.title||<span className="text-[#9CA3AF] italic">No title</span>}</p>
                        <button onClick={()=>{setEditId(card.id);setEditTitle(card.title??"");}} className="text-[#D1D5DB] hover:text-[var(--gold-dark)] flex-shrink-0"><Edit2 size={11}/></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
