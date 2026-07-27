"use client";

import { useEffect, type ReactNode } from "react";

import {
  detectClientPreferences,
  type DetectedPreferences,
} from "@/lib/preferences/location-preferences";
import { getLanguageOption } from "@/lib/preferences/languages";
import { usePreferencesStore } from "@/stores/preferences-store";

function LanguageGate({ children }: { children: ReactNode }) {
  usePreferencesStore((state) => state.language);

  return children;
}

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

  applyLocationPreferences(
    detectedPreferences ?? detectClientPreferences(),
  );
}

export function PreferencesProvider({
  children,
  detectedPreferences,
}: PreferencesProviderProps) {
  const language = usePreferencesStore((state) => state.language);

  useEffect(() => {
    const syncDetectedPreferences = () => {
      applyDetectedPreferences(detectedPreferences);
    };

    if (usePreferencesStore.persist.hasHydrated()) {
      syncDetectedPreferences();
      return;
    }

    return usePreferencesStore.persist.onFinishHydration(syncDetectedPreferences);
  }, [detectedPreferences]);

  useEffect(() => {
    document.documentElement.lang = getLanguageOption(language).htmlLang;
  }, [language]);

  return <LanguageGate>{children}</LanguageGate>;
}
