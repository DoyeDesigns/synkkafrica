"use client";

import { usePathname } from "next/navigation";

import { ACCOUNT_AREA_PREFIX } from "@/features/account/constants";
import { Footer } from "./Footer";

const HIDDEN_PREFIXES = ["/login", ACCOUNT_AREA_PREFIX];

export function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooter = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}
