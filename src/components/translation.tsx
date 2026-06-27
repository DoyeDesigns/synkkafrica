"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type TProps = {
  k: TranslationKey;
};

export function T({ k }: TProps) {
  const t = useTranslation();

  return <>{t(k)}</>;
}
