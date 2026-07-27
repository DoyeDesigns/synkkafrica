import type { TranslationKey } from "@/lib/preferences/translations";

export type VerificationAudience = "user" | "vendor";

export type VerificationStatus = "pending" | "approved" | "denied";

export type VerificationCheckResult = "passed" | "failed" | "warning";

export type VerificationDocumentPreview = {
  id: string;
  labelKey:
    | "admin.verifications.document.passportPhoto"
    | "admin.verifications.document.selfie"
    | "admin.verifications.document.cac"
    | "admin.verifications.document.ninSlip"
    | "admin.verifications.document.driversLicense";
};

export type VerificationProviderCheck = {
  id: string;
  labelKey:
    | "admin.verifications.check.documentAuthenticity"
    | "admin.verifications.check.liveness"
    | "admin.verifications.check.faceMatch"
    | "admin.verifications.check.faceMatchConfidence"
    | "admin.verifications.check.nameMatch"
    | "admin.verifications.check.businessRegistration"
    | "admin.verifications.check.cacRegistrationLookup";
  result: VerificationCheckResult;
  detailKey?: TranslationKey;
};

export type AdminVerification = {
  id: string;
  accountId: string;
  name: string;
  audience: VerificationAudience;
  documentTypeKey:
    | "admin.verifications.documentType.passport"
    | "admin.verifications.documentType.cacNin"
    | "admin.verifications.documentType.driversLicense";
  submittedAt: string;
  status: VerificationStatus;
  pendingElapsed?: string;
  reviewedElapsed?: string;
  approvedByAt?: string;
  denialReasonKey?: TranslationKey;
  blockingMessageKey?: "admin.verifications.blocking.firstCheckout";
  documentPreviews: VerificationDocumentPreview[];
  providerResults: VerificationProviderCheck[];
  accountHref: string;
};

export type VerificationListFilter =
  | "all"
  | "users"
  | "vendors"
  | "pending"
  | "approved"
  | "denied";

export const VERIFICATION_LIST_FILTERS: VerificationListFilter[] = [
  "all",
  "users",
  "vendors",
  "pending",
  "approved",
  "denied",
];

export const ADMIN_VERIFICATION_STATS = {
  needsManualReview: 3,
  approvedToday: 14,
  deniedToday: 2,
  avgReviewTimeMinutes: 38,
};

export const ADMIN_VERIFICATIONS: AdminVerification[] = [
  {
    id: "ver-1",
    accountId: "USR-08813",
    name: "Amara Chukwu",
    audience: "user",
    documentTypeKey: "admin.verifications.documentType.passport",
    submittedAt: "2026-07-21T16:02:00.000Z",
    status: "pending",
    pendingElapsed: "2h 15m",
    blockingMessageKey: "admin.verifications.blocking.firstCheckout",
    documentPreviews: [
      { id: "doc-1", labelKey: "admin.verifications.document.passportPhoto" },
      { id: "doc-2", labelKey: "admin.verifications.document.selfie" },
    ],
    providerResults: [
      {
        id: "check-1",
        labelKey: "admin.verifications.check.documentAuthenticity",
        result: "passed",
      },
      {
        id: "check-2",
        labelKey: "admin.verifications.check.liveness",
        result: "passed",
      },
      {
        id: "check-3",
        labelKey: "admin.verifications.check.faceMatch",
        result: "warning",
        detailKey: "admin.verifications.check.faceMatchDetail",
      },
      {
        id: "check-4",
        labelKey: "admin.verifications.check.nameMatch",
        result: "passed",
        detailKey: "admin.verifications.check.nameMatchDetail",
      },
    ],
    accountHref: "/admin/users",
  },
  {
    id: "ver-2",
    accountId: "VND-00227",
    name: "Coastal Trails NG",
    audience: "vendor",
    documentTypeKey: "admin.verifications.documentType.cacNin",
    submittedAt: "2026-07-20T11:20:00.000Z",
    status: "approved",
    reviewedElapsed: "24 min",
    approvedByAt: "2026-07-20T11:44:00.000Z",
    documentPreviews: [
      { id: "doc-3", labelKey: "admin.verifications.document.ninSlip" },
      { id: "doc-4", labelKey: "admin.verifications.document.cac" },
    ],
    providerResults: [
      {
        id: "check-6",
        labelKey: "admin.verifications.check.documentAuthenticity",
        result: "passed",
      },
      {
        id: "check-5",
        labelKey: "admin.verifications.check.cacRegistrationLookup",
        result: "passed",
        detailKey: "admin.verifications.check.cacRegistrationVerified",
      },
      {
        id: "check-7",
        labelKey: "admin.verifications.check.nameMatch",
        result: "passed",
        detailKey: "admin.verifications.check.nameMatchDetail",
      },
    ],
    accountHref: "/admin/vendors",
  },
  {
    id: "ver-3",
    accountId: "USR-09102",
    name: "Kofi Mensah",
    audience: "user",
    documentTypeKey: "admin.verifications.documentType.driversLicense",
    submittedAt: "2026-07-19T09:40:00.000Z",
    status: "denied",
    reviewedElapsed: "51 min",
    denialReasonKey: "admin.verifications.denialReason.expiredLicense",
    documentPreviews: [
      {
        id: "doc-5",
        labelKey: "admin.verifications.document.driversLicense",
      },
      { id: "doc-6", labelKey: "admin.verifications.document.selfie" },
    ],
    providerResults: [
      {
        id: "check-8",
        labelKey: "admin.verifications.check.documentAuthenticity",
        result: "failed",
        detailKey: "admin.verifications.check.documentExpiredDetail",
      },
      {
        id: "check-9",
        labelKey: "admin.verifications.check.liveness",
        result: "passed",
      },
      {
        id: "check-10",
        labelKey: "admin.verifications.check.faceMatchConfidence",
        result: "passed",
        detailKey: "admin.verifications.check.faceMatchConfidenceDetail",
      },
    ],
    accountHref: "/admin/users",
  },
  {
    id: "ver-4",
    accountId: "VND-00318",
    name: "Alex Autos",
    audience: "vendor",
    documentTypeKey: "admin.verifications.documentType.cacNin",
    submittedAt: "2026-07-21T08:15:00.000Z",
    status: "pending",
    pendingElapsed: "45m",
    documentPreviews: [
      { id: "doc-7", labelKey: "admin.verifications.document.cac" },
      { id: "doc-8", labelKey: "admin.verifications.document.selfie" },
    ],
    providerResults: [
      {
        id: "check-11",
        labelKey: "admin.verifications.check.businessRegistration",
        result: "warning",
        detailKey: "admin.verifications.check.businessRegistrationDetail",
      },
      {
        id: "check-12",
        labelKey: "admin.verifications.check.documentAuthenticity",
        result: "passed",
      },
    ],
    accountHref: "/admin/vendors",
  },
];

export function formatVerificationSubmittedAt(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatVerificationReviewedAt(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function filterAdminVerifications(
  verifications: AdminVerification[],
  listFilter: VerificationListFilter,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return verifications.filter((verification) => {
    const matchesFilter = (() => {
      switch (listFilter) {
        case "all":
          return true;
        case "users":
          return verification.audience === "user";
        case "vendors":
          return verification.audience === "vendor";
        case "pending":
          return verification.status === "pending";
        case "approved":
          return verification.status === "approved";
        case "denied":
          return verification.status === "denied";
      }
    })();

    const matchesQuery =
      normalizedQuery.length === 0 ||
      verification.name.toLowerCase().includes(normalizedQuery) ||
      verification.accountId.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });
}
