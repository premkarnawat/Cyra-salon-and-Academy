import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: any;
          }[]
        ) {
          // Set cookies in request
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Refresh response
          supabaseResponse = NextResponse.next({ request });

          // Set cookies in response
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ CRITICAL FIX: use getSession instead of getUser
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  const pathname = request.nextUrl.pathname;

  // 🔐 Protect all admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // 🔁 Redirect logged-in user away from login
  if (pathname === "/admin/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
