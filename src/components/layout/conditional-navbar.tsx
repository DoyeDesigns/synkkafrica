"use client";

import { Suspense } from "react";
import type { Session } from "next-auth";

import { NavbarContent, NavbarContentFallback } from "./navbar-content";

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
