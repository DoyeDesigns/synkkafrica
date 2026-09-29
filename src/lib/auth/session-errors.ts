// Client-safe constants shared by the NextAuth config (src/auth.ts) and the
// client components that react to them. Keep this file free of server-only
// imports.

// Surfaced to `signIn("otp", { redirect: false })` as `res.code` when the
// backend refuses an admin-blocked account.
export const ACCOUNT_BLOCKED_SIGNIN_CODE = "account_blocked";

// `session.error` values meaning the backend definitively rejected the
// customer's session (blocked, or refresh token revoked — which a block
// does). The client signs out on these. "RefreshTokenError" stays the
// generic, possibly-transient failure and does not force a sign-out.
export const SESSION_ERROR_ACCOUNT_BLOCKED = "AccountBlocked";
export const SESSION_ERROR_REVOKED = "SessionRevoked";

// `/login?error=account_blocked` shows the blocked message on arrival.
export const LOGIN_ACCOUNT_BLOCKED_URL = `/login?error=${ACCOUNT_BLOCKED_SIGNIN_CODE}`;
