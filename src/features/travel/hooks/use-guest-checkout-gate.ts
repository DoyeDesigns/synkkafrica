"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createEmptyGuestIdentity,
  validateGuestIdentities,
  type GuestIdentity,
  type GuestIdentityErrors,
} from "@/features/travel/booking/guest-identity";

function resizeIdentities(
  previous: GuestIdentity[],
  count: number,
): GuestIdentity[] {
  const safeCount = Math.max(1, count);

  if (previous.length === safeCount) {
    return previous;
  }

  if (previous.length < safeCount) {
    return [
      ...previous,
      ...Array.from(
        { length: safeCount - previous.length },
        createEmptyGuestIdentity,
      ),
    ];
  }

  return previous.slice(0, safeCount);
}

export function useGuestCheckoutGate(guestCount: number) {
  const [identities, setIdentities] = useState<GuestIdentity[]>(() =>
    Array.from({ length: Math.max(1, guestCount) }, createEmptyGuestIdentity),
  );
  const [identityErrors, setIdentityErrors] = useState<GuestIdentityErrors[]>(
    [],
  );

  useEffect(() => {
    setIdentities((previous) => resizeIdentities(previous, guestCount));
    setIdentityErrors([]);
  }, [guestCount]);

  const setIdentityAt = useCallback((index: number, identity: GuestIdentity) => {
    setIdentities((previous) => {
      const next = [...previous];
      next[index] = identity;
      return next;
    });
  }, []);

  const guardProceed = (onProceed: () => void) => {
    const validation = validateGuestIdentities(identities);

    if (!validation.isValid) {
      setIdentityErrors(validation.errors);
      return;
    }

    setIdentityErrors([]);
    onProceed();
  };

  const hasIdentityErrors = identityErrors.some(
    (errors) => Object.keys(errors).length > 0,
  );

  return {
    identities,
    setIdentityAt,
    identityErrors,
    hasIdentityErrors,
    guardProceed,
  };
}
