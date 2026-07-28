import { AccountContactSupportLink } from "@/features/account/components/account-contact-support-link";
import { AccountSidebarLinks } from "@/features/account/components/account-sidebar-links";
import { AccountSignOutButton } from "@/features/account/components/account-sign-out-button";

export function AccountSidebar() {
  return (
    <aside className="space-y-3">
      <nav className="space-y-2 bg-white border border-[#EEEEEE] rounded-[10px] p-4">
        <AccountSidebarLinks />
        <AccountSignOutButton />
      </nav>

      <AccountContactSupportLink />
    </aside>
  );
}
