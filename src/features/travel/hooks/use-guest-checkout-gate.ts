"use client";

import { useCallback, useState } from "react";

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

export function useGuestCheckoutGate(
  guestCount: number,
  options?: { leadGuestOnly?: boolean },
) {
  // When leadGuestOnly is set we only ever collect and validate a single
  // (lead) guest's details, regardless of how many guests the booking is for.
  const identityCount = options?.leadGuestOnly ? 1 : guestCount;

  const [identities, setIdentities] = useState<GuestIdentity[]>(() =>
    Array.from({ length: Math.max(1, identityCount) }, createEmptyGuestIdentity),
  );
  const [identityErrors, setIdentityErrors] = useState<GuestIdentityErrors[]>(
    [],
  );
  const [lastCount, setLastCount] = useState(identityCount);

  // Reconcile the identities array with the current guest count during render
  // (React's recommended pattern) rather than in an effect, which avoids a
  // cascading extra render on every count change.
  if (lastCount !== identityCount) {
    setLastCount(identityCount);
    setIdentities((previous) => resizeIdentities(previous, identityCount));
    setIdentityErrors([]);
  }

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
