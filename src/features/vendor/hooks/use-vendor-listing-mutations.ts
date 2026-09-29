"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";

import { VENDOR_QUERY_KEYS } from "@/features/vendor/vendor-query-keys";
import { useTranslation } from "@/hooks/use-translation";
import {
  deleteVendorListing,
  setVendorListingStatus,
  type VendorListingSummary,
} from "@/lib/api/vendor";

type ToggleableStatus = "live" | "paused";

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// Pause/resume + delete for vendor listings, shared by the dashboard and the
// listings page so both render working card buttons.
//
// Pause/resume is optimistic: the card flips immediately, rolls back just that
// listing on failure, and the toggle is disabled while its request is in
// flight (double clicks used to race and 403).
export function useVendorListingMutations() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);

  const markPending = useCallback((id: string, pending: boolean) => {
    setPendingIds((current) => {
      const next = new Set(current);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const setCachedStatus = (id: string, status: VendorListingSummary["status"]) =>
    queryClient.setQueryData<VendorListingSummary[]>(
      VENDOR_QUERY_KEYS.listings,
      (current) =>
        current?.map((listing) =>
          listing.id === id ? { ...listing, status } : listing,
        ),
    );

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ToggleableStatus }) => {
      if (!token) throw new Error(t("vendor.listings.errors.noSession"));
      return setVendorListingStatus(token, id, status);
    },
    onMutate: async ({ id, status }) => {
      setError(null);
      markPending(id, true);
      await queryClient.cancelQueries({ queryKey: VENDOR_QUERY_KEYS.listings });
      const previous = queryClient
        .getQueryData<VendorListingSummary[]>(VENDOR_QUERY_KEYS.listings)
        ?.find((listing) => listing.id === id)?.status;
      setCachedStatus(id, status);
      return { previous };
    },
    onError: (err, { id }, context) => {
      if (context?.previous) setCachedStatus(id, context.previous);
      setError(errorMessage(err, t("vendor.listings.errors.statusFailed")));
    },
    onSettled: (_data, _err, { id }) => {
      markPending(id, false);
      void queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.listings });
      void queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.listing(id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error(t("vendor.listings.errors.noSession"));
      return deleteVendorListing(token, id);
    },
    onMutate: () => setError(null),
    onError: (err) =>
      setError(errorMessage(err, t("vendor.listings.errors.deleteFailed"))),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<VendorListingSummary[]>(
        VENDOR_QUERY_KEYS.listings,
        (current) => current?.filter((listing) => listing.id !== id),
      );
      queryClient.removeQueries({ queryKey: VENDOR_QUERY_KEYS.listing(id) });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: VENDOR_QUERY_KEYS.listings }),
  });

  // Only live <-> paused is a vendor action; the backend 403s anything else.
  const togglePause = (id: string) => {
    if (pendingIds.has(id)) return;
    const current = queryClient
      .getQueryData<VendorListingSummary[]>(VENDOR_QUERY_KEYS.listings)
      ?.find((listing) => listing.id === id);
    if (!current || (current.status !== "live" && current.status !== "paused")) {
      return;
    }
    statusMutation.mutate({
      id,
      status: current.status === "live" ? "paused" : "live",
    });
  };

  const deleteListing = (id: string, options?: { onSuccess?: () => void }) =>
    deleteMutation.mutate(id, { onSuccess: () => options?.onSuccess?.() });

  return {
    togglePause,
    isTogglePending: (id: string) => pendingIds.has(id),
    deleteListing,
    isDeleting: deleteMutation.isPending,
    error,
    clearError: () => setError(null),
  };
}
