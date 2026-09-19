"use client";

import { useEffect, type ReactNode } from "react";

import { detectBrowserLocationPreferences } from "@/lib/preferences/detect-browser-location";
import {
  detectClientPreferences,
  type DetectedPreferences,
} from "@/lib/preferences/location-preferences";
import { getLanguageOption } from "@/lib/preferences/languages";
import { usePreferencesStore } from "@/stores/preferences-store";

type PreferencesProviderProps = {
  children: ReactNode;
  detectedPreferences?: DetectedPreferences | null;
};

function applyDetectedPreferences(
  detectedPreferences: DetectedPreferences | null | undefined,
) {
  const { hasUserSetPreferences, applyLocationPreferences } =
    usePreferencesStore.getState();

  if (hasUserSetPreferences) {
    return;
  }

  applyLocationPreferences(detectedPreferences ?? detectClientPreferences());
}

export function PreferencesProvider({
  children,
  detectedPreferences,
}: PreferencesProviderProps) {
  const language = usePreferencesStore((state) => state.language);

  useEffect(() => {
    let cancelled = false;

    const syncDetectedPreferences = () => {
      applyDetectedPreferences(detectedPreferences);

      if (usePreferencesStore.getState().hasUserSetPreferences) {
        return;
      }

      void detectBrowserLocationPreferences().then((fromGeo) => {
        if (cancelled || !fromGeo) return;
        if (usePreferencesStore.getState().hasUserSetPreferences) return;
        usePreferencesStore.getState().applyLocationPreferences(fromGeo);
      });
    };

    if (usePreferencesStore.persist.hasHydrated()) {
      syncDetectedPreferences();
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = usePreferencesStore.persist.onFinishHydration(
      syncDetectedPreferences,
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [detectedPreferences]);

  useEffect(() => {
    document.documentElement.lang = getLanguageOption(language).htmlLang;
  }, [language]);

  return children;
}
