import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import {
  isAccountDesignPreviewEnabled,
  isAdminDemoEnabled,
} from "@/features/account/preview";

// Behind Vercel's proxy `nextUrl.origin` can resolve to http://localhost:3000,
// which would send production users to a localhost login page. The public
// origin is carried in the forwarded headers Vercel always sets, so build
// redirects against those and fall back to nextUrl only for local dev.
function redirect(req: NextRequest, pathname: string): NextResponse {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ??
    req.nextUrl.protocol.replace(":", "");
  const base = host ? `${proto}://${host}` : req.nextUrl.origin;
  return NextResponse.redirect(new URL(pathname, base));
}

// Route guards for the admin, vendor and customer areas. Mirrors the intent of
// the `authorized` callback in auth.ts, but redirects to the correct per-area
// login page instead of the single default sign-in page — an unauthenticated
// admin belongs at /admin/login, not the customer /login.
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const role = req.auth?.user?.role;

  // --- Admin area ---
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/accept-invite") {
      return NextResponse.next();
    }
    if (isAdminDemoEnabled()) return NextResponse.next();
    if (role !== "admin") {
      return redirect(req, "/admin/login");
    }
    return NextResponse.next();
  }

  // --- Vendor area (login/signup stay public) ---
  if (pathname.startsWith("/vendor")) {
    if (pathname === "/vendor/login" || pathname === "/vendor/signup") {
      return NextResponse.next();
    }
    if (role !== "vendor") {
      return redirect(req, "/vendor/login");
    }
    return NextResponse.next();
  }

  // --- Customer account / bookings ---
  if (pathname.startsWith("/account") || pathname.startsWith("/bookings")) {
    if (pathname.startsWith("/account") && isAccountDesignPreviewEnabled()) {
      return NextResponse.next();
    }
    if (!req.auth?.user) {
      return redirect(req, "/login");
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/account/:path*",
    "/bookings/:path*",
  ],
};
