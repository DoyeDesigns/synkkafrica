"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { VendorVerificationStatus } from "@/features/vendor/constants";

const VendorVerificationContext =
  createContext<VendorVerificationStatus>("verified");

export function VendorVerificationProvider({
  status,
  children,
}: {
  status: VendorVerificationStatus;
  children: ReactNode;
}) {
  return (
    <VendorVerificationContext.Provider value={status}>
      {children}
    </VendorVerificationContext.Provider>
  );
}

export function useVendorVerificationStatus() {
  return useContext(VendorVerificationContext);
}
