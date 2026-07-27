"use client";

import { useState } from "react";

import {
  createEmptyGuestIdentity,
  validateGuestIdentity,
  type GuestIdentity,
  type GuestIdentityErrors,
} from "@/features/travel/booking/guest-identity";

export function useGuestCheckoutGate() {
  const [identity, setIdentity] = useState<GuestIdentity>(createEmptyGuestIdentity);
  const [identityErrors, setIdentityErrors] = useState<GuestIdentityErrors>({});

  const guardProceed = (onProceed: () => void) => {
    const validation = validateGuestIdentity(identity);

    if (!validation.isValid) {
      setIdentityErrors(validation.errors);
      return;
    }

    setIdentityErrors({});
    onProceed();
  };

  return {
    identity,
    setIdentity,
    identityErrors,
    guardProceed,
  };
}
