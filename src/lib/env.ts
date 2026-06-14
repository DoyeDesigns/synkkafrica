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

export function isBackendReady() {
  return hasMongoUri() && hasAuthSecret();
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
