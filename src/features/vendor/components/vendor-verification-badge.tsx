"use client";

import { BadgeCheck, CircleX, Clock3 } from "lucide-react";

import type { VendorVerificationStatus } from "@/features/vendor/constants";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<VendorVerificationStatus, TranslationKey> = {
  verified: "vendor.header.verifiedVendor",
  unverified: "vendor.header.unverifiedVendor",
  pending: "vendor.header.pendingVendor",
};

const STATUS_STYLES: Record<
  VendorVerificationStatus,
  { textClassName: string; iconClassName: string }
> = {
  verified: {
    textClassName: "text-[#1A9E37]",
    iconClassName: "text-[#1A9E37]",
  },
  unverified: {
    textClassName: "text-[#C0392B]",
    iconClassName: "text-[#C0392B]",
  },
  pending: {
    textClassName: "text-[#D85A30]",
    iconClassName: "text-[#D85A30]",
  },
};

type VendorVerificationBadgeProps = {
  status?: VendorVerificationStatus;
};

function VerificationIcon({ status }: { status: VendorVerificationStatus }) {
  const styles = STATUS_STYLES[status];

  if (status === "verified") {
    return (
      <BadgeCheck
        className={`h-4 w-4 shrink-0 ${styles.iconClassName}`}
        strokeWidth={2}
        stroke="#C4F02F"
        fill="#1A9E37"
        aria-hidden="true"
      />
    );
  }

  if (status === "unverified") {
    return (
      <CircleX
        className={`h-4 w-4 shrink-0 ${styles.iconClassName}`}
        strokeWidth={2}
        aria-hidden="true"
      />
    );
  }

  return (
    <Clock3
      className={`h-4 w-4 shrink-0 ${styles.iconClassName}`}
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

export function VendorVerificationBadge({
  status = "verified",
}: VendorVerificationBadgeProps) {
  const t = useTranslation();
  const styles = STATUS_STYLES[status];

  return (
    <p
      className={`flex items-center justify-end gap-1.5 text-sm font-semibold font-satoshi ${styles.textClassName}`}
    >
      <VerificationIcon status={status} />
      {t(STATUS_LABEL_KEYS[status])}
    </p>
  );
}
