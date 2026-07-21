export type AdminBookingStatus =
  | "confirmed"
  | "awaiting_confirmation"
  | "cancelled"
  | "completed";

export type AdminBooking = {
  id: string;
  guestFirstName: string;
  guestEmail: string;
  experienceTitle: string;
  vendorName: string;
  vendorId: string;
  date: string;
  guestCount: number;
  amount: number;
  currency: string;
  status: AdminBookingStatus;
};

export const ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: "ab-1",
    guestFirstName: "Amara",
    guestEmail: "amara@email.com",
    experienceTitle: "Lagos Lagoon Sunset Cruise",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    date: "2026-07-25",
    guestCount: 4,
    amount: 340000,
    currency: "NGN",
    status: "awaiting_confirmation",
  },
  {
    id: "ab-2",
    guestFirstName: "Chidi",
    guestEmail: "chidi@email.com",
    experienceTitle: "Lekki Garden Suites",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    date: "2026-08-03",
    guestCount: 2,
    amount: 240000,
    currency: "NGN",
    status: "confirmed",
  },
  {
    id: "ab-3",
    guestFirstName: "Fatima",
    guestEmail: "fatima@email.com",
    experienceTitle: "Lagos Lagoon Sunset Cruise",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    date: "2026-08-10",
    guestCount: 6,
    amount: 510000,
    currency: "NGN",
    status: "confirmed",
  },
];

export const ADMIN_VENDORS_FOR_REASSIGN = [
  { id: "vendor-alex", name: "Alex Autos" },
  { id: "vendor-coastal", name: "Coastal Trails NG" },
  { id: "vendor-luxe", name: "Luxe Lagos Stays" },
];
