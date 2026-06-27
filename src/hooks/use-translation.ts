"use client";

import { useMemo } from "react";

import { usePreferencesStore } from "@/stores/preferences-store";
import { translate, type TranslationKey } from "@/lib/preferences/translations";

export function useTranslation() {
  const language = usePreferencesStore((state) => state.language);

  return useMemo(
    () => (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language],
  );
}
