import { NextResponse } from "next/server";

import { listCountries } from "@/lib/geo/country-state-city";

export async function GET() {
  try {
    const countries = await listCountries();
    return NextResponse.json(countries);
  } catch {
    return NextResponse.json(
      { error: "Could not load countries" },
      { status: 502 },
    );
  }
}
