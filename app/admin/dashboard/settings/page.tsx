"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import toast from "react-hot-toast";
import { DEFAULT_CONFIG } from "@/lib/constants";
import type { SiteConfig } from "@/types";

interface ExtConfig extends SiteConfig { brand_font?:string; body_font?:string; }

const BRAND_FONTS=[
  {value:"Cinzel Decorative",label:"Cinzel Decorative",sample:"CYRA"},
  {value:"Cormorant Garamond",label:"Cormorant Garamond",sample:"CYRA"},
  {value:"Playfair Display",label:"Playfair Display",sample:"CYRA"},
  {value:"Marcellus",label:"Marcellus",sample:"CYRA"},
];
const BODY_FONTS=[
  {value:"Jost",label:"Jost (Default)",sample:"Salon & Academy"},
  {value:"DM Sans",label:"DM Sans",sample:"Salon & Academy"},
  {value:"Lato",label:"Lato",sample:"Salon & Academy"},
  {value:"Nunito",label:"Nunito",sample:"Salon & Academy"},
];

type Tab="general"|"opening"|"fonts"|"social";
const TABS:{ id:Tab;label:string }[]=[
  {id:"general",label:"General"},{id:"opening",label:"Opening"},
  {id:"fonts",label:"Fonts"},{id:"social",label:"Social"},
];

export default function SettingsPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [config,  setConfig]  = useState<ExtConfig>(DEFAULT_CONFIG as ExtConfig);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState<Tab>("general");

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json())
      .then(d=>{ if(d&&!d.error) setConfig({...DEFAULT_CONFIG,...d} as ExtConfig); })
      .finally(()=>setLoading(false));
  },[]);

  async function save() {
    if(!token) return toast.error("Not authenticated");
    setSaving(true);
    const r=await adminFetch("/api/settings",{method:"POST",body:config as unknown as Record<string,unknown>,token});
    const d=await r.json();
    if(d.error) toast.error(d.error);
    else toast.success("Settings saved!");
    setSaving(false);
  }

  function set(k:keyof ExtConfig,v:string){ setConfig(c=>({...c,[k]:v})); }

  const inp="admin-input";
  const lbl="block text-xs font-semibold text-[#374151] mb-1.5";

  if(authLoading||loading) return <AdminLayout><LoadingSpinner/></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#111827]">Site Settings</h2>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 btn-gold px-5 py-2.5 rounded-xl text-[11px] tracking-[0.14em]">
            {saving?<Loader2 size={13} className="animate-spin"/>:<Save size={13}/>}
            {saving?"Saving…":"Save All"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-[#E5E7EB]">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${tab===t.id?"border-[var(--gold)] text-[var(--gold-dark)]":"border-transparent text-[#6B7280] hover:text-[#374151]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">

          {tab==="general" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#111827] mb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([["salon_name","Salon Name"],["tagline","Tagline"],["phone","Phone"],["whatsapp","WhatsApp (no +)"],["email","Email","email"],["opening_hours","Opening Hours"]] as [keyof ExtConfig,string,string?][]).map(([k,l,t])=>(
                  <div key={k}><label className={lbl}>{l}</label>
                    <input type={t||"text"} value={(config[k] as string)||""} onChange={e=>set(k,e.target.value)} placeholder={l} className={inp}/></div>
                ))}
              </div>
              <div><label className={lbl}>Address</label>
                <textarea rows={2} value={config.address||""} onChange={e=>set("address",e.target.value)} className={`${inp} resize-none`}/></div>
            </div>
          )}

          {tab==="opening" && (
            <div className="space-y-5">
              <h3 className="font-semibold text-[#111827]">Opening Screen</h3>
              <p className="text-sm text-[#6B7280] -mt-2">The full-screen intro users see on first load.</p>
              <div><label className={lbl}>Background Image</label>
                <ImageUpload value={config.opening_bg_url} onChange={url=>set("opening_bg_url",url)} bucket="settings" folder="opening" label="Upload Background Photo"/></div>
              <div><label className={lbl}>Logo (leave empty for text logo)</label>
                <ImageUpload value={config.opening_logo_url} onChange={url=>set("opening_logo_url",url)} bucket="settings" folder="logo" label="Upload Logo (PNG transparent)"/></div>
              <div><label className={lbl}>Brand Name Text</label>
                <input value={config.salon_name||""} onChange={e=>set("salon_name",e.target.value)} className={inp}/></div>
            </div>
          )}

          {tab==="fonts" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-[#111827]">Typography</h3>
              <div>
                <label className={lbl}>Brand / Display Font</label>
                <p className="text-xs text-[#9CA3AF] mb-3">Used for "CYRA" and headings</p>
                <div className="grid grid-cols-2 gap-2">
                  {BRAND_FONTS.map(f=>(
                    <button key={f.value} type="button" onClick={()=>set("brand_font",f.value)}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${config.brand_font===f.value?"border-[var(--gold)] bg-[var(--gold-pale)]/20":"border-[#E5E7EB] hover:border-[rgba(191,160,106,0.4)]"}`}>
                      <span className="text-xl text-[#111827] mb-0.5" style={{fontFamily:`'${f.value}',serif`}}>{f.sample}</span>
                      <span className="text-[10px] text-[#9CA3AF]">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lbl}>Body / UI Font</label>
                <p className="text-xs text-[#9CA3AF] mb-3">Used for paragraphs and navigation</p>
                <div className="grid grid-cols-2 gap-2">
                  {BODY_FONTS.map(f=>(
                    <button key={f.value} type="button" onClick={()=>set("body_font",f.value)}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${config.body_font===f.value?"border-[var(--gold)] bg-[var(--gold-pale)]/20":"border-[#E5E7EB] hover:border-[rgba(191,160,106,0.4)]"}`}>
                      <span className="text-sm text-[#374151] mb-0.5" style={{fontFamily:`'${f.value}',sans-serif`}}>{f.sample}</span>
                      <span className="text-[10px] text-[#9CA3AF]">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[9px] tracking-widest uppercase text-[#9CA3AF] mb-2">Preview</p>
                <div className="text-2xl text-[var(--gold-dark)]" style={{fontFamily:config.brand_font?`'${config.brand_font}',serif`:undefined}}>
                  {config.salon_name?.split(" ")[0]?.toUpperCase()||"CYRA"}
                </div>
                <div className="text-xs text-[#6B7280] tracking-widest mt-1" style={{fontFamily:config.body_font?`'${config.body_font}',sans-serif`:undefined}}>
                  Salon &amp; Academy
                </div>
              </div>
            </div>
          )}

          {tab==="social" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#111827]">Social & Footer</h3>
              {([["instagram_url","Instagram URL"],["facebook_url","Facebook URL"],["footer_copyright","Footer Copyright"]] as [keyof ExtConfig,string][]).map(([k,l])=>(
                <div key={k}><label className={lbl}>{l}</label>
                  <input value={(config[k] as string)||""} onChange={e=>set(k,e.target.value)} placeholder={l} className={inp}/></div>
              ))}
            </div>
          )}
        </div>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 btn-gold px-8 py-3.5 rounded-xl text-[11px] tracking-[0.18em] w-full justify-center">
          {saving?<><Loader2 size={13} className="animate-spin"/>Saving…</>:<><Save size={13}/>Save All Settings</>}
        </button>
      </div>
    </AdminLayout>
  );
}
