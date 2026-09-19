"use client";

import {
  CarFront,
  ChevronDown,
  Settings,
} from "lucide-react";
import Image from "next/image";

import {
  CAR_RENTAL_PRICE_RANGE_OPTIONS,
  CAR_TYPE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  type CarRentalFilterState,
  type CarRentalPriceRangeOption,
} from "@/features/travel/data/car-rental-results";
import { FilterPanel } from "@/features/travel/components/results/accommodations/filter-panel";
import { ClearFilterButton } from "@/features/travel/components/results/shared/clear-filter-button";
import { DiscountFilterPanel } from "@/features/travel/components/results/shared/discount-filter-panel";
import { FilterAddressField } from "@/features/travel/components/results/shared/filter-address-field";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";

const PRICE_SLIDER_MIN = 10000;
const PRICE_SLIDER_MAX = 300000;

type CarRentalsFilterSidebarProps = {
  filters: CarRentalFilterState;
  activeFilterCount: number;
  showClearFilter: boolean;
  onFilterChange: <K extends keyof CarRentalFilterState>(
    key: K,
    value: CarRentalFilterState[K],
  ) => void;
  onApply: () => void;
  onClearFilters: () => void;
};

function FilterSelect({
  icon,
  value,
  options,
  onChange,
  labelOption,
}: {
  icon: React.ReactNode;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  labelOption: (value: string) => string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#676565]">
        {icon}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-lg border border-[#C9C9C9] bg-white py-2.5 pl-9 pr-8 text-sm font-satoshi text-foreground outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelOption(option)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
    </div>
  );
}

export function CarRentalsFilterSidebar({
  filters,
  activeFilterCount,
  showClearFilter,
  onFilterChange,
  onApply,
  onClearFilters,
}: CarRentalsFilterSidebarProps) {
  const t = useTranslation();
  const { labelOption, labelPriceRange } = useFilterOptionLabel();
  const sliderValue = Number.isFinite(filters.priceMax)
    ? Math.min(PRICE_SLIDER_MAX, Math.max(PRICE_SLIDER_MIN, filters.priceMax))
    : PRICE_SLIDER_MAX;

  return (
    <aside className="space-y-4">
      <button
        type="button"
        onClick={onApply}
        className="h-11 w-full rounded-[5px] bg-[#004785] px-4 py-3 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
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

      <FilterPanel>
        <label className="text-sm font-bold font-montserrat text-foreground">
          {t("filters.location")}
        </label>
        <FilterAddressField
          value={filters.location}
          onChange={(value) => onFilterChange("location", value)}
          placeholder={t("filters.searchAddress")}
          listboxId="car-rentals-filter-address"
        />
      </FilterPanel>

      <DiscountFilterPanel
        value={filters.discounts}
        onChange={(value) => onFilterChange("discounts", value)}
      />

      <FilterPanel className="space-y-4">
        <label className="text-sm font-bold font-montserrat text-foreground">
          {t("filters.price")}
        </label>

        <div className="mt-3 flex items-center rounded-lg border border-[#C9C9C9] px-3 py-2.5">
          <span className="shrink-0 text-sm font-satoshi text-foreground">₦</span>
          <input
            type="text"
            inputMode="numeric"
            value={filters.priceBudget}
            onChange={(event) => {
              const raw = event.target.value;
              onFilterChange("priceBudget", raw);
              const parsed = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
              if (!Number.isNaN(parsed)) {
                onFilterChange(
                  "priceMax",
                  Math.min(PRICE_SLIDER_MAX, Math.max(PRICE_SLIDER_MIN, parsed)),
                );
              }
            }}
            placeholder={t("filters.budget")}
            className="min-w-0 flex-1 bg-transparent px-1.5 text-sm font-satoshi text-foreground outline-none placeholder:font-medium placeholder:text-foreground/60"
          />
          <span className="shrink-0 text-sm font-satoshi text-foreground/70">
            {t("filters.perDaily")}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg bg-[#0000003D] px-2 pt-2">
            <input
              type="range"
              min={PRICE_SLIDER_MIN}
              max={PRICE_SLIDER_MAX}
              step={5000}
              value={sliderValue}
              onChange={(event) => {
                const value = Number(event.target.value);
                onFilterChange("priceMax", value);
                onFilterChange("priceBudget", value.toLocaleString("en-NG"));
              }}
              className="w-full cursor-pointer accent-[#D85A30]"
            />
          </div>
        </div>

        <div className="space-y-5">
          {CAR_RENTAL_PRICE_RANGE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-sm font-satoshi text-foreground"
            >
              <input
                type="radio"
                name="car-price-range"
                checked={filters.priceRange === option.id}
                onChange={() =>
                  onFilterChange("priceRange", option.id as CarRentalPriceRangeOption)
                }
                className="h-4 w-4 accent-[#D85A30]"
              />
              {labelPriceRange(option.id)}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-satoshi text-foreground">
            <input
              type="radio"
              name="car-price-range"
              checked={filters.priceRange === null}
              onChange={() => onFilterChange("priceRange", null)}
              className="h-4 w-4 accent-[#D85A30]"
            />
            {t("filters.anyPrice")}
          </label>
        </div>
      </FilterPanel>

      <FilterPanel className="">
        <label className="text-sm font-bold font-montserrat text-foreground">
          {t("filters.other")}
        </label>

        <div className="space-y-3 mt-3">
        <FilterSelect
          icon={<CarFront className="h-4 w-4" strokeWidth={1.75} />}
          value={filters.carType}
          options={CAR_TYPE_OPTIONS}
          onChange={(value) => onFilterChange("carType", value)}
          labelOption={labelOption}
        />

        <FilterSelect
          icon={
            <Image src="/wheel-grey.png" alt="" width={16} height={16} aria-hidden />
          }
          value={filters.serviceType}
          options={SERVICE_TYPE_OPTIONS}
          onChange={(value) => onFilterChange("serviceType", value)}
          labelOption={labelOption}
        />

        <FilterSelect
          icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
          value={filters.transmission}
          options={TRANSMISSION_OPTIONS}
          onChange={(value) => onFilterChange("transmission", value)}
          labelOption={labelOption}
        />
        </div>
      </FilterPanel>
    </aside>
  );
}
