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
