"use client";

import {
  CarFront,
  ChevronDown,
  Settings,
} from "lucide-react";

import {
  CAR_RENTAL_PRICE_RANGE_OPTIONS,
  CAR_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  type CarRentalFilterState,
  type CarRentalPriceRangeOption,
} from "@/features/travel/data/car-rental-results";
import { FilterPanel } from "@/features/travel/components/results/accommodations/filter-panel";
import { ClearFilterButton } from "@/features/travel/components/results/shared/clear-filter-button";
import { DiscountFilterPanel } from "@/features/travel/components/results/shared/discount-filter-panel";
import { FilterAddressField } from "@/features/travel/components/results/shared/filter-address-field";
import { useDisplayCurrency } from "@/hooks/use-display-currency";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";
import { scalePriceSlider } from "@/lib/preferences/price-filter";

// Slider bounds in Naira; shown in the display currency via scalePriceSlider.
const NGN_PRICE_SLIDER = { min: 10000, max: 300000, step: 5000 };

type CarRentalsFilterSidebarProps = {
  filters: CarRentalFilterState;
  // Body types present in the current inventory; the select is hidden when
  // none can be determined (so it can't zero out the results).
  carTypeOptions: readonly string[];
  activeFilterCount: number;
  showClearFilter: boolean;
  onFilterChange: <K extends keyof CarRentalFilterState>(
    key: K,
    value: CarRentalFilterState[K],
  ) => void;
  onApply: () => void;
  // Set a filter and apply it immediately (location suggestion picks).
  onApplyFilter: <K extends keyof CarRentalFilterState>(
    key: K,
    value: CarRentalFilterState[K],
  ) => void;
  onClearFilters: () => void;
};

function FilterSelect({
  icon,
  value,
  options,
  onChange,
  labelOption,
  anyLabel,
}: {
  icon: React.ReactNode;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  labelOption: (value: string) => string;
  // Label for the "" (no filter) option.
  anyLabel: string;
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
        <option value="">{anyLabel}</option>
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
  carTypeOptions,
  activeFilterCount,
  showClearFilter,
  onFilterChange,
  onApply,
  onApplyFilter,
  onClearFilters,
}: CarRentalsFilterSidebarProps) {
  const t = useTranslation();
  const { labelOption, labelPriceRange } = useFilterOptionLabel();
  // Prices on the result cards are shown in the display currency, so the
  // budget input and slider are too.
  const display = useDisplayCurrency();
  const slider = scalePriceSlider(
    NGN_PRICE_SLIDER,
    (amount) => display.toDisplay(amount, "NGN"),
    display.currency,
  );
  const sliderValue = Number.isFinite(filters.priceMax)
    ? Math.min(slider.max, Math.max(slider.min, filters.priceMax))
    : slider.max;

  return (
    <aside className="space-y-4">
      <button
        type="button"
        onClick={() => onApply()}
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
          onCommit={(value) => onApplyFilter("location", value)}
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
          <span className="shrink-0 text-sm font-satoshi text-foreground">
            {display.symbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={filters.priceBudget}
            onChange={(event) => {
              const raw = event.target.value;
              onFilterChange("priceBudget", raw);
              const parsed = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
              // The typed budget is the effective ceiling; the slider only
              // mirrors it. Clearing the budget removes the ceiling.
              onFilterChange(
                "priceMax",
                Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed,
              );
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
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={sliderValue}
              onChange={(event) => {
                const value = Number(event.target.value);
                // The slider's top end means "no ceiling".
                if (value >= slider.max) {
                  onFilterChange("priceMax", Number.POSITIVE_INFINITY);
                  onFilterChange("priceBudget", "");
                  return;
                }
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
        {carTypeOptions.length > 0 || filters.carType ? (
          <FilterSelect
            icon={<CarFront className="h-4 w-4" strokeWidth={1.75} />}
            value={filters.carType}
            options={
              filters.carType && !carTypeOptions.includes(filters.carType)
                ? [...carTypeOptions, filters.carType]
                : carTypeOptions
            }
            onChange={(value) => onFilterChange("carType", value)}
            labelOption={labelOption}
            anyLabel={t("filters.carType.any")}
          />
        ) : null}

        <FilterSelect
          icon={<Settings className="h-4 w-4" strokeWidth={1.75} />}
          value={filters.transmission}
          options={TRANSMISSION_OPTIONS}
          onChange={(value) => onFilterChange("transmission", value)}
          labelOption={labelOption}
          anyLabel={t("filters.transmission.any")}
        />
        </div>
      </FilterPanel>
    </aside>
  );
}
