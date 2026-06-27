"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { ToursFilterSidebar } from "./tours-filter-sidebar";
import { TourResultCard } from "./tour-result-card";
import { ToursResultsHeader } from "./tours-results-header";
import { ResultsBreadcrumbs } from "../shared/results-breadcrumbs";
import { useTourFiltersContext } from "@/features/travel/providers/tour-filters-provider";
import { useTranslation } from "@/hooks/use-translation";

const INITIAL_VISIBLE_COUNT = 9;
const LOAD_MORE_COUNT = 9;

export function ToursResultsPage() {
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
  } = useTourFiltersContext();

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [results.length, searchQuery]);

  return (
    <div className="space-y-6">
      <ResultsBreadcrumbs
        items={[
          { label: t("breadcrumb.synkkAfrica"), href: "/" },
          { label: t("breadcrumb.tours") },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-10 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:overscroll-contain">
            <ToursFilterSidebar
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
          <ToursResultsHeader
            query={searchQuery}
            onQueryChange={setSearchQuery}
            resultCount={results.length}
          />

          {results.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleResults.map((item) => (
                  <TourResultCard key={item.id} item={item} />
                ))}
              </div>

              {hasMore ? (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) => current + LOAD_MORE_COUNT)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30] px-8 py-3 text-sm font-medium font-satoshi text-[#D85A30] transition-colors hover:bg-zinc-50"
                  >
                    {t("common.seeMore")}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
              <p className="text-base font-medium font-satoshi text-foreground">
                {t("results.tours.empty")}
              </p>
              <p className="mt-2 text-sm font-satoshi text-foreground/70">
                {t("results.emptyHint")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
