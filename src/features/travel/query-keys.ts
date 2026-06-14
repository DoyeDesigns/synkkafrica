import type { TravelSection, TravelView } from "./types";

export const travelQueryKeys = {
  all: ["travel"] as const,
  section: (section: TravelSection) =>
    [...travelQueryKeys.all, section] as const,
  landing: (section: TravelSection) =>
    [...travelQueryKeys.section(section), "landing"] as const,
  results: (section: TravelSection, searchKey: string) =>
    [...travelQueryKeys.section(section), "results", searchKey] as const,
};

export function buildSearchKey(
  section: TravelSection,
  params: Record<string, string>,
) {
  const entries = Object.entries(params)
    .filter(([, value]) => value)
    .sort(([a], [b]) => a.localeCompare(b));

  return `${section}:${JSON.stringify(entries)}`;
}

export function parseTravelUrl(searchParams: URLSearchParams) {
  return {
    view: (searchParams.get("view") === "results"
      ? "results"
      : "landing") satisfies TravelView,
    searchParams: Object.fromEntries(searchParams.entries()),
  };
}
