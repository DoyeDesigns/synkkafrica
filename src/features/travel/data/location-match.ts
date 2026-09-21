import { expandedLocationHaystack } from "@/lib/geo/city-supplements";

export function locationsOverlap(
  filterLocation: string,
  listingLocation: string,
) {
  const filter = filterLocation.trim().toLowerCase();
  const listing = expandedLocationHaystack(
    listingLocation.trim().toLowerCase(),
  );

  if (!filter || !listing) {
    return false;
  }

  if (filter.includes(listing) || listing.includes(filter)) {
    return true;
  }

  const filterTokens = tokenizeLocation(filter);
  if (filterTokens.length === 0) {
    return false;
  }

  return filterTokens.some((token) => listing.includes(token));
}

function tokenizeLocation(value: string) {
  return value
    .split(/[\s,./|+-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}
