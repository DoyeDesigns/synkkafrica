"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import { NavbarContent } from "./NavbarContent";

const HIDDEN_PREFIXES = ["/login"];

type ConditionalNavbarProps = {
  session: Session | null;
};

export function ConditionalNavbar({ session }: ConditionalNavbarProps) {
  const pathname = usePathname();
  const hideNavbar = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hideNavbar) {
    return null;
  }

  return <NavbarContent session={session} />;
}
