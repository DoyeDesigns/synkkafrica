import { TOUR_PACKAGES } from "@/features/tour-packages/data/tour-packages";

export type TourPackageTier = {
  id: string;
  name: string;
  duration: string;
  price: number;
};

export type TourPackageDetail = {
  id: string;
  title: string;
  country: string;
  location: string;
  nights: number;
  days: number;
  startDate: string;
  endDate: string;
  images: string[];
  features: string[];
  tiers: TourPackageTier[];
  taxesAndFees: number;
  currency: string;
};

function buildTiers(
  basePrice: number,
  nights: number,
  days: number,
): TourPackageTier[] {
  const duration = `${nights} Nights / ${days} Days`;

  return [
    { id: "standard", name: "Standard package", duration, price: basePrice },
    {
      id: "deluxe",
      name: "Deluxe package",
      duration,
      price: Math.round(basePrice * 1.35),
    },
    {
      id: "all-inclusive",
      name: "All-inclusive",
      duration,
      price: Math.round(basePrice * 1.75),
    },
  ];
}

function buildFromPackage(pkg: (typeof TOUR_PACKAGES)[number]): TourPackageDetail {
  return {
    id: pkg.id,
    title: pkg.title,
    country: pkg.country,
    location: pkg.country,
    nights: pkg.nights,
    days: pkg.days,
    startDate: pkg.startDate,
    endDate: pkg.endDate,
    images: [pkg.image, pkg.image],
    features: [
      `${pkg.nights} nights / ${pkg.days} days`,
      "Flights included",
      "Hotel stay",
      "Guided tours",
    ],
    tiers: buildTiers(pkg.price, pkg.nights, pkg.days),
    taxesAndFees: 12000,
    currency: pkg.currency,
  };
}

function buildGenericFallback(packageId: string): TourPackageDetail {
  const template = buildFromPackage(TOUR_PACKAGES[0]);

  return {
    ...template,
    id: packageId,
  };
}

export function getTourPackageById(packageId: string): TourPackageDetail | null {
  const pkg = TOUR_PACKAGES.find((item) => item.id === packageId);

  if (pkg) {
    return buildFromPackage(pkg);
  }

  return buildGenericFallback(packageId);
}

export function getAllTourPackageIds(): string[] {
  return TOUR_PACKAGES.map((item) => item.id);
}
