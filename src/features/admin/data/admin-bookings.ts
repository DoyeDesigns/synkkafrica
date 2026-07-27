export type AdminBookingProductType = "flights" | "cars" | "accommodations" | "experiences";

export type AdminBookingSource = "website" | "mobile_app" | "admin";

export type AdminBookingStatus =
  | "awaiting_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "disputed";

export type AdminBookingTimelineEvent = {
  label: string;
  timestamp: string;
};

export type AdminBooking = {
  id: string;
  productType: AdminBookingProductType;
  title: string;
  customerName: string;
  customerEmail: string;
  customerWhatsApp: string;
  vendorName: string;
  vendorId: string;
  vendorPhone: string;
  startDate: string;
  endDate: string;
  guestCount: number;
  amount: number;
  currency: string;
  paymentStatus: string;
  chargedCurrency: string;
  source: AdminBookingSource;
  status: AdminBookingStatus;
  timelineLabel: string;
  timeline: AdminBookingTimelineEvent[];
};

export const ADMIN_BOOKING_VENDORS = [
  { id: "vendor-luxe", name: "Lekki Garden Suites", phone: "+234 809 440 1122" },
  { id: "vendor-alex", name: "Alex Autos", phone: "+234 802 000 1122" },
  { id: "vendor-coastal", name: "Coastal Trails NG", phone: "+234 701 882 9031" },
  { id: "vendor-safari", name: "Safari Connect Tours", phone: "+234 706 119 8834" },
];

export const ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: "BKG-5610",
    productType: "accommodations",
    title: "Lekki Garden Suites",
    customerName: "Chidi Okafor",
    customerEmail: "chidi@email.com",
    customerWhatsApp: "+234 803 221 4490",
    vendorName: "Lekki Garden Suites",
    vendorId: "vendor-luxe",
    vendorPhone: "+234 809 440 1122",
    startDate: "2026-08-08",
    endDate: "2026-08-12",
    guestCount: 2,
    amount: 240000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "GBP (converted)",
    source: "website",
    status: "confirmed",
    timelineLabel: "In 12 days",
    timeline: [
      { label: "Booking confirmed by vendor", timestamp: "20 Jul 2026, 14:32" },
      { label: "Payment received", timestamp: "20 Jul 2026, 14:28" },
      { label: "Booking created via website", timestamp: "20 Jul 2026, 14:25" },
    ],
  },
  {
    id: "BKG-5602",
    productType: "cars",
    title: "Toyota Camry 2023 — 3 days",
    customerName: "Amara Chukwu",
    customerEmail: "amara@email.com",
    customerWhatsApp: "+44 7700 900123",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    vendorPhone: "+234 802 000 1122",
    startDate: "2026-07-30",
    endDate: "2026-08-02",
    guestCount: 1,
    amount: 85000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "GBP (converted)",
    source: "mobile_app",
    status: "awaiting_confirmation",
    timelineLabel: "In 3 days",
    timeline: [
      { label: "Awaiting vendor confirmation", timestamp: "24 Jul 2026, 09:10" },
      { label: "Payment received", timestamp: "24 Jul 2026, 09:08" },
      { label: "Booking created via mobile app", timestamp: "24 Jul 2026, 09:05" },
    ],
  },
  {
    id: "BKG-5598",
    productType: "experiences",
    title: "Lagos Lagoon Sunset Cruise",
    customerName: "Fatima Bello",
    customerEmail: "fatima@email.com",
    customerWhatsApp: "+234 701 882 9031",
    vendorName: "Coastal Trails NG",
    vendorId: "vendor-coastal",
    vendorPhone: "+234 701 882 9031",
    startDate: "2026-08-05",
    endDate: "2026-08-05",
    guestCount: 4,
    amount: 120000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "NGN",
    source: "website",
    status: "confirmed",
    timelineLabel: "In 9 days",
    timeline: [
      { label: "Booking confirmed by vendor", timestamp: "22 Jul 2026, 11:00" },
      { label: "Payment received", timestamp: "22 Jul 2026, 10:58" },
      { label: "Booking created via website", timestamp: "22 Jul 2026, 10:55" },
    ],
  },
  {
    id: "BKG-5584",
    productType: "flights",
    title: "Lagos (LOS) → London (LHR)",
    customerName: "James Osei",
    customerEmail: "james@email.com",
    customerWhatsApp: "+233 24 555 0192",
    vendorName: "SynkAfrica Travel",
    vendorId: "vendor-safari",
    vendorPhone: "+234 706 119 8834",
    startDate: "2026-08-01",
    endDate: "2026-08-01",
    guestCount: 1,
    amount: 680000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "USD (converted)",
    source: "admin",
    status: "confirmed",
    timelineLabel: "In 5 days",
    timeline: [
      { label: "Ticket issued", timestamp: "18 Jul 2026, 16:40" },
      { label: "Booking created by admin", timestamp: "18 Jul 2026, 16:35" },
    ],
  },
  {
    id: "BKG-5570",
    productType: "accommodations",
    title: "Victoria Island Penthouse",
    customerName: "Elena Rossi",
    customerEmail: "elena@email.com",
    customerWhatsApp: "+39 347 555 8821",
    vendorName: "Lekki Garden Suites",
    vendorId: "vendor-luxe",
    vendorPhone: "+234 809 440 1122",
    startDate: "2026-07-28",
    endDate: "2026-07-31",
    guestCount: 3,
    amount: 420000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "EUR (converted)",
    source: "website",
    status: "disputed",
    timelineLabel: "Disputed",
    timeline: [
      { label: "Dispute opened by customer", timestamp: "25 Jul 2026, 08:15" },
      { label: "Booking confirmed by vendor", timestamp: "10 Jul 2026, 12:00" },
      { label: "Payment received", timestamp: "10 Jul 2026, 11:58" },
    ],
  },
  {
    id: "BKG-5555",
    productType: "cars",
    title: "Mercedes-Benz E-Class — 5 days",
    customerName: "David Chen",
    customerEmail: "david@email.com",
    customerWhatsApp: "+1 415 555 0199",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    vendorPhone: "+234 802 000 1122",
    startDate: "2026-07-15",
    endDate: "2026-07-20",
    guestCount: 2,
    amount: 195000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "USD (converted)",
    source: "mobile_app",
    status: "completed",
    timelineLabel: "Completed 15 Jul",
    timeline: [
      { label: "Booking completed", timestamp: "20 Jul 2026, 18:00" },
      { label: "Booking confirmed by vendor", timestamp: "01 Jul 2026, 09:30" },
      { label: "Booking created via mobile app", timestamp: "01 Jul 2026, 09:25" },
    ],
  },
  {
    id: "BKG-5540",
    productType: "experiences",
    title: "Badagry Heritage Day Trip",
    customerName: "Sofia Mendes",
    customerEmail: "sofia@email.com",
    customerWhatsApp: "+351 912 555 441",
    vendorName: "Safari Connect Tours",
    vendorId: "vendor-safari",
    vendorPhone: "+234 706 119 8834",
    startDate: "2026-06-18",
    endDate: "2026-06-18",
    guestCount: 2,
    amount: 75000,
    currency: "NGN",
    paymentStatus: "Refunded",
    chargedCurrency: "NGN",
    source: "website",
    status: "cancelled",
    timelineLabel: "Cancelled 18 Jun",
    timeline: [
      { label: "Booking cancelled and refunded", timestamp: "18 Jun 2026, 10:00" },
      { label: "Payment received", timestamp: "05 Jun 2026, 14:20" },
    ],
  },
  {
    id: "BKG-5521",
    productType: "accommodations",
    title: "Eko Beachfront Apartment",
    customerName: "Aisha Mohammed",
    customerEmail: "aisha@email.com",
    customerWhatsApp: "+234 806 119 8834",
    vendorName: "Lekki Garden Suites",
    vendorId: "vendor-luxe",
    vendorPhone: "+234 809 440 1122",
    startDate: "2026-07-29",
    endDate: "2026-08-01",
    guestCount: 2,
    amount: 180000,
    currency: "NGN",
    paymentStatus: "Paid in full",
    chargedCurrency: "NGN",
    source: "mobile_app",
    status: "awaiting_confirmation",
    timelineLabel: "In 2 days",
    timeline: [
      { label: "Awaiting vendor confirmation", timestamp: "25 Jul 2026, 15:00" },
      { label: "Payment received", timestamp: "25 Jul 2026, 14:58" },
    ],
  },
];

function parseBookingDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

const REFERENCE_DATE = new Date("2026-07-27T12:00:00");

export function isAdminBookingUpcoming(booking: AdminBooking) {
  if (booking.status === "cancelled" || booking.status === "completed") {
    return false;
  }

  const start = parseBookingDate(booking.startDate);
  const diffDays = (start.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= 7;
}

export function isAdminBookingInDateRange(
  booking: AdminBooking,
  range: AdminBookingDateRange,
  referenceDate: Date = REFERENCE_DATE,
) {
  if (range === "all") {
    return true;
  }

  const rangeDays: Record<Exclude<AdminBookingDateRange, "all">, number> = {
    day: 1,
    week: 7,
    month: 30,
    six_months: 183,
    year: 365,
  };

  const maxDays = rangeDays[range];
  const bookingDate = parseBookingDate(booking.startDate);
  const diffDays =
    Math.abs(bookingDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays <= maxDays;
}

export function filterAdminBookings(
  bookings: AdminBooking[],
  query: string,
  productType: AdminBookingProductType | "all",
  source: AdminBookingSource | "all",
  status: AdminBookingStatus | "all" | "upcoming",
  dateRange: AdminBookingDateRange = "all",
) {
  const normalizedQuery = query.trim().toLowerCase();

  return bookings.filter((booking) => {
    const matchesQuery =
      !normalizedQuery ||
      booking.customerName.toLowerCase().includes(normalizedQuery) ||
      booking.vendorName.toLowerCase().includes(normalizedQuery) ||
      booking.id.toLowerCase().includes(normalizedQuery) ||
      booking.title.toLowerCase().includes(normalizedQuery);

    const matchesProduct = productType === "all" || booking.productType === productType;
    const matchesSource = source === "all" || booking.source === source;
    const matchesDateRange = isAdminBookingInDateRange(booking, dateRange);
    const matchesStatus =
      status === "all" ||
      (status === "upcoming" ? isAdminBookingUpcoming(booking) : booking.status === status);

    return matchesQuery && matchesProduct && matchesSource && matchesDateRange && matchesStatus;
  });
}

export function getAdminBookingStats(bookings: AdminBooking[]) {
  return {
    upcoming: bookings.filter(isAdminBookingUpcoming).length,
    awaitingConfirmation: bookings.filter((b) => b.status === "awaiting_confirmation").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    disputed: bookings.filter((b) => b.status === "disputed").length,
    totalThisMonth: bookings.length,
  };
}

export function getAdminBookingById(id: string) {
  return ADMIN_BOOKINGS.find((booking) => booking.id === id);
}

export function formatAdminBookingDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseBookingDate(date));
}

export const ADMIN_BOOKING_PRODUCT_TYPES: AdminBookingProductType[] = [
  "flights",
  "cars",
  "accommodations",
  "experiences",
];

export const ADMIN_BOOKING_SOURCES: AdminBookingSource[] = [
  "website",
  "mobile_app",
  "admin",
];

export const ADMIN_BOOKING_DATE_RANGES = [
  "day",
  "week",
  "month",
  "six_months",
  "year",
  "all",
] as const;

export type AdminBookingDateRange = (typeof ADMIN_BOOKING_DATE_RANGES)[number];

export const ADMIN_BOOKING_STATUS_FILTERS = [
  "all",
  "upcoming",
  "awaiting_confirmation",
  "confirmed",
  "completed",
  "cancelled",
  "disputed",
] as const;

export type AdminBookingStatusFilter = (typeof ADMIN_BOOKING_STATUS_FILTERS)[number];

export type AdminCreateBookingPaymentStatus =
  | "send_payment_link"
  | "paid_in_full"
  | "payment_pending";

export const ADMIN_CREATE_BOOKING_PAYMENT_STATUSES: AdminCreateBookingPaymentStatus[] = [
  "send_payment_link",
  "paid_in_full",
  "payment_pending",
];

export type AdminBookingCustomerOption = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type AdminBookingListingOption = {
  id: string;
  title: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  productType: AdminBookingProductType;
};

export const ADMIN_BOOKING_CUSTOMERS: AdminBookingCustomerOption[] = [
  {
    id: "customer-chidi",
    name: "Chidi Okafor",
    email: "chidi@email.com",
    phone: "+234 803 221 4490",
  },
  {
    id: "customer-amara",
    name: "Amara Chukwu",
    email: "amara@email.com",
    phone: "+44 7700 900123",
  },
  {
    id: "customer-fatima",
    name: "Fatima Bello",
    email: "fatima@email.com",
    phone: "+234 701 882 9031",
  },
  {
    id: "customer-james",
    name: "James Osei",
    email: "james@email.com",
    phone: "+233 24 555 0192",
  },
  {
    id: "customer-elena",
    name: "Elena Rossi",
    email: "elena@email.com",
    phone: "+39 347 555 8821",
  },
  {
    id: "customer-aisha",
    name: "Aisha Mohammed",
    email: "aisha@email.com",
    phone: "+234 806 119 8834",
  },
];

const ADMIN_BOOKING_LISTINGS: AdminBookingListingOption[] = [
  {
    id: "stay-lekki-garden",
    title: "Lekki Garden Suites",
    vendorId: "vendor-luxe",
    vendorName: "Lekki Garden Suites",
    vendorPhone: "+234 809 440 1122",
    productType: "accommodations",
  },
  {
    id: "stay-vi-penthouse",
    title: "Victoria Island Penthouse",
    vendorId: "vendor-luxe",
    vendorName: "Lekki Garden Suites",
    vendorPhone: "+234 809 440 1122",
    productType: "accommodations",
  },
  {
    id: "stay-eko-beachfront",
    title: "Eko Beachfront Apartment",
    vendorId: "vendor-luxe",
    vendorName: "Lekki Garden Suites",
    vendorPhone: "+234 809 440 1122",
    productType: "accommodations",
  },
  {
    id: "car-toyota-camry",
    title: "Toyota Camry 2023",
    vendorId: "vendor-alex",
    vendorName: "Alex Autos",
    vendorPhone: "+234 802 000 1122",
    productType: "cars",
  },
  {
    id: "car-mercedes-eclass",
    title: "Mercedes-Benz E-Class",
    vendorId: "vendor-alex",
    vendorName: "Alex Autos",
    vendorPhone: "+234 802 000 1122",
    productType: "cars",
  },
  {
    id: "tour-lagos-sunset",
    title: "Lagos Lagoon Sunset Cruise",
    vendorId: "vendor-coastal",
    vendorName: "Coastal Trails NG",
    vendorPhone: "+234 701 882 9031",
    productType: "experiences",
  },
  {
    id: "tour-badagry",
    title: "Badagry Heritage Day Trip",
    vendorId: "vendor-safari",
    vendorName: "Safari Connect Tours",
    vendorPhone: "+234 706 119 8834",
    productType: "experiences",
  },
  {
    id: "flight-los-lhr",
    title: "Lagos (LOS) → London (LHR)",
    vendorId: "vendor-safari",
    vendorName: "SynkAfrica Travel",
    vendorPhone: "+234 706 119 8834",
    productType: "flights",
  },
];

export function searchAdminBookingCustomers(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return ADMIN_BOOKING_CUSTOMERS;
  }

  return ADMIN_BOOKING_CUSTOMERS.filter(
    (customer) =>
      customer.name.toLowerCase().includes(normalizedQuery) ||
      customer.email.toLowerCase().includes(normalizedQuery) ||
      customer.phone.toLowerCase().includes(normalizedQuery),
  );
}

export function searchAdminBookingListings(
  query: string,
  productType: AdminBookingProductType,
) {
  const normalizedQuery = query.trim().toLowerCase();
  const listings = ADMIN_BOOKING_LISTINGS.filter(
    (listing) => listing.productType === productType,
  );

  if (!normalizedQuery) {
    return listings;
  }

  return listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(normalizedQuery) ||
      listing.vendorName.toLowerCase().includes(normalizedQuery),
  );
}

export type CreateAdminBookingInput = {
  productType: AdminBookingProductType;
  customer: AdminBookingCustomerOption;
  listing: AdminBookingListingOption;
  startDate: string;
  endDate: string;
  guestCount: number;
  amount: number;
  paymentStatus: AdminCreateBookingPaymentStatus;
  internalNote?: string;
};

function getPaymentStatusLabel(paymentStatus: AdminCreateBookingPaymentStatus) {
  switch (paymentStatus) {
    case "paid_in_full":
      return "Paid in full";
    case "payment_pending":
      return "Payment pending";
    default:
      return "Payment link sent";
  }
}

function getBookingStatus(paymentStatus: AdminCreateBookingPaymentStatus): AdminBookingStatus {
  return paymentStatus === "paid_in_full" ? "confirmed" : "awaiting_confirmation";
}

export function createAdminBooking(
  input: CreateAdminBookingInput,
  existingBookings: AdminBooking[],
): AdminBooking {
  const numericIds = existingBookings
    .map((booking) => Number.parseInt(booking.id.replace("BKG-", ""), 10))
    .filter((value) => !Number.isNaN(value));
  const nextNumericId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 5611;
  const nowLabel = "27 Jul 2026, 11:48";

  return {
    id: `BKG-${nextNumericId}`,
    productType: input.productType,
    title: input.listing.title,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    customerWhatsApp: input.customer.phone,
    vendorName: input.listing.vendorName,
    vendorId: input.listing.vendorId,
    vendorPhone: input.listing.vendorPhone,
    startDate: input.startDate,
    endDate: input.endDate,
    guestCount: input.guestCount,
    amount: input.amount,
    currency: "NGN",
    paymentStatus: getPaymentStatusLabel(input.paymentStatus),
    chargedCurrency: "NGN",
    source: "admin",
    status: getBookingStatus(input.paymentStatus),
    timelineLabel: "Upcoming",
    timeline: [
      {
        label: "Booking created by admin",
        timestamp: nowLabel,
      },
      ...(input.internalNote
        ? [{ label: `Internal note: ${input.internalNote}`, timestamp: nowLabel }]
        : []),
    ],
  };
}
