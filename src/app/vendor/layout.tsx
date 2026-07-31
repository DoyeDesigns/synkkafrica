import { VendorLayoutSwitcher } from "@/features/vendor/components/vendor-layout-switcher";
import { type VendorVerificationStatus } from "@/features/vendor/constants";
import { auth } from "@/auth";
import { AuthProvider } from "@/providers/session-provider";
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

  // Vendor pages use useSession() (token for API calls + role) and React Query,
  // so this segment needs the client SessionProvider. QueryProvider is global.
  return (
    <AuthProvider>
      <VendorLayoutSwitcher
        vendorName={session?.user?.name}
        verificationStatus={verificationStatus}
      >
        {children}
      </VendorLayoutSwitcher>
    </AuthProvider>
  );
}
