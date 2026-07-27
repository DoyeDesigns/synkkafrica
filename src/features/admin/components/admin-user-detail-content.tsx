"use client";

import {
  ArrowLeftRight,
  Check,
  Download,
  Eye,
  MoreVertical,
  Pause,
  Plus,
  Power,
  RotateCcw,
  ScanFace,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  formatAdminUserJoinedDate,
  formatAdminUserLifetimeSpend,
  getAdminUserDetailById,
  type AdminUserBookingStatus,
  type AdminUserDetail,
  type AdminUserStatus,
} from "@/features/admin/data/admin-users";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminUserStatus, TranslationKey> = {
  active: "admin.users.status.active",
  inactive: "admin.users.status.inactive",
};

const BOOKING_STATUS_KEYS: Record<AdminUserBookingStatus, TranslationKey> = {
  confirmed: "admin.users.detail.bookingStatus.confirmed",
  completed: "admin.users.detail.bookingStatus.completed",
  cancelled: "admin.users.detail.bookingStatus.cancelled",
};

const STATUS_BADGE_STYLES: Record<AdminUserStatus, string> = {
  active: "bg-[#E8F5E9] text-[#2E7D32]",
  inactive: "bg-[#F5F5F5] text-[#676565]",
};

type AdminUserDetailContentProps = {
  userId: string;
};

export function AdminUserDetailContent({ userId }: AdminUserDetailContentProps) {
  const t = useTranslation();
  const user = getAdminUserDetailById(userId);

  if (!user) {
    return (
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("admin.users.notFound")}
        </p>
        <Link
          href="/admin/users"
          className="mt-4 inline-flex text-sm font-semibold text-[#135391] underline underline-offset-2"
        >
          {t("admin.users.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          value={String(user.bookingsCount)}
          label={t("admin.users.detail.totalBookings")}
        />
        <MetricCard
          value={formatAdminUserLifetimeSpend(user.currency, user.totalSpend)}
          label={t("admin.users.detail.lifetimeSpend")}
        />
        <MetricCard value={user.primaryCorridor} label={t("admin.users.detail.primaryCorridor")} />
        <MetricCard
          value={String(user.openTickets)}
          label={t("admin.users.detail.openTickets")}
        />
      </div>

      <ProfileHeader user={user} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard title={t("admin.users.detail.identityVerification")}>
          <DetailRow
            label={t("admin.users.detail.governmentId", {
              type: user.verification.governmentIdType,
            })}
            value={
              user.verification.governmentIdVerified
                ? t("admin.users.detail.verified")
                : t("admin.users.detail.notVerified")
            }
            badgeTone={
              user.verification.governmentIdVerified ? "verified" : "notVerified"
            }
          />
          <DetailRow
            label={t("admin.users.detail.faceMatch")}
            value={
              user.verification.faceMatchVerified
                ? t("admin.users.detail.verified")
                : t("admin.users.detail.notVerified")
            }
            badgeTone={user.verification.faceMatchVerified ? "verified" : "notVerified"}
          />
          <DetailRow
            label={t("admin.users.detail.verifiedVia")}
            value={user.verification.provider}
            badgeTone={
              user.verification.governmentIdVerified ? "verified" : "notVerified"
            }
          />
        </DetailCard>

        <DetailCard title={t("admin.users.detail.paymentMethods")}>
          <DetailRow
            label={t("admin.users.detail.card")}
            value={user.paymentMethods.cardLabel}
            valueClassName="text-[#2F2F2F]"
          />
          <DetailRow
            label={t("admin.users.detail.defaultCurrency")}
            value={user.paymentMethods.defaultCurrency}
            valueClassName="text-[#2F2F2F]"
          />
        </DetailCard>

        <DetailCard title={t("admin.users.detail.recentBookings")}>
          {user.recentBookings.map((booking) => (
            <DetailRow
              key={booking.name}
              label={booking.name}
              value={t(BOOKING_STATUS_KEYS[booking.status])}
              valueClassName="text-[#2F2F2F]"
            />
          ))}
        </DetailCard>

        <DetailCard title={t("admin.users.detail.internalNotes")}>
          {user.internalNote ? (
            <div className="rounded-lg bg-[#F0F6FC] px-4 py-4">
              <p className="text-sm italic leading-relaxed text-[#2F2F2F]">
                &ldquo;{user.internalNote.text}&rdquo;
              </p>
              <p className="mt-3 text-xs font-medium text-[#676565]">
                {t("admin.users.detail.noteAttribution", {
                  author: user.internalNote.author,
                  date: user.internalNote.date,
                })}
              </p>
            </div>
          ) : (
            <p className="py-2 text-sm font-medium text-[#676565]">
              {t("admin.users.detail.noNotes")}
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

function ProfileHeader({ user }: { user: AdminUserDetail }) {
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

  const phoneLabel = user.whatsAppLinked
    ? t("admin.users.detail.phoneWhatsApp", { phone: user.phone })
    : user.phone;

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold font-satoshi text-[#2F2F2F]">{user.name}</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[user.status]}`}
            >
              {t(STATUS_LABEL_KEYS[user.status])}
            </span>
            {user.idVerified ? (
              <span className="rounded-full bg-[#E3F2FD] px-2.5 py-1 text-xs font-semibold text-[#1565C0]">
                {t("admin.users.detail.idFaceVerified")}
              </span>
            ) : null}
          </div>

          <p className="mt-3 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.users.userId")}: {user.accountId} &bull;{" "}
            {t("admin.users.detail.joined", {
              date: formatAdminUserJoinedDate(user.joinedAt),
            })}{" "}
            &bull;{" "}
            {t("admin.users.detail.lastActive", { elapsed: user.lastActiveLabel })}
          </p>

          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {user.email} &bull; {phoneLabel} &bull; {user.location}
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
            <UserOptionsMenu onClose={() => setIsMenuOpen(false)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UserOptionsMenu({ onClose }: { onClose: () => void }) {
  const t = useTranslation();

  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-[#EEEEEE] bg-white py-2 shadow-lg">
      <MenuSection title={t("admin.users.menu.verification")}>
        <MenuItem
          icon={Check}
          label={t("admin.users.menu.rerunIdVerification")}
          onClick={onClose}
        />
        <MenuItem
          icon={ScanFace}
          label={t("admin.users.menu.rerunFaceVerification")}
          onClick={onClose}
        />
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.users.menu.financial")}>
        <MenuItem icon={RotateCcw} label={t("admin.users.menu.issueRefund")} onClick={onClose} />
        <MenuItem
          icon={Pause}
          label={t("admin.users.menu.holdBookingPayment")}
          onClick={onClose}
          iconWrapperClassName="rounded-md border border-[#E5E5E5] bg-[#FAFAFA]"
        />
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.users.menu.support")}>
        <MenuItem icon={Eye} label={t("admin.users.menu.viewAsReadOnly")} onClick={onClose} />
        <MenuItem icon={Plus} label={t("admin.users.menu.addInternalNote")} onClick={onClose} />
      </MenuSection>

      <MenuDivider />

      <MenuSection title={t("admin.users.menu.dataAccount")}>
        <MenuItem
          icon={ArrowLeftRight}
          label={t("admin.users.menu.mergeDuplicateAccount")}
          onClick={onClose}
        />
        <MenuItem
          icon={Download}
          label={t("admin.users.menu.exportUserData")}
          onClick={onClose}
        />
        <MenuItem
          icon={Power}
          label={t("admin.users.menu.suspendAccount")}
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

function DetailRow({
  label,
  value,
  valueClassName = "text-[#2F2F2F]",
  badgeTone,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  badgeTone?: "verified" | "notVerified" | "pending" | "signed";
}) {
  const badgeStyles = {
    verified: "bg-[#E8F5E9] text-[#2E7D32]",
    notVerified: "bg-[#F5F5F5] text-[#676565]",
    pending: "bg-[#E8EAF6] text-[#3949AB]",
    signed: "bg-[#E8F5E9] text-[#2E7D32]",
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
        <span className={`text-sm font-semibold font-satoshi text-right ${valueClassName}`}>
          {value}
        </span>
      )}
    </div>
  );
}
