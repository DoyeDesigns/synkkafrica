"use client";

import { CalendarDays, ChevronDown, User } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const TITLE_KEYS: { value: string; key: TranslationKey }[] = [
  { value: "Mr", key: "booking.guest.title.mr" },
  { value: "Mrs", key: "booking.guest.title.mrs" },
  { value: "Ms", key: "booking.guest.title.ms" },
  { value: "Miss", key: "booking.guest.title.miss" },
  { value: "Dr", key: "booking.guest.title.dr" },
];

const NATIONALITIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Morocco"];

function FormField({
  label,
  children,
  className = "",
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
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

const inputClassName =
  "w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40 focus:border-[#004785]";

const selectClassName = `${inputClassName} appearance-none`;

export function GuestDetailsForm() {
  const t = useTranslation();
  const [adultEnabled, setAdultEnabled] = useState(true);

  return (
    <section className="rounded-[10px] bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold font-inter text-foreground">
        {t("booking.guest.title")}
      </h2>

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004785] text-white">
            <User className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <p className="text-sm font-semibold font-inter text-foreground">
            {t("booking.guest.adultLabel")}
          </p>
        </div>
        <span className="text-sm font-medium font-satoshi text-foreground/70">
          {t("booking.guest.addedCount", { added: 0, total: 1 })}
        </span>
      </div>

      <div className="mt-4 rounded-md bg-[#FFF1EA] px-4 py-3 text-sm font-normal font-inter text-foreground">
        {t("booking.guest.passportHint")}
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-[#E5E5E5]">
        <label className="flex cursor-pointer items-center gap-2 border-b border-[#E5E5E5] px-4 py-3">
          <input
            type="checkbox"
            checked={adultEnabled}
            onChange={(event) => setAdultEnabled(event.target.checked)}
            className="h-4 w-4 accent-[#004785]"
          />
          <span className="text-sm font-semibold font-inter text-foreground">
            {t("booking.guest.adultCheckbox", { count: 1 })}
          </span>
        </label>

        {adultEnabled ? (
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
                  <input
                    type="text"
                    placeholder={t("booking.guest.datePlaceholder")}
                    className={`${inputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    aria-label={t("booking.guest.openCalendar")}
                    className="absolute right-0 top-0 flex h-full items-center border-l border-[#E5E5E5] px-3 text-[#676565]"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </button>
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
                      name="gender"
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
                      name="gender"
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
