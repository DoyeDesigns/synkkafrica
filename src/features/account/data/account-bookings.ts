import type { StoredBookingConfirmation } from "@/features/travel/booking/booking-confirmation";

export type BookingProductType = StoredBookingConfirmation["productType"];

export type AccountBookingStatus = "upcoming" | "past" | "cancelled";

export type AccountBookingReview = {
  rating: number;
  text: string;
  photos?: string[];
  submittedAt: string;
};

export type AccountBooking = {
  id: string;
  userId: string;
  orderNumber: string;
  orderDate: string;
  experienceDate: string;
  experienceTime?: string;
  experienceEndDate?: string;
  totalAmount: number;
  currency: string;
  title: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  recipientEmail: string;
  status: AccountBookingStatus;
  guestCount: number;
  rooms?: number;
  specialRequests?: string;
  productType?: BookingProductType;
  productId?: string;
  cancellationWindowHours: number;
  reviewSubmitted?: boolean;
  userReview?: AccountBookingReview;
  cancelledAt?: string;
};

export type BookingListTab = "upcoming" | "past" | "cancelled";

export const BOOKING_PERIOD_OPTIONS = [
  "Past month",
  "Past 3 months",
  "Past 6 months",
  "Past year",
  "All time",
] as const;

export const DEFAULT_CANCELLATION_WINDOW_HOURS = 48;

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0] ?? "";
}

export function createSeedBookings(userId: string, userEmail: string): AccountBooking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [
    {
      id: "booking-upcoming-1",
      userId,
      orderNumber: "SYNK-TARK01",
      orderDate: formatDisplayDate(new Date(today.getTime() - 2 * 86400000)),
      experienceDate: daysFromNow(5),
      experienceTime: "09:00",
      totalAmount: 345500,
      currency: "NGN",
      title: "Tarkwa Bay Tour",
      description:
        "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
      location: "Lagos, Nigeria",
      rating: 4.6,
      reviewCount: 12,
      image: "/hero/tours.png",
      recipientEmail: userEmail,
      status: "upcoming",
      guestCount: 2,
      productType: "tour",
      productId: "tarkwa-bay-tour",
      cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
    },
    {
      id: "booking-upcoming-2",
      userId,
      orderNumber: "SYNK-ARK02",
      orderDate: formatDisplayDate(new Date(today.getTime() - 5 * 86400000)),
      experienceDate: daysFromNow(12),
      experienceTime: "15:00",
      experienceEndDate: daysFromNow(14),
      totalAmount: 512000,
      currency: "NGN",
      title: "The Ark Haven",
      description:
        "A serene escape with modern comfort and traditional Moroccan charm in Marrakesh.",
      location: "Marrakesh, Morocco",
      rating: 4.8,
      reviewCount: 24,
      image: "/hero/accommodations.png",
      recipientEmail: userEmail,
      status: "upcoming",
      guestCount: 2,
      rooms: 1,
      productType: "accommodation",
      productId: "ark-havn-results",
      cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
    },
    {
      id: "booking-past-1",
      userId,
      orderNumber: "SYNK-RDPX03",
      orderDate: formatDisplayDate(new Date(today.getTime() - 45 * 86400000)),
      experienceDate: daysFromNow(-10),
      experienceTime: "12:00",
      totalAmount: 128000,
      currency: "NGN",
      title: "RDPX Paintball Arena",
      description: "Team-based paintball sessions with equipment and safety briefing included.",
      location: "Lagos, Nigeria",
      rating: 4.6,
      reviewCount: 12,
      image: "/destinations/lagos.png",
      recipientEmail: userEmail,
      status: "past",
      guestCount: 4,
      productType: "tour",
      productId: "rdpx-paintball",
      cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
    },
    {
      id: "booking-past-2",
      userId,
      orderNumber: "SYNK-FOOD04",
      orderDate: formatDisplayDate(new Date(today.getTime() - 60 * 86400000)),
      experienceDate: daysFromNow(-28),
      experienceTime: "17:30",
      totalAmount: 86000,
      currency: "NGN",
      title: "Lagos Food Tour",
      description: "Sample suya, puff-puff, and local delicacies across the city's best food spots.",
      location: "Lagos, Nigeria",
      rating: 4.9,
      reviewCount: 38,
      image: "/hero/tours.png",
      recipientEmail: userEmail,
      status: "past",
      guestCount: 2,
      productType: "tour",
      productId: "lagos-food-tour",
      cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
      reviewSubmitted: true,
      userReview: {
        rating: 5,
        text: "Amazing food stops and a very knowledgeable guide. Would book again.",
        submittedAt: daysFromNow(-25),
      },
    },
    {
      id: "booking-cancelled-1",
      userId,
      orderNumber: "SYNK-DXB05",
      orderDate: formatDisplayDate(new Date(today.getTime() - 20 * 86400000)),
      experienceDate: daysFromNow(3),
      experienceTime: "09:00",
      totalAmount: 95000,
      currency: "NGN",
      title: "Dubai Desert Safari",
      description:
        "Dune bashing, camel rides, and a traditional Bedouin camp under the stars.",
      location: "Dubai, UAE",
      rating: 4.9,
      reviewCount: 86,
      image: "/destinations/dubai.png",
      recipientEmail: userEmail,
      status: "cancelled",
      guestCount: 2,
      productType: "tour",
      productId: "dubai-safari",
      cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
      cancelledAt: formatDisplayDate(new Date(today.getTime() - 18 * 86400000)),
    },
  ];
}

export function getBookingExperienceDateTime(booking: AccountBooking) {
  const [hours = "9", minutes = "0"] = (booking.experienceTime ?? "09:00").split(":");
  const date = new Date(`${booking.experienceDate}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);
  return date;
}

export function isUpcomingBooking(booking: AccountBooking, now = new Date()) {
  if (booking.status === "cancelled") return false;
  return getBookingExperienceDateTime(booking).getTime() > now.getTime();
}

export function isPastBooking(booking: AccountBooking, now = new Date()) {
  if (booking.status === "cancelled") return false;
  return getBookingExperienceDateTime(booking).getTime() <= now.getTime();
}

export function getBookingListTab(booking: AccountBooking, now = new Date()): BookingListTab {
  if (booking.status === "cancelled") return "cancelled";
  return isUpcomingBooking(booking, now) ? "upcoming" : "past";
}

export function canCancelBooking(booking: AccountBooking, now = new Date()) {
  if (booking.status !== "upcoming" && !isUpcomingBooking(booking, now)) {
    return false;
  }

  const experienceAt = getBookingExperienceDateTime(booking).getTime();
  const windowMs = booking.cancellationWindowHours * 60 * 60 * 1000;
  return now.getTime() <= experienceAt - windowMs;
}

export type BookingCountdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export function getBookingCountdown(
  booking: AccountBooking,
  now = new Date(),
): BookingCountdown | null {
  if (!isUpcomingBooking(booking, now)) {
    return null;
  }

  const totalMs = Math.max(0, getBookingExperienceDateTime(booking).getTime() - now.getTime());
  const days = Math.floor(totalMs / 86400000);
  const hours = Math.floor((totalMs % 86400000) / 3600000);
  const minutes = Math.floor((totalMs % 3600000) / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);

  return { days, hours, minutes, seconds, totalMs };
}

export function confirmationToAccountBooking(
  userId: string,
  userEmail: string,
  confirmation: StoredBookingConfirmation,
): AccountBooking {
  const experienceDate =
    confirmation.checkIn ?? confirmation.date ?? new Date().toISOString().split("T")[0] ?? "";

  return {
    id: `booking-${confirmation.reference.toLowerCase()}`,
    userId,
    orderNumber: confirmation.reference,
    orderDate: formatDisplayDate(new Date()),
    experienceDate,
    experienceTime: confirmation.time,
    experienceEndDate: confirmation.checkOut,
    totalAmount: confirmation.total ?? 0,
    currency: confirmation.currency ?? "NGN",
    title: confirmation.productName,
    description: "Your SynkAfrica booking confirmation.",
    location: "SynkAfrica",
    rating: 4.8,
    reviewCount: 0,
    image:
      confirmation.productType === "accommodation"
        ? "/hero/accommodations.png"
        : confirmation.productType === "car"
          ? "/hero/car-rentals.png"
          : "/hero/tours.png",
    recipientEmail: userEmail,
    status: "upcoming",
    guestCount: confirmation.guests,
    rooms: confirmation.rooms,
    specialRequests: confirmation.specialRequests,
    productType: confirmation.productType,
    productId: confirmation.productId,
    cancellationWindowHours: DEFAULT_CANCELLATION_WINDOW_HOURS,
  };
}

export function refreshBookingStatuses(bookings: AccountBooking[], now = new Date()) {
  return bookings.map((booking) => {
    if (booking.status === "cancelled") {
      return booking;
    }

    return {
      ...booking,
      status: isUpcomingBooking(booking, now) ? "upcoming" : "past",
    } satisfies AccountBooking;
  });
}
