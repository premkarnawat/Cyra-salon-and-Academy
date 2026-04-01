"use client";

import { useState, useEffect } from "react";
import { SiteConfig } from "@/types";
import { DEFAULT_CONFIG } from "@/lib/constants";

export function useSiteSettings() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG as SiteConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) setConfig({ ...DEFAULT_CONFIG, ...data } as SiteConfig);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { config, loading };
}
