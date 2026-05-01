"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Eye, EyeOff } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminFetch } from "@/lib/adminFetch";
import toast from "react-hot-toast";
import { DEFAULT_CONFIG } from "@/lib/constants";
import type { SiteConfig } from "@/types";
import { createClient } from "@/lib/supabase/client";

// ── Task 3: Change Password component ─────────────────────────────────────
function ChangePasswordTab() {
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew,   setShowNew]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [saving,    setSaving]    = useState(false);

  const inp = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm text-[#111827] bg-white focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[rgba(191,160,106,0.3)] transition-all";

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw new Error(error.message);
      toast.success("Password updated successfully");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-sm">
      <h3 className="font-semibold text-[#111827]">Change Password</h3>
      <p className="text-xs text-[#6B7280] -mt-2">Update your admin account password.</p>

      <form onSubmit={handleChangePassword} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5 tracking-wide uppercase">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              className={`${inp} pr-10`}
            />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[var(--gold-dark)] transition-colors">
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-[#374151] mb-1.5 tracking-wide uppercase">Confirm Password</label>
          <div className="relative">
            <input
              type={showConf ? "text" : "password"}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              required
              className={`${inp} pr-10`}
            />
            <button type="button" onClick={() => setShowConf(!showConf)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[var(--gold-dark)] transition-colors">
              {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {confirmPw && newPw !== confirmPw && (
            <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
          )}
          {confirmPw && newPw === confirmPw && newPw.length >= 6 && (
            <p className="text-[11px] text-green-600 mt-1">✓ Passwords match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || !newPw || !confirmPw}
          className="btn-gold px-5 py-2.5 rounded-lg text-[11.5px] tracking-[0.18em] flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <><Loader2 size={13} className="animate-spin" /> Updating…</> : "Update Password"}
        </button>
      </form>
    </div>
  );
}

interface ExtConfig extends SiteConfig {
  brand_font?: string;
  body_font?: string;
  navbar_logo_url?: string;
  form_logo_url?: string;
  footer_logo_url?: string;
  address2?: string;
}

const BRAND_FONTS=[
  {value:"Cinzel Decorative",label:"Cinzel Decorative",sample:"CYRA"},
  {value:"Cormorant Garamond",label:"Cormorant Garamond",sample:"CYRA"},
  {value:"Playfair Display",label:"Playfair Display",sample:"CYRA"},
  {value:"Marcellus",label:"Marcellus",sample:"CYRA"},
];
const BODY_FONTS=[
  {value:"Jost",      label:"Jost (Default)", sample:"Salon & Academy"},
  {value:"Marcellus", label:"Marcellus",       sample:"Salon & Academy"},
  {value:"DM Sans",   label:"DM Sans",         sample:"Salon & Academy"},
  {value:"Lato",      label:"Lato",            sample:"Salon & Academy"},
  {value:"Nunito",    label:"Nunito",          sample:"Salon & Academy"},
];

const PLACEMENT_OPTIONS: { value: SiteConfig["logo_placement"]; label: string; desc: string }[] = [
  { value:"none",   label:"Text Only",      desc:"Show CYRA + Salon & Academy text everywhere (no logo)" },
  { value:"navbar", label:"Navbar Only",    desc:"Logo appears left of text in header only" },
  { value:"form",   label:"Form Only",      desc:"Logo appears above text in the form popup only" },
  { value:"both",   label:"Navbar + Form",  desc:"Logo appears in both navbar and form" },
];

type Tab="logo"|"general"|"opening"|"fonts"|"social"|"about"|"security";
const TABS:{ id:Tab;label:string }[]=[
  {id:"logo",     label:"🖼 Logo"},
  {id:"general",  label:"General"},
  {id:"opening",  label:"Opening"},
  {id:"fonts",    label:"Fonts"},
  {id:"social",   label:"Social"},
  {id:"about",    label:"About Us"},
  {id:"security", label:"🔒 Security"},
];

export default function SettingsPage() {
  const { token, loading:authLoading } = useAdminAuth();
  const [config,  setConfig]  = useState<ExtConfig>(DEFAULT_CONFIG as ExtConfig);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState<Tab>("logo");

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
    if(d.error) toast.error(d.error); else toast.success("Settings saved!");
    setSaving(false);
  }

  function set(k:keyof ExtConfig, v:string){ setConfig(c=>({...c,[k]:v})); }

  const inp="admin-input";
  const lbl="block text-xs font-semibold text-[#374151] mb-1.5";

  if(authLoading||loading) return <AdminLayout><LoadingSpinner/></AdminLayout>;

  const logoPlacement = config.logo_placement ?? "none";

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
        <div className="flex gap-0 border-b border-[#E5E7EB] overflow-x-auto">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                tab===t.id?"border-[var(--gold)] text-[var(--gold-dark)]":"border-transparent text-[#6B7280] hover:text-[#374151]"
              }`}>{t.label}</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">

          {/* ── LOGO TAB ── */}
          {tab==="logo" && (
            <div className="space-y-8">
              <h3 className="font-semibold text-[#111827]">Logo Settings</h3>
              <p className="text-xs text-[#6B7280] -mt-4">
                Upload separate logos for each section. If a section-specific logo is not set, it falls back to the <strong>Global Logo</strong>.
              </p>

              {/* Global / fallback logo */}
              <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div>
                  <label className={lbl}>Global Logo <span className="text-[#9CA3AF] font-normal">(fallback for all sections)</span></label>
                  <p className="text-xs text-[#9CA3AF] mb-2">Used wherever no section-specific logo is uploaded.</p>
                  <ImageUpload value={config.logo_url} onChange={url=>set("logo_url",url)}
                    bucket="settings" folder="logo" label="Upload Global Logo"/>
                </div>
                {config.logo_url && (
                  <div className="flex items-center gap-4">
                    <img src={config.logo_url} alt="Global" className="h-12 w-auto object-contain rounded" />
                    <button type="button" onClick={()=>set("logo_url","")} className="text-xs text-red-500 hover:text-red-600 underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Navbar logo */}
              <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div>
                  <label className={lbl}>Navbar Logo</label>
                  <p className="text-xs text-[#9CA3AF] mb-2">Shown in the top navigation bar.</p>
                  <ImageUpload value={(config as ExtConfig).navbar_logo_url||""} onChange={url=>set("navbar_logo_url" as keyof ExtConfig,url)}
                    bucket="settings" folder="logo" label="Upload Navbar Logo"/>
                </div>
                {(config as ExtConfig).navbar_logo_url && (
                  <div className="flex items-center gap-4">
                    <img src={(config as ExtConfig).navbar_logo_url} alt="Navbar" className="h-9 w-auto object-contain rounded" />
                    <button type="button" onClick={()=>set("navbar_logo_url" as keyof ExtConfig,"")} className="text-xs text-red-500 hover:text-red-600 underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Form logo */}
              <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div>
                  <label className={lbl}>Form Logo</label>
                  <p className="text-xs text-[#9CA3AF] mb-2">Shown at the top of the lead capture form popup.</p>
                  <ImageUpload value={(config as ExtConfig).form_logo_url||""} onChange={url=>set("form_logo_url" as keyof ExtConfig,url)}
                    bucket="settings" folder="logo" label="Upload Form Logo"/>
                </div>
                {(config as ExtConfig).form_logo_url && (
                  <div className="flex items-center gap-4">
                    <img src={(config as ExtConfig).form_logo_url} alt="Form" className="h-16 w-auto object-contain rounded" />
                    <button type="button" onClick={()=>set("form_logo_url" as keyof ExtConfig,"")} className="text-xs text-red-500 hover:text-red-600 underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Footer logo */}
              <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
                <div>
                  <label className={lbl}>Footer Logo</label>
                  <p className="text-xs text-[#9CA3AF] mb-2">Shown in the footer brand column.</p>
                  <ImageUpload value={(config as ExtConfig).footer_logo_url||""} onChange={url=>set("footer_logo_url" as keyof ExtConfig,url)}
                    bucket="settings" folder="logo" label="Upload Footer Logo"/>
                </div>
                {(config as ExtConfig).footer_logo_url && (
                  <div className="flex items-center gap-4">
                    <img src={(config as ExtConfig).footer_logo_url} alt="Footer" className="h-14 w-auto object-contain rounded" />
                    <button type="button" onClick={()=>set("footer_logo_url" as keyof ExtConfig,"")} className="text-xs text-red-500 hover:text-red-600 underline">Remove</button>
                  </div>
                )}
              </div>

              {/* Placement selector — still relevant for global logo */}
              <div>
                <label className={lbl}>Logo Placement <span className="text-[#9CA3AF] font-normal">(applies to Global Logo only)</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {PLACEMENT_OPTIONS.map(opt=>(
                    <button key={opt.value} type="button"
                      onClick={()=>set("logo_placement" as keyof ExtConfig, opt.value as string)}
                      className={`flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all ${
                        logoPlacement===opt.value
                          ?"border-[var(--gold)] bg-[rgba(191,160,106,0.06)]"
                          :"border-[#E5E7EB] hover:border-[rgba(191,160,106,0.4)]"
                      }`}>
                      <span className={`text-sm font-semibold mb-0.5 ${logoPlacement===opt.value?"text-[var(--gold-dark)]":"text-[#374151]"}`}>
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-[#9CA3AF] leading-snug">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── GENERAL ── */}
          {tab==="general" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#111827]">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([["salon_name","Salon Name"],["tagline","Tagline"],["phone","Phone"],["whatsapp","WhatsApp (no +)"],["email","Email","email"],["opening_hours","Opening Hours"]] as [keyof ExtConfig,string,string?][]).map(([k,l,t])=>(
                  <div key={k}><label className={lbl}>{l}</label>
                    <input type={t||"text"} value={(config[k] as string)||""} onChange={e=>set(k,e.target.value)} placeholder={l} className={inp}/></div>
                ))}
              </div>
              <div><label className={lbl}>Address <span className="text-[#9CA3AF] font-normal">(Location 1)</span></label>
                <textarea rows={2} value={config.address||""} onChange={e=>set("address",e.target.value)} className={`${inp} resize-none`}/></div>
              <div><label className={lbl}>Address 2 <span className="text-[#9CA3AF] font-normal">(Branch / Franchise — optional)</span></label>
                <textarea rows={2} value={(config as ExtConfig).address2||""} onChange={e=>set("address2" as keyof ExtConfig,e.target.value)} placeholder="Leave empty to hide in footer" className={`${inp} resize-none`}/></div>
            </div>
          )}

          {/* ── OPENING ── */}
          {tab==="opening" && (
            <div className="space-y-5">
              <h3 className="font-semibold text-[#111827]">Opening Screen</h3>
              <p className="text-sm text-[#6B7280] -mt-2">Full-screen intro on first load.</p>
              <div><label className={lbl}>Background Image</label>
                <ImageUpload value={config.opening_bg_url} onChange={url=>set("opening_bg_url",url)} bucket="settings" folder="opening" label="Upload Background Photo"/></div>
              <div><label className={lbl}>Opening Screen Logo (optional)</label>
                <p className="text-xs text-[#9CA3AF] mb-2">If empty, the Logo tab image will be used. Leave both empty for text only.</p>
                <ImageUpload value={config.opening_logo_url} onChange={url=>set("opening_logo_url",url)} bucket="settings" folder="logo" label="Upload Opening Logo"/></div>
              <div><label className={lbl}>Brand Name Text</label>
                <input value={config.salon_name||""} onChange={e=>set("salon_name",e.target.value)} className={inp}/></div>
            </div>
          )}

          {/* ── FONTS ── */}
          {tab==="fonts" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-[#111827]">Typography</h3>
              <div>
                <label className={lbl}>Brand / Display Font</label>
                <p className="text-xs text-[#9CA3AF] mb-3">Used for "CYRA" and headings</p>
                <div className="grid grid-cols-2 gap-2">
                  {BRAND_FONTS.map(f=>(
                    <button key={f.value} type="button" onClick={()=>set("brand_font" as keyof ExtConfig,f.value)}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${(config as ExtConfig).brand_font===f.value?"border-[var(--gold)] bg-[var(--gold-pale)]/20":"border-[#E5E7EB] hover:border-[rgba(191,160,106,0.4)]"}`}>
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
                    <button key={f.value} type="button" onClick={()=>set("body_font" as keyof ExtConfig,f.value)}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${(config as ExtConfig).body_font===f.value?"border-[var(--gold)] bg-[var(--gold-pale)]/20":"border-[#E5E7EB] hover:border-[rgba(191,160,106,0.4)]"}`}>
                      <span className="text-sm text-[#374151] mb-0.5" style={{fontFamily:`'${f.value}',sans-serif`}}>{f.sample}</span>
                      <span className="text-[10px] text-[#9CA3AF]">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ABOUT US ── */}
          {tab==="about" && (
            <div className="space-y-5">
              <h3 className="font-semibold text-[#111827]">About Us Section</h3>
              <p className="text-sm text-[#6B7280] -mt-2">This section appears between Packages and Rate Cards on the frontend.</p>
              <div>
                <label className={lbl}>About Text</label>
                <textarea
                  rows={6}
                  value={(config as ExtConfig).about_text||""}
                  onChange={e=>set("about_text" as keyof ExtConfig, e.target.value)}
                  placeholder="Write about your salon, your journey, your vision..."
                  className={`${inp} resize-none`}
                />
              </div>
              <div>
                <label className={lbl}>About Image (Passport / Portrait size)</label>
                <p className="text-xs text-[#9CA3AF] mb-2">Upload a passport-size or portrait photo. Recommended ratio: 5:6</p>
                <ImageUpload
                  value={(config as ExtConfig).about_image_url||""}
                  onChange={url=>set("about_image_url" as keyof ExtConfig, url)}
                  bucket="settings" folder="about" label="Upload About Image"
                />
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab==="security" && <ChangePasswordTab />}

          {/* ── SOCIAL ── */}
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
