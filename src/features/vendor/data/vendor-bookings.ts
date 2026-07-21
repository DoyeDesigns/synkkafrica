export type VendorBookingTab = "upcoming" | "past" | "cancelled";

export type VendorBookingStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export type VendorBookingDateRange =
  | "all"
  | "pastMonth"
  | "past3Months"
  | "past6Months"
  | "pastYear";

export type VendorBooking = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  experienceDate: string;
  experienceTime: string;
  guestCount: number;
  guestFirstName: string;
  specialRequests?: string;
  status: VendorBookingStatus;
};

export const VENDOR_BOOKING_DATE_RANGE_OPTIONS: VendorBookingDateRange[] = [
  "all",
  "pastMonth",
  "past3Months",
  "past6Months",
  "pastYear",
];

export const VENDOR_BOOKINGS: VendorBooking[] = [
  {
    id: "vb-1",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-07-25",
    experienceTime: "17:30",
    guestCount: 4,
    guestFirstName: "Amara",
    specialRequests: "One guest uses a wheelchair — please confirm boat access.",
    status: "awaiting_confirmation",
  },
  {
    id: "vb-2",
    listingId: "lekki-garden-suites",
    listingTitle: "Lekki Garden Suites",
    listingImage: "/hero/accommodations.png",
    experienceDate: "2026-08-03",
    experienceTime: "14:00",
    guestCount: 2,
    guestFirstName: "Chidi",
    status: "awaiting_confirmation",
  },
  {
    id: "vb-3",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-08-10",
    experienceTime: "17:30",
    guestCount: 6,
    guestFirstName: "Fatima",
    specialRequests: "Vegetarian refreshments preferred.",
    status: "confirmed",
  },
  {
    id: "vb-4",
    listingId: "toyota-camry-2021",
    listingTitle: "Toyota Camry 2021",
    listingImage: "/hero/car-rentals.png",
    experienceDate: "2026-07-28",
    experienceTime: "09:00",
    guestCount: 1,
    guestFirstName: "Emeka",
    status: "confirmed",
  },
  {
    id: "vb-5",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-07-05",
    experienceTime: "17:30",
    guestCount: 3,
    guestFirstName: "Ngozi",
    status: "completed",
  },
  {
    id: "vb-6",
    listingId: "lekki-garden-suites",
    listingTitle: "Lekki Garden Suites",
    listingImage: "/hero/accommodations.png",
    experienceDate: "2026-06-15",
    experienceTime: "15:00",
    guestCount: 2,
    guestFirstName: "Tunde",
    specialRequests: "Late check-in around 10 PM.",
    status: "completed",
  },
  {
    id: "vb-7",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-07-15",
    experienceTime: "17:30",
    guestCount: 2,
    guestFirstName: "Zainab",
    status: "cancelled",
  },
  {
    id: "vb-8",
    listingId: "toyota-camry-2021",
    listingTitle: "Toyota Camry 2021",
    listingImage: "/hero/car-rentals.png",
    experienceDate: "2026-05-20",
    experienceTime: "11:00",
    guestCount: 1,
    guestFirstName: "Kofi",
    status: "declined",
  },
];

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getVendorBookingTab(
  booking: VendorBooking,
  referenceDate = new Date(),
): VendorBookingTab {
  if (booking.status === "cancelled" || booking.status === "declined") {
    return "cancelled";
  }

  if (booking.status === "completed") {
    return "past";
  }

  const experienceDay = startOfDay(new Date(booking.experienceDate));
  const today = startOfDay(referenceDate);

  if (experienceDay < today) {
    return "past";
  }

  return "upcoming";
}

export function isWithinDateRange(
  experienceDate: string,
  range: VendorBookingDateRange,
  referenceDate = new Date(),
): boolean {
  if (range === "all") {
    return true;
  }

  const experienceDay = startOfDay(new Date(experienceDate));
  const today = startOfDay(referenceDate);
  const rangeStart = new Date(today);

  switch (range) {
    case "pastMonth":
      rangeStart.setMonth(rangeStart.getMonth() - 1);
      break;
    case "past3Months":
      rangeStart.setMonth(rangeStart.getMonth() - 3);
      break;
    case "past6Months":
      rangeStart.setMonth(rangeStart.getMonth() - 6);
      break;
    case "pastYear":
      rangeStart.setFullYear(rangeStart.getFullYear() - 1);
      break;
  }

  return experienceDay >= rangeStart;
}

export function formatExperienceDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatExperienceTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
