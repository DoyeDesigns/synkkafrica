import {
  DEFAULT_TIME_SLOTS,
  toDateKey,
  type AvailabilityDayStatus,
} from "@/features/vendor/data/vendor-listing-availability";

export type BookingTimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

const SHARED_BLOCKED_DATES = [
  "2026-09-12",
  "2026-09-25",
  "2026-10-03",
  "2026-10-17",
];

function hashPropertyId(propertyId: string) {
  return propertyId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getPropertyDayStatuses(
  propertyId: string,
): Record<string, AvailabilityDayStatus> {
  const statuses: Record<string, AvailabilityDayStatus> = {};
  const seed = hashPropertyId(propertyId);
  const today = new Date();

  for (let offset = 0; offset < 120; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateKey = toDateKey(date);

    if (dateKey < toDateKey(today)) {
      statuses[dateKey] = "blocked";
      continue;
    }

    if (SHARED_BLOCKED_DATES.includes(dateKey)) {
      statuses[dateKey] = "blocked";
      continue;
    }

    if ((offset + seed) % 11 === 0) {
      statuses[dateKey] = "blocked";
      continue;
    }

    statuses[dateKey] = "available";
  }

  return statuses;
}

export function getPropertyTimeSlots(): BookingTimeSlot[] {
  return DEFAULT_TIME_SLOTS.filter((slot) => slot.enabled).map((slot) => ({
    id: slot.id,
    time: slot.time,
    available: true,
  }));
}

export function getTourDayStatuses(tourId: string): Record<string, AvailabilityDayStatus> {
  return getPropertyDayStatuses(tourId);
}

export function getTourTimeSlots(): BookingTimeSlot[] {
  return getPropertyTimeSlots();
}

export function isDateBlocked(
  dayStatuses: Record<string, AvailabilityDayStatus>,
  dateKey: string,
) {
  return dayStatuses[dateKey] === "blocked";
}

export function isRangeBlocked(
  dayStatuses: Record<string, AvailabilityDayStatus>,
  checkIn: string,
  checkOut: string,
) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  for (let current = new Date(start); current < end; current.setDate(current.getDate() + 1)) {
    if (isDateBlocked(dayStatuses, toDateKey(current))) {
      return true;
    }
  }

  return false;
}
