/**
 * lib/userTracking.ts
 * Modular user tracking: localStorage user_id + Supabase users/visits tables.
 * Import and use these three functions; do not use sessionStorage anywhere.
 */

const LS_USER_ID   = "cyra_user_id";
const LS_USER_NAME = "cyra_user_name";

// ── checkUser ─────────────────────────────────────────────────────────────────
// Returns the stored user_id if the user has filled the form before, else null.
// Call this on every page load.
export function checkUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_USER_ID);
}

// Returns the stored user name for the welcome-back message
export function getStoredUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_USER_NAME);
}

// ── submitForm ────────────────────────────────────────────────────────────────
// Called when user submits the form for the very first time.
// Creates user_id → stores in localStorage → POSTs to /api/lead-capture
export async function submitForm(params: {
  name: string;
  contact: string;
  dob: string;
}): Promise<{ success: boolean; error?: string; userId: string }> {
  const userId = crypto.randomUUID();
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  const res = await fetch("/api/lead-capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id:    userId,
      name:       params.name.trim(),
      contact:    params.contact.replace(/\D/g, "").replace(/^91/, ""),
      dob:        params.dob,
      user_agent: userAgent,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    return { success: false, error: data.error ?? "Submission failed", userId };
  }

  // Persist to localStorage ONLY after successful DB write
  localStorage.setItem(LS_USER_ID,   userId);
  localStorage.setItem(LS_USER_NAME, params.name.trim());

  return { success: true, userId };
}

// ── logVisit ──────────────────────────────────────────────────────────────────
// Called on every page load for returning users.
// Silently POSTs a visit row; never throws / never blocks UI.
export async function logVisit(userId: string): Promise<void> {
  if (!userId) return;
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";

  try {
    await fetch("/api/log-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, user_agent: userAgent }),
    });
  } catch {
    // Silently ignore — never block the user experience
  }
}
