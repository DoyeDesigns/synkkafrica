"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TourEventCard } from "@/features/travel/components/landing/tours/tour-event-card";
import {
  TOUR_EVENT_CATEGORIES,
  TOUR_EVENT_EXPERIENCES,
  TOUR_EVENT_LOCATIONS,
  TOUR_EVENTS,
} from "@/features/travel/data/tours-landing";
import { useFilterOptionLabel } from "@/hooks/use-filter-option-label";
import { useTranslation } from "@/hooks/use-translation";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 6;

function FilterPill({
  value,
  options,
  onChange,
  labelOption,
}: {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  labelOption: (value: string) => string;
}) {
  return (
    <label className="relative min-w-0 flex-1 sm:flex-none">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-[120px] appearance-none rounded-[25px] border border-[#D0D0D0] bg-[#A2A2A2]/10 px-4 pr-9 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#D85A30] sm:w-auto"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labelOption(option)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
    </label>
  );
}

export function ToursEventsSection() {
  const t = useTranslation();
  const { labelOption } = useFilterOptionLabel();
  const [location, setLocation] = useState<string>(TOUR_EVENT_LOCATIONS[0]);
  const [category, setCategory] = useState<string>(TOUR_EVENT_CATEGORIES[0]);
  const [experience, setExperience] = useState<string>(TOUR_EVENT_EXPERIENCES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return TOUR_EVENTS.filter((event) => {
      const matchesLocation = event.city === location;
      const matchesCategory =
        category === TOUR_EVENT_CATEGORIES[0] || event.category === category;
      const matchesExperience =
        experience === TOUR_EVENT_EXPERIENCES[0] || event.experience === experience;
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);

      return matchesLocation && matchesCategory && matchesExperience && matchesSearch;
    });
  }, [category, experience, location, searchQuery]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [location, category, experience, searchQuery]);

  return (
    <section className="w-full mt-20">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold font-satoshi text-foreground">
            <span>{t("landing.tours.events.browsingIn")}</span>
            <label className="relative">
              <span className="sr-only">Location</span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-11 appearance-none rounded-[25px] border border-[#D0D0D0] bg-[#A2A2A2]/10 px-4 pr-9 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#D85A30]"
              >
                {TOUR_EVENT_LOCATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <FilterPill
              value={category}
              options={TOUR_EVENT_CATEGORIES}
              onChange={setCategory}
              labelOption={labelOption}
            />
            <FilterPill
              value={experience}
              options={TOUR_EVENT_EXPERIENCES}
              onChange={setExperience}
              labelOption={labelOption}
            />

            <label className="relative w-full sm:min-w-[220px] sm:flex-1 lg:max-w-[280px]">
              <span className="sr-only">{t("results.tours.searchPlaceholder")}</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("results.tours.searchPlaceholder")}
                className="h-11 w-full rounded-[10px] border border-[#C9C9C9] bg-white py-2.5 pl-4 pr-10 text-sm font-satoshi text-foreground outline-none focus:border-[#D85A30]"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
            </label>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <>
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {visibleEvents.map((event) => (
                <TourEventCard key={event.id} event={event} />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) => current + LOAD_MORE_COUNT)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30] px-8 py-3 text-sm font-medium font-satoshi text-[#D85A30] transition-colors hover:bg-white"
                >
                  {t("common.seeMore")}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-medium font-satoshi text-foreground">
              {t("results.tours.empty")}
            </p>
            <p className="mt-2 text-sm font-satoshi text-foreground/70">
              {t("results.emptyHint")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
