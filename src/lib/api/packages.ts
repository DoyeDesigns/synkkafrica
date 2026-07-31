import { apiFetch } from "@/lib/api/backend";
import type {
  AccommodationDeal,
  PackageOfferInclusion,
} from "@/features/travel/data/accommodations-landing";

export type PackageApi = {
  id: string;
  title: string;
  days: number;
  nights: number;
  scheduleLabel: string | null;
  savingsPercent: number;
  currentPrice: number;
  separateBookingPrice: number | null;
  currency: string;
  image: string | null;
  inclusions: string[];
  status: "draft" | "published";
  sortOrder: number;
};

const FALLBACK_PACKAGE_IMAGE = "/destinations/lagos.png";
const VALID_INCLUSIONS: PackageOfferInclusion[] = [
  "flights",
  "stays",
  "carDriver",
];

export async function listPackages(): Promise<PackageApi[]> {
  return apiFetch<PackageApi[]>("/packages");
}

// Map a backend package onto the carousel's deal shape.
export function toAccommodationDeal(p: PackageApi): AccommodationDeal {
  return {
    id: p.id,
    title: p.title,
    days: p.days,
    nights: p.nights,
    scheduleLabel: p.scheduleLabel ?? "",
    savingsPercent: p.savingsPercent,
    currentPrice: p.currentPrice,
    separateBookingPrice: p.separateBookingPrice ?? p.currentPrice,
    currency: p.currency,
    image: p.image ?? FALLBACK_PACKAGE_IMAGE,
    inclusions: p.inclusions.filter((i): i is PackageOfferInclusion =>
      VALID_INCLUSIONS.includes(i as PackageOfferInclusion),
    ),
    packageId: p.id,
  };
}
