import { VendorLoginPageContent } from "@/features/vendor/components/vendor-login-page-content";
import { isBackendReady } from "@/lib/env";

export default async function VendorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { reset } = await searchParams;
  return (
    <VendorLoginPageContent
      backendReady={isBackendReady()}
      passwordUpdated={reset === "success"}
    />
  );
}
