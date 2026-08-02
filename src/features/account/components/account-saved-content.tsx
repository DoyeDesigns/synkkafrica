"use client";

import Image from "next/image";
import { Star, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SavedSection } from "@/features/account/components/saved-section";
import { useTranslation } from "@/hooks/use-translation";
import {
  listMySaved,
  unsaveListing,
  type SavedListingApi,
} from "@/lib/api/users";

const FALLBACK_IMAGE = "/hero/accommodations.png";

const savedScrollClass =
  "flex w-full min-w-0 max-w-full gap-5 overflow-x-auto pb-2";

export function AccountSavedContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: saved = [], isLoading } = useQuery({
    queryKey: ["account-saved"],
    queryFn: () => listMySaved(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const unsaveMutation = useMutation({
    mutationFn: (listingId: string) => unsaveListing(token as string, listingId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["account-saved"] }),
  });

  const byCategory = (category: SavedListingApi["category"]) =>
    saved.filter((s) => s.category === category);

  const accommodations = byCategory("accommodations");
  const cars = byCategory("cars");
  const tours = byCategory("experiences");

  const renderRow = (items: SavedListingApi[]) => (
    <div className="min-w-0 overflow-hidden">
      <div className={savedScrollClass}>
        {items.map((item) => (
          <SavedListingCard
            key={item.savedId}
            item={item}
            onRemove={() => unsaveMutation.mutate(item.listingId)}
            removing={unsaveMutation.isPending}
          />
        ))}
      </div>
    </div>
  );

  if (token && !isLoading && saved.length === 0) {
    return (
      <section className="rounded-2xl border border-[#EEEEEE] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium font-satoshi text-foreground/70">
          {t("account.saved.empty")}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-20 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white p-6 shadow-sm sm:p-8">
      <SavedSection
        title={t("account.saved.accommodations")}
        count={accommodations.length}
      >
        {renderRow(accommodations)}
      </SavedSection>

      <SavedSection title={t("account.saved.cars")} count={cars.length}>
        {renderRow(cars)}
      </SavedSection>

      <SavedSection title={t("account.saved.tours")} count={tours.length}>
        {renderRow(tours)}
      </SavedSection>
    </section>
  );
}

function SavedListingCard({
  item,
  onRemove,
  removing,
}: {
  item: SavedListingApi;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <div className="w-[280px] shrink-0 overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white">
      <div className="relative h-40 w-full bg-zinc-100">
        <Image
          src={item.coverImageUrl || FALLBACK_IMAGE}
          alt={item.title}
          fill
          className="object-cover"
          sizes="280px"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label="Remove from saved"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4 text-[#C0392B]" strokeWidth={2} />
        </button>
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
          {item.title}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
          {item.location ?? "—"}
        </p>
        {item.ratingCount > 0 ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold font-satoshi text-[#2F2F2F]">
            <Star className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
            {item.ratingAvg.toFixed(1)} · {item.ratingCount}
          </p>
        ) : null}
      </div>
    </div>
  );
}
