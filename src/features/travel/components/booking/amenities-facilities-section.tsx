"use client";

import {
  Accessibility,
  Bell,
  Check,
  CircleParking,
  Flower2,
  Info,
  PawPrint,
  User,
  Users,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import { useBookingContent } from "@/hooks/use-booking-content";
import { useTranslation } from "@/hooks/use-translation";
import type {
  AmenityCategory,
  AmenityCategoryIcon,
  AmenityListItem,
  AmenityTag,
  PropertyAmenities,
} from "@/features/travel/data/property-amenities";

type AmenitiesFacilitiesSectionProps = {
  amenities: PropertyAmenities;
};

const CATEGORY_ICONS: Record<AmenityCategoryIcon, LucideIcon> = {
  stay: User,
  outdoors: Flower2,
  pets: PawPrint,
  wifi: Wifi,
  parking: CircleParking,
  "front-desk": Bell,
  family: Users,
  cleaning: WashingMachine,
  general: Info,
  accessibility: Accessibility,
  pool: Waves,
};

function AmenityTagBadge({ tag }: { tag: AmenityTag }) {
  const t = useTranslation();

  if (tag === "free") {
    return (
      <span className="rounded bg-[#E8F5E9] px-1.5 py-0.5 text-xs font-medium font-satoshi text-[#2E7D32]">
        {t("booking.amenity.free")}
      </span>
    );
  }

  return (
    <span className="rounded bg-[#F0F0F0] px-1.5 py-0.5 text-xs font-medium font-satoshi text-[#676565]">
      {t("booking.amenity.additionalCharge")}
    </span>
  );
}

function AmenityList({ items }: { items: AmenityListItem[] }) {
  const { labelContent } = useBookingContent();

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-start gap-2 text-sm font-normal font-inter text-foreground"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#676565]" strokeWidth={2} />
          <span className="flex flex-wrap items-center gap-2">
            {labelContent(item.label)}
            {item.tag ? <AmenityTagBadge tag={item.tag} /> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AmenityCategoryBlock({ category }: { category: AmenityCategory }) {
  const { labelContent } = useBookingContent();
  const Icon = CATEGORY_ICONS[category.icon];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 shrink-0 text-foreground" strokeWidth={1.75} />
        <h3 className="text-sm font-bold font-inter text-foreground">
          {labelContent(category.title)}
        </h3>
      </div>

      {category.description ? (
        <p className="text-sm font-normal font-inter text-foreground">
          {labelContent(category.description)}
        </p>
      ) : null}

      {category.items ? <AmenityList items={category.items} /> : null}

      {category.subsections?.map((subsection) => (
        <div key={subsection.title} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold font-inter text-foreground">
              {labelContent(subsection.title)}
            </p>
            {subsection.tag ? <AmenityTagBadge tag={subsection.tag} /> : null}
          </div>
          <AmenityList items={subsection.items} />
        </div>
      ))}
    </div>
  );
}

export function AmenitiesFacilitiesSection({
  amenities,
}: AmenitiesFacilitiesSectionProps) {
  return (
    <section>
      <div className="mt-5 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-8">
            {column.map((category) => (
              <AmenityCategoryBlock key={category.title} category={category} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
