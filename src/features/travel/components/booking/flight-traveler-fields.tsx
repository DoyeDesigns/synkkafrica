"use client";

import { ChevronDown } from "lucide-react";

import { FormDate, FormSelect } from "./form-controls";
import {
  createEmptyGuestIdentity,
  type GuestIdentity,
  type GuestIdentityErrors,
  type GuestIdentityField,
} from "@/features/travel/booking/guest-identity";
import type { TravelerInput } from "@/lib/api/bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const input =
  "w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40 focus:border-[#004785]";

const selectClassName = `${input} appearance-none`;

export type TravelerValue = Partial<TravelerInput> & {
  identity?: GuestIdentity;
};

const ID_TYPE_KEYS: { value: GuestIdentity["idType"]; key: TranslationKey }[] = [
  { value: "passport", key: "booking.guest.idType.passport" },
  { value: "national-id", key: "booking.guest.idType.nationalId" },
  { value: "drivers-license", key: "booking.guest.idType.driversLicense" },
];

function genderFromTitle(title: TravelerInput["title"] | undefined): "M" | "F" {
  if (title === "MS" || title === "MRS" || title === "MISS") return "F";
  return "M";
}

/** Narrow form state to the full traveler payload expected by createBooking. */
export function toTravelerInput(value: TravelerValue): TravelerInput {
  const title = value.title ?? "MR";
  const identity = value.identity ?? createEmptyGuestIdentity();
  const nationality = (value.nationality ?? "").toUpperCase();

  return {
    title,
    firstName: value.firstName ?? "",
    lastName: value.lastName ?? "",
    dateOfBirth: value.dateOfBirth ?? "",
    // Still required by the flights API — derived from title, not collected in UI.
    gender: value.gender ?? genderFromTitle(title),
    nationality,
    passportNumber: identity.idNumber.trim().toUpperCase(),
    passportExpiry: identity.expiryDate,
    passportIssuingCountry: nationality,
    frequentFlyerProgram: value.frequentFlyerProgram,
    frequentFlyerNumber: value.frequentFlyerNumber,
  };
}

const TITLES = ["MR", "MS", "MRS", "MISS", "DR"].map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase(),
}));

function Field({
  label,
  required = false,
  className = "",
  error,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold font-satoshi text-foreground">
        {label}
        {required ? <span className="text-[#004785]"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="text-xs font-medium font-inter text-[#D85A30]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FlightTravelerFields({
  index,
  value,
  onChange,
  identityErrors = {},
}: {
  index: number;
  value: TravelerValue;
  onChange: (next: TravelerValue) => void;
  identityErrors?: GuestIdentityErrors;
}) {
  const t = useTranslation();
  const identity = value.identity ?? createEmptyGuestIdentity();
  const set = (patch: Partial<TravelerValue>) => onChange({ ...value, ...patch });
  const updateIdentity = (patch: Partial<GuestIdentity>) =>
    set({ identity: { ...identity, ...patch } });
  const iso2 = (v: string) =>
    v.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
  const today = new Date().toISOString().slice(0, 10);

  const fieldError = (field: GuestIdentityField) =>
    identityErrors[field]
      ? t(identityErrors[field] as TranslationKey)
      : undefined;

  return (
    <div className="rounded-md border border-[#E5E5E5]">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] px-4 py-3">
        <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#004785] text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-sm font-semibold font-inter text-foreground">
          Traveller {index + 1}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <Field label="Title" required className="max-w-xs">
          <FormSelect
            aria-label="Title"
            value={value.title ?? "MR"}
            onChange={(v) => set({ title: v as TravelerInput["title"] })}
            options={TITLES}
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Last Name" required>
            <input
              className={input}
              placeholder="Last Name"
              value={value.lastName ?? ""}
              onChange={(e) => set({ lastName: e.target.value })}
              required
            />
          </Field>
          <Field label="First Name" required>
            <input
              className={input}
              placeholder="First Name"
              value={value.firstName ?? ""}
              onChange={(e) => set({ firstName: e.target.value })}
              required
            />
          </Field>
          <Field label="Date of birth" required>
            <FormDate
              placeholder="Select date"
              value={value.dateOfBirth ?? ""}
              max={today}
              onChange={(v) => set({ dateOfBirth: v })}
            />
          </Field>
        </div>

        <Field label="Nationality" required className="max-w-xs">
          <input
            className={`${input} uppercase`}
            placeholder="NG"
            value={value.nationality ?? ""}
            onChange={(e) => set({ nationality: iso2(e.target.value) })}
            required
          />
        </Field>

        <div className="rounded-md border border-[#E5E5E5] bg-[#F8F8F8] p-4">
          <h3 className="text-sm font-semibold font-inter text-foreground">
            {t("booking.guest.idVerificationTitle")}
          </h3>
          <p className="mt-1 text-xs font-normal font-inter text-foreground/70">
            {t("booking.guest.idVerificationSubtitle")}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Field
              label={t("booking.guest.idType")}
              required
              error={fieldError("idType")}
            >
              <div className="relative">
                <select
                  className={selectClassName}
                  value={identity.idType}
                  onChange={(event) =>
                    updateIdentity({
                      idType: event.target.value as GuestIdentity["idType"],
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    {t("common.select")}
                  </option>
                  {ID_TYPE_KEYS.map((idType) => (
                    <option key={idType.value} value={idType.value}>
                      {t(idType.key)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
              </div>
            </Field>

            <Field
              label={t("booking.guest.idNumber")}
              required
              error={fieldError("idNumber")}
            >
              <input
                type="text"
                className={input}
                value={identity.idNumber}
                onChange={(event) =>
                  updateIdentity({ idNumber: event.target.value })
                }
                placeholder={t("booking.guest.idNumberPlaceholder")}
                required
              />
            </Field>

            <Field
              label={t("booking.guest.idExpiry")}
              required
              error={fieldError("expiryDate")}
            >
              <input
                type="date"
                className={input}
                value={identity.expiryDate}
                min={today}
                onChange={(event) =>
                  updateIdentity({ expiryDate: event.target.value })
                }
                required
              />
            </Field>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-3">
            <input
              type="checkbox"
              checked={identity.confirmed}
              onChange={(event) =>
                updateIdentity({ confirmed: event.target.checked })
              }
              className="mt-0.5 h-4 w-4 accent-[#004785]"
            />
            <span className="text-sm font-medium font-inter text-foreground">
              {t("booking.guest.confirmId")}
            </span>
          </label>
          {identityErrors.confirmed ? (
            <p className="mt-2 text-xs font-medium font-inter text-[#D85A30]">
              {t(identityErrors.confirmed as TranslationKey)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
