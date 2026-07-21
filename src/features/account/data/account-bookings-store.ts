"use client";

import type { StoredBookingConfirmation } from "@/features/travel/booking/booking-confirmation";
import {
  confirmationToAccountBooking,
  createSeedBookings,
  refreshBookingStatuses,
  type AccountBooking,
  type AccountBookingReview,
} from "@/features/account/data/account-bookings";

const STORAGE_PREFIX = "synk-account-bookings";

const ACTIVE_USER_KEY = "synk-active-user-id";
const ACTIVE_USER_EMAIL_KEY = "synk-active-user-email";

export function rememberActiveAccountUser(userId: string, userEmail: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACTIVE_USER_KEY, userId);
  localStorage.setItem(ACTIVE_USER_EMAIL_KEY, userEmail);
}

export function getRememberedAccountUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const userId = localStorage.getItem(ACTIVE_USER_KEY);
  const userEmail = localStorage.getItem(ACTIVE_USER_EMAIL_KEY);

  if (!userId || !userEmail) {
    return null;
  }

  return { userId, userEmail };
}

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readStoredBookings(userId: string): AccountBooking[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(getStorageKey(userId));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AccountBooking[];
  } catch {
    return null;
  }
}

function writeStoredBookings(userId: string, bookings: AccountBooking[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(bookings));
}

export function loadUserBookings(userId: string, userEmail: string): AccountBooking[] {
  const stored = readStoredBookings(userId);

  if (stored && stored.length > 0) {
    return refreshBookingStatuses(stored);
  }

  const seed = createSeedBookings(userId, userEmail);
  writeStoredBookings(userId, seed);
  return seed;
}

export function saveUserBookings(userId: string, bookings: AccountBooking[]) {
  writeStoredBookings(userId, refreshBookingStatuses(bookings));
}

export function syncConfirmationToUserBookings(
  userId: string,
  userEmail: string,
  confirmation: StoredBookingConfirmation,
): AccountBooking[] {
  const bookings = loadUserBookings(userId, userEmail);
  const nextBooking = confirmationToAccountBooking(userId, userEmail, confirmation);
  const exists = bookings.some((booking) => booking.orderNumber === nextBooking.orderNumber);

  if (exists) {
    return bookings;
  }

  const next = refreshBookingStatuses([nextBooking, ...bookings]);
  saveUserBookings(userId, next);
  return next;
}

export function cancelUserBooking(
  userId: string,
  userEmail: string,
  bookingId: string,
): AccountBooking[] {
  const bookings = loadUserBookings(userId, userEmail);
  const nowLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const next = bookings.map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          status: "cancelled" as const,
          cancelledAt: nowLabel,
        }
      : booking,
  );

  saveUserBookings(userId, next);
  return refreshBookingStatuses(next);
}

export function submitUserBookingReview(
  userId: string,
  userEmail: string,
  bookingId: string,
  review: Omit<AccountBookingReview, "submittedAt">,
): AccountBooking[] {
  const bookings = loadUserBookings(userId, userEmail);
  const submittedAt = new Date().toISOString().split("T")[0] ?? "";

  const next = bookings.map((booking) =>
    booking.id === bookingId
      ? {
          ...booking,
          reviewSubmitted: true,
          userReview: {
            ...review,
            submittedAt,
          },
        }
      : booking,
  );

  saveUserBookings(userId, next);
  return next;
}

export function getUserBookingById(
  userId: string,
  userEmail: string,
  bookingId: string,
): AccountBooking | null {
  return loadUserBookings(userId, userEmail).find((booking) => booking.id === bookingId) ?? null;
}
