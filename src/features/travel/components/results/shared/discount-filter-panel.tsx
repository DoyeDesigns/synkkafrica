"use client";

import { BadgePercent, ChevronDown } from "lucide-react";

import { FilterPanel } from "@/features/travel/components/results/accommodations/filter-panel";
import { DISCOUNT_FILTER_OPTIONS } from "@/features/travel/data/discount-filter";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";

type DiscountFilterPanelProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DiscountFilterPanel({ value, onChange }: DiscountFilterPanelProps) {
  const t = useTranslation();
  const { labelOption } = useFilterOptionLabel();

  return (
    <FilterPanel>
      <label className="text-sm font-bold font-montserrat text-foreground">
        {t("filters.discounts")}
      </label>
      <div className="relative mt-3">
        <BadgePercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[#C9C9C9] bg-white py-2.5 pl-9 pr-8 text-sm font-satoshi text-foreground outline-none"
        >
          {DISCOUNT_FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {labelOption(option)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
      </div>
    </FilterPanel>
  );
}
