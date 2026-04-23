"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { verifyUser, logVisit, checkUser } from "@/lib/userTracking";

export function useFormLock() {
  const [isLocked,      setIsLocked]      = useState(false);
  const [isSubmitted,   setIsSubmitted]   = useState(false);
  const [returningName, setReturningName] = useState<string | null>(null);
  const [checking,      setChecking]      = useState(true); // true while async verify runs
  const triggeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // ── Step 1: verify user against DB (handles stale sessions) ───────────
      const result = await verifyUser();

      if (cancelled) return;

      if (result.exists) {
        // ── RETURNING USER ─────────────────────────────────────────────────
        setIsSubmitted(true);
        setReturningName(result.name);
        logVisit(result.userId); // fire-and-forget
        setChecking(false);
        return;
      }

      // ── NEW USER (or deleted user — localStorage already cleared) ─────────
      setChecking(false);

      const THRESHOLD =
        typeof window !== "undefined" ? window.innerHeight * 0.8 : 500;

      function handleScroll() {
        if (triggeredRef.current) return;
        // Double-check: another tab may have submitted while scrolling
        if (checkUser()) {
          setIsSubmitted(true);
          triggeredRef.current = true;
          window.removeEventListener("scroll", handleScroll);
          return;
        }
        if (window.scrollY > THRESHOLD) {
          triggeredRef.current = true;
          setIsLocked(true);
          window.removeEventListener("scroll", handleScroll);
        }
      }

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }

    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Triggered by "Explore Offers" CTA click
  const triggerByClick = useCallback(() => {
    if (checkUser()) {
      setIsSubmitted(true);
      return;
    }
    if (!triggeredRef.current) {
      triggeredRef.current = true;
      setIsLocked(true);
    }
  }, []);

  // Called by FormLockModal after successful submission
  const onFormSuccess = useCallback((name: string) => {
    setIsSubmitted(true);
    setIsLocked(false);
    setReturningName(name);
  }, []);

  return {
    isLocked:      isLocked && !isSubmitted,
    isSubmitted,
    returningName,
    triggerByClick,
    onFormSuccess,
    checking,       // exposes loading state (optional — page.tsx ignores it)
  };
}
