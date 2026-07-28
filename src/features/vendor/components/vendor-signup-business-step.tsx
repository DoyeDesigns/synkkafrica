"use client";

import { CalendarDays, ChevronDown, MapPin } from "lucide-react";

import {
  VENDOR_BUSINESS_TYPES,
  VENDOR_PHONE_COUNTRY_CODES,
  type VendorSignupFormState,
} from "@/features/vendor/data/vendor-signup";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type VendorSignupBusinessStepProps = {
  form: VendorSignupFormState;
  onChange: (patch: Partial<VendorSignupFormState>) => void;
};

export function VendorSignupBusinessStep({ form, onChange }: VendorSignupBusinessStepProps) {
  const t = useTranslation();

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <SectionHeading
          title={t("vendor.signup.sections.businessInfo")}
          hint={t("vendor.signup.sections.businessInfoHint")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("vendor.signup.fields.businessName")} required>
            <input
              type="text"
              value={form.businessName}
              onChange={(event) => onChange({ businessName: event.target.value })}
              placeholder={t("vendor.signup.placeholders.businessName")}
              className={inputClassName}
            />
          </FormField>

          <FormField label={t("vendor.signup.fields.businessType")} required>
            <select
              value={form.businessType}
              onChange={(event) => onChange({ businessType: event.target.value })}
              className={inputClassName}
            >
              <option value="">{t("vendor.signup.placeholders.businessType")}</option>
              {VENDOR_BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label={t("vendor.signup.fields.cacRegistrationNumber")} required>
          <input
            type="text"
            value={form.cacRegistrationNumber}
            onChange={(event) => onChange({ cacRegistrationNumber: event.target.value })}
            placeholder={t("vendor.signup.placeholders.cacRegistrationNumber")}
            className={inputClassName}
          />
        </FormField>

        <FormField label={t("vendor.signup.fields.businessAddress")} required>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            <input
              type="text"
              value={form.businessAddress}
              onChange={(event) => onChange({ businessAddress: event.target.value })}
              placeholder={t("vendor.signup.placeholders.businessAddress")}
              className={`${inputClassName} pl-9`}
            />
          </div>
        </FormField>
      </section>

      <section className="space-y-5 border-t border-[#EEEEEE] pt-6">
        <SectionHeading
          title={t("vendor.signup.sections.ownerInfo")}
          hint={t("vendor.signup.sections.ownerInfoHint")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("vendor.signup.fields.ownerFullName")} required>
            <input
              type="text"
              value={form.ownerFullName}
              onChange={(event) => onChange({ ownerFullName: event.target.value })}
              placeholder={t("vendor.signup.placeholders.ownerFullName")}
              className={inputClassName}
            />
          </FormField>

          <FormField label={t("vendor.signup.fields.ownerEmail")} required>
            <input
              type="email"
              value={form.ownerEmail}
              onChange={(event) => onChange({ ownerEmail: event.target.value })}
              placeholder={t("vendor.signup.placeholders.ownerEmail")}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("vendor.signup.fields.phoneNumber")} required>
            <div className="flex overflow-hidden rounded-lg border border-[#E5E5E5] bg-white focus-within:border-[#135391]">
              <div className="relative border-r border-[#E5E5E5]">
                <select
                  value={form.phoneCountryCode}
                  onChange={(event) => onChange({ phoneCountryCode: event.target.value })}
                  className="h-11 appearance-none bg-[#F8F8F8] pl-3 pr-8 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none"
                >
                  {VENDOR_PHONE_COUNTRY_CODES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#676565]" />
              </div>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(event) => onChange({ phoneNumber: event.target.value })}
                placeholder={t("vendor.signup.placeholders.phoneNumber")}
                className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none"
              />
            </div>
          </FormField>

          <FormField label={t("vendor.signup.fields.dateOfBirth")} required>
            <div className="relative">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => onChange({ dateOfBirth: event.target.value })}
                className={`${inputClassName} pr-10`}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">{title}</h3>
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{hint}</p>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {label}
        {required ? <span className="text-[#C0392B]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
