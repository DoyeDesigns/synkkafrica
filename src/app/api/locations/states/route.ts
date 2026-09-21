import { NextRequest, NextResponse } from "next/server";

import { listStates } from "@/lib/geo/country-state-city";

export async function GET(request: NextRequest) {
  const countryCode = request.nextUrl.searchParams.get("countryCode") ?? "";
  if (!countryCode.trim()) {
    return NextResponse.json([]);
  }

  try {
    const states = await listStates(countryCode);
    return NextResponse.json(states);
  } catch {
    return NextResponse.json(
      { error: "Could not load states" },
      { status: 502 },
    );
  }
}
