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
  return /^[6-9]\d{9}$/.test(raw.replace(/\D/g,"").replace(/^91/,""));
}

function parseDob(raw: string): string | null {
  const m = raw.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (!m) return null;
  const [,dd,mm,yyyy] = m;
  const d=parseInt(dd,10), mo=parseInt(mm,10), y=parseInt(yyyy,10);
  if (mo<1||mo>12||d<1||d>31||y<1920||y>new Date().getFullYear()) return null;
  return `${yyyy}-${mm}-${dd}`;
}

function Field({ id, label, type, value, onChange, placeholder, icon:Icon, maxLength, error, inputMode }: {
  id:string; label:string; type:string; value:string;
  onChange:(v:string)=>void; placeholder:string;
  icon:React.ElementType; maxLength?:number; error?:string;
  inputMode?:React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className="relative">
      <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        error?"shadow-[0_0_0_2px_rgba(239,68,68,0.4)]":focused?"shadow-[0_0_0_2px_rgba(191,160,106,0.45)]":"shadow-[0_0_0_1px_rgba(191,160,106,0.2)]"
      }`}>
        <div className={`absolute inset-0 transition-colors duration-300 ${focused?"bg-white/90":"bg-white/60"}`}
          style={{ backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }} />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon size={15} strokeWidth={1.8} className={`transition-colors duration-300 ${focused?"text-[var(--gold)]":"text-[var(--gold-dark)]/40"}`} />
        </div>
        <label htmlFor={id} className={`absolute left-11 z-10 pointer-events-none font-jost transition-all duration-250 ${
          floated?"top-[7px] text-[9.5px] tracking-[0.18em] uppercase text-[var(--gold)] font-semibold":"top-1/2 -translate-y-1/2 text-[13.5px] text-[#8C7A5E]/60 tracking-wide"
        }`}>{label}</label>
        <input id={id} type={type} value={value}
          onChange={e=>onChange(e.target.value)}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          placeholder={focused?placeholder:""} maxLength={maxLength}
          inputMode={inputMode} autoComplete="off"
          className={`relative z-10 w-full bg-transparent outline-none pl-11 pr-4 ${
            floated?"pt-[22px] pb-[8px]":"py-[18px]"
          } text-[14px] font-jost text-[#1C1710] placeholder:text-[#8C7A5E]/35 placeholder:text-[13px] transition-all duration-250`}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
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
  const [errors,  setErrors]  = useState<Record<string,string>>({});
  const firstRef = useRef<HTMLDivElement>(null);

  // Show logo in form when placement is "form" or "both"
  const showFormLogo = !!logoUrl && (logoPlacement === "form" || logoPlacement === "both");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstRef.current?.querySelector("input")?.focus(), 500);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleDobChange(raw: string) {
    const d = raw.replace(/\D/g,"").slice(0,8);
    let f = d;
    if (d.length>=3&&d.length<=4) f=`${d.slice(0,2)}/${d.slice(2)}`;
    else if (d.length>=5) f=`${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
    setDob(f);
    if (errors.dob) setErrors(e=>({...e,dob:""}));
  }

  function validate(): boolean {
    const e: Record<string,string> = {};
    if (!name.trim()||name.trim().length<2) e.name="Please enter your full name";
    if (!validatePhone(contact))            e.contact="Enter a valid 10-digit mobile number";
    if (!parseDob(dob))                     e.dob="Enter date as DD/MM/YYYY";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const parsed = parseDob(dob)!;
      const result = await submitForm({
        name:    name.trim(),
        contact: contact.replace(/\D/g,"").replace(/^91/,""),
        dob:     parsed,
      });
      if (!result.success) throw new Error(result.error);
      toast.success("Welcome to Cyra Salon! ✨");
      onSuccess(name.trim());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          transition={{duration:0.4}}>

          <motion.div className="absolute inset-0"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:0.4}}
            style={{background:"rgba(250,246,239,0.65)",backdropFilter:"blur(18px) saturate(1.4)",WebkitBackdropFilter:"blur(18px) saturate(1.4)"}} />

          <div className="absolute top-[-10%] left-[-5%] w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{background:"radial-gradient(circle,rgba(191,160,106,0.12) 0%,transparent 70%)",filter:"blur(40px)"}} aria-hidden />
          <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{background:"radial-gradient(circle,rgba(191,160,106,0.1) 0%,transparent 70%)",filter:"blur(40px)"}} aria-hidden />

          <motion.div className="relative z-10 w-full max-w-[420px]"
            initial={{scale:0.86,opacity:0,y:36}} animate={{scale:1,opacity:1,y:0}}
            exit={{scale:0.93,opacity:0,y:20}}
            transition={{duration:0.5,ease:[0.175,0.885,0.32,1.275]}}>
            <div className="rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(140,110,48,0.18),0_8px_32px_rgba(0,0,0,0.08)]"
              style={{background:"rgba(255,255,255,0.82)",backdropFilter:"blur(32px) saturate(1.6)",WebkitBackdropFilter:"blur(32px) saturate(1.6)",border:"1px solid rgba(191,160,106,0.25)"}}>
              <div className="h-[3px] w-full bg-gradient-to-r from-[var(--gold-dark)] via-[var(--gold)] to-[var(--gold-light)]" />

              <div className="px-7 sm:px-9 pt-8 pb-9">
                <div className="text-center mb-8">

                  {/* Logo above brand text — shown when placement is form/both */}
                  {showFormLogo && (
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={logoUrl}
                        alt="Cyra"
                        style={{ height:64, width:"auto", objectFit:"contain" }}
                        draggable={false}
                      />
                    </div>
                  )}

                  {/* Brand text — ALWAYS shown */}
                  <div className="font-cinzel text-[1.55rem] tracking-[0.22em] leading-none text-[var(--gold-dark)] mb-[5px]">
                    CYRA
                  </div>
                  <div className="font-marcellus text-[0.58rem] tracking-[0.42em] uppercase text-[var(--gold)] opacity-70 mb-4">
                    Salon &amp; Academy
                  </div>

                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto mb-4" />
                  <p className="font-cormorant text-[1.15rem] text-[#3D3527] leading-snug mb-1">Welcome! Please introduce yourself</p>
                  <p className="font-jost text-[12px] text-[#8C7A5E]/70 tracking-wide">Takes just 10 seconds · Only once, ever</p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div ref={firstRef}>
                    <Field id="fl-name" label="Your Full Name" type="text" value={name}
                      onChange={v=>{setName(v);if(errors.name)setErrors(e=>({...e,name:""}));}}
                      placeholder="e.g. Priya Sharma" icon={User} error={errors.name} />
                  </div>
                  <Field id="fl-contact" label="Mobile Number" type="tel" value={contact}
                    onChange={v=>{setContact(v);if(errors.contact)setErrors(e=>({...e,contact:""}));}}
                    placeholder="10-digit mobile number" icon={Phone} maxLength={10} inputMode="numeric" error={errors.contact} />
                  <Field id="fl-dob" label="Date of Birth" type="text" value={dob}
                    onChange={handleDobChange} placeholder="DD/MM/YYYY" icon={Calendar}
                    maxLength={10} inputMode="numeric" error={errors.dob} />

                  <motion.button type="submit" disabled={loading}
                    whileHover={loading?{}:{scale:1.02,y:-2}} whileTap={loading?{}:{scale:0.98}}
                    className="btn-gold w-full mt-2 py-[15px] rounded-2xl text-[11.5px] tracking-[0.26em] flex items-center justify-center gap-2.5 shadow-[0_8px_28px_rgba(191,160,106,0.35)] hover:shadow-[0_12px_36px_rgba(191,160,106,0.45)] disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-300">
                    {loading?<><Loader2 size={15} className="animate-spin"/> Please wait…</>:<>Proceed Ahead &nbsp;→</>}
                  </motion.button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(191,160,106,0.2)]" />
                  <p className="text-[10.5px] font-jost text-[#8C7A5E]/50 tracking-wide px-3 text-center">🔒 Private &amp; secure · Not shared with anyone</p>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(191,160,106,0.2)]" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
