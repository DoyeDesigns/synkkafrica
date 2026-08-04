import { VendorLayoutSwitcher } from "@/features/vendor/components/vendor-layout-switcher";
import { type VendorVerificationStatus } from "@/features/vendor/constants";
import { auth } from "@/auth";
import { getVendorProfile } from "@/lib/api/vendor";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Derive the verification status from the vendor's *current* backend status
  // (fresh, so it updates the moment an admin approves) — not a hardcoded
  // "verified". A pending vendor sees the "awaiting verification" notice/badge.
  let verificationStatus: VendorVerificationStatus = "pending";
  if (session?.accessToken) {
    try {
      const me = await getVendorProfile(session.accessToken);
      verificationStatus =
        me.status === "active"
          ? "verified"
          : me.status === "pending"
            ? "pending"
            : "unverified";
    } catch {
      verificationStatus = "pending";
    }
  }

  // SessionProvider (for useSession()) is mounted once at the root layout.
  return (
    <VendorLayoutSwitcher
      vendorName={session?.user?.name}
      verificationStatus={verificationStatus}
    >
      {children}
    </VendorLayoutSwitcher>
  );
}
