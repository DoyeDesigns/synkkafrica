"use client";

import {
  ChevronDown,
  Compass,
  LayoutGrid,
} from "lucide-react";

import { FilterPanel } from "@/features/travel/components/results/accommodations/filter-panel";
import { ClearFilterButton } from "@/features/travel/components/results/shared/clear-filter-button";
import { DiscountFilterPanel } from "@/features/travel/components/results/shared/discount-filter-panel";
import { FilterAddressField } from "@/features/travel/components/results/shared/filter-address-field";
import {
  TOUR_CATEGORY_FILTER_OPTIONS,
  TOUR_EXPERIENCE_FILTER_OPTIONS,
  TOUR_PRICE_RANGE_OPTIONS,
  type TourFilterState,
  type TourPriceRangeOption,
} from "@/features/travel/data/tour-results";
import { useDisplayCurrency } from "@/hooks/use-display-currency";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";
import {
  scalePriceSlider,
  type PriceSliderBounds,
} from "@/lib/preferences/price-filter";

// Slider bounds in Naira; shown in the display currency via scalePriceSlider.
const NGN_PRICE_SLIDER = { min: 10000, max: 300000, step: 5000 };

// An open ceiling (Infinity) parks the slider at its top end.
function sliderValue(priceMax: number, slider: PriceSliderBounds) {
  return Number.isFinite(priceMax)
    ? Math.min(slider.max, Math.max(slider.min, priceMax))
    : slider.max;
}

type ToursFilterSidebarProps = {
  filters: TourFilterState;
  activeFilterCount: number;
  showClearFilter: boolean;
  onFilterChange: <K extends keyof TourFilterState>(
    key: K,
    value: TourFilterState[K],
  ) => void;
  onApply: () => void;
  // Set a filter and apply it immediately (location suggestion picks).
  onApplyFilter: <K extends keyof TourFilterState>(
    key: K,
    value: TourFilterState[K],
  ) => void;
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

export function ToursFilterSidebar({
  filters,
  activeFilterCount,
  showClearFilter,
  onFilterChange,
  onApply,
  onApplyFilter,
  onClearFilters,
}: ToursFilterSidebarProps) {
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
          listboxId="tours-filter-address"
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
              // The typed budget is the ceiling; clearing it removes the ceiling.
              onFilterChange(
                "priceMax",
                Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed,
              );
            }}
            placeholder={t("filters.budget")}
            className="min-w-0 flex-1 bg-transparent px-1.5 text-sm font-satoshi text-foreground outline-none placeholder:font-medium placeholder:text-foreground/60"
          />
        </div>

        <div className="bg-[#0000003D] rounded-lg px-2 pt-2">
          <input
            type="range"
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={sliderValue(filters.priceMax, slider)}
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

        <div className="space-y-5">
          {TOUR_PRICE_RANGE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-2 text-sm font-satoshi text-foreground"
            >
              <input
                type="radio"
                name="tour-price-range"
                checked={filters.priceRange === option.id}
                onChange={() =>
                  onFilterChange("priceRange", option.id as TourPriceRangeOption)
                }
                className="h-4 w-4 accent-[#D85A30]"
              />
              {labelPriceRange(option.id)}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2 text-sm font-satoshi text-foreground">
            <input
              type="radio"
              name="tour-price-range"
              checked={filters.priceRange === null}
              onChange={() => onFilterChange("priceRange", null)}
              className="h-4 w-4 accent-[#D85A30]"
            />
            {t("filters.anyPrice")}
          </label>
        </div>
      </FilterPanel>

      <FilterPanel>
        <label className="text-sm font-bold font-montserrat text-foreground">
          {t("filters.other")}
        </label>

        <div className="mt-3 space-y-3">
          <FilterSelect
            icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.75} />}
            value={filters.category}
            options={TOUR_CATEGORY_FILTER_OPTIONS}
            onChange={(value) => onFilterChange("category", value)}
            labelOption={labelOption}
          />

          <FilterSelect
            icon={<Compass className="h-4 w-4" strokeWidth={1.75} />}
            value={filters.experience}
            options={TOUR_EXPERIENCE_FILTER_OPTIONS}
            onChange={(value) => onFilterChange("experience", value)}
            labelOption={labelOption}
          />
        </div>
      </FilterPanel>
    </aside>
  );
}
