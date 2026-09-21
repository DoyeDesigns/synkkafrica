import { NextRequest, NextResponse } from "next/server";

import { listCities } from "@/lib/geo/country-state-city";

export async function GET(request: NextRequest) {
  const countryCode = request.nextUrl.searchParams.get("countryCode") ?? "";
  const stateCode = request.nextUrl.searchParams.get("stateCode") ?? "";
  if (!countryCode.trim()) {
    return NextResponse.json([]);
  }

  try {
    const cities = await listCities(countryCode, stateCode || undefined);
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json(
      { error: "Could not load cities" },
      { status: 502 },
    );
  }
}
