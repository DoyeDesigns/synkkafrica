import type { BookingParams } from "@/features/travel/booking/booking-params";
import { generateBookingReference } from "@/features/travel/booking/booking-params";
import {
  getRememberedAccountUser,
  syncConfirmationToUserBookings,
} from "@/features/account/data/account-bookings-store";

export type BookingProductType = "accommodation" | "tour" | "car" | "tour-package";

export type StoredBookingConfirmation = {
  reference: string;
  productType: BookingProductType;
  productId: string;
  productName: string;
  checkIn?: string;
  checkOut?: string;
  date?: string;
  time?: string;
  guests: number;
  rooms?: number;
  total?: number;
  currency?: string;
  specialRequests?: string;
};

const STORAGE_KEY = "synk-booking-confirmation";

export function createBookingConfirmation(
  input: Omit<StoredBookingConfirmation, "reference"> & { reference?: string },
): StoredBookingConfirmation {
  const confirmation: StoredBookingConfirmation = {
    reference: input.reference ?? generateBookingReference(),
    ...input,
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(confirmation));

    const user = getRememberedAccountUser();

    if (user) {
      syncConfirmationToUserBookings(user.userId, user.userEmail, confirmation);
    }
  }

  return confirmation;
}

export function getStoredBookingConfirmation(): StoredBookingConfirmation | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredBookingConfirmation;
  } catch {
    return null;
  }
}

function formatIcsDate(date: string, time = "09:00") {
  const [hours, minutes] = time.split(":");
  const value = new Date(`${date}T${hours}:${minutes}:00`);
  return value.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function buildGoogleCalendarUrl(confirmation: StoredBookingConfirmation) {
  const startDate = confirmation.checkIn ?? confirmation.date ?? "";
  const endDate = confirmation.checkOut ?? confirmation.date ?? startDate;
  const start = formatIcsDate(startDate, confirmation.time ?? "09:00");
  const end = formatIcsDate(endDate, confirmation.time ?? "17:00");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: confirmation.productName,
    dates: `${start}/${end}`,
    details: `Booking reference: ${confirmation.reference}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(confirmation: StoredBookingConfirmation) {
  const startDate = confirmation.checkIn ?? confirmation.date ?? "";
  const endDate = confirmation.checkOut ?? confirmation.date ?? startDate;
  const start = formatIcsDate(startDate, confirmation.time ?? "09:00");
  const end = formatIcsDate(endDate, confirmation.time ?? "17:00");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SynkAfrica//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${confirmation.reference}@synkafrica.com`,
    `DTSTAMP:${formatIcsDate(new Date().toISOString().split("T")[0] ?? "")}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${confirmation.productName}`,
    `DESCRIPTION:Booking reference ${confirmation.reference}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${confirmation.reference}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function bookingParamsToConfirmationInput(
  params: BookingParams,
  product: {
    type: BookingProductType;
    id: string;
    name: string;
    total?: number;
    currency?: string;
  },
): Omit<StoredBookingConfirmation, "reference"> {
  return {
    productType: product.type,
    productId: product.id,
    productName: product.name,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    date: params.date,
    time: params.time,
    guests: params.guests,
    rooms: params.rooms,
    total: product.total,
    currency: product.currency,
    specialRequests: params.specialRequests,
  };
}
