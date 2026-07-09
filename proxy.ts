import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/api/auth/signin", "/api/auth/signup"];

// Routes that require admin role
const adminRoutes = ["/admin"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes through
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow API routes that are not admin-specific
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    const raw = req.cookies.get("mc_session")?.value;

    if (!raw) {
      // No session — redirect to login
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const session = JSON.parse(raw);
      if (session.role !== "admin") {
        // Authenticated but not an admin — show unauthorized page
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch {
      // Invalid session cookie — redirect to login
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, _next, and favicon
    "/((?!_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
};