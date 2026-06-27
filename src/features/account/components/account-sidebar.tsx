import Image from "next/image";

import { AccountSidebarLinks } from "@/features/account/components/account-sidebar-links";
import { AccountSignOutButton } from "@/features/account/components/account-sign-out-button";

export function AccountSidebar() {
  return (
    <aside className="space-y-3">
      <nav className="space-y-2 bg-white border border-[#EEEEEE] rounded-[10px] p-4">
        <AccountSidebarLinks />
        <AccountSignOutButton />
      </nav>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#676767] px-4 py-3.5 text-sm font-medium font-satoshi text-white transition-opacity hover:opacity-90"
      >
        <span>
          <Image src="/contact-support.png" alt="Help" width={24} height={24} />
        </span>
        Contact support
      </button>
    </aside>
  );
}
