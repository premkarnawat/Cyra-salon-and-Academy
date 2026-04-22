"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { checkUser, logVisit, getStoredUserName } from "@/lib/userTracking";

export function useFormLock() {
  const [isLocked,      setIsLocked]      = useState(false);
  const [isSubmitted,   setIsSubmitted]   = useState(false);
  const [returningName, setReturningName] = useState<string | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const userId = checkUser(); // reads localStorage

    if (userId) {
      // ── RETURNING USER ──────────────────────────────────────────────────────
      // Skip form entirely, log this visit silently
      setIsSubmitted(true);
      setReturningName(getStoredUserName());
      logVisit(userId); // fire-and-forget, never blocks UI
      return;
    }

    // ── NEW USER — set up scroll trigger ────────────────────────────────────
    const THRESHOLD =
      typeof window !== "undefined" ? window.innerHeight * 0.8 : 500;

    function handleScroll() {
      if (triggeredRef.current) return;
      // Re-check in case another tab submitted
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
  // user_id is already stored in localStorage inside submitForm()
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
  };
}
