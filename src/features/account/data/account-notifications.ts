import type { TranslationKey } from "@/lib/preferences/translations";
import type { AccountBooking } from "@/features/account/data/account-bookings";
import {
  getBookingExperienceDateTime,
  isPastBooking,
  isUpcomingBooking,
} from "@/features/account/data/account-bookings";

export type NotificationPeriod = "most-recent" | "week-earlier" | "three-months-ago";

export type NotificationIconType =
  | "flight"
  | "info"
  | "experience"
  | "reminder"
  | "review"
  | "cancellation";

export type AccountNotificationKind =
  | "booking_confirmation"
  | "reminder_24h"
  | "review_request"
  | "cancellation_refund"
  | "info";

export type NotificationMessagePart =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href?: string };

export type AccountNotification = {
  id: string;
  kind: AccountNotificationKind;
  period: NotificationPeriod;
  icon: NotificationIconType;
  titleKey: TranslationKey;
  // Raw title from the backend feed; overrides `titleKey` when present.
  title?: string;
  messageKey: TranslationKey;
  messageParams?: Record<string, string | number>;
  message?: NotificationMessagePart[];
  time: string;
  date?: string;
  href?: string;
  read?: boolean;
  createdAt: string;
};

export const NOTIFICATION_PERIOD_ORDER: NotificationPeriod[] = [
  "most-recent",
  "week-earlier",
  "three-months-ago",
];

function formatNotificationTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatNotificationDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  })
    .format(date)
    .toUpperCase();
}

function isWithin24Hours(booking: AccountBooking, now = new Date()) {
  if (!isUpcomingBooking(booking, now)) {
    return false;
  }

  const experienceAt = getBookingExperienceDateTime(booking).getTime();
  const diff = experienceAt - now.getTime();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

export function buildNotificationsFromBookings(
  bookings: AccountBooking[],
): AccountNotification[] {
  const now = new Date();
  const generated: AccountNotification[] = [];

  for (const booking of bookings) {
    if (booking.status === "cancelled") {
      generated.push({
        id: `cancel-${booking.id}`,
        kind: "cancellation_refund",
        period: "most-recent",
        icon: "cancellation",
        titleKey: "account.notifications.title.cancellationRefund",
        messageKey: "account.notifications.message.cancellationRefund",
        messageParams: {
          title: booking.title,
          reference: booking.orderNumber,
        },
        time: formatNotificationTime(now),
        date: booking.cancelledAt?.toUpperCase(),
        href: `/account/bookings/${booking.id}`,
        read: false,
        createdAt: now.toISOString(),
      });
      continue;
    }

    if (isWithin24Hours(booking, now)) {
      generated.push({
        id: `reminder-${booking.id}`,
        kind: "reminder_24h",
        period: "most-recent",
        icon: "reminder",
        titleKey: "account.notifications.title.reminder24h",
        messageKey: "account.notifications.message.reminder24h",
        messageParams: {
          title: booking.title,
          time: booking.experienceTime ?? "09:00",
          date: booking.experienceDate,
        },
        time: formatNotificationTime(now),
        href: `/account/bookings/${booking.id}`,
        read: false,
        createdAt: now.toISOString(),
      });
    }

    if (isPastBooking(booking, now) && !booking.reviewSubmitted) {
      generated.push({
        id: `review-${booking.id}`,
        kind: "review_request",
        period: "most-recent",
        icon: "review",
        titleKey: "account.notifications.title.reviewRequest",
        messageKey: "account.notifications.message.reviewRequest",
        messageParams: {
          title: booking.title,
        },
        time: formatNotificationTime(now),
        date: formatNotificationDate(getBookingExperienceDateTime(booking)),
        href: "/account/reviews",
        read: false,
        createdAt: now.toISOString(),
      });
    }
  }

  return generated;
}

export function createSeedNotifications(): AccountNotification[] {
  const now = new Date();

  return [
    {
      id: "seed-reminder-24h",
      kind: "reminder_24h",
      period: "most-recent",
      icon: "reminder",
      titleKey: "account.notifications.title.reminder24h",
      messageKey: "account.notifications.message.reminder24h",
      messageParams: {
        title: "Tarkwa Bay Tour",
        time: "09:00",
        date: "Jul 26, 2026",
      },
      time: "8:00 AM",
      href: "/account/bookings/booking-upcoming-1",
      read: false,
      createdAt: now.toISOString(),
    },
    {
      id: "seed-review-request",
      kind: "review_request",
      period: "most-recent",
      icon: "review",
      titleKey: "account.notifications.title.reviewRequest",
      messageKey: "account.notifications.message.reviewRequest",
      messageParams: {
        title: "RDPX Paintball Arena",
      },
      time: "11:00 PM",
      date: "JUL 11",
      href: "/account/reviews",
      read: false,
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: "seed-cancellation-refund",
      kind: "cancellation_refund",
      period: "most-recent",
      icon: "cancellation",
      titleKey: "account.notifications.title.cancellationRefund",
      messageKey: "account.notifications.message.cancellationRefund",
      messageParams: {
        title: "Dubai Desert Safari",
        reference: "SYNK-DXB05",
      },
      time: "2:15 PM",
      date: "JUL 03",
      href: "/account/bookings/booking-cancelled-1",
      read: false,
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: "experience-1",
      kind: "booking_confirmation",
      period: "week-earlier",
      icon: "experience",
      titleKey: "account.notifications.title.bookingConfirmation",
      messageKey: "account.notifications.message.bookingConfirmation",
      messageParams: {
        title: "RDPX Paintball Arena",
        location: "Lagos, Nigeria",
      },
      time: "11:00 PM",
      date: "MAY 12",
      href: "/account/bookings/booking-past-1",
      read: true,
      createdAt: "2026-05-12T23:00:00.000Z",
    },
    {
      id: "passport-reminder",
      kind: "info",
      period: "three-months-ago",
      icon: "info",
      titleKey: "account.notifications.title.info",
      messageKey: "account.notifications.message.passportReminder",
      time: "2:15 PM",
      date: "FEB 18",
      read: true,
      createdAt: "2026-02-18T14:15:00.000Z",
    },
  ];
}

export function getNotificationPeriod(
  createdAt: string,
  now = new Date(),
): NotificationPeriod {
  const created = new Date(createdAt);
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays <= 7) {
    return "most-recent";
  }

  if (diffDays <= 30) {
    return "week-earlier";
  }

  return "three-months-ago";
}

export function groupNotificationsByPeriod(
  notifications: AccountNotification[],
): Record<NotificationPeriod, AccountNotification[]> {
  return {
    "most-recent": notifications.filter((item) => item.period === "most-recent"),
    "week-earlier": notifications.filter((item) => item.period === "week-earlier"),
    "three-months-ago": notifications.filter(
      (item) => item.period === "three-months-ago",
    ),
  };
}

export function mergeAccountNotifications(
  seed: AccountNotification[],
  fromBookings: AccountNotification[],
): AccountNotification[] {
  const filteredSeed = seed.filter((item) => {
    if (!item.id.startsWith("seed-")) {
      return true;
    }

    if (
      item.kind === "cancellation_refund" &&
      fromBookings.some((notification) => notification.kind === "cancellation_refund")
    ) {
      return false;
    }

    if (
      item.kind === "review_request" &&
      fromBookings.some((notification) => notification.kind === "review_request")
    ) {
      return false;
    }

    if (
      item.kind === "reminder_24h" &&
      fromBookings.some((notification) => notification.kind === "reminder_24h")
    ) {
      return false;
    }

    return true;
  });

  const deduped = new Map<string, AccountNotification>();

  for (const notification of [...fromBookings, ...filteredSeed]) {
    deduped.set(notification.id, notification);
  }

  return Array.from(deduped.values())
    .map((notification) => ({
      ...notification,
      period: getNotificationPeriod(notification.createdAt),
    }))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}
