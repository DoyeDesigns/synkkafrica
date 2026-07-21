export type VendorPayoutBankId = "gtbank" | "access" | "zenith" | "firstbank";

export type VendorBusinessProfile = {
  internalBusinessName: string;
  contactPhone: string;
  contactEmail: string;
  businessAddress: string;
  payoutBankId: VendorPayoutBankId;
  payoutAccountNumber: string;
  payoutAccountName: string;
};

export const VENDOR_PAYOUT_BANK_OPTIONS: Array<{
  id: VendorPayoutBankId;
  labelKey:
    | "vendor.earnings.bank.gtbank"
    | "vendor.earnings.bank.access"
    | "vendor.businessProfile.bank.zenith"
    | "vendor.businessProfile.bank.firstBank";
}> = [
  { id: "gtbank", labelKey: "vendor.earnings.bank.gtbank" },
  { id: "access", labelKey: "vendor.earnings.bank.access" },
  { id: "zenith", labelKey: "vendor.businessProfile.bank.zenith" },
  { id: "firstbank", labelKey: "vendor.businessProfile.bank.firstBank" },
];

export function createDefaultVendorBusinessProfile(
  overrides?: Partial<VendorBusinessProfile>,
): VendorBusinessProfile {
  return {
    internalBusinessName: "Alex Autos Experiences Ltd",
    contactPhone: "+234 801 234 5678",
    contactEmail: "alex@alexautos.ng",
    businessAddress: "12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
    payoutBankId: "gtbank",
    payoutAccountNumber: "0123454521",
    payoutAccountName: "Alex Autos Experiences Ltd",
    ...overrides,
  };
}

export const DEFAULT_VENDOR_BUSINESS_PROFILE =
  createDefaultVendorBusinessProfile();

export function maskAccountNumber(accountNumber: string) {
  const trimmed = accountNumber.replace(/\s/g, "");
  if (trimmed.length <= 4) {
    return trimmed;
  }

  return `****${trimmed.slice(-4)}`;
}
