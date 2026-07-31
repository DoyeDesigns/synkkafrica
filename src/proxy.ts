export { auth as proxy } from "@/auth";

// The per-route rules live in the `authorized` callback in auth.ts (account
// preview, admin demo, vendor role). Vendor login/signup are allowed through
// there; other /vendor routes require a vendor session.
export const config = {
  matcher: ["/account/:path*", "/bookings/:path*", "/vendor/:path*"],
};
