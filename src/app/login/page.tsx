import { LoginPageContent } from "@/components/auth/login-page-content";
import { isBackendReady } from "@/lib/env";

export default function LoginPage() {
  return <LoginPageContent backendReady={isBackendReady()} />;
}
