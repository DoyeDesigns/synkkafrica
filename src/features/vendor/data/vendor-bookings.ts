export type VendorBookingTab = "upcoming" | "past" | "declined" | "cancelled";

export type VendorBookingStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled";

export type VendorBookingProductType = "car" | "accommodation" | "experience";

export type VendorCarRentalMode = "self_drive" | "with_driver";

export type VendorBookingDateRange =
  | "all"
  | "pastMonth"
  | "past3Months"
  | "past6Months"
  | "pastYear";

export type VendorBooking = {
  id: string;
  bookingReference: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  productType?: VendorBookingProductType;
  experienceDate: string;
  experienceTime: string;
  guestCount: number;
  guestFirstName: string;
  specialRequests?: string;
  carRentalMode?: VendorCarRentalMode;
  deliveryAddress?: string;
  pickupAddress?: string;
  declineReason?: string;
  status: VendorBookingStatus;
  amount: number;
  currency: string;
  paymentSecured: boolean;
  respondBy?: string;
};

export type VendorBookingListingOption = {
  id: string;
  title: string;
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
    bookingReference: "BKG-5521",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-07-28",
    experienceTime: "17:30",
    guestCount: 4,
    guestFirstName: "Amara",
    specialRequests: "One guest uses a wheelchair — please confirm boat access.",
    status: "awaiting_confirmation",
    amount: 65_000,
    currency: "NGN",
    paymentSecured: true,
    respondBy: "2026-07-27T04:20:00.000Z",
  },
  {
    id: "vb-2",
    bookingReference: "BKG-5514",
    listingId: "lekki-garden-suites",
    listingTitle: "Lekki Garden Suites",
    listingImage: "/hero/accommodations.png",
    experienceDate: "2026-08-03",
    experienceTime: "14:00",
    guestCount: 2,
    guestFirstName: "Chidi",
    status: "awaiting_confirmation",
    amount: 120_000,
    currency: "NGN",
    paymentSecured: true,
    respondBy: "2026-07-27T10:00:00.000Z",
  },
  {
    id: "vb-3",
    bookingReference: "BKG-5498",
    listingId: "toyota-camry-2021",
    listingTitle: "Toyota Camry 2021",
    listingImage: "/hero/car-rentals.png",
    productType: "car",
    experienceDate: "2026-07-28",
    experienceTime: "09:00",
    guestCount: 1,
    guestFirstName: "Emeka",
    carRentalMode: "self_drive",
    deliveryAddress: "14 Admiralty Way, Lekki Phase 1, Lagos",
    pickupAddress: "42 Ozumba Mbadiwe Ave, Victoria Island, Lagos",
    status: "confirmed",
    amount: 48_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-4",
    bookingReference: "BKG-5482",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-08-10",
    experienceTime: "17:30",
    guestCount: 6,
    guestFirstName: "Fatima",
    specialRequests: "Vegetarian refreshments preferred.",
    status: "confirmed",
    amount: 95_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-9",
    bookingReference: "BKG-5471",
    listingId: "lagos-food-experience",
    listingTitle: "Lagos Food Experience",
    listingImage: "/promo/experience.png",
    experienceDate: "2026-08-05",
    experienceTime: "12:00",
    guestCount: 3,
    guestFirstName: "Ada",
    status: "confirmed",
    amount: 54_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-10",
    bookingReference: "BKG-5463",
    listingId: "tarkwa-bay-tour",
    listingTitle: "Tarkwa Bay Boat Tour",
    listingImage: "/hero/tours.png",
    experienceDate: "2026-08-08",
    experienceTime: "10:00",
    guestCount: 5,
    guestFirstName: "James",
    status: "confirmed",
    amount: 72_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-11",
    bookingReference: "BKG-5455",
    listingId: "victoria-island-loft",
    listingTitle: "Victoria Island Loft",
    listingImage: "/hero/accommodations.png",
    experienceDate: "2026-08-12",
    experienceTime: "15:00",
    guestCount: 2,
    guestFirstName: "Blessing",
    status: "confirmed",
    amount: 135_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-5",
    bookingReference: "BKG-5410",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-07-05",
    experienceTime: "17:30",
    guestCount: 3,
    guestFirstName: "Ngozi",
    status: "completed",
    amount: 48_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-6",
    bookingReference: "BKG-5388",
    listingId: "lekki-garden-suites",
    listingTitle: "Lekki Garden Suites",
    listingImage: "/hero/accommodations.png",
    experienceDate: "2026-06-15",
    experienceTime: "15:00",
    guestCount: 2,
    guestFirstName: "Tunde",
    specialRequests: "Late check-in around 10 PM.",
    status: "completed",
    amount: 110_000,
    currency: "NGN",
    paymentSecured: true,
  },
  {
    id: "vb-7",
    bookingReference: "BKG-5362",
    listingId: "lagos-lagoon-sunset-cruise",
    listingTitle: "Lagos Lagoon Sunset Cruise",
    listingImage: "/destinations/lagos.png",
    experienceDate: "2026-07-15",
    experienceTime: "17:30",
    guestCount: 2,
    guestFirstName: "Zainab",
    status: "cancelled",
    amount: 32_000,
    currency: "NGN",
    paymentSecured: false,
  },
  {
    id: "vb-8",
    bookingReference: "BKG-5340",
    listingId: "toyota-camry-2021",
    listingTitle: "Toyota Camry 2021",
    listingImage: "/hero/car-rentals.png",
    productType: "car",
    experienceDate: "2026-05-20",
    experienceTime: "11:00",
    guestCount: 1,
    guestFirstName: "Kofi",
    carRentalMode: "with_driver",
    pickupAddress: "42 Ozumba Mbadiwe Ave, Victoria Island, Lagos",
    declineReason: "Vehicle unavailable for the requested dates due to scheduled maintenance.",
    status: "declined",
    amount: 48_000,
    currency: "NGN",
    paymentSecured: true,
  },
];

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getVendorBookingListingOptions(
  bookings: VendorBooking[],
): VendorBookingListingOption[] {
  const listings = new Map<string, string>();

  for (const booking of bookings) {
    listings.set(booking.listingId, booking.listingTitle);
  }

  return Array.from(listings.entries())
    .map(([id, title]) => ({ id, title }))
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function getVendorListingHref(
  listingId: string,
  options?: { from?: "bookings" },
) {
  const path = `/vendor/listings/detail/${encodeURIComponent(listingId)}`;
  return options?.from === "bookings" ? `${path}?from=bookings` : path;
}

export function getVendorBookingTab(
  booking: VendorBooking,
  referenceDate = new Date(),
): VendorBookingTab {
  if (booking.status === "declined") {
    return "declined";
  }

  if (booking.status === "cancelled") {
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

export function formatBookingDateTime(date: string, time: string) {
  return `${formatExperienceDate(date)} · ${formatExperienceTime(time)}`;
}

export function formatRespondWithin(
  respondBy: string,
  referenceDate = new Date(),
) {
  const remainingMs = new Date(respondBy).getTime() - referenceDate.getTime();

  if (remainingMs <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function computeVendorBookingStats(
  bookings: VendorBooking[],
  referenceDate = new Date(),
) {
  const awaitingConfirmation = bookings.filter(
    (booking) =>
      getVendorBookingTab(booking, referenceDate) === "upcoming" &&
      booking.status === "awaiting_confirmation",
  ).length;

  const upcomingConfirmed = bookings.filter(
    (booking) =>
      getVendorBookingTab(booking, referenceDate) === "upcoming" &&
      booking.status === "confirmed",
  ).length;

  const monthStart = startOfDay(referenceDate);
  monthStart.setDate(1);

  const earningsThisMonth = bookings
    .filter((booking) => {
      const experienceDay = startOfDay(new Date(booking.experienceDate));
      return (
        experienceDay >= monthStart &&
        (booking.status === "confirmed" ||
          booking.status === "completed" ||
          booking.status === "awaiting_confirmation")
      );
    })
    .reduce((total, booking) => total + booking.amount, 0);

  const respondedBookings = bookings.filter((booking) =>
    ["confirmed", "declined", "completed", "cancelled"].includes(booking.status),
  ).length;

  const responseRate =
    bookings.length === 0
      ? 0
      : Math.round((respondedBookings / bookings.length) * 100);

  return {
    awaitingConfirmation,
    upcomingConfirmed,
    earningsThisMonth,
    earningsCurrency: bookings[0]?.currency ?? "NGN",
    responseRate,
  };
}
