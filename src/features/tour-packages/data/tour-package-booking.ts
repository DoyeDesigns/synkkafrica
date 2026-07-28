import { ACCOMMODATION_DEALS } from "@/features/travel/data/accommodations-landing";
import { TOUR_PACKAGES } from "@/features/tour-packages/data/tour-packages";

export type TourPackageTier = {
  id: string;
  name: string;
  duration: string;
  price: number;
};

export type PackageIncludedModuleType = "flight" | "stay" | "car";

export type PackageIncludedModule = {
  id: string;
  type: PackageIncludedModuleType;
  title: string;
  standalonePrice: number;
  details: string[];
};

export type PackagePriceLineItem = {
  id: string;
  label: string;
  amount: number;
};

export type PackageWhyBookReason = {
  id: string;
  title: string;
  description: string;
};

export type TourPackageDetail = {
  id: string;
  title: string;
  country: string;
  location: string;
  scheduleLabel: string;
  badgeLabel: string;
  nights: number;
  days: number;
  startDate: string;
  endDate: string;
  images: string[];
  extraPhotoCount: number;
  minGuests: number;
  maxGuests: number;
  moduleCount: number;
  freeCancellation: boolean;
  includedModules: PackageIncludedModule[];
  priceLineItems: PackagePriceLineItem[];
  packageDiscount: number;
  packagePrice: number;
  whyBookReasons: PackageWhyBookReason[];
  cancellationDeadline: string;
  cancellationDescription: string;
  features: string[];
  tiers: TourPackageTier[];
  taxesAndFees: number;
  currency: string;
};

const LAGOS_WEEKEND_GETAWAY: TourPackageDetail = {
  id: "singapore-lights",
  title: "Lagos Weekend Getaway",
  country: "Nigeria",
  location: "Victoria Island & Eko Atlantic",
  scheduleLabel: "Fri 12 — Mon 15 Jul 2026",
  badgeLabel: "Best Value Package",
  nights: 3,
  days: 4,
  startDate: "Fri 12 Jul 2026",
  endDate: "Mon 15 Jul 2026",
  images: [
    "/destinations/lagos.png",
    "/destinations/lagos.png",
    "/destinations/lagos.png",
    "/destinations/lagos.png",
  ],
  extraPhotoCount: 6,
  minGuests: 1,
  maxGuests: 2,
  moduleCount: 3,
  freeCancellation: true,
  includedModules: [
    {
      id: "flight",
      type: "flight",
      title: "FLIGHT: Lagos → Lagos Round Trip",
      standalonePrice: 185_000,
      details: [
        "Fri 12 Jul, 09:40 → Mon 15 Jul, 18:20",
        "Economy · 1 checked bag included",
      ],
    },
    {
      id: "stay",
      type: "stay",
      title: "STAY: Eko Atlantic Villa",
      standalonePrice: 504_000,
      details: [
        "3 nights · Check-in 12 Jul, Check-out 15 Jul",
        "1 King Suite · Sea view · Breakfast included",
      ],
    },
    {
      id: "car",
      type: "car",
      title: "CAR + DRIVER: SUV with Personal Driver",
      standalonePrice: 92_000,
      details: [
        "Available all 4 days · Airport pickup & drop-off",
        "English-speaking driver · Fuel included",
      ],
    },
  ],
  priceLineItems: [
    { id: "flight", label: "Flight (round trip)", amount: 185_000 },
    { id: "stay", label: "Stay (3 nights)", amount: 504_000 },
    { id: "car", label: "Car + Driver (4 days)", amount: 92_000 },
  ],
  packageDiscount: 169_000,
  packagePrice: 612_000,
  whyBookReasons: [
    {
      id: "one-payment",
      title: "One payment, one receipt",
      description:
        "Flight, hotel, and car are billed together so you do not chase separate confirmations.",
    },
    {
      id: "vetted-vendors",
      title: "Vetted, matched vendors",
      description:
        "Each module is picked to fit the same dates and location for a seamless trip.",
    },
    {
      id: "trip-support",
      title: "Dedicated trip support",
      description:
        "Our team covers the whole package from booking through travel day assistance.",
    },
    {
      id: "savings",
      title: "Save ₦169,000 vs separate booking",
      description:
        "Bundle pricing means you pay less than booking flight, stay, and car on their own.",
    },
  ],
  cancellationDeadline: "Free cancellation until 5 Jul",
  cancellationDescription:
    "Cancel the full package up to 4 days before check-in for a full refund. After that, standard vendor policies apply per module.",
  features: [
    "3 nights / 4 days",
    "Flights included",
    "Hotel stay",
    "Car with driver",
  ],
  tiers: [
    {
      id: "standard",
      name: "Standard package",
      duration: "3 Nights / 4 Days",
      price: 612_000,
    },
  ],
  taxesAndFees: 0,
  currency: "NGN",
};

function buildStandardTier(
  basePrice: number,
  nights: number,
  days: number,
): TourPackageTier[] {
  return [
    {
      id: "standard",
      name: "Standard package",
      duration: `${nights} Nights / ${days} Days`,
      price: basePrice,
    },
  ];
}

function buildFromPackage(pkg: (typeof TOUR_PACKAGES)[number]): TourPackageDetail {
  const deal = ACCOMMODATION_DEALS.find((item) => item.packageId === pkg.id);
  const packagePrice = deal?.currentPrice ?? pkg.price;
  const separateTotal = deal?.separateBookingPrice ?? Math.round(pkg.price * 1.2);
  const discount = Math.max(0, separateTotal - packagePrice);
  const moduleShare = Math.round(separateTotal / 3);

  return {
    id: pkg.id,
    title: deal?.title ?? pkg.title,
    country: pkg.country,
    location: pkg.country,
    scheduleLabel: deal?.scheduleLabel ?? `${pkg.startDate} — ${pkg.endDate}`,
    badgeLabel: "Best Value Package",
    nights: pkg.nights,
    days: pkg.days,
    startDate: pkg.startDate,
    endDate: pkg.endDate,
    images: [pkg.image, pkg.image, pkg.image, pkg.image],
    extraPhotoCount: 4,
    minGuests: 1,
    maxGuests: 2,
    moduleCount: deal?.inclusions.length ?? 3,
    freeCancellation: true,
    includedModules: [
      {
        id: "flight",
        type: "flight",
        title: `FLIGHT: ${pkg.country} Round Trip`,
        standalonePrice: moduleShare,
        details: [
          `${pkg.startDate} → ${pkg.endDate}`,
          "Economy · 1 checked bag included",
        ],
      },
      {
        id: "stay",
        type: "stay",
        title: `STAY: ${pkg.country} Hotel`,
        standalonePrice: moduleShare,
        details: [
          `${pkg.nights} nights · Check-in and check-out included`,
          "Standard room · Breakfast included",
        ],
      },
      {
        id: "car",
        type: "car",
        title: "CAR + DRIVER: SUV with Personal Driver",
        standalonePrice: moduleShare,
        details: [
          `Available all ${pkg.days} days · Airport pickup & drop-off`,
          "English-speaking driver · Fuel included",
        ],
      },
    ],
    priceLineItems: [
      { id: "flight", label: "Flight (round trip)", amount: moduleShare },
      {
        id: "stay",
        label: `Stay (${pkg.nights} nights)`,
        amount: moduleShare,
      },
      {
        id: "car",
        label: `Car + Driver (${pkg.days} days)`,
        amount: moduleShare,
      },
    ],
    packageDiscount: discount,
    packagePrice,
    whyBookReasons: LAGOS_WEEKEND_GETAWAY.whyBookReasons.map((reason) =>
      reason.id === "savings"
        ? {
            ...reason,
            title: `Save ${discount.toLocaleString()} vs separate booking`,
          }
        : reason,
    ),
    cancellationDeadline: "Free cancellation until 5 days before check-in",
    cancellationDescription: LAGOS_WEEKEND_GETAWAY.cancellationDescription,
    features: [
      `${pkg.nights} nights / ${pkg.days} days`,
      "Flights included",
      "Hotel stay",
      "Car with driver",
    ],
    tiers: buildStandardTier(packagePrice, pkg.nights, pkg.days),
    taxesAndFees: 0,
    currency: pkg.currency,
  };
}

function buildGenericFallback(packageId: string): TourPackageDetail {
  return {
    ...LAGOS_WEEKEND_GETAWAY,
    id: packageId,
  };
}

const PACKAGE_DETAILS: Record<string, TourPackageDetail> = {
  "singapore-lights": LAGOS_WEEKEND_GETAWAY,
};

export function getTourPackageById(packageId: string): TourPackageDetail | null {
  const explicit = PACKAGE_DETAILS[packageId];
  if (explicit) {
    return explicit;
  }

  const pkg = TOUR_PACKAGES.find((item) => item.id === packageId);
  if (pkg) {
    return buildFromPackage(pkg);
  }

  return buildGenericFallback(packageId);
}

export function getAllTourPackageIds(): string[] {
  return TOUR_PACKAGES.map((item) => item.id);
}
