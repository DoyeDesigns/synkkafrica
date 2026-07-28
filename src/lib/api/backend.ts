import { getApiBaseUrl } from "@/lib/env";

// Thin, typed client for the SynkkAfrica NestJS backend. Isomorphic — safe to
// call from server (NextAuth callbacks, server components/actions) and from
// client components. Pass a bearer token to authenticate.

export type BackendTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshTokenExpiresIn: number; // seconds
};

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  // Merged into the query string for GET requests.
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

export async function apiFetch<T>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL is not configured");
  }

  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(url.toString(), {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
    // Backend uses bearer tokens, not cookies — no credentials needed.
    cache: "no-store",
  });

  // 204 / empty body
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const parsed = text ? safeJson(text) : undefined;

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// --- Customer auth (passwordless OTP) ---

// Sends a 6-digit code to the email. Always 204 (no account enumeration).
export async function requestOtp(email: string): Promise<void> {
  await apiFetch<void>("/auth/request-otp", { body: { email } });
}

// Verifies the code and returns the backend token pair. First verification
// signs the user up; subsequent ones log in.
export async function verifyOtp(
  email: string,
  code: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/auth/verify-otp", { body: { email, code } });
}

// Rotates the refresh token, returning a fresh pair.
export async function refreshTokens(
  refreshToken: string,
): Promise<BackendTokens> {
  return apiFetch<BackendTokens>("/auth/refresh", { body: { refreshToken } });
}

// Best-effort revoke of the refresh token on sign-out.
export async function signOutBackend(refreshToken: string): Promise<void> {
  await apiFetch<void>("/auth/signout", { body: { refreshToken } });
}
