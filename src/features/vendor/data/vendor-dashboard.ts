export type VendorDashboardPeriod = "day" | "week" | "month" | "sixMonths" | "year";

export type VendorListingStatus = "live" | "pending" | "paused";

export type VendorDashboardListing = {
  id: string;
  title: string;
  category: string;
  categoryKey:
    | "vendor.dashboard.category.accommodations"
    | "vendor.dashboard.category.carRentals"
    | "vendor.dashboard.category.tours"
    | "vendor.dashboard.category.toursExperiences";
  rating: number;
  image: string;
  status: VendorListingStatus;
};

export type VendorDashboardStats = {
  liveListings: number;
  newBookings: Record<VendorDashboardPeriod, number>;
  earnings: Record<VendorDashboardPeriod, number>;
  earningsCurrency: string;
  pendingApproval: number;
};

export const VENDOR_DASHBOARD_PERIOD_OPTIONS: VendorDashboardPeriod[] = [
  "day",
  "week",
  "month",
  "sixMonths",
  "year",
];

export const VENDOR_DASHBOARD_STATS: VendorDashboardStats = {
  liveListings: 3,
  newBookings: { day: 0, week: 1, month: 2, sixMonths: 11, year: 18 },
  earnings: {
    day: 0,
    week: 210_000,
    month: 842_000,
    sixMonths: 4_200_000,
    year: 9_450_000,
  },
  earningsCurrency: "NGN",
  pendingApproval: 1,
};

export const VENDOR_DASHBOARD_LISTINGS: VendorDashboardListing[] = [
  {
    id: "lekki-garden-suites",
    title: "Lekki Garden Suites",
    category: "Accommodations",
    categoryKey: "vendor.dashboard.category.accommodations",
    rating: 5,
    image: "/hero/accommodations.png",
    status: "live",
  },
  {
    id: "victoria-island-loft",
    title: "Victoria Island Loft",
    category: "Accommodations",
    categoryKey: "vendor.dashboard.category.accommodations",
    rating: 4,
    image: "/hero/accommodations.png",
    status: "paused",
  },
  {
    id: "toyota-camry-2021",
    title: "Toyota Camry 2021",
    category: "Car rentals",
    categoryKey: "vendor.dashboard.category.carRentals",
    rating: 0,
    image: "/hero/car-rentals.png",
    status: "pending",
  },
  {
    id: "tarkwa-bay-tour",
    title: "Tarkwa Bay Boat Tour",
    category: "Tours",
    categoryKey: "vendor.dashboard.category.tours",
    rating: 5,
    image: "/hero/tours.png",
    status: "live",
  },
  {
    id: "lagos-food-experience",
    title: "Lagos Food Experience",
    category: "Tours & experiences",
    categoryKey: "vendor.dashboard.category.toursExperiences",
    rating: 5,
    image: "/promo/experience.png",
    status: "live",
  },
  {
    id: "lagos-night-cruise",
    title: "Lagos Night Cruise",
    category: "Tours & experiences",
    categoryKey: "vendor.dashboard.category.toursExperiences",
    rating: 5,
    image: "/destinations/lagos.png",
    status: "pending",
  },
];
