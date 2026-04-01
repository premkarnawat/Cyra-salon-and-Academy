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
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--dark-900)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20"
        style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(191,160,106,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(140,110,48,0.1) 0%, transparent 60%)" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-sm px-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-dark rounded-3xl p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="font-cinzel text-3xl tracking-[0.2em] text-[var(--gold-light)] mb-1">CYRA</div>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto my-3" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-[rgba(191,160,106,0.5)]">Admin Portal</p>
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
                className="input-luxury text-[#F0E8D8]"
                style={{ background:"rgba(255,255,255,0.06)", color:"#F0E8D8" }}
              />
              <label className="float-label">Email Address</label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder=" "
                required
                className="input-luxury pr-10 text-[#F0E8D8]"
                style={{ background:"rgba(255,255,255,0.06)", color:"#F0E8D8" }}
              />
              <label className="float-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(191,160,106,0.5)] hover:text-[var(--gold)] transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 rounded-xl text-[11px] tracking-[0.25em] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-[10px] text-[rgba(191,160,106,0.4)] hover:text-[var(--gold)] transition-colors tracking-wide">
              ← Back to Website
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
