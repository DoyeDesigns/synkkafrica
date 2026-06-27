import { auth } from "@/auth";

import { NavbarContent } from "./NavbarContent";

export async function Navbar() {
  const session = await auth();

  return <NavbarContent session={session} />;
}
