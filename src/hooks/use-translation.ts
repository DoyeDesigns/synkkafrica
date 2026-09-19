"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import type { TranslationKey } from "@/i18n/types";

/**
 * Thin facade over next-intl so existing `t("dotted.key", params?)` call sites
 * keep working. Params use simple `{name}` placeholders (ICU-compatible).
 */
export function useTranslation() {
  const t = useTranslations();

  return useMemo(
    () =>
      (key: TranslationKey, params?: Record<string, string | number>) => {
        try {
          return t(key, params);
        } catch {
          return key;
        }
      },
    [t],
  );
}
