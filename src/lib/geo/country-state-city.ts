import { City, Country, State } from "country-state-city";

import { supplementalCities } from "@/lib/geo/city-supplements";

export type GeoOption = {
  code: string;
  name: string;
};

const CSC_BASE = "https://api.countrystatecity.in/v1";

function cscKey() {
  return process.env.CSC_API_KEY?.trim() || process.env.COUNTRYSTATECITY_API_KEY?.trim();
}

async function cscFetch<T>(path: string): Promise<T | null> {
  const key = cscKey();
  if (!key) return null;

  const response = await fetch(`${CSC_BASE}${path}`, {
    headers: { "X-CSCAPI-KEY": key },
    next: { revalidate: 60 * 60 * 24 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error(`CountryStateCity lookup failed (${response.status})`);
  }

  return (await response.json()) as T;
}

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export async function listCountries(): Promise<GeoOption[]> {
  try {
    const remote = await cscFetch<Array<{ name: string; iso2: string }>>(
      "/countries",
    );
    if (remote?.length) {
      return sortByName(
        remote.map((country) => ({
          code: country.iso2,
          name: country.name,
        })),
      );
    }
  } catch {
    // Fall through to the local CountryStateCity dataset.
  }

  return sortByName(
    Country.getAllCountries().map((country) => ({
      code: country.isoCode,
      name: country.name,
    })),
  );
}

export async function listStates(countryCode: string): Promise<GeoOption[]> {
  const code = countryCode.trim().toUpperCase();
  if (!code) return [];

  try {
    const remote = await cscFetch<Array<{ name: string; iso2: string }>>(
      `/countries/${encodeURIComponent(code)}/states`,
    );
    if (remote) {
      return sortByName(
        remote.map((state) => ({
          code: state.iso2,
          name: state.name,
        })),
      );
    }
  } catch {
    // Fall through to the local CountryStateCity dataset.
  }

  return sortByName(
    State.getStatesOfCountry(code).map((state) => ({
      code: state.isoCode,
      name: state.name,
    })),
  );
}

function mergeOptions(primary: GeoOption[], extra: GeoOption[]) {
  const seen = new Set(primary.map((item) => item.name.toLowerCase()));
  const merged = [...primary];
  for (const item of extra) {
    if (!seen.has(item.name.toLowerCase())) {
      seen.add(item.name.toLowerCase());
      merged.push(item);
    }
  }
  return sortByName(merged);
}

export async function listCities(
  countryCode: string,
  stateCode?: string,
): Promise<GeoOption[]> {
  const country = countryCode.trim().toUpperCase();
  const state = stateCode?.trim().toUpperCase();
  if (!country) return [];

  try {
    const path = state
      ? `/countries/${encodeURIComponent(country)}/states/${encodeURIComponent(state)}/cities`
      : `/countries/${encodeURIComponent(country)}/cities`;
    const remote = await cscFetch<Array<{ name: string; id?: number }>>(path);
    if (remote) {
      return mergeOptions(
        remote.map((city) => ({
          code: city.name,
          name: city.name,
        })),
        supplementalCities(country, state),
      );
    }
  } catch {
    // Fall through to the local CountryStateCity dataset.
  }

  const cities = state
    ? City.getCitiesOfState(country, state)
    : (City.getCitiesOfCountry(country) ?? []);

  return mergeOptions(
    cities.map((city) => ({
      code: city.name,
      name: city.name,
    })),
    supplementalCities(country, state),
  );
}
