import { apiFetch } from "@/lib/api/backend";

// GET /health/live
export async function getHealthLive(signal?: AbortSignal): Promise<unknown> {
  return apiFetch<unknown>("/health/live", { signal });
}

// GET /health/ready
export async function getHealthReady(signal?: AbortSignal): Promise<unknown> {
  return apiFetch<unknown>("/health/ready", { signal });
}

// GET /health — full subsystem tree (200 or 503 from backend).
export async function getHealth(signal?: AbortSignal): Promise<unknown> {
  return apiFetch<unknown>("/health", { signal });
}
