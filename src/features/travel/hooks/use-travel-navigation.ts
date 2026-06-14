"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import {
  getDefaultSection,
  isTravelSection,
} from "@/features/travel/constants";
import type { TravelSection, TravelView } from "@/features/travel/types";

export function useTravelNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const sectionParam = searchParams.get("section");
  const section: TravelSection =
    sectionParam && isTravelSection(sectionParam)
      ? sectionParam
      : getDefaultSection();

  const view: TravelView =
    searchParams.get("view") === "results" ? "results" : "landing";

  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams();

      searchParams.forEach((value, key) => {
        params.set(key, value);
      });

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!params.get("section")) {
        params.set("section", section);
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, searchParams, section],
  );

  const setSection = useCallback(
    (nextSection: TravelSection) => {
      startTransition(() => {
        router.replace(`${pathname}?section=${nextSection}`, { scroll: false });
      });
    },
    [pathname, router],
  );

  const submitSearch = useCallback(
    (fields: Record<string, string>) => {
      const params = new URLSearchParams({ section, view: "results" });

      Object.entries(fields).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [pathname, router, section],
  );

  const resetToLanding = useCallback(() => {
    startTransition(() => {
      router.replace(`${pathname}?section=${section}`, { scroll: false });
    });
  }, [pathname, router, section]);

  return {
    section,
    view,
    searchParams,
    isPending,
    setSection,
    submitSearch,
    resetToLanding,
  };
}
