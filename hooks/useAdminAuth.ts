"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface AdminAuth {
  token: string | null;
  userId: string | null;
  loading: boolean;
  /** Refreshes token — call before any protected API request if token might be stale */
  refresh: () => Promise<string | null>;
}

export function useAdminAuth(): AdminAuth {
  const [token,   setToken]   = useState<string | null>(null);
  const [userId,  setUserId]  = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const t = session?.access_token ?? null;
      const u = session?.user?.id ?? null;
      setToken(t);
      setUserId(u);
      return t;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    // Keep token refreshed when tab regains focus
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  return { token, userId, loading, refresh };
}
