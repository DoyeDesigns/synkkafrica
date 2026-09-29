"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import { FormDate, FormSelect } from "./form-controls";
import type { TravelerInput } from "@/lib/api/bookings";
import { listCountries } from "@/lib/api/locations";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const input =
  "w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40 focus:border-[#004785]";
const inputInvalid = "border-[#D85A30]";

export type TravelerValue = Partial<TravelerInput>;

type TravelerField =
  | "firstName"
  | "lastName"
  | "dateOfBirth"
  | "nationality"
  | "passportNumber"
  | "passportExpiry"
  | "passportIssuingCountry";

export type TravelerErrors = Partial<Record<TravelerField, TranslationKey>>;

// Duffel books every search passenger as type "adult", which airlines only
// accept for travellers aged 18+.
const ADULT_MIN_AGE = 18;
// Latin letters (incl. accents), spaces, hyphens, apostrophes and dots — the
// characters airline reservation systems accept in passenger names.
const NAME_RE = /^[\p{Script=Latin}][\p{Script=Latin} .'-]*$/u;
const PASSPORT_RE = /^[A-Z0-9]{5,20}$/;
const ISO2_RE = /^[A-Z]{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function yearsAgo(years: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return localDateKey(d);
}

/** Uppercase letters/digits only — what the backend and Duffel accept. */
export function sanitizePassportNumber(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 20);
}

function genderFromTitle(title: TravelerInput["title"] | undefined): "M" | "F" {
  if (title === "MS" || title === "MRS" || title === "MISS") return "F";
  return "M";
}

function validateName(value: string | undefined): TranslationKey | undefined {
  const v = (value ?? "").trim();
  if (!v) return "booking.flight.errors.required";
  if (v.length > 100 || !NAME_RE.test(v)) return "booking.flight.errors.nameInvalid";
  return undefined;
}

function validateCountry(value: string | undefined): TranslationKey | undefined {
  return ISO2_RE.test(value ?? "") ? undefined : "booking.flight.errors.countryRequired";
}

type IdentityOptions = {
  /**
   * The offer's `identityDocumentsRequired`. Passport number, expiry and
   * issuing country are validated (and sent) only when true. Callers that
   * don't know the flag should pass true — the backend 400s a booking whose
   * offer needs passports and doesn't get them.
   */
  requireIdentityDocuments?: boolean;
};

/** Per-traveller validation mirroring the backend TravelerPiiDto + Duffel rules. */
export function validateTraveler(
  value: TravelerValue,
  { requireIdentityDocuments = true }: IdentityOptions = {},
): TravelerErrors {
  const errors: TravelerErrors = {};
  const today = localDateKey(new Date());

  const first = validateName(value.firstName);
  if (first) errors.firstName = first;
  const last = validateName(value.lastName);
  if (last) errors.lastName = last;

  const dob = value.dateOfBirth ?? "";
  if (!dob) errors.dateOfBirth = "booking.flight.errors.required";
  else if (!DATE_RE.test(dob) || dob > today || dob < "1900-01-01")
    errors.dateOfBirth = "booking.flight.errors.dobInvalid";
  else if (dob > yearsAgo(ADULT_MIN_AGE))
    errors.dateOfBirth = "booking.flight.errors.adultAge";

  const nationality = validateCountry(value.nationality);
  if (nationality) errors.nationality = nationality;

  if (!requireIdentityDocuments) return errors;

  const passport = value.passportNumber ?? "";
  if (!passport) errors.passportNumber = "booking.flight.errors.required";
  else if (!PASSPORT_RE.test(passport))
    errors.passportNumber = "booking.flight.errors.passportNumberInvalid";

  const expiry = value.passportExpiry ?? "";
  if (!expiry) errors.passportExpiry = "booking.flight.errors.required";
  else if (!DATE_RE.test(expiry) || expiry <= today)
    errors.passportExpiry = "booking.flight.errors.passportExpired";

  const issuing = validateCountry(value.passportIssuingCountry);
  if (issuing) errors.passportIssuingCountry = issuing;

  return errors;
}

export function isTravelerValid(
  value: TravelerValue,
  options: IdentityOptions = {},
): boolean {
  return Object.keys(validateTraveler(value, options)).length === 0;
}

/** Narrow form state to the full traveler payload expected by createBooking. */
export function toTravelerInput(
  value: TravelerValue,
  { requireIdentityDocuments = true }: IdentityOptions = {},
): TravelerInput {
  const title = value.title ?? "MR";
  const passportNumber = sanitizePassportNumber(value.passportNumber ?? "");
  const passportExpiry = value.passportExpiry ?? "";
  const passportIssuingCountry = (value.passportIssuingCountry ?? "").toUpperCase();
  // Passport data is sent only when the offer needs it. Empty strings are
  // never sent: the backend DTO rejects "" (length / ISO checks) even though
  // the fields are optional.
  const passport = requireIdentityDocuments
    ? {
        passportNumber: passportNumber || undefined,
        passportExpiry: passportExpiry || undefined,
        passportIssuingCountry: passportIssuingCountry || undefined,
      }
    : {};
  return {
    title,
    firstName: (value.firstName ?? "").trim(),
    lastName: (value.lastName ?? "").trim(),
    dateOfBirth: value.dateOfBirth ?? "",
    // Required by the flights API — derived from the title unless the
    // traveller picked one explicitly (only offered for gender-neutral "Dr").
    gender: value.gender ?? genderFromTitle(title),
    nationality: (value.nationality ?? "").toUpperCase(),
    ...passport,
    frequentFlyerProgram: value.frequentFlyerProgram || undefined,
    frequentFlyerNumber: value.frequentFlyerNumber || undefined,
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

function CountrySelect({
  value,
  onChange,
  onBlur,
  invalid,
  ariaLabel,
}: {
  value: string;
  onChange: (code: string) => void;
  onBlur: () => void;
  invalid: boolean;
  ariaLabel: string;
}) {
  const t = useTranslation();
  const { data: countries, isError } = useQuery({
    queryKey: ["geo", "countries"],
    queryFn: ({ signal }) => listCountries(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  // Fallback when the country list can't load: accept a raw ISO alpha-2 code.
  if (isError) {
    return (
      <input
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={`${input} uppercase ${invalid ? inputInvalid : ""}`}
        placeholder="NG"
        maxLength={2}
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase())
        }
        onBlur={onBlur}
      />
    );
  }

  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={`${input} h-11 appearance-none pr-9 ${invalid ? inputInvalid : ""} ${
          value ? "" : "text-foreground/40"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      >
        <option value="" disabled>
          {countries ? t("booking.flight.selectCountry") : t("booking.flight.loadingCountries")}
        </option>
        {(countries ?? []).map((c) => (
          <option key={c.code} value={c.code} className="text-foreground">
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
    </div>
  );
}

export function FlightTravelerFields({
  index,
  value,
  onChange,
  showAllErrors = false,
  requireIdentityDocuments = true,
}: {
  index: number;
  value: TravelerValue;
  onChange: (next: TravelerValue) => void;
  /** Offer's `identityDocumentsRequired` — hides the passport block when false. */
  requireIdentityDocuments?: boolean;
  /** Reveal every error (e.g. after a submit attempt), not just touched ones. */
  showAllErrors?: boolean;
}) {
  const t = useTranslation();
  const [touched, setTouched] = useState<Partial<Record<TravelerField, boolean>>>({});
  const set = (patch: Partial<TravelerValue>) => onChange({ ...value, ...patch });
  const touch = (field: TravelerField) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  const today = localDateKey(new Date());
  // Open the DOB calendar around a typical adult age instead of this month.
  const dobDefaultMonth = yearsAgo(30);

  // Passport expiry must be strictly in the future.
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return localDateKey(d);
  })();

  const errors = validateTraveler(value, { requireIdentityDocuments });
  const errorFor = (field: TravelerField) =>
    (showAllErrors || touched[field]) && errors[field] ? t(errors[field]) : undefined;

  const title = value.title ?? "MR";

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
          {t("booking.flight.travellerN", { n: index + 1 })}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <p className="text-xs font-normal font-inter text-foreground/70">
          {t("booking.guest.passportHint")}
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label={t("booking.guest.titleField")} required>
            <FormSelect
              aria-label={t("booking.guest.titleField")}
              value={title}
              onChange={(v) => {
                const nextTitle = v as TravelerInput["title"];
                // Gender follows the title except for "Dr", where it's asked.
                set({
                  title: nextTitle,
                  gender: nextTitle === "DR" ? value.gender : undefined,
                });
              }}
              options={TITLES}
            />
          </Field>
          {title === "DR" ? (
            <Field label={t("booking.guest.gender")} required>
              <FormSelect
                aria-label={t("booking.guest.gender")}
                value={value.gender ?? "M"}
                onChange={(v) => set({ gender: v as TravelerInput["gender"] })}
                options={[
                  { value: "M", label: t("booking.guest.male") },
                  { value: "F", label: t("booking.guest.female") },
                ]}
              />
            </Field>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label={t("booking.guest.lastName")} required error={errorFor("lastName")}>
            <input
              className={`${input} ${errorFor("lastName") ? inputInvalid : ""}`}
              placeholder={t("booking.guest.lastName")}
              autoComplete="family-name"
              value={value.lastName ?? ""}
              onChange={(e) => set({ lastName: e.target.value })}
              onBlur={() => touch("lastName")}
              aria-invalid={Boolean(errorFor("lastName")) || undefined}
              required
            />
          </Field>
          <Field label={t("booking.guest.firstName")} required error={errorFor("firstName")}>
            <input
              className={`${input} ${errorFor("firstName") ? inputInvalid : ""}`}
              placeholder={t("booking.guest.firstName")}
              autoComplete="given-name"
              value={value.firstName ?? ""}
              onChange={(e) => set({ firstName: e.target.value })}
              onBlur={() => touch("firstName")}
              aria-invalid={Boolean(errorFor("firstName")) || undefined}
              required
            />
          </Field>
          <Field
            label={t("booking.guest.dateOfBirth")}
            required
            error={errorFor("dateOfBirth")}
          >
            <FormDate
              placeholder={t("booking.flight.selectDate")}
              value={value.dateOfBirth ?? ""}
              max={today}
              defaultMonth={dobDefaultMonth}
              invalid={Boolean(errorFor("dateOfBirth"))}
              onChange={(v) => {
                touch("dateOfBirth");
                set({ dateOfBirth: v });
              }}
            />
          </Field>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field
            label={t("booking.guest.nationality")}
            required
            error={errorFor("nationality")}
          >
            <CountrySelect
              ariaLabel={t("booking.guest.nationality")}
              value={value.nationality ?? ""}
              invalid={Boolean(errorFor("nationality"))}
              onBlur={() => touch("nationality")}
              onChange={(code) => {
                touch("nationality");
                // Most travellers hold a passport from their nationality —
                // keep the issuing country in step until they pick a
                // different one themselves.
                const issuing = value.passportIssuingCountry;
                set({
                  nationality: code,
                  passportIssuingCountry:
                    issuing && issuing !== value.nationality ? issuing : code,
                });
              }}
            />
          </Field>
        </div>

        {requireIdentityDocuments ? (
        <div className="rounded-md border border-[#E5E5E5] bg-[#F8F8F8] p-4">
          <h3 className="text-sm font-semibold font-inter text-foreground">
            {t("booking.flight.passportTitle")}
          </h3>
          <p className="mt-1 text-xs font-normal font-inter text-foreground/70">
            {t("booking.flight.passportSubtitle")}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Field
              label={t("booking.flight.passportNumber")}
              required
              error={errorFor("passportNumber")}
            >
              <input
                className={`${input} uppercase ${
                  errorFor("passportNumber") ? inputInvalid : ""
                }`}
                placeholder="A12345678"
                autoComplete="off"
                spellCheck={false}
                maxLength={20}
                value={value.passportNumber ?? ""}
                onChange={(e) =>
                  set({ passportNumber: sanitizePassportNumber(e.target.value) })
                }
                onBlur={() => touch("passportNumber")}
                aria-invalid={Boolean(errorFor("passportNumber")) || undefined}
                required
              />
            </Field>
            <Field
              label={t("booking.flight.passportExpiry")}
              required
              error={errorFor("passportExpiry")}
            >
              <FormDate
                placeholder={t("booking.flight.selectDate")}
                value={value.passportExpiry ?? ""}
                min={tomorrow}
                invalid={Boolean(errorFor("passportExpiry"))}
                onChange={(v) => {
                  touch("passportExpiry");
                  set({ passportExpiry: v });
                }}
              />
            </Field>
            <Field
              label={t("booking.flight.passportIssuingCountry")}
              required
              error={errorFor("passportIssuingCountry")}
            >
              <CountrySelect
                ariaLabel={t("booking.flight.passportIssuingCountry")}
                value={value.passportIssuingCountry ?? ""}
                invalid={Boolean(errorFor("passportIssuingCountry"))}
                onBlur={() => touch("passportIssuingCountry")}
                onChange={(code) => {
                  touch("passportIssuingCountry");
                  set({ passportIssuingCountry: code });
                }}
              />
            </Field>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
