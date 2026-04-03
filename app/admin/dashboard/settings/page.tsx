"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { DEFAULT_CONFIG } from "@/lib/constants";
import type { SiteConfig } from "@/types";

// ── Font options ───────────────────────────────────────────────────────────────
const BRAND_FONTS = [
  { value: "Cinzel Decorative", label: "Cinzel Decorative", sample: "CYRA" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", sample: "CYRA" },
  { value: "Playfair Display", label: "Playfair Display", sample: "CYRA" },
  { value: "Marcellus", label: "Marcellus", sample: "CYRA" },
  { value: "Libre Baskerville", label: "Libre Baskerville", sample: "CYRA" },
];

const BODY_FONTS = [
  { value: "Jost", label: "Jost (Default)", sample: "Salon & Academy · Pune" },
  { value: "Marcellus", label: "Marcellus", sample: "Salon & Academy · Pune" },
  { value: "DM Sans", label: "DM Sans", sample: "Salon & Academy · Pune" },
  { value: "Lato", label: "Lato", sample: "Salon & Academy · Pune" },
  { value: "Nunito", label: "Nunito", sample: "Salon & Academy · Pune" },
];

// Extended SiteConfig with font fields
interface ExtendedConfig extends SiteConfig {
  brand_font?: string;
  body_font?: string;
}

type TabId = "general" | "opening" | "fonts" | "social";

const TABS: { id: TabId; label: string }[] = [
  { id: "general", label: "General"  },
  { id: "opening", label: "Opening"  },
  { id: "fonts",   label: "Fonts"    },
  { id: "social",  label: "Social"   },
];

const inputStyle = "admin-input";
const labelStyle = "block text-[9px] tracking-[0.25em] uppercase text-[var(--gold-dark)] font-semibold mb-1.5";

export default function SettingsPage() {
  const [config,  setConfig]  = useState<ExtendedConfig>(DEFAULT_CONFIG as ExtendedConfig);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState<TabId>("general");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { if (d && !d.error) setConfig({ ...DEFAULT_CONFIG, ...d } as ExtendedConfig); })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    const r = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const d = await r.json();
    if (d.error) toast.error(d.error);
    else {
      toast.success("Settings saved!");
      // Apply fonts immediately on the page for live preview
      applyFonts(config.brand_font, config.body_font);
    }
    setSaving(false);
  }

  function applyFonts(brand?: string, body?: string) {
    if (brand) document.documentElement.style.setProperty("--font-brand", `'${brand}', serif`);
    if (body)  document.documentElement.style.setProperty("--font-body",  `'${body}', sans-serif`);
  }

  function set(key: keyof ExtendedConfig, val: string) {
    setConfig(c => ({ ...c, [key]: val }));
  }

  const Field = ({ k, label, type = "text" }: { k: keyof ExtendedConfig; label: string; type?: string }) => (
    <div>
      <label className={labelStyle}>{label}</label>
      <input type={type} value={(config[k] as string) || ""} onChange={e => set(k, e.target.value)}
        placeholder={label} className={inputStyle} />
    </div>
  );

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-cormorant text-2xl text-[#1C1710]">Site Settings</h2>
            <p className="text-xs text-[#8C7A5E] mt-0.5">Changes apply immediately on save</p>
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 btn-gold px-5 py-2.5 rounded-xl text-[11px] tracking-[0.15em]">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[rgba(191,160,106,0.15)]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-[11px] tracking-[0.14em] uppercase border-b-2 -mb-px transition-all font-medium ${
                tab === t.id
                  ? "border-[var(--gold)] text-[var(--gold-dark)]"
                  : "border-transparent text-[#8C7A5E] hover:text-[#5A4E3C]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="admin-card">

          {/* ── GENERAL ── */}
          {tab === "general" && (
            <div className="space-y-4">
              <h3 className="font-cormorant text-lg text-[#1C1710]">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field k="salon_name"    label="Salon Name" />
                <Field k="tagline"       label="Tagline" />
                <Field k="phone"         label="Phone Number" />
                <Field k="whatsapp"      label="WhatsApp (country code, no +)" />
                <Field k="email"         label="Email Address" type="email" />
                <Field k="opening_hours" label="Opening Hours" />
              </div>
              <div>
                <label className={labelStyle}>Address</label>
                <textarea value={config.address || ""} onChange={e => set("address", e.target.value)}
                  placeholder="Full address" rows={2}
                  className="admin-input w-full resize-none" style={{ paddingTop:"0.7rem" }} />
              </div>
            </div>
          )}

          {/* ── OPENING SCREEN ── */}
          {tab === "opening" && (
            <div className="space-y-6">
              <h3 className="font-cormorant text-lg text-[#1C1710]">Opening Screen</h3>
              <p className="text-xs text-[#8C7A5E] -mt-2">The full-screen intro animation users see on first load.</p>

              <div>
                <label className={labelStyle}>Background Image</label>
                <ImageUpload value={config.opening_bg_url} onChange={url => set("opening_bg_url", url)}
                  bucket="settings" folder="opening" label="Upload Background Photo" />
              </div>

              <div>
                <label className={labelStyle}>Logo (optional — leave empty to use text)</label>
                <ImageUpload value={config.opening_logo_url} onChange={url => set("opening_logo_url", url)}
                  bucket="settings" folder="logo" label="Upload Logo (PNG, transparent)" />
              </div>

              <Field k="salon_name" label="Brand Name Text (shown if no logo)" />
            </div>
          )}

          {/* ── FONTS ── */}
          {tab === "fonts" && (
            <div className="space-y-7">
              <h3 className="font-cormorant text-lg text-[#1C1710]">Typography</h3>
              <p className="text-xs text-[#8C7A5E] -mt-3 leading-relaxed">
                Choose fonts for your brand name and body text. Changes apply site-wide after saving.
              </p>

              {/* Brand font */}
              <div>
                <label className={labelStyle}>Brand / Display Font</label>
                <p className="text-[10px] text-[#8C7A5E]/60 mb-3">Used for "CYRA" and all section headings</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BRAND_FONTS.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => set("brand_font", f.value)}
                      className={`
                        flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all
                        ${config.brand_font === f.value
                          ? "border-[var(--gold)] bg-[rgba(191,160,106,0.06)] shadow-[0_0_0_3px_rgba(191,160,106,0.12)]"
                          : "border-[rgba(191,160,106,0.15)] hover:border-[rgba(191,160,106,0.4)] bg-[#FDFAF4]"
                        }
                      `}
                    >
                      <span
                        className="text-2xl text-[#1C1710] mb-1"
                        style={{ fontFamily: `'${f.value}', serif` }}
                      >
                        {f.sample}
                      </span>
                      <span className="text-[10px] text-[#8C7A5E] font-jost tracking-wide">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Body font */}
              <div>
                <label className={labelStyle}>Body / UI Font</label>
                <p className="text-[10px] text-[#8C7A5E]/60 mb-3">Used for paragraphs, buttons, and navigation</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BODY_FONTS.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => set("body_font", f.value)}
                      className={`
                        flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all
                        ${config.body_font === f.value
                          ? "border-[var(--gold)] bg-[rgba(191,160,106,0.06)] shadow-[0_0_0_3px_rgba(191,160,106,0.12)]"
                          : "border-[rgba(191,160,106,0.15)] hover:border-[rgba(191,160,106,0.4)] bg-[#FDFAF4]"
                        }
                      `}
                    >
                      <span
                        className="text-sm text-[#1C1710] mb-1 leading-relaxed"
                        style={{ fontFamily: `'${f.value}', sans-serif` }}
                      >
                        {f.sample}
                      </span>
                      <span className="text-[10px] text-[#8C7A5E] font-jost tracking-wide">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              <div className="rounded-xl border border-[rgba(191,160,106,0.2)] bg-[#FDFAF4] p-5">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--gold-dark)] font-semibold mb-3">Live Preview</p>
                <div
                  className="text-3xl text-[var(--gold-dark)] tracking-[0.2em] leading-none"
                  style={{ fontFamily: config.brand_font ? `'${config.brand_font}', serif` : undefined }}
                >
                  {config.salon_name?.split(" ")[0]?.toUpperCase() || "CYRA"}
                </div>
                <div
                  className="text-[11px] text-[#8C7A5E] tracking-[0.3em] uppercase mt-1.5"
                  style={{ fontFamily: config.body_font ? `'${config.body_font}', sans-serif` : undefined }}
                >
                  Salon &amp; Academy
                </div>
              </div>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {tab === "social" && (
            <div className="space-y-4">
              <h3 className="font-cormorant text-lg text-[#1C1710]">Social & Footer</h3>
              <Field k="instagram_url"    label="Instagram URL" />
              <Field k="facebook_url"     label="Facebook URL" />
              <Field k="footer_copyright" label="Footer Copyright Text" />
            </div>
          )}
        </div>

        {/* Save */}
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 btn-gold px-8 py-3.5 rounded-xl text-[11px] tracking-[0.2em] w-full justify-center">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save All Settings</>}
        </button>
      </div>
    </AdminLayout>
  );
}
