import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const pathname = request.nextUrl.pathname;

  // ✅ CHECK SUPABASE AUTH COOKIE MANUALLY
  const hasSession =
    request.cookies.getAll().some((cookie) =>
      cookie.name.includes("sb-")
    );

  // 🔐 Protect admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // 🔁 Redirect logged-in user away from login
  if (pathname === "/admin/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
