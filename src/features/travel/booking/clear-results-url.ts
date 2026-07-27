export function getClearedResultsHref(section: string, pathname = "/") {
  const params = new URLSearchParams({
    section,
    view: "results",
  });

  return `${pathname}?${params.toString()}`;
}
