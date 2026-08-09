"use client";

import { CalendarDays, ChevronDown, Minus, Plus, User } from "lucide-react";

import type {
  GuestIdentity,
  GuestIdentityErrors,
  GuestIdentityField,
} from "@/features/travel/booking/guest-identity";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const TITLE_KEYS: { value: string; key: TranslationKey }[] = [
  { value: "Mr", key: "booking.guest.title.mr" },
  { value: "Mrs", key: "booking.guest.title.mrs" },
  { value: "Ms", key: "booking.guest.title.ms" },
  { value: "Miss", key: "booking.guest.title.miss" },
  { value: "Dr", key: "booking.guest.title.dr" },
];

const ID_TYPE_KEYS: { value: GuestIdentity["idType"]; key: TranslationKey }[] = [
  { value: "passport", key: "booking.guest.idType.passport" },
  { value: "national-id", key: "booking.guest.idType.nationalId" },
  { value: "drivers-license", key: "booking.guest.idType.driversLicense" },
];

const NATIONALITIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Morocco"];

const inputClassName =
  "w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40 focus:border-[#004785]";

const selectClassName = `${inputClassName} appearance-none`;

function FormField({
  label,
  children,
  className = "",
  required = false,
  error,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  error?: string;
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

type AdultGuestSectionProps = {
  index: number;
  identity: GuestIdentity;
  identityErrors?: GuestIdentityErrors;
  onIdentityChange: (identity: GuestIdentity) => void;
  title?: string;
};

function AdultGuestSection({
  index,
  identity,
  identityErrors = {},
  onIdentityChange,
  title,
}: AdultGuestSectionProps) {
  const t = useTranslation();

  const updateIdentity = (patch: Partial<GuestIdentity>) => {
    onIdentityChange({ ...identity, ...patch });
  };

  const fieldError = (field: GuestIdentityField) =>
    identityErrors[field]
      ? t(identityErrors[field] as TranslationKey)
      : undefined;

  return (
    <div className="overflow-hidden rounded-md border border-[#E5E5E5]">
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004785] text-white">
          <User className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-semibold font-inter text-foreground">
          {title ?? t("booking.guest.adultCheckbox", { count: index + 1 })}
        </p>
      </div>

      <div className="space-y-4 p-4">
        <FormField label={t("booking.guest.titleField")} required className="max-w-xs">
          <div className="relative">
            <select className={selectClassName} defaultValue="">
              <option value="" disabled>
                {t("common.select")}
              </option>
              {TITLE_KEYS.map((title) => (
                <option key={title.value} value={title.value}>
                  {t(title.key)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
          </div>
        </FormField>

        <div className="grid gap-4 lg:grid-cols-3">
          <FormField label={t("booking.guest.lastName")} required>
            <input type="text" className={inputClassName} />
          </FormField>
          <FormField label={t("booking.guest.firstName")} required>
            <input type="text" className={inputClassName} />
          </FormField>
          <FormField label={t("booking.guest.middleName")}>
            <input type="text" className={inputClassName} />
          </FormField>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <FormField label={t("booking.guest.dateOfBirth")} required>
            <div className="relative">
              <input type="date" className={`${inputClassName} pr-10`} />
              <span className="pointer-events-none absolute right-0 top-0 flex h-full items-center border-l border-[#E5E5E5] px-3 text-[#676565]">
                <CalendarDays className="h-4 w-4" />
              </span>
            </div>
          </FormField>

          <FormField label={t("booking.guest.nationality")} required>
            <div className="relative">
              <select className={selectClassName} defaultValue="Nigeria">
                {NATIONALITIES.map((nationality) => (
                  <option key={nationality} value={nationality}>
                    {nationality}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium font-satoshi text-foreground/70">
              {t("booking.guest.gender")}
              <span className="text-[#004785]"> *</span>
            </span>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[#E5E5E5] px-3 py-2.5">
                <input
                  type="radio"
                  name={`gender-${index}`}
                  value="male"
                  defaultChecked
                  className="h-4 w-4 accent-[#004785]"
                />
                <span className="text-sm font-medium font-satoshi text-foreground">
                  {t("booking.guest.male")}
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-[#E5E5E5] px-3 py-2.5">
                <input
                  type="radio"
                  name={`gender-${index}`}
                  value="female"
                  className="h-4 w-4 accent-[#004785]"
                />
                <span className="text-sm font-medium font-satoshi text-foreground">
                  {t("booking.guest.female")}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[#E5E5E5] bg-[#F8F8F8] p-4">
          <h3 className="text-sm font-semibold font-inter text-foreground">
            {t("booking.guest.idVerificationTitle")}
          </h3>
          <p className="mt-1 text-xs font-normal font-inter text-foreground/70">
            {t("booking.guest.idVerificationSubtitle")}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <FormField
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
            </FormField>

            <FormField
              label={t("booking.guest.idNumber")}
              required
              error={fieldError("idNumber")}
            >
              <input
                type="text"
                className={inputClassName}
                value={identity.idNumber}
                onChange={(event) =>
                  updateIdentity({ idNumber: event.target.value })
                }
                placeholder={t("booking.guest.idNumberPlaceholder")}
              />
            </FormField>

            <FormField
              label={t("booking.guest.idExpiry")}
              required
              error={fieldError("expiryDate")}
            >
              <input
                type="date"
                className={inputClassName}
                value={identity.expiryDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) =>
                  updateIdentity({ expiryDate: event.target.value })
                }
              />
            </FormField>
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

        {index === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField label={t("booking.guest.mobileNo")}>
              <div className="flex overflow-hidden rounded-md border border-[#E5E5E5] bg-white focus-within:border-[#004785]">
                <div className="relative border-r border-[#E5E5E5]">
                  <select
                    className="appearance-none bg-[#F8F8F8] py-2.5 pl-3 pr-8 text-sm font-medium font-satoshi text-foreground outline-none"
                    defaultValue="+234"
                  >
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+254">🇰🇪 +254</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#676565]" />
                </div>
                <input
                  type="tel"
                  placeholder="7812345678"
                  className="w-full bg-transparent px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40"
                />
              </div>
            </FormField>
            <FormField label={t("booking.guest.emailAddress")}>
              <input
                type="email"
                placeholder="user@mail.com"
                className={inputClassName}
              />
            </FormField>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type GuestDetailsFormProps = {
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  specialRequests?: string;
  onSpecialRequestsChange?: (value: string) => void;
  identities: GuestIdentity[];
  onIdentityChange: (index: number, identity: GuestIdentity) => void;
  identityErrors?: GuestIdentityErrors[];
  maxGuests?: number;
  allowGuestCountChange?: boolean;
  hideSpecialRequests?: boolean;
  leadGuestOnly?: boolean;
};

export function GuestDetailsForm({
  guestCount,
  onGuestCountChange,
  specialRequests = "",
  onSpecialRequestsChange,
  identities,
  onIdentityChange,
  identityErrors = [],
  maxGuests = 12,
  allowGuestCountChange = true,
  hideSpecialRequests = false,
  leadGuestOnly = false,
}: GuestDetailsFormProps) {
  const t = useTranslation();

  // When leadGuestOnly is set we only collect a single set of details (the lead
  // guest) even if the booking is for multiple guests.
  const formCount = leadGuestOnly ? 1 : guestCount;

  return (
    <section className="rounded-[10px] bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("booking.guest.title")}
      </h2>

      {allowGuestCountChange ? (
        <div className="mt-5 rounded-md border border-[#E5E5E5] bg-[#F8F8F8] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold font-inter text-foreground">
                {t("booking.guest.countLabel")}
              </p>
              <p className="text-xs font-normal font-inter text-foreground/70">
                {t("booking.guest.countHint")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}
                className="rounded-md border border-[#E5E5E5] bg-white p-1.5 text-[#676565]"
                aria-label={t("booking.guest.decreaseGuests")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-base font-bold font-satoshi text-foreground">
                {guestCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  onGuestCountChange(Math.min(maxGuests, guestCount + 1))
                }
                className="rounded-md border border-[#E5E5E5] bg-white p-1.5 text-[#676565]"
                aria-label={t("booking.guest.increaseGuests")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-[#E5E5E5] bg-[#F8F8F8] px-4 py-3">
          <p className="text-sm font-semibold font-inter text-foreground">
            {t("booking.guest.countLabel")}: {guestCount}
          </p>
          <p className="mt-1 text-xs font-normal font-inter text-foreground/70">
            {t("booking.package.guestCountLocked")}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004785] text-white">
            <User className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-semibold font-inter text-foreground">
            {leadGuestOnly
              ? t("booking.guest.leadGuestLabel")
              : t("booking.guest.adultLabel")}
          </p>
        </div>
        {!leadGuestOnly ? (
          <span className="text-sm font-medium font-satoshi text-foreground/70">
            {t("booking.guest.addedCount", {
              added: guestCount,
              total: guestCount,
            })}
          </span>
        ) : null}
      </div>

      <div className="mt-4 rounded-md bg-[#FFF1EA] px-4 py-3 text-sm font-normal font-inter text-foreground">
        {t("booking.guest.idVerificationHint")}
      </div>

      <div className="mt-5 space-y-4">
        {Array.from({ length: formCount }, (_, index) => (
          <AdultGuestSection
            key={index}
            index={index}
            identity={identities[index] ?? identities[0]}
            identityErrors={identityErrors[index]}
            onIdentityChange={(identity) => onIdentityChange(index, identity)}
            title={leadGuestOnly ? t("booking.guest.leadGuestLabel") : undefined}
          />
        ))}
      </div>

      {!hideSpecialRequests ? (
        <div className="mt-5">
          <FormField label={t("booking.guest.specialRequests")}>
            <textarea
              value={specialRequests}
              onChange={(event) => onSpecialRequestsChange?.(event.target.value)}
              rows={4}
              placeholder={t("booking.guest.specialRequestsPlaceholder")}
              className={`${inputClassName} resize-none`}
            />
          </FormField>
        </div>
      ) : null}
    </section>
  );
}
