import type { TranslationKey } from "@/lib/preferences/translations";

export type VendorDocumentStatus =
  | "verified"
  | "rejected"
  | "pending"
  | "not_uploaded";

export type VendorVehicleDocumentType =
  | "insurance"
  | "roadworthiness"
  | "ownership";

export type VendorBusinessDocument = {
  id: string;
  nameKey: TranslationKey;
  fileName: string;
  uploadedAt: string;
  reference?: string;
  status: "verified";
};

export type VendorVehicleDocument = {
  id: string;
  type: VendorVehicleDocumentType;
  status: VendorDocumentStatus;
  fileName?: string;
  uploadedAt?: string;
  rejectionReasonKey?: TranslationKey;
};

export type VendorVehicleListingDocuments = {
  id: string;
  vehicleName: string;
  plateNumber: string;
  documents: VendorVehicleDocument[];
};

export const VENDOR_BUSINESS_DOCUMENT: VendorBusinessDocument = {
  id: "business-cac",
  nameKey: "vendor.businessProfile.documents.business.cac",
  fileName: "CAC-RC-1487523.pdf",
  uploadedAt: "2026-07-14T10:00:00",
  reference: "CAC-RC-1487523",
  status: "verified",
};

export const VENDOR_VEHICLE_LISTING_DOCUMENTS: VendorVehicleListingDocuments[] =
  [
    {
      id: "vehicle-1",
      vehicleName: "Toyota Camry 2021",
      plateNumber: "LAG-482-BK",
      documents: [
        {
          id: "v1-insurance",
          type: "insurance",
          status: "verified",
          fileName: "camry-insurance-2026.pdf",
          uploadedAt: "2026-07-10T09:00:00",
        },
        {
          id: "v1-roadworthiness",
          type: "roadworthiness",
          status: "verified",
          fileName: "camry-roadworthiness.pdf",
          uploadedAt: "2026-07-10T09:05:00",
        },
        {
          id: "v1-ownership",
          type: "ownership",
          status: "verified",
          fileName: "camry-ownership.pdf",
          uploadedAt: "2026-07-10T09:10:00",
        },
      ],
    },
    {
      id: "vehicle-2",
      vehicleName: "Honda Accord 2019",
      plateNumber: "ABJ-771-KD",
      documents: [
        {
          id: "v2-insurance",
          type: "insurance",
          status: "verified",
          fileName: "accord-insurance-2026.pdf",
          uploadedAt: "2026-07-08T11:00:00",
        },
        {
          id: "v2-roadworthiness",
          type: "roadworthiness",
          status: "verified",
          fileName: "accord-roadworthiness.pdf",
          uploadedAt: "2026-07-08T11:05:00",
        },
        {
          id: "v2-ownership",
          type: "ownership",
          status: "rejected",
          rejectionReasonKey:
            "vendor.businessProfile.documents.rejection.plateMismatch",
        },
      ],
    },
    {
      id: "vehicle-3",
      vehicleName: "Kia Rio 2020",
      plateNumber: "EN-219-XY",
      documents: [
        { id: "v3-insurance", type: "insurance", status: "not_uploaded" },
        { id: "v3-roadworthiness", type: "roadworthiness", status: "not_uploaded" },
        { id: "v3-ownership", type: "ownership", status: "not_uploaded" },
      ],
    },
  ];

export const VENDOR_VEHICLE_DOCUMENT_TYPES: VendorVehicleDocumentType[] = [
  "insurance",
  "roadworthiness",
  "ownership",
];

export function formatVendorDocumentDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function getVerifiedDocumentCount(documents: VendorVehicleDocument[]) {
  return documents.filter((document) => document.status === "verified").length;
}

export type VendorListingDocumentSummary = {
  verifiedCount: number;
  totalCount: number;
  listingStatus: "all_verified" | "action_needed" | "not_started" | "in_progress";
  rejectedDocument?: VendorVehicleDocument;
};

export function summarizeListingDocuments(
  documents: VendorVehicleDocument[],
): VendorListingDocumentSummary {
  const verifiedCount = getVerifiedDocumentCount(documents);
  const totalCount = documents.length;
  const rejectedDocument = documents.find(
    (document) => document.status === "rejected",
  );

  if (verifiedCount === 0) {
    return {
      verifiedCount,
      totalCount,
      listingStatus: "not_started",
      rejectedDocument,
    };
  }

  if (verifiedCount === totalCount) {
    return {
      verifiedCount,
      totalCount,
      listingStatus: "all_verified",
      rejectedDocument,
    };
  }

  if (rejectedDocument) {
    return {
      verifiedCount,
      totalCount,
      listingStatus: "action_needed",
      rejectedDocument,
    };
  }

  return {
    verifiedCount,
    totalCount,
    listingStatus: "in_progress",
    rejectedDocument,
  };
}
