import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    // Backend (NestJS) access token — attach as Bearer on API calls.
    accessToken?: string;
    // Set to "RefreshTokenError" when the backend refresh failed; the UI
    // should treat the session as expired and prompt re-login.
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    // Absolute expiry (ms epoch) of the backend access token.
    accessTokenExpires?: number;
    error?: string;
  }
}
