"use client";

import Image from "next/image";
import Link from "next/link";

import { LoginTrustBadges } from "@/components/auth/login-trust-badges";
import { VendorLoginEmailForm } from "@/features/vendor/components/vendor-login-email-form";
import { useTranslation } from "@/hooks/use-translation";

type VendorLoginPageContentProps = {
  backendReady: boolean;
};

export function VendorLoginPageContent({ backendReady }: VendorLoginPageContentProps) {
  const t = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-[557px]">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/synkafrica-logo.svg"
            alt="SynkAfrica"
            width={88}
            height={88}
            priority
            className="h-[88px] w-[88px]"
          />

          <h1 className="mt-6 text-xl font-bold font-satoshi text-foreground">
            {t("vendor.login.title")}
          </h1>

          <p className="mt-3 max-w-[557px] text-base font-medium font-satoshi leading-relaxed text-foreground/80">
            {t("vendor.login.intro")}
          </p>
        </div>

        {!backendReady ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
            {t("login.backendNotReady")}
          </p>
        ) : null}

        <div className="mt-8 space-y-6">
          <VendorLoginEmailForm />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium font-satoshi text-foreground/70">
            {t("vendor.login.noAccount")}{" "}
            <Link
              href="/vendor/signup"
              className="font-bold text-[#D85A30] transition-opacity hover:opacity-80"
            >
              {t("vendor.login.signUp")}
            </Link>
          </p>
        </div>

        <LoginTrustBadges />
      </div>
    </div>
  );
}
