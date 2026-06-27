"use client";

import { Search } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";

type CarRentalsResultsHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
};

export function CarRentalsResultsHeader({
  query,
  onQueryChange,
  resultCount,
}: CarRentalsResultsHeaderProps) {
  const t = useTranslation();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[22px] font-bold font-montserrat text-foreground">
          {t("results.carRentals.title")}
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-foreground">
          {t("results.promoSubtitle")}
        </p>
        <p className="mt-2 text-xs font-satoshi text-foreground/60">
          {t("results.carRentals.carsFound", { count: resultCount })}
        </p>
      </div>

      <label className="relative w-full sm:max-w-[280px]">
        <span className="sr-only">{t("results.carRentals.searchPlaceholder")}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("results.carRentals.searchPlaceholder")}
          className="h-11 w-full rounded-[10px] border border-black/10 bg-white py-2.5 pl-4 pr-10 text-sm font-satoshi text-foreground outline-none focus:border-[#D85A30]"
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
      </label>
    </div>
  );
}
