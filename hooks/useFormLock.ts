"use client";

import { useState, useEffect, useCallback } from "react";
import { isFormSubmitted, markFormSubmitted } from "@/lib/utils";

export function useFormLock() {
  const [isLocked, setIsLocked]     = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [triggerType, setTriggerType] = useState<"scroll" | "cta" | null>(null);

  useEffect(() => {
    // Check session
    if (isFormSubmitted()) {
      setIsSubmitted(true);
      return;
    }

    // Scroll listener — trigger after 200px
    const handleScroll = () => {
      if (isFormSubmitted()) return;
      if (window.scrollY > 200 && !isSubmitted) {
        setIsLocked(true);
        setTriggerType("scroll");
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSubmitted]);

  const triggerByClick = useCallback(() => {
    if (isFormSubmitted()) return;
    setIsLocked(true);
    setTriggerType("cta");
  }, []);

  const onFormSuccess = useCallback(() => {
    markFormSubmitted();
    setIsSubmitted(true);
    setIsLocked(false);
  }, []);

  const closeLock = useCallback(() => {
    // Don't allow closing without submitting
  }, []);

  return { isLocked, isSubmitted, triggerType, triggerByClick, onFormSuccess, closeLock };
}
