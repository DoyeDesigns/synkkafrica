"use client";

import { AccommodationsFilterSidebar } from "./accommodations-filter-sidebar";
import { AccommodationResultCard } from "./accommodation-result-card";
import { AccommodationsResultsHeader } from "./accommodations-results-header";
import { ResultsBreadcrumbs } from "../shared/results-breadcrumbs";
import { useAccommodationFiltersContext } from "@/features/travel/providers/accommodation-filters-provider";
import { useTranslation } from "@/hooks/use-translation";
import { OngoingDealsSection } from "../../landing/accommodations/ongoing-deals-section";
import { ACCOMMODATION_DEALS } from "@/features/travel/data/accommodations-landing";

export function AccommodationsResultsPage() {
  const t = useTranslation();
  const {
    draftFilters,
    draftFilterCount,
    results,
    searchQuery,
    setSearchQuery,
    updateDraftFilter,
    applyFilters,
    resetFilters,
    hasAppliedFilters,
  } = useAccommodationFiltersContext();

  return (
    <div className="space-y-6">
      <ResultsBreadcrumbs
        items={[
          { label: t("breadcrumb.synkkAfrica"), href: "/" },
          { label: t("breadcrumb.accommodations") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-10 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
            <AccommodationsFilterSidebar
              filters={draftFilters}
              activeFilterCount={draftFilterCount}
              showClearFilter={hasAppliedFilters}
              onFilterChange={updateDraftFilter}
              onApply={applyFilters}
              onClearFilters={resetFilters}
            />
          </div>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <AccommodationsResultsHeader
            query={searchQuery}
            onQueryChange={setSearchQuery}
            resultCount={results.length}
          />

          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((item) => (
                <AccommodationResultCard key={item.id} item={item} />
              ))
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
                <p className="text-base font-medium font-satoshi text-foreground">
                  {t("results.accommodations.empty")}
                </p>
                <p className="mt-2 text-sm font-satoshi text-foreground/70">
                  {t("results.emptyHint")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-31 mb-12 w-full">
        <OngoingDealsSection items={ACCOMMODATION_DEALS} />
      </div>
    </div>
  );
}
