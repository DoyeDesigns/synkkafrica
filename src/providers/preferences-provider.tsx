"use client";

import { useEffect, type ReactNode } from "react";

import { getLanguageOption } from "@/lib/preferences/languages";
import { usePreferencesStore } from "@/stores/preferences-store";

function LanguageGate({ children }: { children: ReactNode }) {
  usePreferencesStore((state) => state.language);

  return children;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const language = usePreferencesStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = getLanguageOption(language).htmlLang;
  }, [language]);

  return <LanguageGate>{children}</LanguageGate>;
}
