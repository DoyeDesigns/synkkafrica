"use client";

import {
  FILTER_OPTION_KEY_MAP,
  PRICE_RANGE_LABEL_KEYS,
  PROPERTY_TYPE_ID_KEY_MAP,
} from "@/lib/preferences/filter-option-keys";
import { useTranslation } from "@/hooks/use-translation";

export function useFilterOptionLabel() {
  const t = useTranslation();

  const labelOption = (value: string) => {
    const key = FILTER_OPTION_KEY_MAP[value];
    return key ? t(key) : value;
  };

  const labelPriceRange = (id: string) => {
    const key = PRICE_RANGE_LABEL_KEYS[id];
    return key ? t(key) : id;
  };

  const labelPropertyTypeId = (id: string, fallback: string) => {
    const key = PROPERTY_TYPE_ID_KEY_MAP[id];
    return key ? t(key) : fallback;
  };

  return { labelOption, labelPriceRange, labelPropertyTypeId };
}
