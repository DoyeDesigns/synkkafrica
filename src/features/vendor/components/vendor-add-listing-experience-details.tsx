"use client";

import { CalendarDays, Check, Clock, MapPin, X } from "lucide-react";
import { useState, type KeyboardEvent, type ReactNode } from "react";

import {
  EXPERIENCE_ADDITIONAL_INFO_MAX_LENGTH,
  EXPERIENCE_HIGHLIGHTS_MAX_LENGTH,
  EXPERIENCE_TAG_MAX_LENGTH,
  EXPERIENCE_TYPE_LABEL_KEYS,
  EXPERIENCE_TYPES,
  EXPERIENCE_WEEKDAY_LABEL_KEYS,
  EXPERIENCE_WEEKDAYS,
} from "@/features/vendor/data/experience-listing";
import type { AddListingFormState } from "@/features/vendor/data/vendor-add-listing";
import { useTranslation } from "@/hooks/use-translation";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const textareaClassName =
  "min-h-[120px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

type ExperienceDetailsFieldsProps = {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
};

export function ExperienceDetailsFields({
  form,
  onChange,
}: ExperienceDetailsFieldsProps) {
  const t = useTranslation();

  const toggleOperatingDay = (day: (typeof EXPERIENCE_WEEKDAYS)[number]) => {
    const isSelected = form.operatingDays.includes(day);
    onChange({
      operatingDays: isSelected
        ? form.operatingDays.filter((item) => item !== day)
        : [...form.operatingDays, day],
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.addListing.experienceDetailsHeading")}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("vendor.addListing.experienceName")} required>
            <input
              type="text"
              value={form.experienceName}
              onChange={(event) => onChange({ experienceName: event.target.value })}
              placeholder={t("vendor.addListing.experienceNamePlaceholder")}
              className={inputClassName}
            />
          </FormField>

          <FormField label={t("vendor.addListing.experienceType")} required>
            <select
              value={form.experienceType}
              onChange={(event) => onChange({ experienceType: event.target.value })}
              className={`${inputClassName} appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23676565' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              }}
            >
              <option value="">{t("vendor.addListing.experienceTypeSelect")}</option>
              {EXPERIENCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(EXPERIENCE_TYPE_LABEL_KEYS[type])}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={t("vendor.addListing.location")} required>
            <div className="relative">
              <input
                type="text"
                value={form.location}
                onChange={(event) => onChange({ location: event.target.value })}
                placeholder={t("vendor.addListing.experienceLocationPlaceholder")}
                className={`${inputClassName} pr-10`}
              />
              <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          <FormField label={t("vendor.addListing.duration")} required>
            <div className="relative">
              <input
                type="text"
                value={form.duration}
                onChange={(event) => onChange({ duration: event.target.value })}
                placeholder={t("vendor.addListing.durationPlaceholder")}
                className={`${inputClassName} pr-10`}
              />
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>
        </div>

        <FormField label={t("vendor.addListing.experienceHighlights")} required>
          <p className="text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.experienceHighlightsHint")}
          </p>
          <div className="relative">
            <textarea
              value={form.experienceDescription}
              maxLength={EXPERIENCE_HIGHLIGHTS_MAX_LENGTH}
              onChange={(event) => onChange({ experienceDescription: event.target.value })}
              placeholder={t("vendor.addListing.experienceHighlightsPlaceholder")}
              className={textareaClassName}
            />
            <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium font-satoshi text-[#676565]">
              {form.experienceDescription.length} / {EXPERIENCE_HIGHLIGHTS_MAX_LENGTH}
            </span>
          </div>
        </FormField>
      </section>

      <section className="space-y-5">
        <div>
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.experienceAvailabilityHeading")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.experienceAvailabilityHint")}
          </p>
        </div>

        <ScheduleModeGroup form={form} onChange={onChange} />

        {form.experienceScheduleMode === "weekly" ? (
          <FormField label={t("vendor.addListing.operatingDays")} required>
            <div className="grid grid-cols-7 gap-2">
              {EXPERIENCE_WEEKDAYS.map((day) => {
                const isSelected = form.operatingDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleOperatingDay(day)}
                    aria-pressed={isSelected}
                    className={`flex min-h-[4.75rem] flex-col items-center justify-center gap-3 rounded-lg border px-1 py-3 text-xs font-semibold font-satoshi transition-colors sm:text-sm ${
                      isSelected
                        ? "border-[#D85A30] bg-[#FFF8F5] text-[#D85A30]"
                        : "border-[#E5E5E5] bg-white text-[#2F2F2F] hover:border-[#D0D0D0]"
                    }`}
                  >
                    <span className="leading-none">{t(EXPERIENCE_WEEKDAY_LABEL_KEYS[day])}</span>
                    {isSelected ? (
                      <span className="mt-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#D85A30] text-white">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="mt-2 h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </FormField>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("vendor.addListing.startTime")} required>
            <div className="relative">
              <input
                type="time"
                value={form.experienceStartTime}
                onChange={(event) => onChange({ experienceStartTime: event.target.value })}
                className={`${inputClassName} pr-10`}
              />
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          <FormField label={t("vendor.addListing.endTime")} required>
            <div className="relative">
              <input
                type="time"
                value={form.experienceEndTime}
                onChange={(event) => onChange({ experienceEndTime: event.target.value })}
                className={`${inputClassName} pr-10`}
              />
              <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.addListing.additionalInfoSection")}
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          <ExperienceTagInputField
            label={t("vendor.addListing.whatsIncluded")}
            hint={t("vendor.addListing.whatsIncludedHint")}
            placeholder={t("vendor.addListing.includesItemsPlaceholder")}
            tags={form.includes}
            maxLength={EXPERIENCE_TAG_MAX_LENGTH}
            onChange={(includes) => onChange({ includes })}
          />
          <ExperienceTagInputField
            label={t("vendor.addListing.whatToBring")}
            hint={t("vendor.addListing.whatToBringHint")}
            placeholder={t("vendor.addListing.whatToBringPlaceholder")}
            tags={form.whatToBring}
            maxLength={EXPERIENCE_TAG_MAX_LENGTH}
            onChange={(whatToBring) => onChange({ whatToBring })}
          />
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.additionalInformationHeading")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.additionalInformationHint")}
          </p>
        </div>

        <div className="relative">
          <textarea
            value={form.additionalInfo}
            maxLength={EXPERIENCE_ADDITIONAL_INFO_MAX_LENGTH}
            onChange={(event) => onChange({ additionalInfo: event.target.value })}
            placeholder={t("vendor.addListing.additionalInformationPlaceholder")}
            className={textareaClassName}
          />
          <span className="pointer-events-none absolute bottom-3 right-3 text-xs font-medium font-satoshi text-[#676565]">
            {form.additionalInfo.length} / {EXPERIENCE_ADDITIONAL_INFO_MAX_LENGTH}
          </span>
        </div>
      </section>
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
  children: ReactNode;
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

function ScheduleModeGroup({
  form,
  onChange,
}: {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
}) {
  const t = useTranslation();
  const value = form.experienceScheduleMode;

  const options = [
    {
      value: "weekly" as const,
      label: t("vendor.addListing.experienceScheduleWeekly"),
      hint: t("vendor.addListing.experienceScheduleWeeklyHint"),
    },
    {
      value: "date_range" as const,
      label: t("vendor.addListing.experienceScheduleDateRange"),
      hint: t("vendor.addListing.experienceScheduleDateRangeHint"),
    },
  ];

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
              isSelected
                ? "border-[#D85A30] bg-[#FFF8F5]"
                : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
            }`}
          >
            <input
              type="radio"
              checked={isSelected}
              onChange={() => onChange({ experienceScheduleMode: option.value })}
              className="mt-0.5 h-4 w-4 shrink-0 border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {option.label}
              </span>
              <span className="mt-1 block text-xs font-medium font-satoshi text-[#676565]">
                {option.hint}
              </span>
            </span>
          </label>
        );
      })}

      {value === "date_range" ? (
        <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] p-4">
          <p className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.experienceDateRangeHeading")}
          </p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.experienceDateRangeHint")}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label={t("vendor.addListing.experienceDateRangeStart")} required>
              <div className="relative">
                <input
                  type="date"
                  value={form.experienceDateRangeStart}
                  max={form.experienceDateRangeEnd || undefined}
                  onChange={(event) =>
                    onChange({ experienceDateRangeStart: event.target.value })
                  }
                  className={`${inputClassName} pr-10`}
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
              </div>
            </FormField>

            <FormField label={t("vendor.addListing.experienceDateRangeEnd")} required>
              <div className="relative">
                <input
                  type="date"
                  value={form.experienceDateRangeEnd}
                  min={form.experienceDateRangeStart || undefined}
                  onChange={(event) => onChange({ experienceDateRangeEnd: event.target.value })}
                  className={`${inputClassName} pr-10`}
                />
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
              </div>
            </FormField>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExperienceTagInputField({
  label,
  hint,
  placeholder,
  tags,
  maxLength,
  onChange,
}: {
  label: string;
  hint: string;
  placeholder: string;
  tags: string[];
  maxLength: number;
  onChange: (tags: string[]) => void;
}) {
  const t = useTranslation();
  const [input, setInput] = useState("");

  const tagsText = tags.join(", ");
  const characterCount = tagsText.length + (tagsText && input ? 2 : 0) + input.length;

  const addTag = () => {
    const value = input.trim();

    if (!value || tags.includes(value) || tags.length >= 10) {
      return;
    }

    const nextTagsText = tags.length > 0 ? `${tagsText}, ${value}` : value;

    if (nextTagsText.length > maxLength) {
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
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">{label}</span>
      <p className="text-xs font-medium font-satoshi text-[#676565]">{hint}</p>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
        />
        <span className="pointer-events-none absolute bottom-[-22px] right-0 text-xs font-medium font-satoshi text-[#676565]">
          {characterCount} / {maxLength}
        </span>
      </div>
      <p className="pt-4 text-xs font-medium font-satoshi text-[#676565]">
        {t("vendor.addListing.tagInputFooter")}
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
