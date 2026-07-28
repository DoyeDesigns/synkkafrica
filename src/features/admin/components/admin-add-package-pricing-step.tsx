"use client";

import { CalendarDays } from "lucide-react";

import {
  calculatePackageSavings,
  getPackageDisplaySavingsPercent,
  PACKAGE_BOOKING_NOTICE_OPTIONS,
  PACKAGE_CURRENCIES,
  type AddPackageFormState,
} from "@/features/admin/data/admin-add-package";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type PackagePricingStepProps = {
  form: AddPackageFormState;
  onChange: (patch: Partial<AddPackageFormState>) => void;
};

export function PackagePricingStep({ form, onChange }: PackagePricingStepProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const savings = calculatePackageSavings(form.normalPrice, form.salesPrice);
  const displayPercent = getPackageDisplaySavingsPercent(form);

  const updatePrices = (patch: Pick<AddPackageFormState, "normalPrice" | "salesPrice">) => {
    const normalPrice = patch.normalPrice ?? form.normalPrice;
    const salesPrice = patch.salesPrice ?? form.salesPrice;
    const nextSavings = calculatePackageSavings(normalPrice, salesPrice);
    const nextPatch: Partial<AddPackageFormState> = { ...patch };

    if (form.showSavingsBadge && nextSavings && !form.savingsBadgePercent.trim()) {
      nextPatch.savingsBadgePercent = String(nextSavings.percent);
    }

    onChange(nextPatch);
  };

  const handleSavingsBadgeToggle = (checked: boolean) => {
    const nextPatch: Partial<AddPackageFormState> = { showSavingsBadge: checked };

    if (checked && savings && !form.savingsBadgePercent.trim()) {
      nextPatch.savingsBadgePercent = String(savings.percent);
    }

    onChange(nextPatch);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-5">
        <SectionHeading
          title={t("admin.packages.pricing.heading")}
          hint={t("admin.packages.pricing.hint")}
        />

        <FormField label={t("admin.packages.fields.currency")} required>
          <select
            value={form.currency}
            onChange={(event) => onChange({ currency: event.target.value })}
            className={inputClassName}
          >
            {PACKAGE_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </FormField>

        <CurrencyField
          label={t("admin.packages.fields.normalPrice")}
          currency={form.currency}
          value={form.normalPrice}
          onChange={(value) => updatePrices({ normalPrice: value, salesPrice: form.salesPrice })}
          required
        />

        <CurrencyField
          label={t("admin.packages.fields.salesPrice")}
          currency={form.currency}
          value={form.salesPrice}
          onChange={(value) => updatePrices({ normalPrice: form.normalPrice, salesPrice: value })}
          required
        />

        {savings && displayPercent !== null ? (
          <div className="rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] px-4 py-3 text-sm font-semibold font-satoshi text-[#2E7D32]">
            {t("admin.packages.pricing.savingsDisplay", {
              amount: formatPrice(form.currency, savings.amount),
              percent: displayPercent,
            })}
          </div>
        ) : null}

        <label className="flex items-center justify-between rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
          <span>
            <span className="block text-sm font-semibold font-satoshi text-[#2F2F2F]">
              {t("admin.packages.fields.showSavingsBadge")}
            </span>
            <span className="mt-0.5 block text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.packages.hints.showSavingsBadge")}
            </span>
          </span>
          <input
            type="checkbox"
            checked={form.showSavingsBadge}
            onChange={(event) => handleSavingsBadgeToggle(event.target.checked)}
            className="h-5 w-5 rounded border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
          />
        </label>

        {form.showSavingsBadge ? (
          <FormField label={t("admin.packages.fields.savingsBadgePercent")} required>
            <div className="flex overflow-hidden rounded-lg border border-[#E5E5E5] bg-white focus-within:border-[#135391]">
              <input
                type="number"
                min={1}
                max={100}
                value={form.savingsBadgePercent}
                onChange={(event) => onChange({ savingsBadgePercent: event.target.value })}
                placeholder={savings ? String(savings.percent) : "0"}
                className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none"
              />
              <span className="flex h-11 shrink-0 items-center border-l border-[#E5E5E5] bg-[#F5F5F5] px-3 text-sm font-semibold font-satoshi text-[#676565]">
                %
              </span>
            </div>
            <p className="text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.packages.hints.savingsBadgePercent")}
            </p>
          </FormField>
        ) : null}
      </section>

      <section className="space-y-5">
        <SectionHeading
          title={t("admin.packages.availability.heading")}
          hint={t("admin.packages.availability.hint")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("admin.packages.fields.validFrom")} required>
            <div className="relative">
              <input
                type="date"
                value={form.validFrom}
                max={form.validUntil || undefined}
                onChange={(event) => onChange({ validFrom: event.target.value })}
                className={`${inputClassName} pr-10`}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          <FormField label={t("admin.packages.fields.validUntil")} required>
            <div className="relative">
              <input
                type="date"
                value={form.validUntil}
                min={form.validFrom || undefined}
                onChange={(event) => onChange({ validUntil: event.target.value })}
                className={`${inputClassName} pr-10`}
              />
              <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>
        </div>

        <FormField label={t("admin.packages.fields.minimumBookingNotice")}>
          <select
            value={form.minimumBookingNotice}
            onChange={(event) => onChange({ minimumBookingNotice: event.target.value })}
            className={inputClassName}
          >
            {PACKAGE_BOOKING_NOTICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </FormField>

        <label className="flex items-center justify-between rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
          <span>
            <span className="block text-sm font-semibold font-satoshi text-[#2F2F2F]">
              {t("admin.packages.fields.packageActive")}
            </span>
            <span className="mt-0.5 block text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.packages.hints.packageActive")}
            </span>
          </span>
          <input
            type="checkbox"
            checked={form.packageActive}
            onChange={(event) => onChange({ packageActive: event.target.checked })}
            className="h-5 w-5 rounded border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
          />
        </label>
      </section>
    </div>
  );
}

function CurrencyField({
  label,
  currency,
  value,
  onChange,
  required,
}: {
  label: string;
  currency: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <FormField label={label} required={required}>
      <div className="flex overflow-hidden rounded-lg border border-[#E5E5E5] bg-white focus-within:border-[#135391]">
        <span className="flex h-11 shrink-0 items-center border-r border-[#E5E5E5] bg-[#F5F5F5] px-3 text-sm font-semibold font-satoshi text-[#676565]">
          {currency}
        </span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0"
          className="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none"
        />
      </div>
    </FormField>
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
