"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotificationPeriod,
  type AccountNotification,
  type AccountNotificationKind,
  type NotificationIconType,
} from "@/features/account/data/account-notifications";
import {
  listMyNotifications,
  markNotificationRead as markReadApi,
  type UserNotificationApi,
} from "@/lib/api/users";

const KNOWN_KINDS: AccountNotificationKind[] = [
  "booking_confirmation",
  "reminder_24h",
  "review_request",
  "cancellation_refund",
  "info",
];

const KIND_ICON: Record<AccountNotificationKind, NotificationIconType> = {
  booking_confirmation: "experience",
  reminder_24h: "reminder",
  review_request: "review",
  cancellation_refund: "cancellation",
  info: "info",
};

function toKind(type: string): AccountNotificationKind {
  return (KNOWN_KINDS as string[]).includes(type)
    ? (type as AccountNotificationKind)
    : "info";
}

function toAccountNotification(n: UserNotificationApi): AccountNotification {
  const kind = toKind(n.type);
  const created = new Date(n.createdAt);
  return {
    id: n.id,
    kind,
    period: getNotificationPeriod(n.createdAt),
    icon: KIND_ICON[kind],
    // titleKey/messageKey are placeholders — title + message (raw) override them.
    titleKey: "account.notifications.title",
    title: n.title,
    messageKey: "account.notifications.title",
    message: [{ type: "text", value: n.message }],
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(created),
    date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
      .format(created)
      .toUpperCase(),
    href: n.href ?? undefined,
    read: n.read,
    createdAt: n.createdAt,
  };
}

// The account notifications feed, backed by the customer's real
// user_notifications (booking confirmations/declines, platform messages).
export function useAccountNotifications() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["account-notifications"],
    queryFn: () => listMyNotifications(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const notifications = useMemo(() => data.map(toAccountNotification), [data]);

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!token) return;
      try {
        await markReadApi(token, notificationId);
      } finally {
        queryClient.invalidateQueries({ queryKey: ["account-notifications"] });
      }
    },
    [token, queryClient],
  );

  const ready = token ? !isLoading : true;

  return {
    ready,
    notifications,
    markRead,
  };
}
