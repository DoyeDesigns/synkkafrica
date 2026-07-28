import type { TranslationKey } from "@/lib/preferences/translations";

export const EXPERIENCE_TYPES = [
  "Tours",
  "Activities",
  "Workshops",
  "Day trips",
] as const;

export type ExperienceType = (typeof EXPERIENCE_TYPES)[number];

export const EXPERIENCE_TYPE_LABEL_KEYS: Record<ExperienceType, TranslationKey> = {
  Tours: "filters.experienceType.tours",
  Activities: "filters.experienceType.activities",
  Workshops: "filters.experienceType.workshops",
  "Day trips": "filters.experienceType.dayTrips",
};

export const EXPERIENCE_WEEKDAYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type ExperienceWeekday = (typeof EXPERIENCE_WEEKDAYS)[number];

export const EXPERIENCE_WEEKDAY_LABEL_KEYS: Record<ExperienceWeekday, TranslationKey> = {
  mon: "vendor.addListing.weekday.mon",
  tue: "vendor.addListing.weekday.tue",
  wed: "vendor.addListing.weekday.wed",
  thu: "vendor.addListing.weekday.thu",
  fri: "vendor.addListing.weekday.fri",
  sat: "vendor.addListing.weekday.sat",
  sun: "vendor.addListing.weekday.sun",
};

export type ExperienceScheduleMode = "weekly" | "date_range";

export const EXPERIENCE_HIGHLIGHTS_MAX_LENGTH = 300;
export const EXPERIENCE_TAG_MAX_LENGTH = 200;
export const EXPERIENCE_ADDITIONAL_INFO_MAX_LENGTH = 300;
