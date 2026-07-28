import { ADMIN_ACCOMMODATIONS } from "@/features/admin/data/admin-accommodations";
import { ADMIN_CARS } from "@/features/admin/data/admin-cars";
import { ADMIN_EXPERIENCES } from "@/features/admin/data/admin-experiences";
import type { TranslationKey } from "@/lib/preferences/translations";

export type PackageStepId = "details" | "modules" | "pricing" | "review";

export const PACKAGE_STEPS: PackageStepId[] = [
  "details",
  "modules",
  "pricing",
  "review",
];

export type PackageModuleType = "flight" | "accommodation" | "car" | "experience";

export type PackageCatalogItem = {
  id: string;
  type: PackageModuleType;
  title: string;
  subtitle: string;
  image: string;
};

export type PackageModule = {
  id: string;
  type: PackageModuleType;
  sourceId: string;
  title: string;
  subtitle: string;
  image: string;
};

export type AddPackageFormState = {
  packageName: string;
  packageSlug: string;
  shortDescription: string;
  detailedDescription: string;
  bannerPreviewUrl: string;
  bannerFileName: string;
  category: string;
  bestFor: string[];
  tags: string[];
  includedMeals: string;
  cancellationPolicy: string;
  refundPolicy: string;
  maxGuests: string;
  featuredDeal: boolean;
  modules: PackageModule[];
  currency: string;
  normalPrice: string;
  salesPrice: string;
  showSavingsBadge: boolean;
  savingsBadgePercent: string;
  validFrom: string;
  validUntil: string;
  minimumBookingNotice: string;
  packageActive: boolean;
};

export const PACKAGE_CATEGORIES = [
  "Beach Getaway",
  "City Break",
  "Safari Adventure",
  "Honeymoon",
  "Family Holiday",
] as const;

export const PACKAGE_BEST_FOR_OPTIONS = [
  "Couples",
  "Families",
  "Solo travelers",
  "Groups",
  "Business travelers",
] as const;

export const PACKAGE_MEAL_OPTIONS = [
  "Breakfast included",
  "Half board",
  "Full board",
  "All inclusive",
  "No meals included",
] as const;

export const PACKAGE_POLICY_OPTIONS = [
  "Flexible",
  "Moderate",
  "Strict",
  "Non-refundable",
] as const;

export const PACKAGE_BOOKING_NOTICE_OPTIONS = [
  "Same day",
  "1 day",
  "3 days",
  "7 days",
  "14 days",
] as const;

export const PACKAGE_CURRENCIES = ["NGN", "USD", "EUR", "GBP"] as const;

export const SHORT_DESCRIPTION_MAX = 160;
export const DETAILED_DESCRIPTION_MAX = 2000;
export const PACKAGE_BANNER_MAX_BYTES = 5 * 1024 * 1024;
export const PACKAGE_BANNER_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export const PACKAGE_MODULE_TYPE_LABEL_KEYS: Record<PackageModuleType, TranslationKey> = {
  flight: "admin.packages.moduleType.flight",
  accommodation: "admin.packages.moduleType.accommodation",
  car: "admin.packages.moduleType.car",
  experience: "admin.packages.moduleType.experience",
};

export const PACKAGE_MODULE_TYPE_STYLES: Record<
  PackageModuleType,
  { badge: string; border: string }
> = {
  flight: { badge: "bg-[#EBF5FB] text-[#1565C0]", border: "border-[#BBDEFB]" },
  accommodation: { badge: "bg-[#E8F5E9] text-[#2E7D32]", border: "border-[#C8E6C9]" },
  car: { badge: "bg-[#FFF3E0] text-[#E65100]", border: "border-[#FFE0B2]" },
  experience: { badge: "bg-[#F3E5F5] text-[#7B1FA2]", border: "border-[#E1BEE7]" },
};

const MOCK_FLIGHTS: PackageCatalogItem[] = [
  {
    id: "flight-los-paris",
    type: "flight",
    title: "Lagos (LOS) → Paris (CDG)",
    subtitle: "Round trip · Economy · 2 passengers",
    image: "/plane.png",
  },
  {
    id: "flight-abuja-dubai",
    type: "flight",
    title: "Abuja (ABV) → Dubai (DXB)",
    subtitle: "Round trip · Business · 2 passengers",
    image: "/plane.png",
  },
  {
    id: "flight-lagos-london",
    type: "flight",
    title: "Lagos (LOS) → London (LHR)",
    subtitle: "Round trip · Premium economy · 2 passengers",
    image: "/plane.png",
  },
];

function listingToCatalog(
  type: Exclude<PackageModuleType, "flight">,
  listing: { id: string; name: string; location: string; vendorName: string },
  image: string,
): PackageCatalogItem {
  return {
    id: listing.id,
    type,
    title: listing.name,
    subtitle: `${listing.location} · ${listing.vendorName}`,
    image,
  };
}

export const PACKAGE_MODULE_CATALOG: PackageCatalogItem[] = [
  ...MOCK_FLIGHTS,
  ...ADMIN_ACCOMMODATIONS.filter((item) => item.status === "active").map((item) =>
    listingToCatalog("accommodation", item, "/promo/loan-section2.png"),
  ),
  ...ADMIN_CARS.filter((item) => item.status === "active").map((item) =>
    listingToCatalog("car", item, "/wheel.png"),
  ),
  ...ADMIN_EXPERIENCES.filter((item) => item.status === "active").map((item) =>
    listingToCatalog("experience", item, "/promo/experience.png"),
  ),
];

export const EMPTY_ADD_PACKAGE_FORM: AddPackageFormState = {
  packageName: "",
  packageSlug: "",
  shortDescription: "",
  detailedDescription: "",
  bannerPreviewUrl: "",
  bannerFileName: "",
  category: "",
  bestFor: [],
  tags: [],
  includedMeals: "",
  cancellationPolicy: "",
  refundPolicy: "",
  maxGuests: "",
  featuredDeal: false,
  modules: [],
  currency: "NGN",
  normalPrice: "",
  salesPrice: "",
  showSavingsBadge: true,
  savingsBadgePercent: "",
  validFrom: "",
  validUntil: "",
  minimumBookingNotice: "3 days",
  packageActive: true,
};

export const STEP_LABEL_KEYS: Record<PackageStepId, TranslationKey> = {
  details: "admin.packages.steps.details",
  modules: "admin.packages.steps.modules",
  pricing: "admin.packages.steps.pricing",
  review: "admin.packages.steps.review",
};

export function slugifyPackageName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getNextPackageStep(step: PackageStepId): PackageStepId | null {
  const index = PACKAGE_STEPS.indexOf(step);
  return index < PACKAGE_STEPS.length - 1 ? PACKAGE_STEPS[index + 1]! : null;
}

export function getPreviousPackageStep(step: PackageStepId): PackageStepId | null {
  const index = PACKAGE_STEPS.indexOf(step);
  return index > 0 ? PACKAGE_STEPS[index - 1]! : null;
}

export function getPackageCatalogByType(type: PackageModuleType) {
  return PACKAGE_MODULE_CATALOG.filter((item) => item.type === type);
}

export function createPackageModule(item: PackageCatalogItem): PackageModule {
  return {
    id: crypto.randomUUID(),
    type: item.type,
    sourceId: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
  };
}

export function getPackageDisplaySavingsPercent(form: AddPackageFormState) {
  const savings = calculatePackageSavings(form.normalPrice, form.salesPrice);

  if (!savings) {
    return null;
  }

  const customPercent = Number(form.savingsBadgePercent);

  if (
    form.showSavingsBadge &&
    form.savingsBadgePercent.trim() &&
    Number.isFinite(customPercent) &&
    customPercent > 0 &&
    customPercent <= 100
  ) {
    return Math.round(customPercent);
  }

  return savings.percent;
}

export function calculatePackageSavings(normalPrice: string, salesPrice: string) {
  const normal = Number(normalPrice);
  const sales = Number(salesPrice);

  if (!Number.isFinite(normal) || !Number.isFinite(sales) || normal <= 0 || sales <= 0) {
    return null;
  }

  const amount = normal - sales;

  if (amount <= 0) {
    return null;
  }

  return {
    amount,
    percent: Math.round((amount / normal) * 100),
  };
}

export function getPackageDetailsMissingFields(form: AddPackageFormState): TranslationKey[] {
  const missing: TranslationKey[] = [];

  if (!form.packageName.trim()) missing.push("admin.packages.fields.packageName");
  if (!form.packageSlug.trim()) missing.push("admin.packages.fields.packageSlug");
  if (!form.shortDescription.trim()) missing.push("admin.packages.fields.shortDescription");
  if (!form.detailedDescription.trim()) missing.push("admin.packages.fields.detailedDescription");
  if (!form.category.trim()) missing.push("admin.packages.fields.category");

  return missing;
}

export function isPackageStepValid(step: PackageStepId, form: AddPackageFormState) {
  switch (step) {
    case "details":
      return getPackageDetailsMissingFields(form).length === 0;
    case "modules":
      return form.modules.length > 0;
    case "pricing":
      return (
        form.normalPrice.trim().length > 0 &&
        form.salesPrice.trim().length > 0 &&
        form.validFrom.trim().length > 0 &&
        form.validUntil.trim().length > 0 &&
        (!form.showSavingsBadge ||
          (Number(form.savingsBadgePercent) > 0 && Number(form.savingsBadgePercent) <= 100))
      );
    case "review":
      return true;
  }
}
