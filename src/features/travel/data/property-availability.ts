import {
  DEFAULT_TIME_SLOTS,
  toDateKey,
  type AvailabilityDayStatus,
} from "@/features/vendor/data/vendor-listing-availability";
import { addDaysToDate } from "@/features/travel/booking/booking-params";

export type BookingTimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

// Listings do not publish a blocked-day calendar yet. Past days are disabled
// by the date picker itself; do not invent the same unavailable days for every listing.
export function getPropertyDayStatuses(
  _propertyId: string,
): Record<string, AvailabilityDayStatus> {
  return {};
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
  const start = dateFromKey(checkIn);
  const end = dateFromKey(checkOut);

  for (let current = new Date(start); current < end; current.setDate(current.getDate() + 1)) {
    if (isDateBlocked(dayStatuses, toDateKey(current))) {
      return true;
    }
  }

  return false;
}

export function clampCheckoutDate(
  dayStatuses: Record<string, AvailabilityDayStatus>,
  checkIn: string,
  requestedCheckOut: string,
): string {
  const minimumCheckout = addDaysToDate(checkIn, 1);

  if (requestedCheckOut <= checkIn) {
    return minimumCheckout;
  }

  const start = dateFromKey(checkIn);
  const end = dateFromKey(requestedCheckOut);

  for (
    let current = new Date(start);
    current < end;
    current.setDate(current.getDate() + 1)
  ) {
    if (isDateBlocked(dayStatuses, toDateKey(current))) {
      const dayBeforeBlocked = new Date(current);
      dayBeforeBlocked.setDate(dayBeforeBlocked.getDate() - 1);
      const clampedCheckout = toDateKey(dayBeforeBlocked);

      return clampedCheckout <= checkIn ? minimumCheckout : clampedCheckout;
    }
  }

  return requestedCheckOut;
}
