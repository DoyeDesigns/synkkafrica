import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import {
  isAccountDesignPreviewEnabled,
  isAdminDemoEnabled,
} from "@/features/account/preview";
import { getAuthSecret, hasApiUrl, hasGoogleAuth } from "@/lib/env";
import { refreshTokens, signOutBackend, verifyOtp } from "@/lib/api/backend";
import { loginVendor, refreshVendorTokens } from "@/lib/api/vendor";

// 30s clock-skew guard so we refresh a hair early rather than sending a
// just-expired access token.
const REFRESH_SKEW_MS = 30_000;

// The custom fields we carry on the NextAuth JWT (Auth.js types it loosely).
// `realm` tells the refresh/session logic which backend realm this session
// belongs to (customer OTP vs vendor password), so token rotation hits the
// right endpoint and the UI can gate vendor-only surfaces.
type BackendToken = {
  id?: string;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
  realm?: "customer" | "vendor";
  role?: "customer" | "vendor";
  vendorStatus?: string;
  name?: string;
  email?: string;
};

const providers = [
  ...(hasGoogleAuth() ? [Google] : []),
  // Passwordless OTP against the SynkkAfrica backend. The email + code are
  // collected in the login UI; `authorize` exchanges them for the backend's
  // access + refresh tokens, which are then carried in the NextAuth JWT.
  ...(hasApiUrl()
    ? [
        Credentials({
          id: "otp",
          name: "Email OTP",
          credentials: {
            email: { label: "Email", type: "email" },
            code: { label: "Code", type: "text" },
          },
          authorize: async (credentials) => {
            const email =
              typeof credentials?.email === "string" ? credentials.email : "";
            const code =
              typeof credentials?.code === "string" ? credentials.code : "";
            if (!email || !code) return null;

            try {
              const tokens = await verifyOtp(email, code);
              const userId = decodeJwtSub(tokens.accessToken) ?? email;
              // Non-standard fields ride along to the jwt() callback via `user`.
              return {
                id: userId,
                email,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                accessTokenExpires:
                  Date.now() + tokens.accessTokenExpiresIn * 1000,
              } as unknown as { id: string; email: string };
            } catch {
              // Wrong/expired code → NextAuth surfaces a CredentialsSignin error.
              return null;
            }
          },
        }),
        // Vendor realm — email + password against /vendor/auth/login. Carries
        // its own realm marker so refresh + guards treat it distinctly from a
        // customer session.
        Credentials({
          id: "vendor",
          name: "Vendor Login",
          credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            const email =
              typeof credentials?.email === "string" ? credentials.email : "";
            const password =
              typeof credentials?.password === "string"
                ? credentials.password
                : "";
            if (!email || !password) return null;

            try {
              const { vendor, ...tokens } = await loginVendor(email, password);
              return {
                id: vendor.id,
                email: vendor.email,
                name: vendor.businessName,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                accessTokenExpires:
                  Date.now() + tokens.accessTokenExpiresIn * 1000,
                realm: "vendor",
                role: "vendor",
                vendorStatus: vendor.status,
              } as unknown as { id: string; email: string };
            } catch {
              return null;
            }
          },
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const protectedPrefixes = ["/account", "/bookings"];
      const isProtected = protectedPrefixes.some((prefix) =>
        nextUrl.pathname.startsWith(prefix),
      );

      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (isAdminDemoEnabled()) {
          return true;
        }

        return !!auth?.user;
      }

      // Vendor area — everything under /vendor requires a signed-in vendor,
      // except the public login/signup pages.
      if (nextUrl.pathname.startsWith("/vendor")) {
        const isPublicVendor =
          nextUrl.pathname === "/vendor/login" ||
          nextUrl.pathname === "/vendor/signup";
        if (isPublicVendor) return true;
        return auth?.user?.role === "vendor";
      }

      if (isProtected) {
        if (isAccountDesignPreviewEnabled()) {
          if (nextUrl.pathname.startsWith("/account")) {
            return true;
          }
        }

        return !!auth?.user;
      }

      return true;
    },

    async jwt({ token, user }) {
      // Auth.js v5 types JWT with an `unknown` index signature, so we read/write
      // our custom fields through a typed view of the same object.
      const t = token as BackendToken;

      // 1. Sign-in: copy the backend tokens off the `user` object.
      if (user) {
        const u = user as unknown as BackendToken;
        t.id = u.id ?? t.id;
        t.accessToken = u.accessToken;
        t.refreshToken = u.refreshToken;
        t.accessTokenExpires = u.accessTokenExpires;
        t.realm = u.realm ?? "customer";
        t.role = u.role ?? "customer";
        t.vendorStatus = u.vendorStatus;
        if (u.name) t.name = u.name;
        return token;
      }

      // 2. No backend session (e.g. Google-only) → nothing to refresh.
      if (!t.refreshToken || !t.accessTokenExpires) return token;

      // 3. Access token still valid → use as-is.
      if (Date.now() < t.accessTokenExpires - REFRESH_SKEW_MS) {
        return token;
      }

      // 4. Expired → rotate the refresh token with the realm's backend.
      try {
        const rotated =
          t.realm === "vendor"
            ? await refreshVendorTokens(t.refreshToken)
            : await refreshTokens(t.refreshToken);
        t.accessToken = rotated.accessToken;
        t.refreshToken = rotated.refreshToken;
        t.accessTokenExpires = Date.now() + rotated.accessTokenExpiresIn * 1000;
        t.error = undefined;
      } catch {
        // Refresh failed → mark the session so the UI can force re-login.
        t.error = "RefreshTokenError";
      }
      return token;
    },

    async session({ session, token }) {
      const t = token as BackendToken;
      if (session.user) {
        session.user.id = t.id ?? session.user.id;
        session.user.role = t.role ?? "customer";
        session.user.vendorStatus = t.vendorStatus;
        if (t.name) session.user.name = t.name;
      }
      // Expose the backend access token so the API client can attach it.
      session.accessToken = t.accessToken;
      session.error = t.error;
      return session;
    },
  },
  events: {
    // Best-effort: revoke the backend refresh token when the NextAuth session
    // ends, so a signed-out session can't be silently refreshed.
    async signOut(message) {
      const refreshToken =
        "token" in message
          ? (message.token as BackendToken | null)?.refreshToken
          : undefined;
      if (refreshToken) {
        try {
          await signOutBackend(refreshToken);
        } catch {
          // Non-fatal — the token expires on its own.
        }
      }
    },
  },
  pages: { signIn: "/login" },
});

// Reads the `sub` (user id) claim out of a signed JWT without verifying it —
// the token came straight from our trusted backend over the authorize() call.
function decodeJwtSub(jwt: string): string | null {
  try {
    const payload = jwt.split(".")[1];
    const json = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { sub?: unknown };
    return typeof json.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}
