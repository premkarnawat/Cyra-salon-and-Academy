"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { DEFAULT_CONFIG } from "@/lib/constants";
import type { SiteConfig } from "@/types";

export default function SettingsPage() {
  const [config,  setConfig]  = useState<SiteConfig>(DEFAULT_CONFIG as SiteConfig);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState<"general" | "opening" | "social">("general");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { if (d && !d.error) setConfig({ ...DEFAULT_CONFIG, ...d } as SiteConfig); })
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
    else toast.success("Settings saved!");
    setSaving(false);
  }

  const field = (key: keyof SiteConfig, placeholder: string, type = "text") => (
    <div className="space-y-1">
      <label className="text-[9px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold">
        {placeholder}
      </label>
      <input
        type={type}
        value={config[key] || ""}
        onChange={e => setConfig({ ...config, [key]: e.target.value })}
        placeholder={placeholder}
        className="input-luxury w-full"
        style={{ background: "rgba(255,255,255,0.05)", color: "#F0E8D8" }}
      />
    </div>
  );

  const TABS = [
    { id: "general", label: "General" },
    { id: "opening", label: "Opening Screen" },
    { id: "social",  label: "Social & Footer" },
  ] as const;

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-cormorant text-2xl text-[#F0E8D8]">Site Settings</h2>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 btn-gold px-5 py-2.5 rounded-xl text-[11px] tracking-[0.15em]"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[rgba(191,160,106,0.15)] pb-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs tracking-[0.15em] uppercase border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? "border-[var(--gold)] text-[var(--gold)]"
                  : "border-transparent text-[rgba(240,232,216,0.4)] hover:text-[rgba(240,232,216,0.7)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-[var(--dark-700)] rounded-2xl border border-[rgba(191,160,106,0.12)] p-6">

          {/* General */}
          {tab === "general" && (
            <div className="space-y-5">
              <h3 className="font-cormorant text-lg text-[var(--gold-light)]">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field("salon_name",    "Salon Name")}
                {field("tagline",       "Tagline")}
                {field("phone",         "Phone Number")}
                {field("whatsapp",      "WhatsApp Number (with country code, no +)")}
                {field("email",         "Email Address", "email")}
                {field("opening_hours", "Opening Hours")}
              </div>
              <div className="space-y-1">
                <label className="text-[9px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold">Address</label>
                <textarea
                  value={config.address || ""}
                  onChange={e => setConfig({ ...config, address: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                  className="input-luxury w-full"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#F0E8D8", paddingTop: "0.8rem" }}
                />
              </div>
            </div>
          )}

          {/* Opening Screen */}
          {tab === "opening" && (
            <div className="space-y-6">
              <h3 className="font-cormorant text-lg text-[var(--gold-light)]">Opening Screen</h3>
              <p className="text-xs text-[rgba(240,232,216,0.4)]">
                This is the full-screen intro animation users see on first load. Customize the background and logo.
              </p>

              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold mb-2">
                  Background Image
                </p>
                <ImageUpload
                  value={config.opening_bg_url}
                  onChange={url => setConfig({ ...config, opening_bg_url: url })}
                  bucket="settings"
                  folder="opening"
                  label="Upload Background (Salon Interior Photo)"
                />
              </div>

              <div>
                <p className="text-[9px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold mb-2">
                  Logo Image (optional — leave empty to use text logo)
                </p>
                <ImageUpload
                  value={config.opening_logo_url}
                  onChange={url => setConfig({ ...config, opening_logo_url: url })}
                  bucket="settings"
                  folder="logo"
                  label="Upload Logo (PNG with transparent background)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] tracking-[0.25em] uppercase text-[var(--gold)] font-semibold">
                  Logo / Brand Text
                </label>
                <input
                  value={config.salon_name || ""}
                  onChange={e => setConfig({ ...config, salon_name: e.target.value })}
                  placeholder="Brand name shown on opening screen"
                  className="input-luxury w-full"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#F0E8D8" }}
                />
              </div>
            </div>
          )}

          {/* Social & Footer */}
          {tab === "social" && (
            <div className="space-y-5">
              <h3 className="font-cormorant text-lg text-[var(--gold-light)]">Social Media & Footer</h3>
              <div className="grid grid-cols-1 gap-4">
                {field("instagram_url",    "Instagram URL")}
                {field("facebook_url",     "Facebook URL")}
                {field("footer_copyright", "Footer Copyright Text")}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 btn-gold px-8 py-3.5 rounded-xl text-[11px] tracking-[0.2em] w-full justify-center"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>
    </AdminLayout>
  );
}
