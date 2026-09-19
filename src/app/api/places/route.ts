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
    const suggestions = await fetchPhotonSuggestions(query, undefined, {
      bias: !geocode,
      limit: geocode ? 1 : 6,
    });
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json(
      { error: "Address lookup failed" },
      { status: 502 },
    );
  }
}
