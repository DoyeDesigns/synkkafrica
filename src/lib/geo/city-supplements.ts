type GeoOption = {
  code: string;
  name: string;
};

/** Extra cities/areas the npm CountryStateCity subset often misses. */
const CITY_SUPPLEMENTS: Record<string, string[]> = {
  "NG-LA": [
    "Lekki",
    "Victoria Island",
    "Ikoyi",
    "Ajah",
    "Yaba",
    "Surulere",
    "Ikorodu",
    "Badagry",
    "Epe",
    "Agege",
    "Alimosho",
    "Apapa",
    "Festac",
    "Gbagada",
    "Ikeja",
    "Lagos Island",
    "Magodo",
    "Maryland",
    "Mushin",
    "Ogba",
    "Oshodi",
    "Banana Island",
  ],
  "NG-FC": ["Abuja", "Garki", "Maitama", "Wuse", "Asokoro", "Gwarinpa", "Kubwa"],
  "NG-RI": ["Port Harcourt", "Obio-Akpor"],
  "NG-KD": ["Kaduna"],
  "NG-KN": ["Kano"],
  "NG-OY": ["Ibadan"],
  "NG-EN": ["Enugu"],
  "NG-AN": ["Awka", "Onitsha"],
  "ZA-GP": ["Johannesburg", "Pretoria", "Sandton", "Soweto"],
  "ZA-WC": ["Cape Town", "Stellenbosch"],
  "KE-30": ["Nairobi"],
  "GH-AA": ["Accra", "Tema"],
  "AE-DU": ["Dubai"],
};

const REGION_PARENTS: Record<string, { state: string; country: string }> = {
  "NG-LA": { state: "Lagos", country: "Nigeria" },
  "NG-FC": { state: "Abuja", country: "Nigeria" },
  "NG-RI": { state: "Rivers", country: "Nigeria" },
  "NG-KD": { state: "Kaduna", country: "Nigeria" },
  "NG-KN": { state: "Kano", country: "Nigeria" },
  "NG-OY": { state: "Oyo", country: "Nigeria" },
  "NG-EN": { state: "Enugu", country: "Nigeria" },
  "NG-AN": { state: "Anambra", country: "Nigeria" },
  "ZA-GP": { state: "Gauteng", country: "South Africa" },
  "ZA-WC": { state: "Western Cape", country: "South Africa" },
  "KE-30": { state: "Nairobi", country: "Kenya" },
  "GH-AA": { state: "Greater Accra", country: "Ghana" },
  "AE-DU": { state: "Dubai", country: "United Arab Emirates" },
};

const METRO_CITIES: Record<string, string> = {
  "NG-LA": "Lagos",
  "NG-FC": "Abuja",
  "NG-RI": "Port Harcourt",
  "NG-KD": "Kaduna",
  "NG-KN": "Kano",
  "NG-OY": "Ibadan",
  "NG-EN": "Enugu",
  "NG-AN": "Onitsha",
  "ZA-GP": "Johannesburg",
  "ZA-WC": "Cape Town",
  "KE-30": "Nairobi",
  "GH-AA": "Accra",
  "AE-DU": "Dubai",
};

const STREET_LIKE =
  /^\d|\b(street|st\.?|road|rd\.?|avenue|ave\.?|close|crescent|drive|blvd|boulevard|lane|way|expressway)\b/i;

const COUNTRY_LIKE = new Set([
  "nigeria",
  "kenya",
  "ghana",
  "south africa",
  "united arab emirates",
  "uae",
  "benin",
  "togo",
  "cameroon",
  "rwanda",
  "tanzania",
  "uganda",
  "egypt",
  "morocco",
  "senegal",
]);

function isStreetLike(value: string) {
  return STREET_LIKE.test(value.trim());
}

function isCountryLike(value: string) {
  return COUNTRY_LIKE.has(value.trim().toLowerCase());
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Collapse a street or neighborhood into the metro city used in hero search. */
export function searchCityFromLocation(location: string) {
  const trimmed = location.trim();
  if (!trimmed) return "";

  const metros = [...new Set(Object.values(METRO_CITIES))];
  const metroHit = metros.find((name) =>
    new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").test(trimmed),
  );
  if (metroHit) return metroHit;

  const lower = trimmed.toLowerCase();
  for (const [key, cities] of Object.entries(CITY_SUPPLEMENTS)) {
    const metro = METRO_CITIES[key];
    if (!metro) continue;
    if (cities.some((city) => lower.includes(city.toLowerCase()))) {
      return metro;
    }
  }

  const parts = trimmed
    .split(/[,|/]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const candidates = parts.filter(
    (part) => !isStreetLike(part) && !isCountryLike(part),
  );
  return candidates[0] ?? "";
}

export function rollupDestinationsByCity(
  destinations: { location: string; count: number }[],
) {
  const map = new Map<string, { location: string; count: number }>();

  for (const destination of destinations) {
    const city = searchCityFromLocation(destination.location);
    if (!city) continue;
    const key = city.toLowerCase();
    const current = map.get(key);
    if (current) {
      current.count += destination.count;
    } else {
      map.set(key, { location: city, count: destination.count });
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Append parent city/country names so "Lekki Phase 1" still matches a Lagos search. */
export function expandedLocationHaystack(location: string) {
  const lower = location.toLowerCase();
  const extra: string[] = [];

  for (const [key, cities] of Object.entries(CITY_SUPPLEMENTS)) {
    const parent = REGION_PARENTS[key];
    if (!parent) continue;
    if (cities.some((city) => lower.includes(city.toLowerCase()))) {
      extra.push(parent.state, parent.country);
    }
  }

  if (extra.length === 0) return location;
  return `${location} ${extra.join(" ")}`;
}

export function supplementalCities(
  countryCode: string,
  stateCode?: string,
): GeoOption[] {
  const country = countryCode.trim().toUpperCase();
  const state = stateCode?.trim().toUpperCase();
  const names = new Set<string>();

  if (state) {
    for (const name of CITY_SUPPLEMENTS[`${country}-${state}`] ?? []) {
      names.add(name);
    }
  } else {
    for (const [key, cities] of Object.entries(CITY_SUPPLEMENTS)) {
      if (key.startsWith(`${country}-`)) {
        for (const name of cities) names.add(name);
      }
    }
  }

  return [...names].map((name) => ({ code: name, name }));
}
