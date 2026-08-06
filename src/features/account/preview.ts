import type { Session } from "next-auth";

export const ACCOUNT_DESIGN_PREVIEW_SESSION: Session = {
  user: {
    id: "design-preview-user",
    name: "Victor",
    email: "victor@synkafrica.com",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const ADMIN_DESIGN_PREVIEW_SESSION: Session = {
  user: {
    id: "design-preview-admin",
    name: "Admin",
    email: "admin@synkafrica.com",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Admin auth is enforced by default. Set ADMIN_DESIGN_PREVIEW=true ONLY for
 * design-preview/demo deployments to open the admin area without signing in.
 * Leaving it unset (or anything other than "true") requires real admin auth.
 */
export function isAdminDemoEnabled() {
  return process.env.ADMIN_DESIGN_PREVIEW === "true";
}

/**
 * Account stays open for demo deployments unless explicitly disabled.
 * Set ACCOUNT_DESIGN_PREVIEW=false when real account auth is required.
 */
export function isAccountDesignPreviewEnabled() {
  return process.env.ACCOUNT_DESIGN_PREVIEW !== "false";
}

export function getAccountDesignPreviewSession(): Session | null {
  return isAccountDesignPreviewEnabled() ? ACCOUNT_DESIGN_PREVIEW_SESSION : null;
}

export function getAdminDesignPreviewSession(): Session | null {
  return isAdminDemoEnabled() ? ADMIN_DESIGN_PREVIEW_SESSION : null;
}
