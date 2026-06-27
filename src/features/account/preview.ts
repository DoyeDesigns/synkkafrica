import type { Session } from "next-auth";

export const ACCOUNT_DESIGN_PREVIEW_SESSION: Session = {
  user: {
    id: "design-preview-user",
    name: "Victor",
    email: "victor@synkkaffric.com",
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Lets account pages render without a real session while designing locally.
 * Set ACCOUNT_DESIGN_PREVIEW=false to require sign-in again in development.
 */
export function isAccountDesignPreviewEnabled() {
  if (process.env.ACCOUNT_DESIGN_PREVIEW === "true") {
    return true;
  }

  if (process.env.ACCOUNT_DESIGN_PREVIEW === "false") {
    return false;
  }

  return process.env.NODE_ENV === "development";
}

export function getAccountDesignPreviewSession(): Session | null {
  return isAccountDesignPreviewEnabled() ? ACCOUNT_DESIGN_PREVIEW_SESSION : null;
}
