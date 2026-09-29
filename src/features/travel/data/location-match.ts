import { expandedLocationHaystack } from "@/lib/geo/city-supplements";

// Address words that say nothing about *where* a place is. Matching on them
// ("road", "state", "phase") would pull in unrelated listings.
const GENERIC_LOCATION_TOKENS = new Set([
  "the",
  "and",
  "road",
  "street",
  "avenue",
  "way",
  "close",
  "crescent",
  "drive",
  "lane",
  "estate",
  "phase",
  "state",
  "city",
  "town",
  "area",
  "district",
  "local",
  "government",
  "lga",
  "federal",
  "capital",
  "territory",
  "republic",
  "province",
  "region",
  "county",
  "island",
  "international",
  "airport",
  "intl",
  "near",
  "junction",
  "bus",
  "stop",
]);

// Country names are too broad to narrow a search on their own when a more
// specific place (city / area) is also given: "Lagos, Nigeria" must not match
// an Abuja listing just because both are in Nigeria.
const COUNTRY_TOKENS = new Set([
  "nigeria",
  "ghana",
  "kenya",
  "south",
  "africa",
  "united",
  "arab",
  "emirates",
  "uae",
  "benin",
  "togo",
  "cameroon",
  "senegal",
  "egypt",
  "morocco",
  "rwanda",
  "tanzania",
  "uganda",
  "ethiopia",
  "kingdom",
  "states",
  "america",
  "usa",
]);

function tokenizeLocation(value: string) {
  return value
    .toLowerCase()
    .split(/[\s,./|()+-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !/^\d+$/.test(token));
}

// Tokens of a location query that identify a place, most specific first.
function significantLocationTokens(value: string) {
  const tokens = tokenizeLocation(value).filter(
    (token) => !GENERIC_LOCATION_TOKENS.has(token),
  );
  const specific = tokens.filter((token) => !COUNTRY_TOKENS.has(token));
  return specific.length > 0 ? specific : tokens;
}

/**
 * Whether a free-text location the user typed/picked (a city, an airport's
 * city, or a full street address from autocomplete) refers to the same area
 * as a listing's stored location. Case-insensitive; a listing in a known
 * sub-area (e.g. "Lekki Phase 1") also matches its city/state ("Lagos").
 */
export function locationsOverlap(
  filterLocation: string,
  listingLocation: string,
) {
  const filter = filterLocation.trim().toLowerCase();
  const rawListing = listingLocation.trim().toLowerCase();

  if (!filter || !rawListing) {
    return false;
  }

  const listing = expandedLocationHaystack(rawListing).toLowerCase();

  if (filter.includes(rawListing) || listing.includes(filter)) {
    return true;
  }

  const filterTokens = significantLocationTokens(filter);
  if (filterTokens.length === 0) {
    return false;
  }

  const listingTokens = new Set(tokenizeLocation(listing));
  return filterTokens.some(
    (token) =>
      listingTokens.has(token) ||
      // Multi-word names ("victoria island", "port harcourt").
      (token.length >= 5 && listing.includes(token)),
  );
}

/**
 * Free-text search over a listing: every meaningful word of the query must
 * appear in the listing's text, or the query must name the listing's area.
 * So "lagos" finds listings in Lekki, and "toyota lekki" finds Toyotas there.
 */
export function matchesSearchQuery(
  query: string,
  text: string,
  location = "",
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = `${text} ${expandedLocationHaystack(location)}`.toLowerCase();
  if (haystack.includes(normalized)) return true;

  const words = normalized
    .split(/[\s,./|()+-]+/)
    .filter((word) => word.length >= 2);
  if (
    words.length > 0 &&
    words.every((word) => haystack.includes(word))
  ) {
    return true;
  }

  return location ? locationsOverlap(normalized, location) : false;
}
