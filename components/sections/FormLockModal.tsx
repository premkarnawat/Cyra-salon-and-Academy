"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User, Phone, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { submitForm } from "@/lib/userTracking";

interface FormLockModalProps {
  isOpen: boolean;
  onSuccess: (name: string) => void;
  logoUrl?: string;
  logoPlacement?: "none" | "navbar" | "form" | "both";
}

function validatePhone(raw: string): boolean {
  return /^[6-9]\d{9}$/.test(raw.replace(/\D/g, "").replace(/^91/, ""));
}

function parseDob(raw: string): string | null {
  const m = raw.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = parseInt(dd, 10), mo = parseInt(mm, 10), y = parseInt(yyyy, 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1920 || y > new Date().getFullYear()) return null;
  return `${yyyy}-${mm}-${dd}`;
}

function Field({ id, label, type, value, onChange, placeholder, icon: Icon, maxLength, error, inputMode }: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ElementType; maxLength?: number; error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative">
      <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        error ? "shadow-[0_0_0_2px_rgba(239,68,68,0.4)]" : focused ? "shadow-[0_0_0_2px_rgba(191,160,106,0.45)]" : "shadow-[0_0_0_1px_rgba(191,160,106,0.2)]"
      }`}>
        <div className={`absolute inset-0 transition-colors duration-300 ${focused ? "bg-white/90" : "bg-white/60"}`}
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon size={15} strokeWidth={1.8} className={`transition-colors duration-300 ${focused ? "text-[var(--gold)]" : "text-[var(--gold-dark)]/40"}`} />
        </div>
        <label htmlFor={id} className={`absolute left-11 z-10 pointer-events-none font-jost transition-all duration-250 ${
          floated ? "top-[7px] text-[9.5px] tracking-[0.18em] uppercase text-[var(--gold)] font-semibold" : "top-1/2 -translate-y-1/2 text-[13.5px] text-[#8C7A5E]/60 tracking-wide"
        }`}>{label}</label>
        <input id={id} type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder={focused ? placeholder : ""} maxLength={maxLength}
          inputMode={inputMode} autoComplete="off"
          className={`relative z-10 w-full bg-transparent outline-none pl-11 pr-4 ${
            floated ? "pt-[22px] pb-[8px]" : "py-[18px]"
          } text-[14px] font-jost text-[#1C1710] placeholder:text-[#8C7A5E]/35 placeholder:text-[13px] transition-all duration-250`}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 ml-1 text-[11px] text-red-500 font-jost tracking-wide">{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FormLockModal({ isOpen, onSuccess, logoUrl, logoPlacement }: FormLockModalProps) {
  const [name,    setName]    = useState("");
  const [contact, setContact] = useState("");
  const [dob,     setDob]     = useState("");
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const firstRef = useRef<HTMLDivElement>(null);

  const showFormLogo = !!logoUrl && (logoPlacement === "form" || logoPlacement === "both");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstRef.current?.querySelector("input")?.focus(), 500);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleDobChange(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 8);
    let f = d;
    if (d.length >= 3 && d.length <= 4) f = `${d.slice(0, 2)}/${d.slice(2)}`;
    else if (d.length >= 5) f = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
    setDob(f);
    if (errors.dob) setErrors(e => ({ ...e, dob: "" }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Please enter your full name";
    if (!validatePhone(contact)) e.contact = "Enter a valid 10-digit mobile number";
    if (!parseDob(dob)) e.dob = "Enter date as DD/MM/YYYY";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const parsed = parseDob(dob)!;
      const result = await submitForm({
        name: name.trim(),
        contact: contact.replace(/\D/g, "").replace(/^91/, ""),
        dob: parsed,
      });
      if (!result.success) throw new Error(result.error);
      toast.success("Welcome to Cyra Salon! ✨");
      onSuccess(name.trim());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Overlay: full viewport, flex centered, no overflow ── */
        <motion.div
          className="fixed inset-0 z-[8000]"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            overflowY: "auto",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(250,246,239,0.68)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          />

          {/* Modal card — max-width constrained, centred */}
          <motion.div
            className="relative z-10"
            style={{ width: "100%", maxWidth: "420px" }}
            initial={{ scale: 0.86, opacity: 0, y: 36 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.175, 0.885, 0.32, 1.1] }}
          >
            <div className="rounded-[28px] overflow-hidden shadow-xl bg-white border border-[rgba(191,160,106,0.2)]">
              <div style={{ padding: "2rem 1.75rem 2.25rem", textAlign: "center" }}>

                {/* Logo — large & centered */}
                {showFormLogo && logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Cyra logo"
                    style={{
                      display: "block",
                      margin: "0 auto 1.5rem",
                      height: "7rem",
                      width: "auto",
                      maxWidth: "180px",
                      objectFit: "contain",
                    }}
                  />
                )}

                {/* Brand typography */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Cinzel Decorative', serif",
                      fontSize: "2.4rem",
                      letterSpacing: "0.28em",
                      color: "var(--gold-dark)",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                      marginBottom: "6px",
                    }}
                  >
                    CYRA
                  </div>
                  <div
                    style={{
                      fontFamily: "'Marcellus', serif",
                      fontSize: "0.62rem",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      opacity: 0.8,
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "clip",
                    }}
                  >
                    Salon &amp; Academy
                  </div>
                </div>

                <p className="mt-5 text-sm font-jost text-[#6B7280]">Welcome! Please introduce yourself</p>

                <form onSubmit={handleSubmit} style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div ref={firstRef}>
                    <Field id="name" label="Your Name" type="text" value={name}
                      onChange={setName} placeholder="Name" icon={User} error={errors.name} />
                  </div>

                  <Field id="contact" label="Mobile" type="tel" value={contact}
                    onChange={setContact} placeholder="Mobile" icon={Phone} error={errors.contact} inputMode="tel" />

                  <Field id="dob" label="Date of Birth" type="text" value={dob}
                    onChange={handleDobChange} placeholder="DD/MM/YYYY" icon={Calendar} error={errors.dob} inputMode="numeric" />

                  <button
                    type="submit"
                    className="btn-gold w-full py-3 rounded-xl"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    ) : (
                      "Continue →"
                    )}
                  </button>
                </form>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
