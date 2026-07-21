import { VENDOR_LISTINGS_PAGE_ITEMS } from "@/features/vendor/data/vendor-listings";

export type AvailabilityDayStatus = "available" | "blocked";

export type LeadTimeUnit = "hours" | "days";

export type TimeSlot = {
  id: string;
  time: string;
  capacity: number;
  enabled: boolean;
};

export type LeadTimeRule = {
  value: number;
  unit: LeadTimeUnit;
};

export type ListingAvailabilityConfig = {
  listingId: string;
  defaultCapacity: number;
  leadTime: LeadTimeRule;
  defaultTimeSlots: TimeSlot[];
  days: Record<
    string,
    {
      status: AvailabilityDayStatus;
      timeSlots?: TimeSlot[];
    }
  >;
};

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: "slot-0900", time: "09:00", capacity: 8, enabled: true },
  { id: "slot-1200", time: "12:00", capacity: 8, enabled: true },
  { id: "slot-1500", time: "15:00", capacity: 8, enabled: true },
  { id: "slot-1730", time: "17:30", capacity: 6, enabled: true },
];

export const LEAD_TIME_UNIT_OPTIONS: LeadTimeUnit[] = ["hours", "days"];

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function cloneTimeSlots(slots: TimeSlot[]): TimeSlot[] {
  return slots.map((slot) => ({ ...slot }));
}

export function createDefaultAvailabilityConfig(
  listingId: string,
): ListingAvailabilityConfig {
  return {
    listingId,
    defaultCapacity: 8,
    leadTime: { value: 24, unit: "hours" },
    defaultTimeSlots: cloneTimeSlots(DEFAULT_TIME_SLOTS),
    days: {},
  };
}

function buildInitialDays(): ListingAvailabilityConfig["days"] {
  return {
    "2026-09-09": { status: "available" },
    "2026-09-19": { status: "available" },
    "2026-09-20": { status: "available" },
    "2026-09-21": { status: "available" },
    "2026-09-30": { status: "available" },
    "2026-09-12": { status: "blocked" },
    "2026-09-25": { status: "blocked" },
  };
}

export function createInitialAvailabilityConfigs(): Record<
  string,
  ListingAvailabilityConfig
> {
  const configs: Record<string, ListingAvailabilityConfig> = {};

  for (const listing of VENDOR_LISTINGS_PAGE_ITEMS) {
    const config = createDefaultAvailabilityConfig(listing.id);

    if (listing.id === "lagos-lagoon-sunset-cruise") {
      config.defaultCapacity = 12;
      config.leadTime = { value: 48, unit: "hours" };
      config.defaultTimeSlots = [
        { id: "slot-1730", time: "17:30", capacity: 12, enabled: true },
      ];
      config.days = buildInitialDays();
    }

    configs[listing.id] = config;
  }

  return configs;
}

export function getDayTimeSlots(
  config: ListingAvailabilityConfig,
  dateKey: string,
): TimeSlot[] {
  const day = config.days[dateKey];

  if (day?.timeSlots) {
    return cloneTimeSlots(day.timeSlots);
  }

  return cloneTimeSlots(config.defaultTimeSlots);
}
