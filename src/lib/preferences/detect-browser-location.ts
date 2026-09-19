import { reverseGeocode } from "@/lib/api/places";
import {
  detectPreferencesFromRequest,
  type DetectedPreferences,
} from "@/lib/preferences/location-preferences";

function countryFromGeolocation(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void reverseGeocode(position.coords.latitude, position.coords.longitude)
          .then((place) => resolve(place?.countryCode ?? null))
          .catch(() => resolve(null));
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  });
}

async function countryFromIp(): Promise<string | null> {
  try {
    const response = await fetch("/api/geo", { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { countryCode?: string | null };
    const code = body.countryCode?.trim().toUpperCase();
    return code && code.length === 2 ? code : null;
  } catch {
    return null;
  }
}

export async function detectBrowserLocationPreferences(): Promise<DetectedPreferences | null> {
  if (typeof navigator === "undefined") {
    return null;
  }

  const ipPromise = countryFromIp();
  const countryCode = (await countryFromGeolocation()) ?? (await ipPromise);
  if (!countryCode) {
    return null;
  }

  return detectPreferencesFromRequest({
    countryCode,
    browserLocale: navigator.language,
    acceptLanguage: navigator.languages?.join(","),
  });
}
