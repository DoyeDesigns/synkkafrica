"use client";

import { CloudUpload, X } from "lucide-react";
import Image from "next/image";
import { useState, type KeyboardEvent } from "react";

import {
  DETAILED_DESCRIPTION_MAX,
  PACKAGE_BANNER_ACCEPT,
  PACKAGE_BANNER_MAX_BYTES,
  PACKAGE_BEST_FOR_OPTIONS,
  PACKAGE_CATEGORIES,
  PACKAGE_MEAL_OPTIONS,
  PACKAGE_POLICY_OPTIONS,
  SHORT_DESCRIPTION_MAX,
  slugifyPackageName,
  type AddPackageFormState,
} from "@/features/admin/data/admin-add-package";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const textareaClassName =
  "min-h-[120px] w-full resize-none rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type PackageDetailsStepProps = {
  form: AddPackageFormState;
  onChange: (patch: Partial<AddPackageFormState>) => void;
};

export function PackageDetailsStep({ form, onChange }: PackageDetailsStepProps) {
  const t = useTranslation();

  const handleNameChange = (value: string) => {
    onChange({
      packageName: value,
      packageSlug: form.packageSlug || slugifyPackageName(value),
    });
  };

  const handleBanner = (file: File | null) => {
    if (!file || file.size > PACKAGE_BANNER_MAX_BYTES) {
      return;
    }

    if (form.bannerPreviewUrl) {
      URL.revokeObjectURL(form.bannerPreviewUrl);
    }

    onChange({
      bannerPreviewUrl: URL.createObjectURL(file),
      bannerFileName: file.name,
    });
  };

  const removeBanner = () => {
    if (form.bannerPreviewUrl) {
      URL.revokeObjectURL(form.bannerPreviewUrl);
    }

    onChange({ bannerPreviewUrl: "", bannerFileName: "" });
  };

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-8">
        <section className="space-y-5">
          <SectionHeading
            title={t("admin.packages.sections.basicInfo")}
            hint={t("admin.packages.sections.basicInfoHint")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("admin.packages.fields.packageName")} required>
              <input
                type="text"
                value={form.packageName}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder={t("admin.packages.placeholders.packageName")}
                className={inputClassName}
              />
            </FormField>

            <FormField label={t("admin.packages.fields.packageSlug")} required>
              <input
                type="text"
                value={form.packageSlug}
                onChange={(event) => onChange({ packageSlug: slugifyPackageName(event.target.value) })}
                placeholder={t("admin.packages.placeholders.packageSlug")}
                className={inputClassName}
              />
              <p className="text-xs font-medium font-satoshi text-[#676565]">
                {t("admin.packages.hints.packageSlug")}
              </p>
            </FormField>
          </div>

          <FormField label={t("admin.packages.fields.shortDescription")} required>
            <div className="relative">
              <textarea
                value={form.shortDescription}
                maxLength={SHORT_DESCRIPTION_MAX}
                onChange={(event) => onChange({ shortDescription: event.target.value })}
                placeholder={t("admin.packages.placeholders.shortDescription")}
                className={`${textareaClassName} min-h-[88px]`}
              />
              <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium font-satoshi text-[#676565]">
                {form.shortDescription.length} / {SHORT_DESCRIPTION_MAX}
              </span>
            </div>
          </FormField>

          <FormField label={t("admin.packages.fields.detailedDescription")} required>
            <div className="relative">
              <textarea
                value={form.detailedDescription}
                maxLength={DETAILED_DESCRIPTION_MAX}
                onChange={(event) => onChange({ detailedDescription: event.target.value })}
                placeholder={t("admin.packages.placeholders.detailedDescription")}
                className={`${textareaClassName} min-h-[160px]`}
              />
              <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium font-satoshi text-[#676565]">
                {form.detailedDescription.length} / {DETAILED_DESCRIPTION_MAX}
              </span>
            </div>
          </FormField>

          <FormField label={t("admin.packages.fields.banner")}>
            {form.bannerPreviewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-[#E5E5E5]">
                <Image
                  src={form.bannerPreviewUrl}
                  alt={form.bannerFileName || t("admin.packages.fields.banner")}
                  width={960}
                  height={320}
                  unoptimized
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeBanner}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-[#C0392B] shadow-sm"
                  aria-label={t("admin.packages.removeBanner")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D0D0] bg-[#FAFAFA] px-6 py-10 text-center transition-colors hover:border-[#D85A30] hover:bg-[#FFF8F5]">
                <CloudUpload className="h-8 w-8 text-[#676565]" />
                <span className="mt-3 text-sm font-semibold font-satoshi text-[#2F2F2F]">
                  {t("admin.packages.uploadBanner")}
                </span>
                <span className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                  {t("admin.packages.uploadBannerHint")}
                </span>
                <input
                  type="file"
                  accept={PACKAGE_BANNER_ACCEPT}
                  className="sr-only"
                  onChange={(event) => handleBanner(event.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("admin.packages.fields.category")} required>
              <select
                value={form.category}
                onChange={(event) => onChange({ category: event.target.value })}
                className={inputClassName}
              >
                <option value="">{t("admin.packages.placeholders.category")}</option>
                {PACKAGE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </FormField>

            <BestForField
              selected={form.bestFor}
              onChange={(bestFor) => onChange({ bestFor })}
            />
          </div>

          <TagField tags={form.tags} onChange={(tags) => onChange({ tags })} />
        </section>

        <section className="space-y-5 border-t border-[#EEEEEE] pt-6">
          <SectionHeading
            title={t("admin.packages.sections.additionalSettings")}
            hint={t("admin.packages.sections.additionalSettingsHint")}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label={t("admin.packages.fields.includedMeals")}>
              <select
                value={form.includedMeals}
                onChange={(event) => onChange({ includedMeals: event.target.value })}
                className={inputClassName}
              >
                <option value="">{t("admin.packages.placeholders.select")}</option>
                {PACKAGE_MEAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={t("admin.packages.fields.cancellationPolicy")}>
              <select
                value={form.cancellationPolicy}
                onChange={(event) => onChange({ cancellationPolicy: event.target.value })}
                className={inputClassName}
              >
                <option value="">{t("admin.packages.placeholders.select")}</option>
                {PACKAGE_POLICY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={t("admin.packages.fields.refundPolicy")}>
              <select
                value={form.refundPolicy}
                onChange={(event) => onChange({ refundPolicy: event.target.value })}
                className={inputClassName}
              >
                <option value="">{t("admin.packages.placeholders.select")}</option>
                {PACKAGE_POLICY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={t("admin.packages.fields.maxGuests")}>
              <input
                type="number"
                min={1}
                value={form.maxGuests}
                onChange={(event) => onChange({ maxGuests: event.target.value })}
                placeholder={t("admin.packages.placeholders.maxGuests")}
                className={inputClassName}
              />
            </FormField>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] px-4 py-3">
            <span>
              <span className="block text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("admin.packages.fields.featuredDeal")}
              </span>
              <span className="mt-0.5 block text-xs font-medium font-satoshi text-[#676565]">
                {t("admin.packages.hints.featuredDeal")}
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.featuredDeal}
              onChange={(event) => onChange({ featuredDeal: event.target.checked })}
              className="h-5 w-5 rounded border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
            />
          </label>
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-[#FFE0B2] bg-[#FFF8F5] p-5">
        <h3 className="text-sm font-bold font-satoshi text-[#D85A30]">
          {t("admin.packages.tips.title")}
        </h3>
        <ul className="mt-3 space-y-2 text-xs font-medium font-satoshi text-[#676565]">
          <li>• {t("admin.packages.tips.one")}</li>
          <li>• {t("admin.packages.tips.two")}</li>
          <li>• {t("admin.packages.tips.three")}</li>
          <li>• {t("admin.packages.tips.four")}</li>
        </ul>
      </aside>
    </div>
  );
}

function BestForField({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const t = useTranslation();

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {t("admin.packages.fields.bestFor")}
      </span>
      <div className="flex min-h-11 flex-wrap gap-2 rounded-lg border border-[#E5E5E5] bg-white p-2">
        {PACKAGE_BEST_FOR_OPTIONS.map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi transition-colors ${
                isSelected
                  ? "bg-[#D85A30] text-white"
                  : "bg-[#F5F5F5] text-[#676565] hover:bg-[#EEEEEE]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagField({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const t = useTranslation();
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();

    if (!value || tags.includes(value)) {
      return;
    }

    onChange([...tags, value]);
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {t("admin.packages.fields.tags")}
      </span>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("admin.packages.placeholders.tags")}
        className={inputClassName}
      />
      <p className="text-xs font-medium font-satoshi text-[#676565]">
        {t("admin.packages.hints.tags")}
      </p>
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#F0F6FC] px-3 py-1 text-xs font-semibold font-satoshi text-[#135391]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                className="text-[#135391]/70 hover:text-[#C0392B]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
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
