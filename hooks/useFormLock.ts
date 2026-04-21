"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  isFormSubmitted,
  markFormSubmitted,
  getReturningUserName,
} from "@/lib/utils";

export function useFormLock() {
  const [isLocked,       setIsLocked]       = useState(false);
  const [isSubmitted,    setIsSubmitted]     = useState(false);
  const [returningName,  setReturningName]   = useState<string | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Check localStorage — returning user skips form entirely
    if (isFormSubmitted()) {
      setIsSubmitted(true);
      setReturningName(getReturningUserName());
      return;
    }

    // Scroll trigger — fires once after user scrolls ~80vh
    const SCROLL_THRESHOLD =
      typeof window !== "undefined" ? window.innerHeight * 0.8 : 500;

    function handleScroll() {
      if (triggeredRef.current) return;
      if (isFormSubmitted()) {
        setIsSubmitted(true);
        setReturningName(getReturningUserName());
        triggeredRef.current = true;
        window.removeEventListener("scroll", handleScroll);
        return;
      }
      if (window.scrollY > SCROLL_THRESHOLD) {
        triggeredRef.current = true;
        setIsLocked(true);
        window.removeEventListener("scroll", handleScroll);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Triggered by clicking "Explore Offers" CTA
  const triggerByClick = useCallback(() => {
    if (isFormSubmitted()) {
      setIsSubmitted(true);
      setReturningName(getReturningUserName());
      return;
    }
    if (!triggeredRef.current) {
      triggeredRef.current = true;
      setIsLocked(true);
    }
  }, []);

  // Called after successful form submission — saves to localStorage
  const onFormSuccess = useCallback((name: string, contact: string) => {
    markFormSubmitted(name, contact);
    setIsSubmitted(true);
    setIsLocked(false);
    setReturningName(name);
  }, []);

  return {
    isLocked:      isLocked && !isSubmitted,
    isSubmitted,
    returningName,  // non-null for returning users
    triggerByClick,
    onFormSuccess,
  };
}
