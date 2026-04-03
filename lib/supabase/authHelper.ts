import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@supabase/supabase-js";

/**
 * Gets the authenticated user from a Next.js API route.
 * Checks Authorization: Bearer header first (most reliable for admin),
 * then falls back to cookie-based session.
 *
 * Returns the user object or null if not authenticated.
 */
export async function getAuthUser(req: Request) {
  // ── 1. Try Authorization: Bearer <token> header ───────────────────────────
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        // Use service-role client to verify the JWT token
        const supabaseAdmin = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) return user;
      } catch {
        // fall through to cookie check
      }
    }
  }

  // ── 2. Fall back to cookie-based session ──────────────────────────────────
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch {
    // not authenticated
  }

  return null;
}
