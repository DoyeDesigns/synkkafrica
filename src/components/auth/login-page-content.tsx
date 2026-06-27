"use client";

import Image from "next/image";

import { LoginAppleButton } from "@/components/auth/login-apple-button";
import { LoginEmailForm } from "@/components/auth/login-email-form";
import { LoginGoogleButton } from "@/components/auth/login-google-button";
import { LoginTrustBadges } from "@/components/auth/login-trust-badges";
import { useTranslation } from "@/hooks/use-translation";

type LoginPageContentProps = {
  backendReady: boolean;
};

export function LoginPageContent({ backendReady }: LoginPageContentProps) {
  const t = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[557px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/synkkafrica-logo.svg"
            alt="SynkkAfrica"
            width={88}
            height={88}
            priority
            className="h-[88px] w-[88px]"
          />

          <p className="mt-6 max-w-[557px] text-base font-medium font-satoshi leading-relaxed text-foreground">
            {t("login.intro")}
          </p>
        </div>

        {!backendReady ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
            {t("login.backendNotReady")}
          </p>
        ) : null}

        <div className="mt-8 space-y-6">
          <LoginEmailForm />

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E0E0E0]" />
            <span className="shrink-0 text-sm font-medium font-satoshi text-foreground/70">
              {t("login.orUseOptions")}
            </span>
            <div className="h-px flex-1 bg-[#E0E0E0]" />
          </div>

          <div className="space-y-4">
            <LoginGoogleButton />
            <LoginAppleButton />
          </div>
        </div>

        <LoginTrustBadges />
      </div>
    </div>
  );
}
