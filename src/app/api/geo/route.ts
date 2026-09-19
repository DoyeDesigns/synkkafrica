import { NextRequest, NextResponse } from "next/server";

function countryFromHeaders(request: NextRequest) {
  const raw =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");
  const code = raw?.trim().toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code;
}

export async function GET(request: NextRequest) {
  const fromHeader = countryFromHeaders(request);
  if (fromHeader) {
    return NextResponse.json({ countryCode: fromHeader });
  }

  try {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const url = forwarded
      ? `https://ipwho.is/${encodeURIComponent(forwarded)}`
      : "https://ipwho.is/";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ countryCode: null });
    }

    const body = (await response.json()) as {
      success?: boolean;
      country_code?: string;
    };
    const code = body.success === false ? null : body.country_code?.trim().toUpperCase();
    return NextResponse.json({
      countryCode: code && code.length === 2 ? code : null,
    });
  } catch {
    return NextResponse.json({ countryCode: null });
  }
}
