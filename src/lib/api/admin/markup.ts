import { apiFetch } from "@/lib/api/backend";

export type MarkupScope = "ROUTE" | "CARRIER_REGION" | "CARRIER" | "REGION_PAIR";

export type MarkupRegion =
  | "WEST_AFRICA"
  | "EAST_AFRICA"
  | "NORTH_AFRICA"
  | "SOUTHERN_AFRICA"
  | "EUROPE"
  | "MIDDLE_EAST"
  | "NORTH_AMERICA"
  | "OTHER";

export type MarkupConfig = {
  defaultPercent: number;
  absoluteFloorMinorUnits: number;
  floorCurrency: string;
};

export type UpdateMarkupConfigInput = {
  defaultPercent?: number;
  absoluteFloorMinorUnits?: number;
  floorCurrency?: string;
};

export type MarkupOverrideListQuery = {
  scope?: MarkupScope;
  airlineCode?: string;
  enabled?: boolean;
};

export type CreateMarkupOverrideInput = {
  scope: MarkupScope;
  airlineCode?: string;
  originRegion?: MarkupRegion;
  destinationRegion?: MarkupRegion;
  originAirport?: string;
  destinationAirport?: string;
  markupPercent: number;
  absoluteFloorMinorUnits?: number;
  priority?: number;
  enabled?: boolean;
  notes?: string;
};

export type UpdateMarkupOverrideInput = {
  markupPercent?: number;
  absoluteFloorMinorUnits?: number;
  priority?: number;
  enabled?: boolean;
  notes?: string;
};

export type MarkupPreviewInput = {
  airlineCode: string;
  originAirport: string;
  destinationAirport: string;
  baseFareMinorUnits: number;
  currency: string;
  passengerCount: number;
};

// GET /admin/markup/config
export async function getMarkupConfig(token: string): Promise<MarkupConfig> {
  return apiFetch<MarkupConfig>("/admin/markup/config", { token });
}

// PATCH /admin/markup/config
export async function updateMarkupConfig(
  token: string,
  input: UpdateMarkupConfigInput,
): Promise<MarkupConfig> {
  return apiFetch<MarkupConfig>("/admin/markup/config", {
    method: "PATCH",
    token,
    body: input,
  });
}

// GET /admin/markup/overrides
export async function listMarkupOverrides(
  token: string,
  query: MarkupOverrideListQuery = {},
): Promise<unknown> {
  return apiFetch<unknown>("/admin/markup/overrides", { token, query });
}

// POST /admin/markup/overrides
export async function createMarkupOverride(
  token: string,
  input: CreateMarkupOverrideInput,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/markup/overrides", {
    method: "POST",
    token,
    body: input,
  });
}

// PATCH /admin/markup/overrides/:id
export async function updateMarkupOverride(
  token: string,
  id: string,
  input: UpdateMarkupOverrideInput,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/markup/overrides/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

// DELETE /admin/markup/overrides/:id
export async function deleteMarkupOverride(
  token: string,
  id: string,
): Promise<unknown> {
  return apiFetch<unknown>(`/admin/markup/overrides/${id}`, {
    method: "DELETE",
    token,
  });
}

// POST /admin/markup/preview
export async function previewMarkup(
  token: string,
  input: MarkupPreviewInput,
): Promise<unknown> {
  return apiFetch<unknown>("/admin/markup/preview", {
    method: "POST",
    token,
    body: input,
  });
}
