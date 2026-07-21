"use client";

import {
  buildNotificationsFromBookings,
  createSeedNotifications,
  mergeAccountNotifications,
  type AccountNotification,
} from "@/features/account/data/account-notifications";
import { loadUserBookings } from "@/features/account/data/account-bookings-store";

const STORAGE_PREFIX = "synk-account-notifications";

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readStoredNotifications(userId: string): AccountNotification[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(getStorageKey(userId));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AccountNotification[];
  } catch {
    return null;
  }
}

function writeStoredNotifications(userId: string, notifications: AccountNotification[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(notifications));
}

export function loadUserNotifications(
  userId: string,
  userEmail: string,
): AccountNotification[] {
  const bookings = loadUserBookings(userId, userEmail);
  const fromBookings = buildNotificationsFromBookings(bookings);
  const seed = createSeedNotifications();
  const merged = mergeAccountNotifications(seed, fromBookings);
  writeStoredNotifications(userId, merged);
  return merged;
}

export function markNotificationRead(
  userId: string,
  userEmail: string,
  notificationId: string,
): AccountNotification[] {
  const notifications = loadUserNotifications(userId, userEmail);
  const next = notifications.map((notification) =>
    notification.id === notificationId
      ? { ...notification, read: true }
      : notification,
  );
  writeStoredNotifications(userId, next);
  return next;
}
