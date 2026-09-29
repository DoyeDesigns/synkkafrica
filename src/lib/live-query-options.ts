// Query options for dashboard data (vendor + admin) that other people change
// behind the viewer's back — admins approve listings, customers book, vendors
// resubmit. The app-wide default (lib/query-client.ts) turns focus refetch off
// and keeps data fresh for a minute, which left dashboards showing stale state
// until a hard refresh. Spread these into dashboard `useQuery` calls instead.
export const LIVE_QUERY_OPTIONS = {
  staleTime: 10_000,
  refetchOnWindowFocus: true,
} as const;

// For data that arrives without any action from the viewer (new bookings,
// notifications): also poll while the tab is open.
export const POLLING_QUERY_OPTIONS = {
  ...LIVE_QUERY_OPTIONS,
  refetchInterval: 30_000,
} as const;
