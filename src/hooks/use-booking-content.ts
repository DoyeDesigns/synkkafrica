"use client";

import {
  BOOKING_CONTENT_KEY_MAP,
  REVIEW_TEXT_KEYS,
  isBookingContentKey,
} from "@/lib/preferences/booking-content-keys";
import { FILTER_OPTION_KEY_MAP } from "@/lib/preferences/filter-option-keys";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type ContentParams = Record<string, string | number>;

export function useBookingContent() {
  const t = useTranslation();

  const labelContent = (value: string, params?: ContentParams) => {
    if (isBookingContentKey(value)) {
      return t(value, params);
    }

    const nightsDaysMatch = value.match(/^(\d+) nights \/ (\d+) days$/i);
    if (nightsDaysMatch) {
      return t("booking.content.feature.nightsDays", {
        nights: nightsDaysMatch[1]!,
        days: nightsDaysMatch[2]!,
      });
    }

    const nightsDaysSlashMatch = value.match(/^(\d+) Nights \/ (\d+) Days$/);
    if (nightsDaysSlashMatch) {
      return t("booking.package.nightsDays", {
        nights: nightsDaysSlashMatch[1]!,
        days: nightsDaysSlashMatch[2]!,
      });
    }

    const filterKey = FILTER_OPTION_KEY_MAP[value];
    if (filterKey) {
      return t(filterKey);
    }

    const key = BOOKING_CONTENT_KEY_MAP[value];
    return key ? t(key, params) : value;
  };

  const labelReview = (review: { id: string; text: string }) => {
    const key = REVIEW_TEXT_KEYS[review.id];
    return key ? t(key) : review.text;
  };

  const labelKey = (key: TranslationKey, params?: ContentParams) =>
    t(key, params);

  return { labelContent, labelReview, labelKey };
}
