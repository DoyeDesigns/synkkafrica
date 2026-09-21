export type PlaceSuggestion = {
  id: string;
  label: string;
  street?: string;
  city?: string;
  lat?: number;
  lon?: number;
  countryCode?: string;
};

export type AddressSuggestScope = {
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
};

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    osm_id?: number;
    osm_type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    locality?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function formatPlaceLabel(properties: PhotonFeature["properties"]): string {
  if (!properties) return "";

  const line = [
    [properties.housenumber, properties.street].filter(Boolean).join(" "),
    properties.name,
    properties.district,
    properties.city,
    properties.state,
    properties.country,
  ]
    .map((part) => part?.trim())
    .filter((part, index, parts): part is string =>
      Boolean(part) && parts.indexOf(part) === index,
    );

  return line.join(", ");
}

function coordsFromFeature(feature: PhotonFeature) {
  const [lon, lat] = feature.geometry?.coordinates ?? [];
  return {
    lat: Number.isFinite(lat) ? lat : undefined,
    lon: Number.isFinite(lon) ? lon : undefined,
  };
}

function streetLineFromProperties(properties: PhotonFeature["properties"]) {
  if (!properties) return "";

  const address = [properties.housenumber, properties.street]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  if (address) return address;

  const name = properties.name?.trim() ?? "";
  const skip = new Set(
    [properties.city, properties.district, properties.state, properties.country]
      .map((part) => part?.trim().toLowerCase())
      .filter((part): part is string => Boolean(part)),
  );
  if (name && !skip.has(name.toLowerCase())) return name;
  return "";
}

function withLocationScope(query: string, scope?: AddressSuggestScope) {
  const lower = query.toLowerCase();
  const extra = [scope?.city, scope?.state, scope?.country]
    .map((part) => part?.trim())
    .filter((part): part is string => {
      if (!part) return false;
      return !lower.includes(part.toLowerCase());
    });
  return extra.length ? `${query}, ${extra.join(", ")}` : query;
}

export function streetLineFromPlace(
  place: PlaceSuggestion,
  location?: { cityName?: string; stateName?: string; countryName?: string },
) {
  if (place.street?.trim()) return place.street.trim();

  let label = place.label;
  for (const part of [
    location?.countryName,
    location?.stateName,
    location?.cityName,
  ]) {
    const trimmed = part?.trim();
    if (!trimmed) continue;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    label = label
      .replace(new RegExp(`(,\\s*)?${escaped}\\s*$`, "i"), "")
      .trim();
  }
  return label;
}

export function parsePhotonSuggestions(body: PhotonResponse): PlaceSuggestion[] {
  return (body.features ?? [])
    .map((feature, index) => {
      const label = formatPlaceLabel(feature.properties);
      const { lat, lon } = coordsFromFeature(feature);
      const id = [
        feature.properties?.osm_type,
        feature.properties?.osm_id,
        index,
      ]
        .filter(Boolean)
        .join("-");

      const countryCode = feature.properties?.countrycode?.trim().toUpperCase();
      const city =
        feature.properties?.city?.trim() ||
        feature.properties?.district?.trim() ||
        feature.properties?.locality?.trim();

      return {
        id: id || `${label}-${index}`,
        label,
        street: streetLineFromProperties(feature.properties) || undefined,
        city: city || undefined,
        lat,
        lon,
        countryCode: countryCode && countryCode.length === 2 ? countryCode : undefined,
      };
    })
    .filter((place) => place.label.length > 0);
}

export async function fetchPhotonSuggestions(
  query: string,
  signal?: AbortSignal,
  options?: AddressSuggestScope & { bias?: boolean; limit?: number },
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return [];
  }

  const scoped = withLocationScope(trimmed, options);
  const limit = options?.limit ?? 6;
  const hasScope = Boolean(
    options?.city?.trim() ||
      options?.country?.trim() ||
      options?.countryCode?.trim(),
  );
  const bias =
    options?.bias === false || hasScope ? "" : "&lat=6.5244&lon=3.3792";
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(scoped)}&limit=${limit}${bias}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Address lookup failed");
  }

  let places = parsePhotonSuggestions((await response.json()) as PhotonResponse);
  const countryCode = options?.countryCode?.trim().toUpperCase();
  if (countryCode) {
    places = places.filter(
      (place) => !place.countryCode || place.countryCode === countryCode,
    );
  }

  const city = options?.city?.trim().toLowerCase();
  if (city) {
    places = [...places].sort((a, b) => {
      const score = (place: PlaceSuggestion) => {
        const haystack = `${place.city ?? ""} ${place.label}`.toLowerCase();
        return haystack.includes(city) ? 0 : 1;
      };
      return score(a) - score(b);
    });
  }

  return places;
}

export async function fetchPhotonReverse(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<PlaceSuggestion | null> {
  const url = `https://photon.komoot.io/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Address lookup failed");
  }

  return parsePhotonSuggestions((await response.json()) as PhotonResponse)[0] ?? null;
}

export async function suggestAddresses(
  query: string,
  signal?: AbortSignal,
  scope?: AddressSuggestScope,
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return [];
  }

  const params = new URLSearchParams({ q: trimmed });
  if (scope?.city?.trim()) params.set("city", scope.city.trim());
  if (scope?.state?.trim()) params.set("state", scope.state.trim());
  if (scope?.country?.trim()) params.set("country", scope.country.trim());
  if (scope?.countryCode?.trim()) {
    params.set("countryCode", scope.countryCode.trim());
  }

  const response = await fetch(`/api/places?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Address lookup failed");
  }

  return (await response.json()) as PlaceSuggestion[];
}

export async function reverseGeocode(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<PlaceSuggestion | null> {
  const response = await fetch(
    `/api/places?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Address lookup failed");
  }

  return (await response.json()) as PlaceSuggestion | null;
}

export async function geocodeAddress(
  query: string,
  signal?: AbortSignal,
): Promise<{ lat: number; lon: number } | null> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return null;
  }

  const response = await fetch(
    `/api/places?q=${encodeURIComponent(trimmed)}&geocode=1`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("Address lookup failed");
  }

  const results = (await response.json()) as PlaceSuggestion[];
  const match = results.find(
    (place) => Number.isFinite(place.lat) && Number.isFinite(place.lon),
  );

  if (match?.lat == null || match.lon == null) {
    return null;
  }

  return { lat: match.lat, lon: match.lon };
}
