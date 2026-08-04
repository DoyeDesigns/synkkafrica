import { apiFetch } from "@/lib/api/backend";

export type CapabilitySource = "ops" | "probed" | "default";

export type ResolvedCapability = {
  supportsPnrHold: boolean;
  supportsManualCapture: boolean;
  source: {
    pnrHold: CapabilitySource;
    manualCapture: CapabilitySource;
  };
};

export type CarrierCapabilityRow = {
  id: string;
  airlineCode: string;
  fareType: string | null;
  defaultSupportsPnrHold: boolean;
  defaultSupportsManualCapture: boolean;
  resolved: ResolvedCapability;
  createdAt: string;
  updatedAt: string;
};

export type CarrierCapabilityListQuery = {
  airlineCode?: string;
  fareType?: string;
  hasOverride?: boolean;
};

export type CreateCarrierCapabilityInput = {
  airlineCode: string;
  fareType?: string | null;
  defaultSupportsPnrHold: boolean;
  defaultSupportsManualCapture: boolean;
  notes?: string;
};

export type SetCarrierCapabilityOverrideInput = {
  supportsPnrHold?: boolean;
  supportsManualCapture?: boolean;
  reason: string;
};

// GET /admin/carrier-capability
export async function listCarrierCapabilities(
  token: string,
  query: CarrierCapabilityListQuery = {},
): Promise<CarrierCapabilityRow[]> {
  return apiFetch<CarrierCapabilityRow[]>("/admin/carrier-capability", {
    token,
    query,
  });
}

// POST /admin/carrier-capability
export async function createCarrierCapability(
  token: string,
  input: CreateCarrierCapabilityInput,
): Promise<CarrierCapabilityRow> {
  return apiFetch<CarrierCapabilityRow>("/admin/carrier-capability", {
    method: "POST",
    token,
    body: input,
  });
}

// GET /admin/carrier-capability/:id
export async function getCarrierCapability(
  token: string,
  id: string,
): Promise<CarrierCapabilityRow> {
  return apiFetch<CarrierCapabilityRow>(`/admin/carrier-capability/${id}`, {
    token,
  });
}

// PATCH /admin/carrier-capability/:id/override
export async function setCarrierCapabilityOverride(
  token: string,
  id: string,
  input: SetCarrierCapabilityOverrideInput,
): Promise<CarrierCapabilityRow> {
  return apiFetch<CarrierCapabilityRow>(
    `/admin/carrier-capability/${id}/override`,
    {
      method: "PATCH",
      token,
      body: input,
    },
  );
}

// DELETE /admin/carrier-capability/:id/override
export async function clearCarrierCapabilityOverride(
  token: string,
  id: string,
): Promise<CarrierCapabilityRow> {
  return apiFetch<CarrierCapabilityRow>(
    `/admin/carrier-capability/${id}/override`,
    {
      method: "DELETE",
      token,
    },
  );
}
