"use client";

import { Suspense } from "react";
import type { Session } from "next-auth";

import { NavbarContent, NavbarContentFallback } from "./NavbarContent";

type ConditionalNavbarProps = {
  session: Session | null;
};

export function ConditionalNavbar(props: ConditionalNavbarProps) {
  return (
    <Suspense fallback={<NavbarContentFallback {...props} />}>
      <NavbarContent {...props} />
    </Suspense>
  );
}
