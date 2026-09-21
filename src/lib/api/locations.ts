export type GeoOption = {
  code: string;
  name: string;
};

async function loadGeo(path: string, signal?: AbortSignal): Promise<GeoOption[]> {
  const response = await fetch(path, { signal });
  if (!response.ok) {
    throw new Error("Location lookup failed");
  }
  return (await response.json()) as GeoOption[];
}

export function listCountries(signal?: AbortSignal) {
  return loadGeo("/api/locations/countries", signal);
}

export function listStates(countryCode: string, signal?: AbortSignal) {
  const code = countryCode.trim();
  if (!code) return Promise.resolve([]);
  return loadGeo(
    `/api/locations/states?countryCode=${encodeURIComponent(code)}`,
    signal,
  );
}

export function listCities(
  countryCode: string,
  stateCode?: string,
  signal?: AbortSignal,
) {
  const country = countryCode.trim();
  if (!country) return Promise.resolve([]);
  const params = new URLSearchParams({ countryCode: country });
  if (stateCode?.trim()) params.set("stateCode", stateCode.trim());
  return loadGeo(`/api/locations/cities?${params.toString()}`, signal);
}
