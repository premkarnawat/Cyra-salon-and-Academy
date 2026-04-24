"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      toast.success("Welcome back!");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const inputBase = `
    w-full bg-[#FDFAF4] border border-[rgba(191,160,106,0.25)]
    rounded-xl px-4 pt-[18px] pb-[8px] text-[14px] text-[#1C1710]
    font-jost outline-none transition-all duration-250
    focus:border-[var(--gold)] focus:shadow-[0_0_0_3px_rgba(191,160,106,0.14)]
    placeholder:text-transparent
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream-100)] px-4">
      {/* Warm gold glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(191,160,106,0.18) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[400px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(140,110,48,0.12)] border border-[rgba(191,160,106,0.18)] overflow-hidden">
          {/* Gold top bar */}
          <div className="h-[3px] bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />

          <div className="px-8 py-10">
            {/* Brand */}
            <div className="text-center mb-8">
              <div
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "2.2rem",
                  letterSpacing: "0.28em",
                  color: "var(--gold-dark)",
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                CYRA
              </div>
              <div
                style={{
                  fontFamily: "'Marcellus', serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.38em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  opacity: 0.8,
                  marginBottom: "12px",
                }}
              >
                Admin Portal
              </div>
              <div className="w-10 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  className={inputBase}
                />
                <label className={`absolute left-4 pointer-events-none font-jost transition-all duration-250 ${
                  email ? "top-[7px] text-[9.5px] tracking-[0.18em] uppercase text-[var(--gold-dark)] font-semibold" : "top-1/2 -translate-y-1/2 text-[13.5px] text-[#8C7A5E]/55"
                }`}>Email Address</label>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=" "
                  required
                  className={`${inputBase} pr-11`}
                />
                <label className={`absolute left-4 pointer-events-none font-jost transition-all duration-250 ${
                  password ? "top-[7px] text-[9.5px] tracking-[0.18em] uppercase text-[var(--gold-dark)] font-semibold" : "top-1/2 -translate-y-1/2 text-[13.5px] text-[#8C7A5E]/55"
                }`}>Password</label>
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A5E]/50 hover:text-[var(--gold-dark)] transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="btn-gold w-full py-[15px] rounded-xl text-[11.5px] tracking-[0.24em] flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign In →"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href="/" className="font-jost text-[11px] text-[#8C7A5E]/50 hover:text-[var(--gold-dark)] transition-colors tracking-wide">
                ← Back to Website
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
