import { VendorLoginPageContent } from "@/features/vendor/components/vendor-login-page-content";
import { isBackendReady } from "@/lib/env";

export default function VendorLoginPage() {
  return <VendorLoginPageContent backendReady={isBackendReady()} />;
}
