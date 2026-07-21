"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import { ADMIN_AREA_PREFIX } from "@/features/admin/constants";
import { ACCOUNT_AREA_PREFIX } from "@/features/account/constants";
import { VENDOR_AREA_PREFIX } from "@/features/vendor/constants";
import { Footer } from "./Footer";

const HIDDEN_PREFIXES = [
  "/login",
  ACCOUNT_AREA_PREFIX,
  VENDOR_AREA_PREFIX,
  ADMIN_AREA_PREFIX,
];

function ConditionalFooterContent() {
  const pathname = usePathname();
  const hideFooter = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideFooter) {
    return null;
  }

  return <Footer />;
}

export function ConditionalFooter() {
  return (
    <Suspense fallback={null}>
      <ConditionalFooterContent />
    </Suspense>
  );
}
