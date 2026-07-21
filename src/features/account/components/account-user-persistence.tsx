"use client";

import { useEffect } from "react";

import { rememberActiveAccountUser } from "@/features/account/data/account-bookings-store";

type AccountUserPersistenceProps = {
  userId: string;
  userEmail: string;
};

export function AccountUserPersistence({
  userId,
  userEmail,
}: AccountUserPersistenceProps) {
  useEffect(() => {
    rememberActiveAccountUser(userId, userEmail);
  }, [userId, userEmail]);

  return null;
}
