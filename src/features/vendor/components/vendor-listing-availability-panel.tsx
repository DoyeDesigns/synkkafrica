"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { VendorBookingAvailabilityCalendar } from "@/features/vendor/components/vendor-booking-availability-calendar";
import {
  cloneTimeSlots,
  createDefaultAvailabilityConfig,
  getDayTimeSlots,
  LEAD_TIME_UNIT_OPTIONS,
  type LeadTimeUnit,
  type ListingAvailabilityConfig,
  type TimeSlot,
} from "@/features/vendor/data/vendor-listing-availability";
import { VENDOR_QUERY_KEYS } from "@/features/vendor/vendor-query-keys";
import { useTranslation } from "@/hooks/use-translation";
import {
  getVendorListing,
  listVendorListings,
  setVendorListingAvailability,
  type VendorListingDetail,
} from "@/lib/api/vendor";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
import type { TranslationKey } from "@/lib/preferences/translations";

const LEAD_TIME_UNIT_LABEL_KEYS: Record<LeadTimeUnit, TranslationKey> = {
  hours: "vendor.listings.availability.leadTimeUnitHours",
  days: "vendor.listings.availability.leadTimeUnitDays",
};

function formatSlotTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

// The backend stores availability as opaque JSON in exactly this config
// shape. Anything missing/malformed falls back to the defaults.
function toAvailabilityConfig(
  listingId: string,
  raw: unknown,
): ListingAvailabilityConfig {
  const fallback = createDefaultAvailabilityConfig(listingId);
  if (!isRecord(raw)) return fallback;
  const leadTime = isRecord(raw.leadTime) ? raw.leadTime : null;
  return {
    listingId,
    defaultCapacity:
      typeof raw.defaultCapacity === "number" && raw.defaultCapacity > 0
        ? raw.defaultCapacity
        : fallback.defaultCapacity,
    leadTime:
      leadTime &&
      typeof leadTime.value === "number" &&
      (leadTime.unit === "hours" || leadTime.unit === "days")
        ? { value: leadTime.value, unit: leadTime.unit }
        : fallback.leadTime,
    defaultTimeSlots: Array.isArray(raw.defaultTimeSlots)
      ? (raw.defaultTimeSlots as TimeSlot[])
      : fallback.defaultTimeSlots,
    days: isRecord(raw.days)
      ? (raw.days as ListingAvailabilityConfig["days"])
      : fallback.days,
  };
}

export function VendorListingAvailabilityPanel() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data: listings, isLoading: listingsLoading } = useQuery({
    queryKey: VENDOR_QUERY_KEYS.listings,
    queryFn: () => listVendorListings(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const [pickedListingId, setPickedListingId] = useState<string | null>(null);
  // Fall back to the first listing until the vendor picks one (or when the
  // picked one was deleted).
  const selectedListingId =
    (pickedListingId && listings?.some((l) => l.id === pickedListingId)
      ? pickedListingId
      : listings?.[0]?.id) ?? "";

  const { data: listingDetail, isLoading: detailLoading } = useQuery({
    queryKey: VENDOR_QUERY_KEYS.listing(selectedListingId),
    queryFn: () => getVendorListing(token as string, selectedListingId),
    enabled: Boolean(token && selectedListingId),
    ...LIVE_QUERY_OPTIONS,
  });

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"available" | "block">("available");
  // Unsaved edits per listing; the server copy is used until the vendor edits.
  const [edits, setEdits] = useState<Record<string, ListingAvailabilityConfig>>(
    {},
  );
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">(
    "idle",
  );

  const serverConfig = useMemo(
    () =>
      selectedListingId && listingDetail?.id === selectedListingId
        ? toAvailabilityConfig(selectedListingId, listingDetail.availability)
        : null,
    [listingDetail, selectedListingId],
  );
  const activeConfig = edits[selectedListingId] ?? serverConfig ?? undefined;
  const isDirty = Boolean(edits[selectedListingId]);

  const saveMutation = useMutation({
    mutationFn: ({
      listingId,
      config,
    }: {
      listingId: string;
      config: ListingAvailabilityConfig;
    }) =>
      setVendorListingAvailability(
        token as string,
        listingId,
        config as unknown as Record<string, unknown>,
      ),
    onMutate: () => setSaveState("idle"),
    onSuccess: (updated: VendorListingDetail, { listingId }) => {
      queryClient.setQueryData(VENDOR_QUERY_KEYS.listing(listingId), updated);
      setEdits((current) => {
        const next = { ...current };
        delete next[listingId];
        return next;
      });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2500);
    },
    onError: () => setSaveState("error"),
  });

  const dayStatuses = useMemo(() => {
    if (!activeConfig) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(activeConfig.days).map(([dateKey, day]) => [
        dateKey,
        day.status,
      ]),
    );
  }, [activeConfig]);

  const selectedDaySlots = useMemo(() => {
    if (!activeConfig || !selectedDateKey) {
      return [];
    }

    const day = activeConfig.days[selectedDateKey];
    if (day?.status === "blocked") {
      return [];
    }

    return getDayTimeSlots(activeConfig, selectedDateKey);
  }, [activeConfig, selectedDateKey]);

  const updateConfig = (
    listingId: string,
    updater: (config: ListingAvailabilityConfig) => ListingAvailabilityConfig,
  ) => {
    setSaveState("idle");
    setEdits((current) => {
      const existing =
        current[listingId] ??
        (listingId === selectedListingId ? serverConfig : null);
      if (!existing) {
        return current;
      }

      return { ...current, [listingId]: updater(existing) };
    });
  };

  const handleDayClick = (dateKey: string) => {
    setSelectedDateKey(dateKey);

    updateConfig(selectedListingId, (config) => {
      const existingDay = config.days[dateKey];

      if (editMode === "block") {
        if (existingDay?.status === "blocked") {
          const nextDays = { ...config.days };
          delete nextDays[dateKey];
          return { ...config, days: nextDays };
        }

        return {
          ...config,
          days: {
            ...config.days,
            [dateKey]: { status: "blocked" },
          },
        };
      }

      if (existingDay?.status === "available") {
        const nextDays = { ...config.days };
        delete nextDays[dateKey];
        return { ...config, days: nextDays };
      }

      return {
        ...config,
        days: {
          ...config.days,
          [dateKey]: {
            status: "available",
            timeSlots: cloneTimeSlots(config.defaultTimeSlots),
          },
        },
      };
    });
  };

  const handleDefaultCapacityChange = (value: number) => {
    const capacity = Number.isFinite(value) && value > 0 ? value : 1;

    updateConfig(selectedListingId, (config) => ({
      ...config,
      defaultCapacity: capacity,
      defaultTimeSlots: config.defaultTimeSlots.map((slot) => ({
        ...slot,
        capacity: slot.enabled ? capacity : slot.capacity,
      })),
    }));
  };

  const handleLeadTimeChange = (value: number, unit: LeadTimeUnit) => {
    const leadValue = Number.isFinite(value) && value > 0 ? value : 1;

    updateConfig(selectedListingId, (config) => ({
      ...config,
      leadTime: { value: leadValue, unit },
    }));
  };

  const handleSlotChange = (
    slotId: string,
    patch: Partial<Pick<TimeSlot, "capacity" | "enabled">>,
  ) => {
    if (!selectedDateKey || !activeConfig) {
      return;
    }

    updateConfig(selectedListingId, (config) => {
      const day = config.days[selectedDateKey];
      const baseSlots =
        day?.timeSlots ?? cloneTimeSlots(config.defaultTimeSlots);
      const nextSlots = baseSlots.map((slot) =>
        slot.id === slotId ? { ...slot, ...patch } : slot,
      );

      return {
        ...config,
        days: {
          ...config.days,
          [selectedDateKey]: {
            status: "available",
            timeSlots: nextSlots,
          },
        },
      };
    });
  };

  const selectedDayLabel = selectedDateKey
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${selectedDateKey}T12:00:00`))
    : null;

  const selectedDayStatus = selectedDateKey
    ? activeConfig?.days[selectedDateKey]?.status
    : undefined;

  if (listingsLoading || (selectedListingId && detailLoading && !activeConfig)) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-sm font-medium font-satoshi text-[#676565]">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("common.loading")}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t("vendor.listings.availability.noListings")}
      </p>
    );
  }

  if (!activeConfig) {
    return (
      <p className="text-sm font-medium font-satoshi text-[#C0392B]">
        {t("vendor.listings.availability.loadFailed")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.listings.availability.selectListing")}
        </span>
        <div className="relative">
          <select
            value={selectedListingId}
            onChange={(event) => {
              setPickedListingId(event.target.value);
              setSelectedDateKey(null);
              setSaveState("idle");
            }}
            className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white px-3 pr-10 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
          >
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]"
            strokeWidth={1.75}
          />
        </div>
      </label>

      <div className="flex rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] p-1">
        {(["available", "block"] as const).map((mode) => {
          const isActive = editMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => setEditMode(mode)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold font-satoshi transition-colors ${
                isActive
                  ? mode === "block"
                    ? "bg-[#C0392B] text-white"
                    : "bg-[#D85A30] text-white"
                  : "text-[#676565] hover:text-[#2F2F2F]"
              }`}
            >
              {mode === "available"
                ? t("vendor.listings.availability.modeAvailable")
                : t("vendor.listings.availability.modeBlock")}
            </button>
          );
        })}
      </div>

      <p className="text-xs font-medium font-satoshi text-[#676565]">
        {editMode === "available"
          ? t("vendor.listings.availability.modeAvailableHint")
          : t("vendor.listings.availability.modeBlockHint")}
      </p>

      <VendorBookingAvailabilityCalendar
        viewDate={viewDate}
        onViewDateChange={setViewDate}
        dayStatuses={dayStatuses}
        selectedDateKey={selectedDateKey}
        editMode={editMode}
        onDayClick={handleDayClick}
      />

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.listings.availability.timeSlots")}
        </h4>

        {selectedDateKey && selectedDayLabel ? (
          <>
            <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
              {selectedDayLabel}
              {selectedDayStatus === "blocked"
                ? ` · ${t("vendor.listings.availability.blocked")}`
                : ""}
            </p>

            {selectedDayStatus === "blocked" ? (
              <p className="mt-3 rounded-lg bg-[#FDEBEB] px-3 py-2.5 text-sm font-medium font-satoshi text-[#C0392B]">
                {t("vendor.listings.availability.blockedDayMessage")}
              </p>
            ) : selectedDaySlots.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {selectedDaySlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex flex-col gap-2 rounded-lg border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(event) =>
                          handleSlotChange(slot.id, {
                            enabled: event.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-[#D0D0D0] accent-[#D85A30]"
                      />
                      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                        {formatSlotTime(slot.time)}
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <span className="text-xs font-medium font-satoshi text-[#676565]">
                        {t("vendor.listings.availability.capacity")}
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={slot.capacity}
                        disabled={!slot.enabled}
                        onChange={(event) =>
                          handleSlotChange(slot.id, {
                            capacity: Number(event.target.value),
                          })
                        }
                        className="h-9 w-20 rounded-lg border border-[#E5E5E5] bg-white px-2 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785] disabled:opacity-50"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.listings.availability.selectAvailableDay")}
              </p>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
            {t("vendor.listings.availability.selectDayHint")}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.listings.availability.defaultCapacity")}
        </h4>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.listings.availability.defaultCapacityHint")}
        </p>
        <input
          type="number"
          min={1}
          value={activeConfig.defaultCapacity}
          onChange={(event) =>
            handleDefaultCapacityChange(Number(event.target.value))
          }
          className="mt-3 h-10 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785] sm:w-28"
        />
      </div>

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.listings.availability.leadTime")}
        </h4>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.listings.availability.leadTimeHint")}
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="number"
            min={1}
            value={activeConfig.leadTime.value}
            onChange={(event) =>
              handleLeadTimeChange(
                Number(event.target.value),
                activeConfig.leadTime.unit,
              )
            }
            className="h-10 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785] sm:w-24"
          />

          <div className="relative flex-1">
            <select
              value={activeConfig.leadTime.unit}
              onChange={(event) =>
                handleLeadTimeChange(
                  activeConfig.leadTime.value,
                  event.target.value as LeadTimeUnit,
                )
              }
              className="h-10 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white px-3 pr-10 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
            >
              {LEAD_TIME_UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {t(LEAD_TIME_UNIT_LABEL_KEYS[unit])}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]"
              strokeWidth={1.75}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {saveState === "saved" ? (
          <span className="text-sm font-semibold font-satoshi text-[#2E7D32]">
            {t("vendor.listings.availability.saved")}
          </span>
        ) : saveState === "error" ? (
          <span role="alert" className="text-sm font-medium font-satoshi text-[#C0392B]">
            {t("vendor.listings.availability.saveFailed")}
          </span>
        ) : null}
        <button
          type="button"
          disabled={!isDirty || saveMutation.isPending || !token}
          onClick={() =>
            saveMutation.mutate({
              listingId: selectedListingId,
              config: activeConfig,
            })
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {t("vendor.listings.availability.save")}
        </button>
      </div>
    </div>
  );
}
