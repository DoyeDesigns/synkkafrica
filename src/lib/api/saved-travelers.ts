import { apiFetch } from "@/lib/api/backend";

export type TravelerTitle = "MR" | "MS" | "MRS" | "MISS" | "DR";
export type TravelerGender = "M" | "F";

export type SavedTraveler = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  title: TravelerTitle;
  gender: TravelerGender;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssuingCountry: string;
  frequentFlyerProgram?: string | null;
  frequentFlyerNumber?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SavedTravelerInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  title: TravelerTitle;
  gender: TravelerGender;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssuingCountry: string;
  frequentFlyerProgram?: string;
  frequentFlyerNumber?: string;
  label: string;
};

export type UpdateSavedTravelerInput = Partial<SavedTravelerInput>;

// GET /users/saved-travelers
export async function listSavedTravelers(
  token: string,
  signal?: AbortSignal,
): Promise<SavedTraveler[]> {
  return apiFetch<SavedTraveler[]>("/users/saved-travelers", { token, signal });
}

// GET /users/saved-travelers/:id
export async function getSavedTraveler(
  token: string,
  id: string,
  signal?: AbortSignal,
): Promise<SavedTraveler> {
  return apiFetch<SavedTraveler>(`/users/saved-travelers/${id}`, {
    token,
    signal,
  });
}

// POST /users/saved-travelers
export async function createSavedTraveler(
  token: string,
  input: SavedTravelerInput,
): Promise<SavedTraveler> {
  return apiFetch<SavedTraveler>("/users/saved-travelers", {
    method: "POST",
    token,
    body: input,
  });
}

// PATCH /users/saved-travelers/:id
export async function updateSavedTraveler(
  token: string,
  id: string,
  input: UpdateSavedTravelerInput,
): Promise<SavedTraveler> {
  return apiFetch<SavedTraveler>(`/users/saved-travelers/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

// DELETE /users/saved-travelers/:id
export async function deleteSavedTraveler(
  token: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/users/saved-travelers/${id}`, {
    method: "DELETE",
    token,
  });
}
