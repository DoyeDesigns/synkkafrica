"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listMySaved, saveListing, unsaveListing } from "@/lib/api/users";

// Heart toggle that saves/unsaves a listing to the customer's wishlist.
// Reads the saved set (shared cache with the account Saved page) to reflect
// current state. No-op for signed-out visitors.
export function SaveListingButton({
  listingId,
  className = "",
}: {
  listingId: string;
  className?: string;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: saved = [] } = useQuery({
    queryKey: ["account-saved"],
    queryFn: () => listMySaved(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
  const isSaved = saved.some((s) => s.listingId === listingId);

  const mutation = useMutation({
    mutationFn: () =>
      isSaved
        ? unsaveListing(token as string, listingId)
        : saveListing(token as string, listingId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["account-saved"] }),
  });

  return (
    <button
      type="button"
      onClick={() => {
        if (token && !mutation.isPending) mutation.mutate();
      }}
      disabled={!token || mutation.isPending}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save"}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`h-5 w-5 ${
          isSaved ? "fill-[#D85A30] text-[#D85A30]" : "text-foreground"
        }`}
        strokeWidth={1.5}
      />
    </button>
  );
}
