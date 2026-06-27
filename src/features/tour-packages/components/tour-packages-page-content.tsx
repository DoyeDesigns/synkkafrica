"use client";

import { ChevronDown, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { TourPackageCard } from "@/features/tour-packages/components/tour-package-card";
import {
  TOUR_PACKAGE_LOCATIONS,
  TOUR_PACKAGES,
} from "@/features/tour-packages/data/tour-packages";
import { useTranslation } from "@/hooks/use-translation";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 4;

export function TourPackagesPageContent() {
  const t = useTranslation();
  const [location, setLocation] = useState<string>(TOUR_PACKAGE_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredPackages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return TOUR_PACKAGES.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [searchQuery]);

  const visiblePackages = filteredPackages.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPackages.length;

  return (
    <div className="">
      <section className="relative min-h-[360px] w-full overflow-hidden sm:min-h-[379px]">
        <Image
          src="/tour-packages.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-28 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold font-montserrat text-white sm:text-5xl">
            {t("tourPackages.hero.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium font-satoshi leading-relaxed text-white/90 sm:text-base">
            {t("tourPackages.hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="mt-25 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 mb-25">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex w-full flex-col gap-2 lg:max-w-[280px]">
            <span className="text-sm font-semibold font-inter text-foreground">
              {t("filters.location")}
            </span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-[#C9C9C9] bg-white py-2.5 pl-10 pr-9 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#D85A30]"
              >
                {TOUR_PACKAGE_LOCATIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
            </div>
          </label>

          <label className="flex w-full flex-col gap-2 lg:flex-1">
            <span className="sr-only">{t("tourPackages.searchPlaceholder")}</span>
            <div className="relative mt-auto">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("tourPackages.searchPlaceholder")}
                className="h-12 w-full rounded-xl border border-[#C9C9C9] bg-white py-2.5 pl-4 pr-10 text-sm font-satoshi text-foreground outline-none focus:border-[#D85A30]"
              />
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
            </div>
          </label>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePackages.map((item) => (
            <TourPackageCard key={item.id} item={item} />
          ))}
        </div>

        {filteredPackages.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium font-satoshi text-foreground/70">
              {t("tourPackages.empty")}
            </p>
          </div>
        ) : null}

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((current) => current + LOAD_MORE_COUNT)
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#D85A30] bg-white px-8 py-3 text-sm font-medium font-satoshi text-[#D85A30] transition-colors hover:bg-[#FFF1EB]"
            >
              {t("common.seeMore")}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
