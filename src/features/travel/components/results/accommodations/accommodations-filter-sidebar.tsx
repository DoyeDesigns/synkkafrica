"use client";

import {
  BadgePercent,
  Building2,
  ChevronDown,
  MapPin,
} from "lucide-react";

import {
  PRICE_RANGE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  type AccommodationFilterState,
  type PriceRangeOption,
} from "@/features/travel/data/accommodation-results";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";
import { FilterPanel } from "./filter-panel";
import { OtherFiltersPanel } from "./other-filters-panel";
import { ClearFilterButton } from "../shared/clear-filter-button";

type AccommodationsFilterSidebarProps = {
  filters: AccommodationFilterState;
  activeFilterCount: number;
  showClearFilter: boolean;
  onFilterChange: <K extends keyof AccommodationFilterState>(
    key: K,
    value: AccommodationFilterState[K],
  ) => void;
  onApply: () => void;
  onClearFilters: () => void;
};

export function AccommodationsFilterSidebar({
  filters,
  activeFilterCount,
  showClearFilter,
  onFilterChange,
  onApply,
  onClearFilters,
}: AccommodationsFilterSidebarProps) {
  const t = useTranslation();
  const { labelOption, labelPriceRange } = useFilterOptionLabel();

  return (
    <aside className="space-y-4">
      <button
        type="button"
        onClick={onApply}
        className="w-full h-11 rounded-[5px] bg-[#004785] px-4 py-3 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
      >
        {t("filters.applyCount", { count: activeFilterCount })}
      </button>

      {showClearFilter ? (
        <ClearFilterButton
          variant="sidebar"
          className="max-w-full rounded-[5px]! border border-[#C9C9C9]!"
          onClick={onClearFilters}
        />
      ) : null}

      <FilterPanel className="space-y-6">
        <div>
          <label className="text-sm font-bold font-montserrat text-foreground">
            {t("filters.location")}
          </label>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#C9C9C9] px-3 py-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-[#676565]" />
            <input
              type="text"
              value={filters.location}
              onChange={(event) =>
                onFilterChange("location", event.target.value)
              }
              className="w-full bg-transparent text-sm font-satoshi text-foreground outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold font-montserrat text-foreground">
            {t("filters.discounts")}
          </label>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#C9C9C9] px-3 py-2.5">
            <BadgePercent className="h-4 w-4 shrink-0 text-[#676565]" />
            <input
              type="text"
              value={filters.discounts}
              onChange={(event) =>
                onFilterChange("discounts", event.target.value)
              }
              className="w-full bg-transparent text-sm font-satoshi text-foreground outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold font-montserrat text-foreground">
            {t("filters.price")}
          </label>

          <div className="mt-3 flex items-center rounded-lg border border-[#C9C9C9] px-3 py-2.5">
            <span className="shrink-0 text-sm font-satoshi text-foreground">₦</span>
            <input
              type="text"
              inputMode="numeric"
              value={filters.priceBudget}
              onChange={(event) =>
                onFilterChange("priceBudget", event.target.value)
              }
              placeholder={t("filters.budget")}
              className="min-w-0 flex-1 bg-transparent px-1.5 text-sm font-satoshi text-foreground outline-none placeholder:font-medium placeholder:text-foreground/60"
            />
            <span className="shrink-0 text-sm font-satoshi text-foreground/70">
              {t("filters.perNight")}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="bg-[#0000003D] pt-2 px-2 rounded-lg">
            <input
              type="range"
              min={10000}
              max={300000}
              step={5000}
              value={filters.priceMax}
              onChange={(event) =>
                onFilterChange("priceMax", Number(event.target.value))
              }
              className="w-full cursor-pointer accent-[#D85A30]"
            />
            </div>

            <div className="space-y-5">
              {PRICE_RANGE_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center gap-2 text-sm font-satoshi text-foreground"
                >
                  <input
                    type="radio"
                    name="price-range"
                    checked={filters.priceRange === option.id}
                    onChange={() =>
                      onFilterChange("priceRange", option.id as PriceRangeOption)
                    }
                    className="h-4 w-4 accent-[#D85A30]"
                  />
                  {labelPriceRange(option.id)}
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 text-sm font-satoshi text-foreground">
                <input
                  type="radio"
                  name="price-range"
                  checked={filters.priceRange === null}
                  onChange={() => onFilterChange("priceRange", null)}
                  className="h-4 w-4 accent-[#D85A30]"
                />
                {t("filters.anyPrice")}
              </label>
            </div>
          </div>
        </div>
      </FilterPanel>

      <FilterPanel>
        <label className="text-sm font-bold font-montserrat text-foreground">
          {t("filters.apartmentType")}
        </label>
        <div className="relative mt-3">
          <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          <select
            value={filters.propertyType}
            onChange={(event) =>
              onFilterChange("propertyType", event.target.value)
            }
            className="w-full appearance-none rounded-lg border border-[#C9C9C9] bg-white py-2.5 pl-9 pr-8 text-sm font-satoshi text-foreground outline-none"
          >
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {labelOption(option)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
        </div>
      </FilterPanel>

      <OtherFiltersPanel
        bedrooms={filters.bedrooms}
        ratings={filters.ratings}
        perks={filters.perks}
        onBedroomsChange={(value) => onFilterChange("bedrooms", value)}
        onRatingsChange={(value) => onFilterChange("ratings", value)}
        onPerksChange={(value) => onFilterChange("perks", value)}
      />
    </aside>
  );
}
