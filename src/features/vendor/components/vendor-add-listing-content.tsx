"use client";

import {
  BedDouble,
  Car,
  ChevronRight,
  CloudUpload,
  MapPin,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";

import { VendorAddListingStepper } from "@/features/vendor/components/vendor-add-listing-stepper";
import { DocumentsStepPage } from "@/features/vendor/components/vendor-add-listing-documents-step";
import { AccommodationDetailsFields } from "@/features/vendor/components/vendor-add-listing-accommodation-details";
import { ExperienceDetailsFields } from "@/features/vendor/components/vendor-add-listing-experience-details";
import { AccommodationPricingStep } from "@/features/vendor/components/vendor-add-listing-accommodation-pricing";
import { ExperiencePricingStep } from "@/features/vendor/components/vendor-add-listing-experience-pricing";
import { ReviewStepPage } from "@/features/vendor/components/vendor-add-listing-review-step";
import {
  EMPTY_ADD_LISTING_FORM,
  getDetailsStepMissingFields,
  getNextStep,
  getPreviousStep,
  isStepValid,
  createListingMediaItem,
  formStateFromListingDetails,
  getListingMediaRejection,
  LISTING_MEDIA_ACCEPT,
  LISTING_MEDIA_MAX_COUNT,
  revokeListingMediaItem,
  type AddListingFormState,
  type ListingMediaItem,
  type AddListingStepId,
  type CarHandoverMethod,
  type ListingCategory,
} from "@/features/vendor/data/vendor-add-listing";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  createVendorListing,
  updateVendorListing,
  submitVendorListing,
  getVendorListing,
  uploadVendorFile,
  type CreateVendorListingInput,
} from "@/lib/api/vendor";

// Map the wide add-listing form onto the backend create payload: derive the
// common columns (title/description/location) per category and carry the rest
// as opaque `details`. Blob-backed media/document previews aren't sent — only
// their metadata (real file upload is a follow-up).
function toCreateInput(form: AddListingFormState): CreateVendorListingInput {
  const { category } = form;
  let title = "";
  let shortDescription = "";
  let location = "";
  if (category === "cars") {
    title = [form.carName, form.carModel, form.year].filter(Boolean).join(" ");
    shortDescription = form.shortDescription;
    location = form.pickupAddress;
  } else if (category === "accommodations") {
    title = form.propertyName;
    shortDescription = form.accommodationDescription;
    location = form.address;
  } else {
    title = form.experienceName;
    shortDescription = form.experienceDescription;
    location = form.location;
  }
  // Only include media that finished uploading (has a stored URL). The first
  // uploaded image becomes the cover shown on listing cards.
  const uploadedMedia = form.mediaItems.filter(
    (m) => m.status === "uploaded" && m.url,
  );
  const media = uploadedMedia.map((m) => ({
    name: m.name,
    kind: m.kind,
    url: m.url,
  }));
  const coverImageUrl = uploadedMedia.find((m) => m.kind === "image")?.url;
  const { mediaItems: _media, uploadedDocuments: _docs, ...details } = form;
  void _media;
  void _docs;
  return {
    category,
    title: title.trim() || "Untitled listing",
    shortDescription: shortDescription || undefined,
    location: location || undefined,
    coverImageUrl,
    details,
    media,
  };
}

// The update endpoint treats category as immutable and rejects unknown fields
// (forbidNonWhitelisted), so drop `category` when patching an existing row.
function toUpdateInput(
  form: AddListingFormState,
): Omit<CreateVendorListingInput, "category"> {
  const { category: _category, ...rest } = toCreateInput(form);
  void _category;
  return rest;
}

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const textareaClassName =
  "min-h-[120px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]";

const CATEGORY_OPTIONS: Array<{
  id: ListingCategory;
  icon: typeof Car;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}> = [
  {
    id: "cars",
    icon: Car,
    titleKey: "vendor.addListing.category.car.title",
    descriptionKey: "vendor.addListing.category.car.description",
  },
  {
    id: "accommodations",
    icon: BedDouble,
    titleKey: "vendor.addListing.category.accommodation.title",
    descriptionKey: "vendor.addListing.category.accommodation.description",
  },
  {
    id: "experiences",
    icon: MapPin,
    titleKey: "vendor.addListing.category.experience.title",
    descriptionKey: "vendor.addListing.category.experience.description",
  },
];

export function VendorAddListingContent({
  exitHref = "/vendor/listings",
  editListingId,
}: {
  exitHref?: string;
  // When set, the wizard reopens an existing listing (a draft being resumed,
  // or a rejected listing being revised) and updates that row on save.
  editListingId?: string;
}) {
  const t = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [currentStep, setCurrentStep] = useState<AddListingStepId>("details");
  const [form, setForm] = useState<AddListingFormState>(EMPTY_ADD_LISTING_FORM);
  const [draftSaved, setDraftSaved] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  // The listing id once a draft has been persisted, so repeated "Save as
  // draft" clicks update the same row instead of spawning duplicate drafts.
  // Seeded from editListingId when resuming an existing listing.
  const [draftId, setDraftId] = useState<string | null>(editListingId ?? null);
  // While an existing listing is being fetched for editing.
  const [loadingListing, setLoadingListing] = useState(Boolean(editListingId));
  const [loadError, setLoadError] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Resume-editing: load the existing listing and rebuild the form from its
  // persisted `details`. Runs once per (listing, token).
  useEffect(() => {
    if (!editListingId || !token) {
      return;
    }
    let cancelled = false;
    getVendorListing(token, editListingId)
      .then((listing) => {
        if (cancelled) return;
        setForm(
          formStateFromListingDetails(
            listing.category,
            listing.details,
            listing.media,
          ),
        );
        setCurrentStep("details");
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingListing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editListingId, token]);

  const updateForm = (patch: Partial<AddListingFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  // Functional per-item update so async upload results land on the right media
  // item without clobbering concurrent uploads.
  const updateMediaItem = (
    id: string,
    patch: Partial<AddListingFormState["mediaItems"][number]>,
  ) => {
    setForm((current) => ({
      ...current,
      mediaItems: current.mediaItems.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
  };

  const handleCategoryChange = (category: ListingCategory) => {
    updateForm({ category });
    setCurrentStep("details");
  };

  const handleContinue = () => {
    const nextStep = getNextStep(currentStep);

    if (!nextStep || !isStepValid(currentStep, form)) {
      return;
    }

    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    const previousStep = getPreviousStep(currentStep);

    if (previousStep) {
      setCurrentStep(previousStep);
      return;
    }

    router.push(exitHref);
  };

  const handleSaveDraft = async () => {
    if (!token || savingDraft) {
      return;
    }
    setSavingDraft(true);
    try {
      if (draftId) {
        await updateVendorListing(token, draftId, toUpdateInput(form));
      } else {
        const created = await createVendorListing(token, {
          ...toCreateInput(form),
          saveAsDraft: true,
        });
        setDraftId(created.id);
      }
      setDraftSaved(true);
      window.setTimeout(() => setDraftSaved(false), 2500);
    } catch {
      window.alert(t("vendor.addListing.draftSaveFailed"));
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!token || publishing) return;
    setPublishing(true);
    setPublishError(null);
    try {
      if (draftId) {
        // Already persisted as a draft — update it in place and submit for
        // review, rather than creating a duplicate listing.
        await updateVendorListing(token, draftId, toUpdateInput(form));
        await submitVendorListing(token, draftId);
      } else {
        await createVendorListing(token, toCreateInput(form));
      }
      router.push(exitHref);
      router.refresh();
    } catch {
      setPublishing(false);
      setPublishError("Couldn't publish your listing. Please try again.");
    }
  };

  const isLastStep = currentStep === "review";
  const canContinue = isStepValid(currentStep, form);
  const missingDetailFields =
    currentStep === "details" ? getDetailsStepMissingFields(form) : [];

  const isDocumentsStep = currentStep === "documents";
  const isEditing = Boolean(editListingId);

  if (loadingListing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm font-medium font-satoshi text-[#C0392B]">
          {t("vendor.addListing.loadError")}
        </p>
        <Link
          href={exitHref}
          className="text-sm font-bold font-satoshi text-[#135391] hover:underline"
        >
          {t("vendor.addListing.backToListings")}
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="-mx-4 -mt-4 border-b border-[#E5E5E5] bg-white px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <VendorAddListingStepper category={form.category} currentStep={currentStep} />
      </div>

      <div className="space-y-6">
      {isDocumentsStep ? (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex text-sm font-medium font-satoshi text-[#135391] hover:underline"
        >
          {t("vendor.addListing.backToListing")}
        </button>
      ) : (
        <Link
          href={exitHref}
          className="inline-flex text-sm font-medium font-satoshi text-[#135391] hover:underline"
        >
          {t("vendor.addListing.backToListings")}
        </Link>
      )}

      <div>
        <h2 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          {isDocumentsStep
            ? t("vendor.addListing.documents.pageTitle")
            : isEditing
              ? t("vendor.addListing.editTitle")
              : t("vendor.addListing.title")}
        </h2>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          {isDocumentsStep
            ? t("vendor.addListing.documents.pageIntro")
            : t("vendor.addListing.subtitle")}
        </p>
      </div>

      {isDocumentsStep ? (
        <DocumentsStepPage
          form={form}
          onChange={updateForm}
          onEditListing={() => setCurrentStep("details")}
          onSubmit={() => {
            if (isStepValid("documents", form)) {
              setCurrentStep("review");
            }
          }}
        />
      ) : (
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
        {currentStep === "details" ? (
          <DetailsStep form={form} onChange={updateForm} onCategoryChange={handleCategoryChange} />
        ) : null}
        {currentStep === "media" ? (
          <MediaStep
            form={form}
            onChange={updateForm}
            onUpdateItem={updateMediaItem}
            token={token}
          />
        ) : null}
        {currentStep === "pricing" ? (
          <PricingStep form={form} onChange={updateForm} />
        ) : null}
        {currentStep === "review" ? <ReviewStepPage form={form} /> : null}
      </div>
      )}

      {!isDocumentsStep ? (
      <div className="flex flex-col gap-3 border-t border-[#EEEEEE] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
        >
          {currentStep === "details"
            ? t("vendor.addListing.cancel")
            : t("vendor.addListing.back")}
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {!canContinue && missingDetailFields.length > 0 ? (
            <p className="text-xs font-medium font-satoshi text-[#E65100] sm:mr-auto sm:text-right">
              {t("vendor.addListing.completeRequiredFields", {
                fields: missingDetailFields.map((field) => t(field)).join(", "),
              })}
            </p>
          ) : null}

          {draftSaved ? (
            <span className="text-sm font-semibold font-satoshi text-[#2E7D32]">
              {t("vendor.addListing.draftSaved")}
            </span>
          ) : (
            <button
              type="button"
              disabled={savingDraft}
              onClick={() => void handleSaveDraft()}
              className="text-sm font-bold font-satoshi text-[#135391] hover:underline disabled:opacity-60"
            >
              {savingDraft
                ? t("common.loading")
                : t("vendor.addListing.saveDraft")}
            </button>
          )}

          {isLastStep ? (
            <div className="flex flex-col items-end gap-2">
              {publishError ? (
                <span className="text-xs font-medium font-satoshi text-[#C0392B]">
                  {publishError}
                </span>
              ) : null}
              <button
                type="button"
                disabled={publishing}
                onClick={() => void handlePublish()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {publishing ? t("common.loading") : t("vendor.addListing.publish")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("vendor.addListing.saveContinue")}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      ) : null}
      </div>
    </>
  );
}

function DetailsStep({
  form,
  onChange,
  onCategoryChange,
}: {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
  onCategoryChange: (category: ListingCategory) => void;
}) {
  const t = useTranslation();

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.addListing.whatAreYouListing")}
        </h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {CATEGORY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = form.category === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onCategoryChange(option.id)}
                className={`relative rounded-xl border px-4 py-6 text-center transition-colors ${
                  isSelected
                    ? "border-[#D85A30] bg-[#FFF8F5]"
                    : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
                }`}
              >
                <span
                  className={`absolute left-4 top-4 flex h-4 w-4 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-[#D85A30] bg-[#D85A30]"
                      : "border-[#CFCFCF] bg-white"
                  }`}
                >
                  {isSelected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>

                <Icon
                  className={`mx-auto h-8 w-8 ${isSelected ? "text-[#D85A30]" : "text-[#9E9E9E]"}`}
                  strokeWidth={1.5}
                />
                <p className="mt-4 text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {t(option.titleKey)}
                </p>
                <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                  {t(option.descriptionKey)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {form.category === "cars" ? (
        <CarDetailsFields form={form} onChange={onChange} />
      ) : null}
      {form.category === "accommodations" ? (
        <AccommodationDetailsFields form={form} onChange={onChange} />
      ) : null}
      {form.category === "experiences" ? (
        <ExperienceDetailsFields form={form} onChange={onChange} />
      ) : null}
    </div>
  );
}

function CarDetailsFields({
  form,
  onChange,
}: {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
}) {
  const t = useTranslation();

  return (
    <section className="space-y-4">
      <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
        {t("vendor.addListing.carDetailsHeading")}
      </h3>

      <FormField label={t("vendor.addListing.carName")} required>
        <input
          type="text"
          value={form.carName}
          onChange={(event) => onChange({ carName: event.target.value })}
          placeholder={t("vendor.addListing.carNamePlaceholder")}
          className={inputClassName}
        />
      </FormField>

      <FormField label={t("vendor.addListing.carModel")} required>
        <input
          type="text"
          value={form.carModel}
          onChange={(event) => onChange({ carModel: event.target.value })}
          placeholder={t("vendor.addListing.carModelPlaceholder")}
          className={inputClassName}
        />
      </FormField>

      <FormField label={t("vendor.addListing.transmission")} required>
        <RadioGroup
          value={form.transmission}
          options={[
            { value: "automatic", label: t("vendor.addListing.transmission.automatic") },
            { value: "manual", label: t("vendor.addListing.transmission.manual") },
          ]}
          onChange={(value) => onChange({ transmission: value as AddListingFormState["transmission"] })}
        />
      </FormField>

      <FormField label={t("vendor.addListing.year")} required>
        <input
          type="text"
          value={form.year}
          onChange={(event) => onChange({ year: event.target.value })}
          placeholder={t("vendor.addListing.yearPlaceholder")}
          className={inputClassName}
        />
      </FormField>

      <FormField label={t("vendor.addListing.comesWithDriver")} required>
        <RadioGroup
          value={form.comesWithDriver ? "yes" : "no"}
          options={[
            { value: "yes", label: t("vendor.addListing.yes") },
            { value: "no", label: t("vendor.addListing.no") },
          ]}
          onChange={(value) => onChange({ comesWithDriver: value === "yes" })}
        />
      </FormField>

      <FormField label={t("vendor.addListing.shortDescription")} required>
        <textarea
          value={form.shortDescription}
          onChange={(event) => onChange({ shortDescription: event.target.value })}
          placeholder={t("vendor.addListing.carDescriptionPlaceholder")}
          className={textareaClassName}
        />
      </FormField>

      <TagInputField
        label={t("vendor.addListing.perksFeatures")}
        placeholder={t("vendor.addListing.perksPlaceholder")}
        tags={form.perks}
        onChange={(perks) => onChange({ perks })}
      />
    </section>
  );
}

function MediaStep({
  form,
  onChange,
  onUpdateItem,
  token,
}: {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
  onUpdateItem: (
    id: string,
    patch: Partial<AddListingFormState["mediaItems"][number]>,
  ) => void;
  token?: string;
}) {
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());

  const handleFiles = (files: FileList | null) => {
    if (!files) {
      return;
    }

    const remainingSlots = LISTING_MEDIA_MAX_COUNT - form.mediaItems.length;

    if (remainingSlots <= 0) {
      return;
    }

    const selected = Array.from(files);

    // Classify every selected file so we can tell the vendor *why* any were
    // dropped, instead of silently discarding them (which looks like the
    // picker did nothing). Only accepted files become previews.
    let unsupported = 0;
    let tooLarge = 0;
    const accepted: File[] = [];
    for (const file of selected) {
      const reason = getListingMediaRejection(file);
      if (reason === "unsupported") {
        unsupported += 1;
      } else if (reason === "too_large") {
        tooLarge += 1;
      } else {
        accepted.push(file);
      }
    }

    const messages: string[] = [];
    if (unsupported > 0) {
      messages.push(
        t("vendor.addListing.mediaSkippedUnsupported", { count: unsupported }),
      );
    }
    if (tooLarge > 0) {
      messages.push(
        t("vendor.addListing.mediaSkippedTooLarge", { count: tooLarge }),
      );
    }
    if (messages.length > 0) {
      window.alert(messages.join("\n"));
    }

    // Pair each new item with its File so we can upload after adding it.
    const newPairs = accepted
      .slice(0, remainingSlots)
      .map((file) => {
        const item = createListingMediaItem(file);
        return item ? { item, file } : null;
      })
      .filter((pair): pair is { item: ListingMediaItem; file: File } => pair !== null);

    if (newPairs.length === 0) {
      return;
    }

    const newItems = newPairs.map((pair) => pair.item);
    onChange({ mediaItems: [...form.mediaItems, ...newItems].slice(0, LISTING_MEDIA_MAX_COUNT) });

    // Upload each accepted file directly to storage; mark the item uploaded
    // (with its URL) or errored when it settles.
    if (!token) {
      newItems.forEach((item) => onUpdateItem(item.id, { status: "error" }));
      return;
    }
    newPairs.forEach(({ item, file }) => {
      uploadVendorFile(token, "listing-media", file)
        .then(({ url }) =>
          onUpdateItem(item.id, {
            url: url ?? undefined,
            status: url ? "uploaded" : "error",
          }),
        )
        .catch(() => onUpdateItem(item.id, { status: "error" }));
    });
  };

  const handleRemove = (id: string) => {
    const item = form.mediaItems.find((mediaItem) => mediaItem.id === id);

    if (item) {
      revokeListingMediaItem(item);
    }

    onChange({ mediaItems: form.mediaItems.filter((mediaItem) => mediaItem.id !== id) });
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("vendor.addListing.mediaHeading")}
        </h3>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.addListing.mediaHint")}
        </p>
      </div>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors ${
          isDragging
            ? "border-[#135391] bg-[#F8FBFF]"
            : "border-[#D0D0D0] bg-[#FAFAFA] hover:border-[#135391] hover:bg-[#F8FBFF]"
        }`}
      >
        <CloudUpload className="h-8 w-8 text-[#676565]" />
        <p className="mt-3 text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("vendor.addListing.uploadImages")}
        </p>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("vendor.addListing.uploadImagesHint")}
        </p>
        <input
          type="file"
          accept={LISTING_MEDIA_ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>

      {form.mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {form.mediaItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[#E5E5E5] bg-[#F5F5F5]"
            >
              {item.kind === "video" ? (
                <video
                  src={item.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : failedPreviews.has(item.id) ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
                  <span className="text-xs font-semibold font-satoshi text-[#676565]">
                    {t("vendor.addListing.mediaPreviewFailed")}
                  </span>
                  <span className="line-clamp-2 text-[10px] font-medium font-satoshi text-[#9A9A9A]">
                    {item.name}
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={() =>
                    setFailedPreviews((prev) => new Set(prev).add(item.id))
                  }
                />
              )}
              {item.status === "uploading" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <span className="text-[11px] font-semibold font-satoshi text-white">
                    {t("vendor.addListing.mediaUploading")}
                  </span>
                </div>
              ) : item.status === "error" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#C0392B]/80 px-2 text-center">
                  <span className="text-[11px] font-semibold font-satoshi text-white">
                    {t("vendor.addListing.mediaUploadFailed")}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute right-2 top-2 rounded-full bg-white p-1 text-[#676565] shadow-sm hover:text-[#C0392B]"
                aria-label={t("vendor.addListing.removeImage")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PricingStep({
  form,
  onChange,
}: {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
}) {
  const t = useTranslation();

  const toggleHandoverMethod = (method: CarHandoverMethod) => {
    const isSelected = form.handoverMethods.includes(method);

    if (isSelected) {
      if (form.handoverMethods.length === 1) {
        return;
      }

      onChange({
        handoverMethods: form.handoverMethods.filter((item) => item !== method),
        ...(method === "delivery" ? { deliveryFee: "" } : {}),
      });
      return;
    }

    onChange({
      handoverMethods: [...form.handoverMethods, method],
    });
  };

  if (form.category === "cars") {
    return (
      <section className="space-y-6">
        <div>
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.pickupDeliveryHeading")}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.pickupDeliveryQuestion")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <OptionCard
              selected={form.handoverMethods.includes("client_pickup")}
              title={t("vendor.addListing.clientPickup")}
              description={t("vendor.addListing.clientPickupHint")}
              onSelect={() => toggleHandoverMethod("client_pickup")}
            />
            <OptionCard
              selected={form.handoverMethods.includes("delivery")}
              title={t("vendor.addListing.deliveryDropoff")}
              description={t("vendor.addListing.deliveryDropoffHint")}
              onSelect={() => toggleHandoverMethod("delivery")}
            />
          </div>

          <FormField label={t("vendor.addListing.pickupAddress")} required>
            <input
              type="text"
              value={form.pickupAddress}
              onChange={(event) => onChange({ pickupAddress: event.target.value })}
              placeholder={t("vendor.addListing.pickupAddressPlaceholder")}
              className={inputClassName}
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.carPricingHeading")}
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <PriceField
              label={t("vendor.addListing.price12hr")}
              value={form.price12hr}
              onChange={(value) => onChange({ price12hr: value })}
            />
            <PriceField
              label={t("vendor.addListing.price24hr")}
              value={form.price24hr}
              onChange={(value) => onChange({ price24hr: value })}
            />
            <PriceField
              label={t("vendor.addListing.priceMultiDay")}
              value={form.priceMultiDay}
              onChange={(value) => onChange({ priceMultiDay: value })}
            />
          </div>

          {form.comesWithDriver ? (
            <PriceField
              label={t("vendor.addListing.driverAddonPrice")}
              value={form.driverAddonPrice}
              onChange={(value) => onChange({ driverAddonPrice: value })}
            />
          ) : (
            <p className="text-xs font-medium font-satoshi text-[#676565]">
              {t("vendor.addListing.selfDriveNoPrice")}
            </p>
          )}

          {form.handoverMethods.includes("delivery") ? (
            <PriceField
              label={t("vendor.addListing.deliveryFee")}
              value={form.deliveryFee}
              onChange={(value) => onChange({ deliveryFee: value })}
            />
          ) : null}
        </div>
      </section>
    );
  }

  if (form.category === "accommodations") {
    return <AccommodationPricingStep form={form} onChange={onChange} />;
  }

  return <ExperiencePricingStep form={form} onChange={onChange} />;
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {label}
        {required ? <span className="text-[#C0392B]"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function RadioGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <label key={option.value} className="inline-flex items-center gap-2 text-sm font-medium font-satoshi text-[#2F2F2F]">
          <input
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

function TagInputField({
  label,
  placeholder,
  tags,
  onChange,
}: {
  label: string;
  placeholder: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();

    if (!value || tags.includes(value) || tags.length >= 10) {
      return;
    }

    onChange([...tags, value]);
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">{label}</span>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
      />
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#F0F6FC] px-3 py-1 text-xs font-semibold font-satoshi text-[#135391]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                className="text-[#135391]/70 hover:text-[#C0392B]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PriceField({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <FormField label={label} required={!optional}>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="NGN"
        className={inputClassName}
      />
    </FormField>
  );
}

function OptionCard({
  selected,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left transition-colors ${
        selected ? "border-[#D85A30] bg-[#FFF8F5]" : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">{title}</p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{description}</p>
        </div>
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            selected ? "border-[#D85A30] bg-[#D85A30]" : "border-[#CFCFCF] bg-white"
          }`}
        >
          {selected ? (
            <span className="block h-1.5 w-1.5 rounded-[1px] bg-white" />
          ) : null}
        </span>
      </div>
    </button>
  );
}
