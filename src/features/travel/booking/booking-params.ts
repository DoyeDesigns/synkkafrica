export type CarRentalMode = "self_drive" | "with_driver";

export type BookingParams = {
  room?: string;
  option?: string;
  tier?: string;
  package?: string;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  time?: string;
  days?: number;
  guests: number;
  rooms: number;
  specialRequests?: string;
  carRentalMode?: CarRentalMode;
  deliveryAddress?: string;
  customerPickupAddress?: string;
  requestDelivery?: boolean;
  email?: string;
  guestFirstName?: string;
};

export function parseBookingParams(searchParams: URLSearchParams): BookingParams {
  const guests = Number(searchParams.get("guests"));
  const rooms = Number(searchParams.get("rooms"));
  const days = Number(searchParams.get("days"));

  return {
    room: searchParams.get("room") ?? undefined,
    option: searchParams.get("option") ?? undefined,
    tier: searchParams.get("tier") ?? undefined,
    package: searchParams.get("package") ?? undefined,
    checkIn: searchParams.get("checkIn") ?? undefined,
    checkOut: searchParams.get("checkOut") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    time: searchParams.get("time") ?? undefined,
    days: Number.isFinite(days) && days > 0 ? days : undefined,
    guests: Number.isFinite(guests) && guests > 0 ? guests : 2,
    rooms: Number.isFinite(rooms) && rooms > 0 ? rooms : 1,
    specialRequests: searchParams.get("specialRequests") ?? undefined,
    carRentalMode:
      searchParams.get("carRentalMode") === "with_driver"
        ? "with_driver"
        : searchParams.get("carRentalMode") === "self_drive"
          ? "self_drive"
          : undefined,
    deliveryAddress: searchParams.get("deliveryAddress") ?? undefined,
    customerPickupAddress: searchParams.get("customerPickupAddress") ?? undefined,
    requestDelivery: searchParams.get("requestDelivery") === "true",
    email: searchParams.get("email") ?? undefined,
    guestFirstName: searchParams.get("guestFirstName") ?? undefined,
  };
}

export function isValidGuestEmail(value: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
}

export function serializeBookingParams(
  params: Partial<BookingParams>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.room) searchParams.set("room", params.room);
  if (params.option) searchParams.set("option", params.option);
  if (params.tier) searchParams.set("tier", params.tier);
  if (params.package) searchParams.set("package", params.package);
  if (params.checkIn) searchParams.set("checkIn", params.checkIn);
  if (params.checkOut) searchParams.set("checkOut", params.checkOut);
  if (params.date) searchParams.set("date", params.date);
  if (params.time) searchParams.set("time", params.time);
  if (params.days) searchParams.set("days", String(params.days));
  if (params.guests) searchParams.set("guests", String(params.guests));
  if (params.rooms) searchParams.set("rooms", String(params.rooms));
  if (params.specialRequests) {
    searchParams.set("specialRequests", params.specialRequests);
  }
  if (params.carRentalMode) {
    searchParams.set("carRentalMode", params.carRentalMode);
  }
  if (params.deliveryAddress) {
    searchParams.set("deliveryAddress", params.deliveryAddress);
  }
  if (params.customerPickupAddress) {
    searchParams.set("customerPickupAddress", params.customerPickupAddress);
  }
  if (params.requestDelivery) {
    searchParams.set("requestDelivery", "true");
  }
  if (params.email) searchParams.set("email", params.email);
  if (params.guestFirstName) {
    searchParams.set("guestFirstName", params.guestFirstName);
  }

  return searchParams;
}

export function generateBookingReference() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SYNK-${suffix}`;
}

export function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function firstQueryValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export function readDateParam(value: string | string[] | undefined) {
  const raw = firstQueryValue(value);
  return parseLocalDateKey(raw) ? raw : "";
}

export function readCountParam(
  value: string | string[] | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const raw = Number(firstQueryValue(value));
  if (!Number.isFinite(raw)) return fallback;

  return Math.min(max, Math.max(min, Math.trunc(raw)));
}

export function readTimeParam(value: string | string[] | undefined) {
  const raw = firstQueryValue(value);
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(raw) ? raw : "";
}

export function withBookingSearch(
  path: string,
  searchParams: { get(key: string): string | null },
  keys: readonly string[],
) {
  const params = new URLSearchParams();

  for (const key of keys) {
    const value = searchParams.get(key)?.trim();
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function parseLocalDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function getDefaultCheckInDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return formatLocalDateKey(date);
}

export function getDefaultCheckOutDate(checkIn?: string) {
  const date = checkIn ? parseLocalDateKey(checkIn) : new Date();
  if (!date) return "";

  if (!checkIn) {
    date.setDate(date.getDate() + 7);
  }
  date.setDate(date.getDate() + 1);
  return formatLocalDateKey(date);
}

export function calculateNights(checkIn: string, checkOut: string) {
  const start = parseLocalDateKey(checkIn);
  const end = parseLocalDateKey(checkOut);
  if (!start || !end) return 0;

  const diff = end.getTime() - start.getTime();
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

export function addDaysToDate(dateKey: string, days: number) {
  const date = parseLocalDateKey(dateKey);
  if (!date) return "";

  date.setDate(date.getDate() + days);
  return formatLocalDateKey(date);
}

export function getCheckOutFromNights(checkIn: string, nights: number) {
  return addDaysToDate(checkIn, Math.max(1, nights));
}

export function getEndDateFromDays(startDate: string, days: number) {
  return addDaysToDate(startDate, Math.max(0, days - 1));
}
