"use client";

import {
  BedDouble,
  Bus,
  Coffee,
  RotateCcw,
  Star,
  Waves,
  Wifi,
  ChevronDown,
  X,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  BEDROOM_OPTIONS,
  PERK_OPTIONS,
  RATING_OPTIONS,
} from "@/features/travel/data/accommodation-results";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";
import { FilterPanel } from "./filter-panel";

type OtherFiltersPanelProps = {
  bedrooms: string;
  ratings: string;
  perks: string;
  onBedroomsChange: (value: string) => void;
  onRatingsChange: (value: string) => void;
  onPerksChange: (value: string) => void;
};

const FILTER_ICON_CLASS = "h-4 w-4 shrink-0 text-[#676565]";

function getPerkIcon(perk: string): LucideIcon {
  switch (perk) {
    case "Breakfast included":
      return Coffee;
    case "Free cancellation":
      return RotateCcw;
    case "Pool access":
      return Waves;
    case "Airport shuttle":
      return Bus;
    default:
      return Wifi;
  }
}

type FilterDropdownRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  labelOption: (value: string) => string;
};

function FilterDropdownRow({
  icon,
  label,
  value,
  options,
  onChange,
  labelOption,
}: FilterDropdownRowProps) {
  const isSelected = Boolean(value);

  return (
    <div className="relative rounded-lg border border-[#C9C9C9] bg-white">
      <div className="pointer-events-none flex items-center gap-2.5 px-3 py-2.5">
        {icon}
        <span
          className={`flex-1 text-sm font-medium font-satoshi ${
            isSelected ? "text-[#D85A30]" : "text-foreground"
          }`}
        >
          {isSelected ? labelOption(value) : label}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-foreground/60" />
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labelOption(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

type FilterTagProps = {
  label: string;
  onRemove: () => void;
};

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#D85A30]/10 px-2 py-1 text-xs font-medium font-satoshi text-[#D85A30]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-sm transition-opacity hover:opacity-70"
      >
        <X className="h-3 w-3" strokeWidth={2} />
      </button>
    </span>
  );
}

export function OtherFiltersPanel({
  bedrooms,
  ratings,
  perks,
  onBedroomsChange,
  onRatingsChange,
  onPerksChange,
}: OtherFiltersPanelProps) {
  const t = useTranslation();
  const { labelOption } = useFilterOptionLabel();
  const PerkIcon = getPerkIcon(perks);

  const activeTags = [
    bedrooms
      ? {
          id: "bedrooms",
          label: labelOption(bedrooms),
          onRemove: () => onBedroomsChange(""),
        }
      : null,
    ratings
      ? { id: "ratings", label: ratings, onRemove: () => onRatingsChange("") }
      : null,
    perks
      ? {
          id: "perks",
          label: labelOption(perks),
          onRemove: () => onPerksChange(""),
        }
      : null,
  ].filter((tag): tag is { id: string; label: string; onRemove: () => void } =>
    Boolean(tag),
  );

  return (
    <FilterPanel className="space-y-3">
      <h3 className="text-sm font-bold font-montserrat text-foreground">
        {t("filters.other")}
      </h3>

      {activeTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeTags.map((tag) => (
            <FilterTag key={tag.id} label={tag.label} onRemove={tag.onRemove} />
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <FilterDropdownRow
          icon={<BedDouble className={FILTER_ICON_CLASS} strokeWidth={1.75} />}
          label={t("filters.bedrooms")}
          value={bedrooms}
          options={BEDROOM_OPTIONS}
          onChange={onBedroomsChange}
          labelOption={labelOption}
        />

        <FilterDropdownRow
          icon={
            <Star
              className={`${FILTER_ICON_CLASS} fill-[#676565]`}
              strokeWidth={0}
            />
          }
          label={t("filters.ratings")}
          value={ratings}
          options={RATING_OPTIONS}
          onChange={onRatingsChange}
          labelOption={labelOption}
        />

        <FilterDropdownRow
          icon={<PerkIcon className={FILTER_ICON_CLASS} strokeWidth={1.75} />}
          label={t("filters.perks")}
          value={perks}
          options={PERK_OPTIONS}
          onChange={onPerksChange}
          labelOption={labelOption}
        />
      </div>
    </FilterPanel>
  );
}
