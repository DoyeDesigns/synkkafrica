"use client";

import { useCallback, useEffect, useState } from "react";

import {
  loadUserNotifications,
  markNotificationRead,
} from "@/features/account/data/account-notifications-store";
import type { AccountNotification } from "@/features/account/data/account-notifications";
import { rememberActiveAccountUser } from "@/features/account/data/account-bookings-store";

export function useAccountNotifications(userId: string, userEmail: string) {
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    rememberActiveAccountUser(userId, userEmail);
    setNotifications(loadUserNotifications(userId, userEmail));
  }, [userId, userEmail]);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const markRead = useCallback(
    (notificationId: string) => {
      const next = markNotificationRead(userId, userEmail, notificationId);
      setNotifications(next);
    },
    [userEmail, userId],
  );

  return {
    ready,
    notifications,
    markRead,
    refresh,
  };
}
