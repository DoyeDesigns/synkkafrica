export type PlaceSuggestion = {
  id: string;
  label: string;
  lat?: number;
  lon?: number;
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

      return {
        id: id || `${label}-${index}`,
        label,
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
  options?: { bias?: boolean; limit?: number },
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return [];
  }

  const limit = options?.limit ?? 6;
  const bias = options?.bias === false ? "" : "&lat=6.5244&lon=3.3792";
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=${limit}${bias}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Address lookup failed");
  }

  return parsePhotonSuggestions((await response.json()) as PhotonResponse);
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
): Promise<PlaceSuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return [];
  }

  const response = await fetch(
    `/api/places?q=${encodeURIComponent(trimmed)}`,
    { signal },
  );

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
