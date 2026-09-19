export function locationsOverlap(
  filterLocation: string,
  listingLocation: string,
) {
  const filter = filterLocation.toLowerCase();
  const listing = listingLocation.toLowerCase();

  if (!filter || !listing) {
    return false;
  }

  if (filter.includes(listing) || listing.includes(filter)) {
    return true;
  }

  return filter
    .split(/[\s,]+/)
    .filter((token) => token.length >= 4)
    .some((token) => listing.includes(token));
}
