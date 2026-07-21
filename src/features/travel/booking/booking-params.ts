export type BookingParams = {
  room?: string;
  option?: string;
  tier?: string;
  package?: string;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  time?: string;
  guests: number;
  rooms: number;
  specialRequests?: string;
};

export function parseBookingParams(searchParams: URLSearchParams): BookingParams {
  const guests = Number(searchParams.get("guests"));
  const rooms = Number(searchParams.get("rooms"));

  return {
    room: searchParams.get("room") ?? undefined,
    option: searchParams.get("option") ?? undefined,
    tier: searchParams.get("tier") ?? undefined,
    package: searchParams.get("package") ?? undefined,
    checkIn: searchParams.get("checkIn") ?? undefined,
    checkOut: searchParams.get("checkOut") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    time: searchParams.get("time") ?? undefined,
    guests: Number.isFinite(guests) && guests > 0 ? guests : 2,
    rooms: Number.isFinite(rooms) && rooms > 0 ? rooms : 1,
    specialRequests: searchParams.get("specialRequests") ?? undefined,
  };
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
  if (params.guests) searchParams.set("guests", String(params.guests));
  if (params.rooms) searchParams.set("rooms", String(params.rooms));
  if (params.specialRequests) {
    searchParams.set("specialRequests", params.specialRequests);
  }

  return searchParams;
}

export function generateBookingReference() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SYNK-${suffix}`;
}

export function getDefaultCheckInDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split("T")[0] ?? "";
}

export function getDefaultCheckOutDate(checkIn?: string) {
  const date = checkIn ? new Date(checkIn) : new Date();
  if (!checkIn) {
    date.setDate(date.getDate() + 7);
  }
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0] ?? "";
}

export function calculateNights(checkIn: string, checkOut: string) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}
