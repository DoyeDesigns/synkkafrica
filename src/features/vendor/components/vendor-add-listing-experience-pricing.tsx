"use client";

import { CircleHelp, Users } from "lucide-react";

import type { AddListingFormState } from "@/features/vendor/data/vendor-add-listing";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type ExperiencePricingStepProps = {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
};

export function ExperiencePricingStep({ form, onChange }: ExperiencePricingStepProps) {
  const t = useTranslation();

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.addListing.experiencePricingHeading")}
        </h3>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.addListing.experiencePricingHint")}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PricingField
          label={t("vendor.addListing.singleTicketPrice")}
          hint={t("vendor.addListing.singleTicketPriceHint")}
          required
          value={form.pricePerPerson}
          onChange={(value) => onChange({ pricePerPerson: value })}
        />

        <PricingField
          label={t("vendor.addListing.groupTicketPrice")}
          hint={t("vendor.addListing.groupTicketPriceHint")}
          showInfo
          value={form.groupTicketPrice}
          onChange={(value) => onChange({ groupTicketPrice: value })}
        />

        <GroupSizeField
          label={t("vendor.addListing.minGroupSizeOptional")}
          placeholder={t("vendor.addListing.minGroupSizePlaceholder")}
          value={form.minGroupSize}
          onChange={(value) => onChange({ minGroupSize: value })}
        />

        <GroupSizeField
          label={t("vendor.addListing.maxGroupSizeOptional")}
          placeholder={t("vendor.addListing.maxGroupSizePlaceholder")}
          value={form.maxGroupSize}
          onChange={(value) => onChange({ maxGroupSize: value })}
        />
      </div>
    </section>
  );
}

function PricingField({
  label,
  hint,
  required,
  showInfo,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  required?: boolean;
  showInfo?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {label}
        {required ? <span className="text-[#C0392B]"> *</span> : null}
        {showInfo ? (
          <CircleHelp className="h-4 w-4 text-[#676565]" aria-hidden="true" />
        ) : null}
      </span>

      <div className="flex overflow-hidden rounded-lg border border-[#E5E5E5] bg-white focus-within:border-[#135391]">
        <span className="flex h-11 shrink-0 items-center border-r border-[#E5E5E5] bg-[#F5F5F5] px-3 text-sm font-semibold font-satoshi text-[#676565]">
          NGN
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

      <p className="text-xs font-medium font-satoshi text-[#676565]">{hint}</p>
    </label>
  );
}

function GroupSizeField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${inputClassName} pr-10`}
        />
        <Users className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
      </div>
    </label>
  );
}
