import {
  Accessibility,
  Bell,
  Car,
  CircleParking,
  Coffee,
  Flower2,
  Info,
  PawPrint,
  Shield,
  Snowflake,
  Tv,
  User,
  Users,
  WashingMachine,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  DEFAULT_PROPERTY_AMENITIES,
  type PropertyAmenities,
} from "@/features/travel/data/property-amenities";

export const ACCOMMODATION_PROPERTY_TYPES = [
  "Hotels",
  "Apartments",
  "Resorts",
  "B&Bs",
  "Guest House",
  "Beach House",
  "Motels",
] as const;

export type AccommodationPropertyType = (typeof ACCOMMODATION_PROPERTY_TYPES)[number];

function flattenPropertyAmenities(amenities: PropertyAmenities): string[] {
  const labels = new Set<string>();

  for (const column of amenities) {
    for (const category of column) {
      category.items?.forEach((item) => labels.add(item.label));
      category.subsections?.forEach((subsection) => {
        subsection.items.forEach((item) => labels.add(item.label));
      });
    }
  }

  return Array.from(labels);
}

/** All amenity labels from the Eko Hotels book page (`DEFAULT_PROPERTY_AMENITIES`). */
export const ACCOMMODATION_LISTING_PERKS = flattenPropertyAmenities(DEFAULT_PROPERTY_AMENITIES);

/** Default visible perks before expanding. */
export const ACCOMMODATION_POPULAR_PERKS = [
  "Free Wifi",
  "Air conditioning",
  "Restaurant",
  "Shared lounge/TV area",
  "Open all year",
  "Parking",
  "24-hour front desk",
  "Concierge",
] as const;

const PERK_ICON_MATCHERS: Array<{ pattern: RegExp; icon: LucideIcon }> = [
  { pattern: /wifi|internet/i, icon: Wifi },
  { pattern: /air conditioning/i, icon: Snowflake },
  { pattern: /breakfast|restaurant|lunch/i, icon: Coffee },
  { pattern: /tv|lounge/i, icon: Tv },
  { pattern: /pool|swim|beach chair/i, icon: Waves },
  { pattern: /parking|valet|garage/i, icon: CircleParking },
  { pattern: /power|shuttle/i, icon: Zap },
  { pattern: /security|locker|concierge|front desk|baggage/i, icon: Shield },
  { pattern: /pet/i, icon: PawPrint },
  { pattern: /clean|housekeeping|ironing|washing/i, icon: WashingMachine },
  { pattern: /family|kids|play/i, icon: Users },
  { pattern: /disabled|accessibility|accessible|emergency cord/i, icon: Accessibility },
  { pattern: /beach|garden|terrace|outdoor|sun deck|fireplace/i, icon: Flower2 },
  { pattern: /spa|room service/i, icon: User },
  { pattern: /car rental|currency|atm/i, icon: Car },
  { pattern: /smoking|general|packed|facilities/i, icon: Info },
  { pattern: /bell|desk/i, icon: Bell },
];

export function getAccommodationPerkIcon(label: string): LucideIcon {
  return PERK_ICON_MATCHERS.find(({ pattern }) => pattern.test(label))?.icon ?? Info;
}

export function getAccommodationPerksForDisplay(expanded: boolean): string[] {
  if (expanded) {
    return ACCOMMODATION_LISTING_PERKS;
  }

  return ACCOMMODATION_POPULAR_PERKS.filter((perk) => ACCOMMODATION_LISTING_PERKS.includes(perk));
}

export function getHiddenAccommodationPerkCount(expanded: boolean): number {
  if (expanded) {
    return 0;
  }

  return ACCOMMODATION_LISTING_PERKS.length - getAccommodationPerksForDisplay(false).length;
}
