"use client";

import {
  Bell,
  CalendarClock,
  CircleDollarSign,
  Megaphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  filterNotifications,
  VENDOR_NOTIFICATION_FILTERS,
  VENDOR_NOTIFICATIONS,
  type VendorNotification,
  type VendorNotificationFilter,
  type VendorNotificationType,
} from "@/features/vendor/data/vendor-notifications";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const FILTER_LABEL_KEYS: Record<VendorNotificationFilter, TranslationKey> = {
  all: "vendor.notifications.filter.all",
  new_booking: "vendor.notifications.filter.newBooking",
  booking_reminder: "vendor.notifications.filter.bookingReminder",
  payout_confirmation: "vendor.notifications.filter.payoutConfirmation",
  admin_message: "vendor.notifications.filter.adminMessage",
};

const TYPE_LABEL_KEYS: Record<VendorNotificationType, TranslationKey> = {
  new_booking: "vendor.notifications.type.newBooking",
  booking_reminder: "vendor.notifications.type.bookingReminder",
  payout_confirmation: "vendor.notifications.type.payoutConfirmation",
  admin_message: "vendor.notifications.type.adminMessage",
};

const TYPE_STYLES: Record<VendorNotificationType, string> = {
  new_booking: "bg-[#E8F5E9] text-[#2E7D32]",
  booking_reminder: "bg-[#FFF3E0] text-[#E65100]",
  payout_confirmation: "bg-[#E3F2FD] text-[#1565C0]",
  admin_message: "bg-[#F3E5F5] text-[#7B1FA2]",
};

const TYPE_ICONS = {
  new_booking: Sparkles,
  booking_reminder: CalendarClock,
  payout_confirmation: CircleDollarSign,
  admin_message: Megaphone,
} as const;

function formatNotificationTime(
  isoDate: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return t("vendor.notifications.time.justNow");
  }

  if (diffHours < 24) {
    return t("vendor.notifications.time.hoursAgo", { count: diffHours });
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

type VendorNotificationsContentProps = {
  vendorName?: string | null;
};

export function VendorNotificationsContent({
  vendorName = "Alex Autos",
}: VendorNotificationsContentProps) {
  const t = useTranslation();
  const displayName = vendorName?.trim() || "Alex Autos";
  const [activeFilter, setActiveFilter] =
    useState<VendorNotificationFilter>("all");
  const [notifications, setNotifications] = useState(VENDOR_NOTIFICATIONS);

  const filteredNotifications = useMemo(
    () => filterNotifications(notifications, activeFilter),
    [activeFilter, notifications],
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleMarkAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  const handleMarkRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center justify-center rounded-lg border border-[#135391] bg-white px-4 py-2.5 text-sm font-bold font-satoshi text-[#135391] transition-colors hover:bg-[#F0F6FC]"
          >
            {t("vendor.notifications.markAllRead")}
          </button>
        ) : null}
      </div>

      <section className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-[#E8E8E8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold font-satoshi text-[#2F2F2F]">
              <Bell className="h-5 w-5 text-[#D85A30]" strokeWidth={2} />
              {t("vendor.nav.notifications")}
            </h3>
            {unreadCount > 0 ? (
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.notifications.unreadCount", { count: unreadCount })}
              </p>
            ) : (
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.notifications.allCaughtUp")}
              </p>
            )}
          </div>
        </div>

        <div
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
          role="group"
          aria-label={t("vendor.notifications.filter.label")}
        >
          {VENDOR_NOTIFICATION_FILTERS.map((filter) => {
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-lg border px-2 py-2.5 text-xs font-semibold font-satoshi transition-colors ${
                  isActive
                    ? "border-[#D85A30] bg-[#FFF1EB] text-[#D85A30]"
                    : "border-[#E5E5E5] bg-[#FAFAFA] text-[#676565] hover:border-[#D0D0D0]"
                }`}
              >
                {t(FILTER_LABEL_KEYS[filter])}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                formatTime={(isoDate) => formatNotificationTime(isoDate, t)}
              />
            ))
          ) : (
            <div className="rounded-[5px] border border-[#EEEEEE] bg-[#F5F5F5] p-8 text-center">
              <p className="text-sm font-medium font-satoshi text-[#676565]">
                {t("vendor.notifications.empty")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  formatTime,
}: {
  notification: VendorNotification;
  onMarkRead: (id: string) => void;
  formatTime: (isoDate: string) => string;
}) {
  const t = useTranslation();
  const Icon = TYPE_ICONS[notification.type];

  const content = (
    <article
      className={`rounded-[5px] border p-4 transition-colors ${
        notification.read
          ? "border-[#EEEEEE] bg-[#FAFAFA]"
          : "border-[#D85A30]/30 bg-[#FFF9F6]"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TYPE_STYLES[notification.type]}`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {t(notification.titleKey)}
                </h4>
                {!notification.read ? (
                  <span className="h-2 w-2 rounded-full bg-[#D85A30]" />
                ) : null}
              </div>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {t(notification.messageKey)}
              </p>
            </div>

            <span
              className={`shrink-0 self-start rounded-full px-2.5 py-1 text-[11px] font-semibold font-satoshi ${TYPE_STYLES[notification.type]}`}
            >
              {t(TYPE_LABEL_KEYS[notification.type])}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <time
              dateTime={notification.createdAt}
              className="text-xs font-medium font-satoshi text-[#676565]"
            >
              {formatTime(notification.createdAt)}
            </time>

            {!notification.read ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onMarkRead(notification.id);
                }}
                className="text-xs font-semibold font-satoshi text-[#135391] hover:underline"
              >
                {t("vendor.notifications.markRead")}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        onClick={() => onMarkRead(notification.id)}
        className="block rounded-[5px] transition-opacity hover:opacity-95"
      >
        {content}
      </Link>
    );
  }

  return content;
}
