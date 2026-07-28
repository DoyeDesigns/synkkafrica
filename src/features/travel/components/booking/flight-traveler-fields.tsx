"use client";

import { FormDate, FormSelect } from "./form-controls";
import type { TravelerInput } from "@/lib/api/bookings";

const input =
  "w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40 focus:border-[#004785]";

export type TravelerValue = Partial<TravelerInput>;

const TITLES = ["MR", "MS", "MRS", "MISS", "DR"].map((t) => ({
  value: t,
  label: t.charAt(0) + t.slice(1).toLowerCase(),
}));

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-bold font-satoshi text-foreground">
        {label}
        {required ? <span className="text-[#004785]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

export function FlightTravelerFields({
  index,
  value,
  onChange,
}: {
  index: number;
  value: TravelerValue;
  onChange: (next: TravelerValue) => void;
}) {
  const set = (patch: Partial<TravelerValue>) => onChange({ ...value, ...patch });
  const iso2 = (v: string) =>
    v.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
  const today = new Date().toISOString().slice(0, 10);

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

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Nationality" required>
            <input
              className={`${input} uppercase`}
              placeholder="NG"
              value={value.nationality ?? ""}
              onChange={(e) => set({ nationality: iso2(e.target.value) })}
              required
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold font-satoshi text-foreground">
              Gender<span className="text-[#004785]"> *</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              {(["M", "F"] as const).map((g) => (
                <label
                  key={g}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 ${
                    (value.gender ?? "M") === g
                      ? "border-[#004785]"
                      : "border-[#E5E5E5]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`gender-${index}`}
                    checked={(value.gender ?? "M") === g}
                    onChange={() => set({ gender: g })}
                    className="h-4 w-4 accent-[#004785]"
                  />
                  <span className="text-sm font-medium font-satoshi text-foreground">
                    {g === "M" ? "Male" : "Female"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Field label="Passport No" required>
            <input
              className={`${input} uppercase`}
              placeholder="A1234567"
              value={value.passportNumber ?? ""}
              onChange={(e) =>
                set({
                  passportNumber: e.target.value
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .toUpperCase(),
                })
              }
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Passport expiry" required>
            <FormDate
              placeholder="Select date"
              value={value.passportExpiry ?? ""}
              min={today}
              onChange={(v) => set({ passportExpiry: v })}
            />
          </Field>
          <Field label="Passport issuing country" required>
            <input
              className={`${input} uppercase`}
              placeholder="NG"
              value={value.passportIssuingCountry ?? ""}
              onChange={(e) =>
                set({ passportIssuingCountry: iso2(e.target.value) })
              }
              required
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
