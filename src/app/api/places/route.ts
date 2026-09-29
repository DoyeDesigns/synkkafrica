import { NextRequest, NextResponse } from "next/server";

import {
  fetchPhotonReverse,
  fetchPhotonSuggestions,
  type AddressSuggestScope,
  type PlaceSuggestion,
} from "@/lib/api/places";

type GooglePlacePrediction = {
  placeId?: string;
  text?: { text?: string };
  structuredFormat?: {
    mainText?: { text?: string };
    secondaryText?: { text?: string };
  };
};

type GoogleAutocompleteResponse = {
  suggestions?: { placePrediction?: GooglePlacePrediction }[];
};

/**
 * Optional Google Places (New) autocomplete. OpenStreetMap/Photon has thin
 * street-level coverage in parts of Africa, so when GOOGLE_PLACES_API_KEY is
 * set we use Google for suggestions (any address, landmark, estate or city —
 * no type restriction) and fall back to Photon on error / no results.
 */
async function fetchGoogleSuggestions(
  query: string,
  scope: AddressSuggestScope,
  signal: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key || query.trim().length < 3) return [];

  const input = [query.trim(), scope.city, scope.state, scope.country]
    .map((part) => part?.trim())
    .filter((part, index, parts): part is string => {
      if (!part) return false;
      if (index === 0) return true;
      return !parts[0]!.toLowerCase().includes(part.toLowerCase());
    })
    .join(", ");

  const countryCode = scope.countryCode?.trim().toLowerCase();
  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
      },
      body: JSON.stringify({
        input,
        languageCode: "en",
        ...(countryCode && countryCode.length === 2
          ? { includedRegionCodes: [countryCode] }
          : {}),
      }),
      signal,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Google Places autocomplete failed (${response.status})`);
  }

  const body = (await response.json()) as GoogleAutocompleteResponse;
  return (body.suggestions ?? [])
    .map((suggestion, index): PlaceSuggestion | null => {
      const prediction = suggestion.placePrediction;
      const label = prediction?.text?.text?.trim();
      if (!prediction || !label) return null;
      const main = prediction.structuredFormat?.mainText?.text?.trim();
      const secondary = prediction.structuredFormat?.secondaryText?.text ?? "";
      // "Lekki, Lagos, Nigeria" → "Lekki" is the closest thing to a city.
      const city = secondary.split(",")[0]?.trim();
      return {
        id: prediction.placeId ?? `google-${index}`,
        label,
        street: main || undefined,
        city: city || undefined,
      };
    })
    .filter((place): place is PlaceSuggestion => place !== null);
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");
  const lat = latParam == null ? NaN : Number(latParam);
  const lon = lonParam == null ? NaN : Number(lonParam);

  try {
    if (latParam != null && lonParam != null && Number.isFinite(lat) && Number.isFinite(lon)) {
      const place = await fetchPhotonReverse(lat, lon, request.signal);
      return NextResponse.json(place);
    }

    const geocode = request.nextUrl.searchParams.get("geocode") === "1";
    const city = request.nextUrl.searchParams.get("city")?.trim() || undefined;
    const state = request.nextUrl.searchParams.get("state")?.trim() || undefined;
    const country =
      request.nextUrl.searchParams.get("country")?.trim() || undefined;
    const countryCode =
      request.nextUrl.searchParams.get("countryCode")?.trim() || undefined;
    const scope = { city, state, country, countryCode };
    const scoped = Boolean(city || country || countryCode);

    // Geocoding needs coordinates, which only Photon returns inline.
    if (!geocode) {
      try {
        const google = await fetchGoogleSuggestions(query, scope, request.signal);
        if (google.length > 0) {
          return NextResponse.json(google);
        }
      } catch (error) {
        console.error("[places] Google autocomplete failed, using Photon", error);
      }
    }

    const suggestions = await fetchPhotonSuggestions(query, request.signal, {
      bias: !geocode && !scoped,
      limit: geocode ? 1 : scoped ? 10 : 8,
      ...scope,
    });
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json(
      { error: "Address lookup failed" },
      { status: 502 },
    );
  }
}
