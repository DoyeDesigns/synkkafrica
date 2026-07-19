import { auth } from "@/auth";

import { ConditionalNavbar } from "./conditional-navbar";

export async function Navbar() {
  const session = await auth();

  return <ConditionalNavbar session={session} />;
}
