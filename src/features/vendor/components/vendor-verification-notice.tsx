"use client";

import { AlertTriangle, Clock3 } from "lucide-react";
import Link from "next/link";

import type { VendorVerificationStatus } from "@/features/vendor/constants";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

type IncompleteVerificationStatus = Exclude<VendorVerificationStatus, "verified">;

const NOTICE_CONFIG: Record<
  IncompleteVerificationStatus,
  {
    titleKey: TranslationKey;
    messageKey: TranslationKey;
    containerClassName: string;
    iconClassName: string;
    titleClassName: string;
    messageClassName: string;
    linkClassName: string;
    Icon: typeof AlertTriangle;
  }
> = {
  unverified: {
    titleKey: "vendor.verificationNotice.unverified.title",
    messageKey: "vendor.verificationNotice.unverified.message",
    containerClassName: "border-[#F5C6CB] bg-[#FFF5F5]",
    iconClassName: "text-[#C0392B]",
    titleClassName: "text-[#C0392B]",
    messageClassName: "text-[#922B21]",
    linkClassName: "text-[#C0392B] hover:text-[#922B21]",
    Icon: AlertTriangle,
  },
  pending: {
    titleKey: "vendor.verificationNotice.pending.title",
    messageKey: "vendor.verificationNotice.pending.message",
    containerClassName: "border-[#FFE0B2] bg-[#FFF8F0]",
    iconClassName: "text-[#D85A30]",
    titleClassName: "text-[#D85A30]",
    messageClassName: "text-[#B45309]",
    linkClassName: "text-[#D85A30] hover:text-[#B45309]",
    Icon: Clock3,
  },
};

type VendorVerificationNoticeProps = {
  status: IncompleteVerificationStatus;
};

export function VendorVerificationNotice({ status }: VendorVerificationNoticeProps) {
  const t = useTranslation();
  const config = NOTICE_CONFIG[status];
  const Icon = config.Icon;

  return (
    <div
      role="alert"
      className={`w-full max-w-2xl rounded-xl border px-4 py-4 shadow-sm sm:px-5 ${config.containerClassName}`}
    >
      <div className="flex gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClassName}`}
          strokeWidth={2}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold font-satoshi ${config.titleClassName}`}>
            {t(config.titleKey)}
          </p>
          <p className={`mt-1 text-sm font-medium font-satoshi ${config.messageClassName}`}>
            {t(config.messageKey)}{" "}
            {status === "unverified" ? (
              <Link
                href="/vendor/business-profile"
                className={`font-bold underline underline-offset-2 ${config.linkClassName}`}
              >
                {t("vendor.verificationNotice.completeVerification")}
              </Link>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
