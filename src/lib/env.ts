export function hasMongoUri() {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export function hasAuthSecret() {
  return Boolean(process.env.AUTH_SECRET?.trim());
}

export function hasGoogleAuth() {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() &&
      process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}

// The SynkAfrica backend (NestJS) base URL, e.g. http://localhost:4001/api.
// Everything the app talks to now lives behind this — auth, flights, bookings.
export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") ?? "";
}

export function hasApiUrl() {
  return Boolean(getApiBaseUrl());
}

// "Backend ready" now means the API URL is configured — auth is delegated to
// the backend, so MongoDB is no longer required for the app to function.
export function isBackendReady() {
  return hasApiUrl();
}

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "development") {
    return "frontend-dev-only-secret-not-for-production";
  }

  return undefined;
}
