import { NextRequest, NextResponse } from "next/server";

import {
  fetchPhotonReverse,
  fetchPhotonSuggestions,
} from "@/lib/api/places";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");
  const lat = latParam == null ? NaN : Number(latParam);
  const lon = lonParam == null ? NaN : Number(lonParam);

  try {
    if (latParam != null && lonParam != null && Number.isFinite(lat) && Number.isFinite(lon)) {
      const place = await fetchPhotonReverse(lat, lon);
      return NextResponse.json(place);
    }

    const geocode = request.nextUrl.searchParams.get("geocode") === "1";
    const city = request.nextUrl.searchParams.get("city")?.trim() || undefined;
    const state = request.nextUrl.searchParams.get("state")?.trim() || undefined;
    const country =
      request.nextUrl.searchParams.get("country")?.trim() || undefined;
    const countryCode =
      request.nextUrl.searchParams.get("countryCode")?.trim() || undefined;
    const scoped = Boolean(city || country || countryCode);
    const suggestions = await fetchPhotonSuggestions(query, undefined, {
      bias: !geocode && !scoped,
      limit: geocode ? 1 : scoped ? 10 : 6,
      city,
      state,
      country,
      countryCode,
    });
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json(
      { error: "Address lookup failed" },
      { status: 502 },
    );
  }
}
