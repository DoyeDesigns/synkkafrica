import {
  EXPERIENCE_WEEKDAYS,
  type ExperienceScheduleMode,
  type ExperienceWeekday,
} from "@/features/vendor/data/experience-listing";
import type { TranslationKey } from "@/lib/preferences/translations";

export type ListingCategory = "cars" | "accommodations" | "experiences";

export type AddListingStepId = "details" | "media" | "pricing" | "documents" | "review";

export const ADD_LISTING_STEPS: AddListingStepId[] = [
  "details",
  "media",
  "pricing",
  "documents",
  "review",
];

export type CarTransmission = "automatic" | "manual";

export type ListingMediaKind = "image" | "video";

export type ListingMediaUploadStatus = "uploading" | "uploaded" | "error";

export type ListingMediaItem = {
  id: string;
  name: string;
  previewUrl: string;
  kind: ListingMediaKind;
  // The stored URL once the direct-to-storage upload completes. Persisted with
  // the listing (media[].url + coverImageUrl); undefined while uploading/failed.
  url?: string;
  status: ListingMediaUploadStatus;
};

export const LISTING_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const LISTING_MEDIA_MAX_COUNT = 8;

export const LISTING_MEDIA_ACCEPT =
  "image/png,image/jpeg,image/webp,video/mp4,.png,.jpg,.jpeg,.webp,.mp4";

// Only formats a browser can actually render in <img>/<video>. Note HEIC —
// the default format for iPhone photos — reports MIME `image/heic`, which
// passes a naive `startsWith("image/")` check but cannot be previewed or
// uploaded, so it must be treated as unsupported (with a clear message).
const RENDERABLE_IMAGE_MIME = /^image\/(png|jpe?g|webp)$/i;
const RENDERABLE_IMAGE_EXT = /\.(png|jpe?g|webp)$/i;

export type ListingMediaRejectionReason = "unsupported" | "too_large";

function isRenderableImage(file: File): boolean {
  return RENDERABLE_IMAGE_MIME.test(file.type) || RENDERABLE_IMAGE_EXT.test(file.name);
}

function isSupportedVideo(file: File): boolean {
  return file.type === "video/mp4" || /\.mp4$/i.test(file.name);
}

// Returns why a file can't be added, or null if it's acceptable. The UI uses
// this to tell the vendor which files were skipped (instead of dropping them
// silently, which reads as "nothing happened when I selected images").
export function getListingMediaRejection(
  file: File,
): ListingMediaRejectionReason | null {
  if (!isRenderableImage(file) && !isSupportedVideo(file)) {
    return "unsupported";
  }
  if (file.size > LISTING_MEDIA_MAX_BYTES) {
    return "too_large";
  }
  return null;
}

function makeMediaId(): string {
  // crypto.randomUUID needs a secure context; fall back so a non-secure host
  // (LAN IP, custom hostname) can't make file selection throw and no-op.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `media-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createListingMediaItem(file: File): ListingMediaItem | null {
  if (getListingMediaRejection(file) !== null) {
    return null;
  }

  return {
    id: makeMediaId(),
    name: file.name,
    previewUrl: URL.createObjectURL(file),
    kind: isSupportedVideo(file) ? "video" : "image",
    // Upload kicks off immediately after the item is added; url fills in then.
    status: "uploading",
  };
}

export function revokeListingMediaItem(item: ListingMediaItem) {
  // Only object URLs need revoking — a persisted storage URL (restored on
  // resume) is a normal https URL and must not be touched.
  if (item.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(item.previewUrl);
  }
}

export type ListingDocumentUpload = {
  name: string;
  previewUrl?: string;
  // The actual file (undefined for docs restored from a saved draft).
  file?: File;
  // Uploaded to storage immediately on select (no listing id needed for the
  // upload itself). On publish only the metadata is attached — fast.
  objectPath?: string;
  status?: "uploading" | "uploaded" | "error";
};

export function createListingDocumentUpload(file: File): ListingDocumentUpload {
  const isImage =
    file.type.startsWith("image/") || /\.(png|jpe?g)$/i.test(file.name);

  return {
    name: file.name,
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
    file,
  };
}

export function revokeListingDocumentUpload(upload: ListingDocumentUpload) {
  if (upload.previewUrl) {
    URL.revokeObjectURL(upload.previewUrl);
  }
}

export type AccommodationRoomType = {
  id: string;
  name: string;
  description: string;
  maxGuests: string;
  pricePerNight: string;
};

export type AccommodationAvailabilityMode = "always" | "date_range";

export type CarHandoverMethod = "client_pickup" | "delivery";

export type ListingDocumentId =
  | "proof_of_ownership"
  | "roadworthiness"
  | "insurance"
  | "cac"
  | "agent_authorization"
  | "agent_proof_of_address"
  | "address_photos";

export type ListingDocumentRequirement = {
  id: ListingDocumentId;
  labelKey: TranslationKey;
  hintKey?: TranslationKey;
  required: boolean;
};

export const LISTING_DOCUMENTS_BY_CATEGORY: Record<
  ListingCategory,
  ListingDocumentRequirement[]
> = {
  cars: [
    {
      id: "cac",
      labelKey: "vendor.addListing.documents.cac",
      hintKey: "vendor.addListing.documents.cacHint",
      required: true,
    },
    {
      id: "proof_of_ownership",
      labelKey: "vendor.addListing.documents.proofOfOwnership",
      hintKey: "vendor.addListing.documents.proofOfOwnershipHint",
      required: false,
    },
    {
      id: "roadworthiness",
      labelKey: "vendor.addListing.documents.roadworthiness",
      hintKey: "vendor.addListing.documents.roadworthinessHint",
      required: false,
    },
    {
      id: "insurance",
      labelKey: "vendor.addListing.documents.insurance",
      hintKey: "vendor.addListing.documents.insuranceHint",
      required: false,
    },
  ],
  accommodations: [
    {
      id: "cac",
      labelKey: "vendor.addListing.documents.cac",
      hintKey: "vendor.addListing.documents.cacHint",
      required: true,
    },
    {
      id: "proof_of_ownership",
      labelKey: "vendor.addListing.documents.proofOfOwnership",
      hintKey: "vendor.addListing.documents.accommodationOwnershipHint",
      required: false,
    },
    {
      id: "agent_authorization",
      labelKey: "vendor.addListing.documents.agentAuthorization",
      hintKey: "vendor.addListing.documents.agentAuthorizationHint",
      required: false,
    },
    {
      id: "agent_proof_of_address",
      labelKey: "vendor.addListing.documents.agentProofOfAddress",
      hintKey: "vendor.addListing.documents.agentProofOfAddressHint",
      required: false,
    },
    {
      id: "address_photos",
      labelKey: "vendor.addListing.documents.addressPhotos",
      hintKey: "vendor.addListing.documents.addressPhotosHint",
      required: false,
    },
  ],
  experiences: [
    {
      id: "cac",
      labelKey: "vendor.addListing.documents.cac",
      hintKey: "vendor.addListing.documents.cacHint",
      required: true,
    },
  ],
};

export type AddListingFormState = {
  category: ListingCategory;
  carName: string;
  carModel: string;
  transmission: CarTransmission;
  year: string;
  comesWithDriver: boolean;
  shortDescription: string;
  perks: string[];
  propertyName: string;
  propertyType: string;
  address: string;
  accommodationMaxGuests: string;
  checkInTime: string;
  checkOutTime: string;
  availabilityMode: AccommodationAvailabilityMode;
  isPropertyOwner: boolean;
  bedrooms: string;
  bathrooms: string;
  accommodationDescription: string;
  amenities: string[];
  experienceName: string;
  experienceType: string;
  location: string;
  duration: string;
  maxGuests: string;
  experienceDescription: string;
  operatingDays: ExperienceWeekday[];
  experienceStartTime: string;
  experienceEndTime: string;
  experienceScheduleMode: ExperienceScheduleMode;
  experienceDateRangeStart: string;
  experienceDateRangeEnd: string;
  includes: string[];
  whatToBring: string[];
  additionalInfo: string;
  mediaItems: ListingMediaItem[];
  pickupAddress: string;
  handoverMethods: CarHandoverMethod[];
  price12hr: string;
  price24hr: string;
  priceMultiDay: string;
  driverAddonPrice: string;
  deliveryFee: string;
  roomTypes: AccommodationRoomType[];
  pricePerPerson: string;
  groupTicketPrice: string;
  minGroupSize: string;
  maxGroupSize: string;
  uploadedDocuments: Partial<Record<ListingDocumentId, ListingDocumentUpload>>;
  gpsAcknowledged: boolean;
};

export const EMPTY_ADD_LISTING_FORM: AddListingFormState = {
  category: "cars",
  carName: "",
  carModel: "",
  transmission: "automatic",
  year: "",
  comesWithDriver: true,
  shortDescription: "",
  perks: [],
  propertyName: "",
  propertyType: "",
  address: "",
  accommodationMaxGuests: "",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  availabilityMode: "always",
  isPropertyOwner: true,
  bedrooms: "",
  bathrooms: "",
  accommodationDescription: "",
  amenities: [],
  experienceName: "",
  experienceType: "",
  location: "",
  duration: "",
  maxGuests: "",
  experienceDescription: "",
  operatingDays: [...EXPERIENCE_WEEKDAYS],
  experienceStartTime: "09:00",
  experienceEndTime: "18:00",
  experienceScheduleMode: "weekly",
  experienceDateRangeStart: "",
  experienceDateRangeEnd: "",
  includes: [],
  whatToBring: [],
  additionalInfo: "",
  mediaItems: [],
  pickupAddress: "",
  handoverMethods: ["client_pickup"],
  price12hr: "",
  price24hr: "",
  priceMultiDay: "",
  driverAddonPrice: "",
  deliveryFee: "",
  roomTypes: [],
  pricePerPerson: "",
  groupTicketPrice: "",
  minGroupSize: "",
  maxGroupSize: "",
  uploadedDocuments: {},
  gpsAcknowledged: false,
};

// Rebuild the wizard form from a persisted listing so a draft can be reopened
// and edited. The backend stores the whole form (minus media/document blobs)
// as opaque `details`, so merging it back over the empty form restores every
// text/pricing/selection field. Media previews can't be restored (blob URLs
// aren't persisted), so they start empty and are re-added if needed.
export function formStateFromListingDetails(
  category: ListingCategory,
  details: Record<string, unknown> | null | undefined,
  media?: unknown[] | null,
): AddListingFormState {
  // Media now persists real storage URLs, so a resumed draft can show its
  // previously-uploaded images directly (no blob needed).
  const mediaItems: ListingMediaItem[] = (media ?? [])
    .map((raw): ListingMediaItem | null => {
      const m = raw as { name?: string; kind?: string; url?: string };
      if (!m.url) return null;
      return {
        id: makeMediaId(),
        name: m.name ?? "media",
        previewUrl: m.url,
        url: m.url,
        kind: m.kind === "video" ? "video" : "image",
        status: "uploaded",
      };
    })
    .filter((m): m is ListingMediaItem => m !== null);

  return {
    ...EMPTY_ADD_LISTING_FORM,
    ...((details as Partial<AddListingFormState> | null) ?? {}),
    category,
    mediaItems,
    uploadedDocuments: {},
  };
}

export function getDetailsStepLabelKey(category: ListingCategory): TranslationKey {
  switch (category) {
    case "cars":
      return "vendor.addListing.steps.carDetails";
    case "accommodations":
      return "vendor.addListing.steps.accommodationDetails";
    case "experiences":
      return "vendor.addListing.steps.experienceDetails";
  }
}

export function getStepLabelKey(step: AddListingStepId, category: ListingCategory): TranslationKey {
  if (step === "details") {
    return getDetailsStepLabelKey(category);
  }

  const STEP_LABEL_KEYS: Record<Exclude<AddListingStepId, "details">, TranslationKey> = {
    media: "vendor.addListing.steps.media",
    pricing: "vendor.addListing.steps.pricing",
    documents: "vendor.addListing.steps.documents",
    review: "vendor.addListing.steps.review",
  };

  return STEP_LABEL_KEYS[step];
}

export function getNextStep(step: AddListingStepId): AddListingStepId | null {
  const index = ADD_LISTING_STEPS.indexOf(step);
  return index < ADD_LISTING_STEPS.length - 1 ? ADD_LISTING_STEPS[index + 1]! : null;
}

export function getPreviousStep(step: AddListingStepId): AddListingStepId | null {
  const index = ADD_LISTING_STEPS.indexOf(step);
  return index > 0 ? ADD_LISTING_STEPS[index - 1]! : null;
}

export function isAccommodationDocumentsValid(form: AddListingFormState) {
  return Boolean(form.uploadedDocuments.cac);
}

export function getDetailsStepMissingFields(form: AddListingFormState): TranslationKey[] {
  const missing: TranslationKey[] = [];

  if (form.category === "cars") {
    if (!form.carName.trim()) missing.push("vendor.addListing.carName");
    if (!form.carModel.trim()) missing.push("vendor.addListing.carModel");
    if (!form.year.trim()) missing.push("vendor.addListing.year");
    if (!form.shortDescription.trim()) missing.push("vendor.addListing.shortDescription");
    return missing;
  }

  if (form.category === "accommodations") {
    if (!form.propertyName.trim()) missing.push("vendor.addListing.accommodationName");
    if (!form.propertyType.trim()) missing.push("vendor.addListing.propertyType");
    if (!form.address.trim()) missing.push("vendor.addListing.location");
    if (!form.accommodationMaxGuests.trim()) missing.push("vendor.addListing.accommodationMaxGuests");
    if (!form.accommodationDescription.trim()) {
      missing.push("vendor.addListing.shortDescription");
    }
    return missing;
  }

  if (!form.experienceName.trim()) missing.push("vendor.addListing.experienceName");
  if (!form.experienceType.trim()) missing.push("vendor.addListing.experienceType");
  if (!form.location.trim()) missing.push("vendor.addListing.location");
  if (!form.duration.trim()) missing.push("vendor.addListing.duration");
  if (!form.experienceDescription.trim()) {
    missing.push("vendor.addListing.experienceHighlights");
  }
  if (form.experienceScheduleMode === "weekly") {
    if (form.operatingDays.length === 0) missing.push("vendor.addListing.operatingDays");
  } else {
    if (!form.experienceDateRangeStart.trim()) {
      missing.push("vendor.addListing.experienceDateRangeStart");
    }
    if (!form.experienceDateRangeEnd.trim()) {
      missing.push("vendor.addListing.experienceDateRangeEnd");
    }
  }
  if (!form.experienceStartTime.trim()) missing.push("vendor.addListing.startTime");
  if (!form.experienceEndTime.trim()) missing.push("vendor.addListing.endTime");

  return missing;
}

export function isStepValid(step: AddListingStepId, form: AddListingFormState) {
  switch (step) {
    case "details":
      return getDetailsStepMissingFields(form).length === 0;
    case "media":
      return form.mediaItems.length > 0;
    case "pricing":
      if (form.category === "cars") {
        return (
          form.price12hr.trim().length > 0 &&
          form.price24hr.trim().length > 0 &&
          form.priceMultiDay.trim().length > 0 &&
          form.pickupAddress.trim().length > 0 &&
          form.handoverMethods.length > 0 &&
          (form.comesWithDriver ? form.driverAddonPrice.trim().length > 0 : true) &&
          (form.handoverMethods.includes("delivery")
            ? form.deliveryFee.trim().length > 0
            : true)
        );
      }

      if (form.category === "accommodations") {
        return (
          form.roomTypes.length > 0 &&
          form.roomTypes.every(
            (room) =>
              room.name.trim().length > 0 &&
              room.description.trim().length > 0 &&
              room.maxGuests.trim().length > 0 &&
              room.pricePerNight.trim().length > 0,
          )
        );
      }

      return form.pricePerPerson.trim().length > 0;
    case "documents": {
      const requirements = LISTING_DOCUMENTS_BY_CATEGORY[form.category].filter(
        (document) => document.required,
      );
      const hasRequiredUploads = requirements.every(
        (document) => form.uploadedDocuments[document.id],
      );

      if (form.category === "cars") {
        return hasRequiredUploads && form.gpsAcknowledged;
      }

      if (form.category === "accommodations") {
        return isAccommodationDocumentsValid(form);
      }

      return hasRequiredUploads;
    }
    case "review":
      return true;
  }
}
