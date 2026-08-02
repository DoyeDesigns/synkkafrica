import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  isAccountDesignPreviewEnabled,
  isAdminDemoEnabled,
} from "@/features/account/preview";

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
    if (pathname === "/admin/login") return NextResponse.next();
    if (isAdminDemoEnabled()) return NextResponse.next();
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    return NextResponse.next();
  }

  // --- Vendor area (login/signup stay public) ---
  if (pathname.startsWith("/vendor")) {
    if (pathname === "/vendor/login" || pathname === "/vendor/signup") {
      return NextResponse.next();
    }
    if (role !== "vendor") {
      return NextResponse.redirect(new URL("/vendor/login", nextUrl));
    }
    return NextResponse.next();
  }

  // --- Customer account / bookings ---
  if (pathname.startsWith("/account") || pathname.startsWith("/bookings")) {
    if (pathname.startsWith("/account") && isAccountDesignPreviewEnabled()) {
      return NextResponse.next();
    }
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL("/login", nextUrl));
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
