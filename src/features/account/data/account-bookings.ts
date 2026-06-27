import { formatPriceWithPreferences } from "@/lib/preferences/format-price";

export type BookingTab = "bookings" | "cancelled";

export type AccountBooking = {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  currency: string;
  title: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  image: string;
  recipientEmail: string;
  status: BookingTab;
};

export const BOOKING_PERIOD_OPTIONS = [
  "Past month",
  "Past 3 months",
  "Past 6 months",
  "Past year",
  "All time",
] as const;

export const ACCOUNT_BOOKINGS: AccountBooking[] = [
  {
    id: "booking-1",
    orderNumber: "#4516641375",
    orderDate: "Oct 18, 2026",
    totalAmount: 345500,
    currency: "NGN",
    title: "Tarkwa Bay Tour",
    description:
      "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
    location: "Lagos, Nigeria",
    rating: 4.6,
    reviewCount: 12,
    image: "/hero/tours.png",
    recipientEmail: "Vladamirocks@gmail.com",
    status: "bookings",
  },
  {
    id: "booking-2",
    orderNumber: "#4516641375",
    orderDate: "Oct 18, 2026",
    totalAmount: 345500,
    currency: "NGN",
    title: "Tarkwa Bay Tour",
    description:
      "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
    location: "Lagos, Nigeria",
    rating: 4.6,
    reviewCount: 12,
    image: "/hero/tours.png",
    recipientEmail: "Vladamirocks@gmail.com",
    status: "bookings",
  },
  {
    id: "booking-3",
    orderNumber: "#4516641380",
    orderDate: "Sep 02, 2026",
    totalAmount: 128000,
    currency: "NGN",
    title: "RDPX Paintball Arena",
    description:
      "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
    location: "Lagos, Nigeria",
    rating: 4.6,
    reviewCount: 12,
    image: "/destinations/lagos.png",
    recipientEmail: "Vladamirocks@gmail.com",
    status: "bookings",
  },
  {
    id: "booking-cancelled-1",
    orderNumber: "#4516600122",
    orderDate: "Aug 14, 2026",
    totalAmount: 95000,
    currency: "NGN",
    title: "Dubai Desert Safari",
    description:
      "Dune bashing, camel rides, and a traditional Bedouin camp under the stars.",
    location: "UAE Dubai",
    rating: 4.9,
    reviewCount: 86,
    image: "/destinations/dubai.png",
    recipientEmail: "Vladamirocks@gmail.com",
    status: "cancelled",
  },
];

export function formatBookingAmount(currency: string, amount: number) {
  return formatPriceWithPreferences(currency, amount);
}
