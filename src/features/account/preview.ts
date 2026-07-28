import type { Session } from "next-auth";

export const ACCOUNT_DESIGN_PREVIEW_SESSION: Session = {
  user: {
    id: "design-preview-user",
    name: "Victor",
    email: "victor@synkkaffric.com",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const ADMIN_DESIGN_PREVIEW_SESSION: Session = {
  user: {
    id: "design-preview-admin",
    name: "Admin",
    email: "admin@synkkaffric.com",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Admin stays open for demo deployments unless explicitly disabled.
 * Set ADMIN_DESIGN_PREVIEW=false when real admin auth is required.
 */
export function isAdminDemoEnabled() {
  return process.env.ADMIN_DESIGN_PREVIEW !== "false";
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
