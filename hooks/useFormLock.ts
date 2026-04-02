"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { isFormSubmitted, markFormSubmitted } from "@/lib/utils";

export function useFormLock() {
  const [isLocked,    setIsLocked]    = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    // Session check — if already submitted this session, unlock immediately
    if (isFormSubmitted()) {
      setIsSubmitted(true);
      return;
    }

    // Scroll trigger — fires once after user scrolls past ~80% of viewport height
    // (i.e. they have scrolled past the hero banner)
    const SCROLL_THRESHOLD = typeof window !== "undefined"
      ? window.innerHeight * 0.8
      : 500;

    function handleScroll() {
      if (triggeredRef.current) return;
      if (isFormSubmitted()) {
        setIsSubmitted(true);
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
      return;
    }
    if (!triggeredRef.current) {
      triggeredRef.current = true;
      setIsLocked(true);
    }
  }, []);

  // Called after successful form submission
  const onFormSuccess = useCallback(() => {
    markFormSubmitted();
    setIsSubmitted(true);
    setIsLocked(false);
  }, []);

  return {
    isLocked:     isLocked && !isSubmitted,
    isSubmitted,
    triggerByClick,
    onFormSuccess,
  };
}
