import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieType = {
  name: string;
  value: string;
  options?: any;
};

// ✅ USER CLIENT (uses cookies for auth session)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieType[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore (Next.js server component limitation)
          }
        },
      },
    }
  );
}

// ✅ ADMIN CLIENT (NO cookies, uses service role key)
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []; // ❌ no cookies needed
        },
        setAll() {
          // no-op
        },
      },
    }
  );
}
