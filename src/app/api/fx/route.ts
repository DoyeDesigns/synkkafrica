import { NextResponse } from "next/server";

import { getUsdFxRates } from "@/lib/preferences/fx";

export async function GET() {
  const snapshot = await getUsdFxRates();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
