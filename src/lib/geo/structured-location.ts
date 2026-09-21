export type StructuredLocationValue = {
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  cityName: string;
  street: string;
};

export const EMPTY_STRUCTURED_LOCATION: StructuredLocationValue = {
  countryCode: "",
  countryName: "",
  stateCode: "",
  stateName: "",
  cityName: "",
  street: "",
};

export function formatStructuredLocation(value: StructuredLocationValue) {
  const parts = [
    value.street,
    value.cityName,
    value.stateName,
    value.countryName,
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  const unique: string[] = [];
  for (const part of parts) {
    if (
      !unique.some((existing) => existing.toLowerCase() === part.toLowerCase())
    ) {
      unique.push(part);
    }
  }

  return unique.join(", ");
}

export function isStructuredLocationComplete(value: StructuredLocationValue) {
  return Boolean(
    value.countryCode &&
      value.countryName &&
      value.cityName &&
      (!value.stateCode || value.stateName),
  );
}

export function toStructuredLocation(input: {
  countryCode?: string;
  countryName?: string;
  stateCode?: string;
  stateName?: string;
  cityName?: string;
  streetLine?: string;
  street?: string;
}): StructuredLocationValue {
  return {
    countryCode: input.countryCode ?? "",
    countryName: input.countryName ?? "",
    stateCode: input.stateCode ?? "",
    stateName: input.stateName ?? "",
    cityName: input.cityName ?? "",
    street: input.street ?? input.streetLine ?? "",
  };
}
