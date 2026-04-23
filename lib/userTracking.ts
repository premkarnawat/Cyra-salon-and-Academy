/**
 * lib/userTracking.ts
 * User tracking with stale-session protection.
 *
 * On every page load, useFormLock calls verifyUser() which:
 *   1. Reads user_id from localStorage
 *   2. Pings /api/lead-capture?check=1 to verify the user still exists in DB
 *   3a. EXISTS   → returning user, log visit, hide form
 *   3b. NOT FOUND → remove stale localStorage keys, treat as new user, show form
 */

const LS_USER_ID   = "cyra_user_id";
const LS_USER_NAME = "cyra_user_name";

// ── Low-level readers ─────────────────────────────────────────────────────────

export function checkUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_USER_ID);
}

export function getStoredUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_USER_NAME);
}

function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_USER_ID);
  localStorage.removeItem(LS_USER_NAME);
}

// ── verifyUser ────────────────────────────────────────────────────────────────
// Returns:
//   { exists: true,  userId, name }  — valid returning user
//   { exists: false }                — no local id OR user deleted from DB
export async function verifyUser(): Promise<
  | { exists: true; userId: string; name: string | null }
  | { exists: false }
> {
  const userId = checkUser();
  if (!userId) return { exists: false };

  try {
    const res = await fetch(`/api/lead-capture?check=1&user_id=${encodeURIComponent(userId)}`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.status === 404) {
      // User was deleted by admin — purge stale session
      clearStoredUser();
      return { exists: false };
    }
    if (!res.ok) {
      // Network/server hiccup — be conservative: treat as returning (don't show form)
      return { exists: true, userId, name: getStoredUserName() };
    }
    // 200 OK — user still in DB
    return { exists: true, userId, name: getStoredUserName() };
  } catch {
    // Offline / fetch error — treat as returning to avoid spamming form
    return { exists: true, userId, name: getStoredUserName() };
  }
}

// ── submitForm ────────────────────────────────────────────────────────────────
export async function submitForm(params: {
  name: string;
  contact: string;
  dob: string;
}): Promise<{ success: boolean; error?: string; userId: string }> {
  const userId    = crypto.randomUUID();
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
    // Silently ignore — never block UI
  }
}
