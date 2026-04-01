"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { getOrCreateSessionId } from "@/lib/utils";

interface FormLockModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function FormLockModal({ isOpen, onSuccess }: FormLockModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !dob) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          dob,
          session_id: getOrCreateSessionId(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Welcome to Cyra Salon! 🌟");
      onSuccess();
    } catch (e: unknown) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "rgba(12,11,9,0.78)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.88, opacity: 0, y: 32 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <div className="glass-dark rounded-3xl p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.7)]">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(191,160,106,0.15)] border border-[rgba(191,160,106,0.25)] mb-4">
                  <Lock size={20} className="text-[var(--gold-light)]" />
                </div>
                <h2 className="font-cinzel text-2xl md:text-3xl text-[#D4B483] tracking-wider mb-1">
                  CYRA
                </h2>
                <div className="w-10 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto my-3" />
                <p className="font-jost text-xs tracking-[0.25em] text-[rgba(212,180,131,0.5)] uppercase mb-2">
                  Salon &amp; Academy
                </p>
                <p className="text-[rgba(240,232,216,0.55)] text-sm font-light mt-3">
                  Please share a few details to continue
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="relative">
                  <input
                    id="fl-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    required
                    className="input-luxury text-[#F0E8D8]"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#F0E8D8" }}
                  />
                  <label htmlFor="fl-name" className="float-label">Your Name</label>
                </div>

                {/* Contact */}
                <div className="relative">
                  <input
                    id="fl-contact"
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder=" "
                    required
                    maxLength={10}
                    className="input-luxury text-[#F0E8D8]"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#F0E8D8" }}
                  />
                  <label htmlFor="fl-contact" className="float-label">Contact Number</label>
                </div>

                {/* DOB */}
                <div className="relative">
                  <input
                    id="fl-dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="input-luxury text-[#F0E8D8]"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#F0E8D8", paddingTop: "1.1rem" }}
                  />
                  <label
                    htmlFor="fl-dob"
                    className="float-label"
                    style={{ top: "0.3rem", fontSize: "0.62rem", color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    Date of Birth
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full py-4 rounded-xl text-xs tracking-[0.25em] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Please wait…</>
                  ) : (
                    "Proceed Ahead →"
                  )}
                </button>
              </form>

              <p className="text-center text-[10px] text-[rgba(255,255,255,0.2)] mt-5 tracking-wide">
                🔒 Your information is private and secure
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
