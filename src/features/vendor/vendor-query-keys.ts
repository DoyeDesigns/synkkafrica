// Single source of truth for vendor React Query keys, so a mutation in one
// screen invalidates exactly what the other screens read.
export const VENDOR_QUERY_KEYS = {
  listings: ["vendor-listings"] as const,
  listing: (id: string) => ["vendor-listing", id] as const,
  bookings: ["vendor-bookings"] as const,
  earnings: ["vendor-earnings"] as const,
  transactions: ["vendor-transactions"] as const,
  // The full business profile (GET /vendor/profile/full). Earnings (payout
  // account) and the business-profile page share this one key.
  profile: ["vendor-profile"] as const,
  notifications: ["vendor-notifications"] as const,
  documents: ["vendor-documents"] as const,
};
