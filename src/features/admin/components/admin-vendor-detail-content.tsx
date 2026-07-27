"use client";

import {
  Ban,
  Check,
  Flag,
  GraduationCap,
  Mail,
  MoreVertical,
  Pause,
  Percent,
  Plus,
  Power,
  RotateCcw,
  Star,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  formatAdminVendorOnboardedDate,
  formatAdminVendorPayoutDate,
  getAdminVendorDetailById,
  getAdminVendorNextTier,
  type AdminVendorDetail,
  type AdminVendorDocumentStatus,
  type AdminVendorStatus,
} from "@/features/admin/data/admin-vendors";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminVendorStatus, TranslationKey> = {
  active: "admin.vendors.status.active",
  inactive: "admin.vendors.status.inactive",
};

const DOCUMENT_STATUS_KEYS: Record<AdminVendorDocumentStatus, TranslationKey> = {
  verified: "admin.vendors.detail.documentStatus.verified",
  pending: "admin.vendors.detail.documentStatus.pendingReview",
  signed: "admin.vendors.detail.documentStatus.signed",
  notVerified: "admin.vendors.detail.documentStatus.notVerified",
};

const STATUS_BADGE_STYLES: Record<AdminVendorStatus, string> = {
  active: "bg-[#E8F5E9] text-[#2E7D32]",
  inactive: "bg-[#F5F5F5] text-[#676565]",
};

const DOCUMENT_BADGE_STYLES: Record<AdminVendorDocumentStatus, string> = {
  verified: "bg-[#E8F5E9] text-[#2E7D32]",
  pending: "bg-[#E8EAF6] text-[#3949AB]",
  signed: "bg-[#E8F5E9] text-[#2E7D32]",
  notVerified: "bg-[#F5F5F5] text-[#676565]",
};

type AdminVendorDetailContentProps = {
  vendorId: string;
};

export function AdminVendorDetailContent({ vendorId }: AdminVendorDetailContentProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const vendor = getAdminVendorDetailById(vendorId);

  if (!vendor) {
    return (
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("admin.vendors.notFound")}
        </p>
        <Link
          href="/admin/vendors"
          className="mt-4 inline-flex text-sm font-semibold text-[#135391] underline underline-offset-2"
        >
          {t("admin.vendors.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          value={String(vendor.activeListings)}
          label={t("admin.vendors.detail.activeListings")}
        />
        <MetricCard
          value={String(vendor.completedBookings)}
          label={t("admin.vendors.detail.completedBookings")}
        />
        <MetricCard
          value={String(vendor.rating)}
          label={t("admin.vendors.detail.averageRating")}
        />
        <MetricCard
          value={String(vendor.openStrikes)}
          label={t("admin.vendors.detail.openStrikes")}
        />
      </div>

      <VendorProfileHeader vendor={vendor} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title={t("admin.vendors.detail.accountDocuments")}>
          {vendor.accountDocuments.map((document) => (
            <DetailRow
              key={document.label}
              label={document.label}
              value={t(DOCUMENT_STATUS_KEYS[document.status])}
              badgeTone={document.status}
            />
          ))}
        </DetailCard>

        <DetailCard
          title={t("admin.vendors.detail.listingDocuments", { category: vendor.category })}
        >
          {vendor.listingDocuments.map((document) => (
            <DetailRow
              key={document.label}
              label={document.label}
              value={t(DOCUMENT_STATUS_KEYS[document.status])}
              badgeTone={document.status}
            />
          ))}
        </DetailCard>

        <DetailCard title={t("admin.vendors.detail.payoutSummary")}>
          <DetailRow
            label={t("admin.vendors.detail.pendingPayout")}
            value={formatPrice(vendor.payout.currency, vendor.payout.pendingAmount)}
          />
          <DetailRow
            label={t("admin.vendors.detail.lastPayout")}
            value={formatAdminVendorPayoutDate(vendor.payout.lastPayoutDate)}
          />
          <DetailRow
            label={t("admin.vendors.commission")}
            value={t("admin.vendors.commissionValue", {
              rate: vendor.payout.commissionRate,
            })}
          />
        </DetailCard>

        <DetailCard title={t("admin.vendors.detail.internalNotes")}>
          {vendor.internalNote ? (
            <div className="rounded-lg bg-[#F0F6FC] px-4 py-4">
              <p className="text-sm italic leading-relaxed text-[#2F2F2F]">
                &ldquo;{vendor.internalNote.text}&rdquo;
              </p>
              <p className="mt-3 text-xs font-medium text-[#676565]">
                {t("admin.vendors.detail.noteAttribution", {
                  author: vendor.internalNote.author,
                  date: vendor.internalNote.date,
                })}
              </p>
            </div>
          ) : (
            <p className="py-2 text-sm font-medium text-[#676565]">
              {t("admin.vendors.detail.noNotes")}
            </p>
          )}
        </DetailCard>
      </div>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white px-5 py-4 shadow-sm">
      <p className="text-2xl font-bold font-inter text-[#D85A30]">{value}</p>
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
    </div>
  );
}

function VendorProfileHeader({ vendor }: { vendor: AdminVendorDetail }) {
  const t = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold font-satoshi text-[#2F2F2F]">{vendor.name}</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[vendor.status]}`}
            >
              {t(STATUS_LABEL_KEYS[vendor.status])}
            </span>
            <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#1565C0]">
              {vendor.tierLabel}
            </span>
          </div>

          <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.vendors.detail.category")}: {vendor.category} &bull;{" "}
            {t("admin.vendors.vendorId")}: {vendor.accountId} &bull;{" "}
            {t("admin.vendors.detail.onboarded", {
              date: formatAdminVendorOnboardedDate(vendor.joinedAt),
            })}
          </p>

          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {vendor.email} &bull; {vendor.phone} &bull; {vendor.location}
          </p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#676565] transition-colors hover:bg-[#F5F5F5]"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {isMenuOpen ? (
            <VendorOptionsMenu vendor={vendor} onClose={() => setIsMenuOpen(false)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VendorOptionsMenu({
  vendor,
  onClose,
}: {
  vendor: AdminVendorDetail;
  onClose: () => void;
}) {
  const t = useTranslation();
  const nextTier = getAdminVendorNextTier(vendor.tier);

  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-72 overflow-hidden rounded-lg border border-[#EEEEEE] bg-white py-2 shadow-lg">
      <MenuSection title={t("admin.vendors.menu.verification")}>
        <MenuItem
          icon={Check}
          label={t("admin.vendors.menu.approvePendingListing")}
          onClick={onClose}
        />
        <MenuItem
          icon={Undo2}
          label={t("admin.vendors.menu.requestAdditionalDocuments")}
          onClick={onClose}
        />
        {nextTier ? (
          <MenuItem
            icon={GraduationCap}
            label={t("admin.vendors.menu.upgradeToTier", { tier: nextTier })}
            onClick={onClose}
          />
        ) : null}
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.vendors.menu.standingTrust")}>
        <MenuItem
          icon={Star}
          label={t("admin.vendors.menu.grantInstantBook")}
          onClick={onClose}
        />
        <MenuItem
          icon={Flag}
          label={t("admin.vendors.menu.addStrike")}
          onClick={onClose}
        />
        <MenuItem
          icon={RotateCcw}
          label={t("admin.vendors.menu.clearStrike")}
          onClick={onClose}
        />
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.vendors.menu.financial")}>
        <MenuItem
          icon={Pause}
          label={t("admin.vendors.menu.holdPendingPayout")}
          onClick={onClose}
          iconWrapperClassName="rounded-md border border-[#E5E5E5] bg-[#FAFAFA]"
        />
        <MenuItem
          icon={Percent}
          label={t("admin.vendors.menu.adjustCommissionRate")}
          onClick={onClose}
        />
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.vendors.menu.communication")}>
        <MenuItem icon={Mail} label={t("admin.vendors.menu.contactVendor")} onClick={onClose} />
        <MenuItem
          icon={Plus}
          label={t("admin.vendors.menu.addInternalNote")}
          onClick={onClose}
        />
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.vendors.menu.account")}>
        <MenuItem
          icon={Power}
          label={t("admin.vendors.menu.suspendAccount")}
          onClick={onClose}
          destructive
        />
        <MenuItem
          icon={Ban}
          label={t("admin.vendors.menu.banPermanently")}
          onClick={onClose}
          destructive
        />
      </MenuSection>
    </div>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-2">
      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function MenuDivider() {
  return <div className="my-2 border-t border-[#F0F0F0]" />;
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
  iconWrapperClassName,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  iconWrapperClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm font-medium font-satoshi transition-colors hover:bg-[#FAFAFA] ${
        destructive ? "text-[#DD2222]" : "text-[#2F2F2F]"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center ${iconWrapperClassName ?? ""}`}
      >
        <Icon className="h-4 w-4" strokeWidth={destructive ? 2 : 1.75} />
      </span>
      {label}
    </button>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type DetailBadgeTone = AdminVendorDocumentStatus;

function DetailRow({
  label,
  value,
  badgeTone,
}: {
  label: string;
  value: string;
  badgeTone?: DetailBadgeTone;
}) {
  const badgeStyles: Record<DetailBadgeTone, string> = {
    verified: DOCUMENT_BADGE_STYLES.verified,
    pending: DOCUMENT_BADGE_STYLES.pending,
    signed: DOCUMENT_BADGE_STYLES.signed,
    notVerified: DOCUMENT_BADGE_STYLES.notVerified,
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-[#E0E0E0] py-3 last:border-b-0">
      <span className="text-sm font-medium font-satoshi text-[#676565]">{label}</span>
      {badgeTone ? (
        <span
          className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${badgeStyles[badgeTone]}`}
        >
          {value}
        </span>
      ) : (
        <span className="text-sm font-semibold font-satoshi text-right text-[#2F2F2F]">
          {value}
        </span>
      )}
    </div>
  );
}
