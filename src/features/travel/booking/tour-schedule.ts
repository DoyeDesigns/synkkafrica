import {
  addDaysToDate,
  formatLocalDateKey,
  parseLocalDateKey,
} from "@/features/travel/booking/booking-params";
import type { TourDetail } from "@/features/travel/data/tour-booking";

// Date.getDay() order → backend's lowercase 3-letter day codes.
const DAY_CODES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

// How far ahead we look for the next bookable date before giving up.
const SEARCH_HORIZON_DAYS = 730;

export const DEFAULT_TOUR_GUESTS = 2;

export function todayDateKey() {
  return formatLocalDateKey(new Date());
}

/** True when the vendor's schedule allows booking on this "YYYY-MM-DD" date. */
export function isTourDateBookable(
  tour: TourDetail,
  dateKey: string,
  todayKey: string = todayDateKey(),
) {
  const date = parseLocalDateKey(dateKey);
  if (!date || dateKey < todayKey) return false;

  const schedule = tour.schedule;
  if (!schedule) return true;

  if (schedule.dateRangeStart && dateKey < schedule.dateRangeStart) return false;
  if (schedule.dateRangeEnd && dateKey > schedule.dateRangeEnd) return false;

  const days = schedule.operatingDays?.map((day) => day.toLowerCase());
  if (days && days.length > 0 && !days.includes(DAY_CODES[date.getDay()])) {
    return false;
  }

  return true;
}

/** First bookable date on or after `fromKey` (or today), or "" if none. */
export function nextBookableTourDate(
  tour: TourDetail,
  fromKey?: string,
  todayKey: string = todayDateKey(),
) {
  let cursor = fromKey && fromKey > todayKey ? fromKey : todayKey;
  const rangeStart = tour.schedule?.dateRangeStart;
  if (rangeStart && cursor < rangeStart) cursor = rangeStart;

  for (let index = 0; index < SEARCH_HORIZON_DAYS; index += 1) {
    if (isTourDateBookable(tour, cursor, todayKey)) return cursor;
    const rangeEnd = tour.schedule?.dateRangeEnd;
    if (rangeEnd && cursor > rangeEnd) return "";
    cursor = addDaysToDate(cursor, 1);
    if (!cursor) return "";
  }

  return "";
}

export function tourGuestBounds(tour: TourDetail) {
  const min = Math.max(1, tour.minGuests ?? 1);
  const max =
    tour.maxGuests !== undefined ? Math.max(min, tour.maxGuests) : undefined;
  return { min, max };
}

export function clampTourGuests(tour: TourDetail, guests: number) {
  const { min, max } = tourGuestBounds(tour);
  const atLeastMin = Math.max(min, guests);
  return max !== undefined ? Math.min(max, atLeastMin) : atLeastMin;
}

function minutesOf(time: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/** Hours between two "HH:mm" times, or null when not computable. */
export function hoursBetween(start: string, end: string) {
  const from = minutesOf(start);
  const to = minutesOf(end);
  if (from === null || to === null || to <= from) return null;
  return Math.round(((to - from) / 60) * 10) / 10;
}
