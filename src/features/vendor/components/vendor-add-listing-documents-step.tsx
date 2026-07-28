"use client";

import {
  Briefcase,
  Car,
  Check,
  CheckCircle2,
  Circle,
  CloudUpload,
  MapPin,
  Pencil,
  Shield,
  ShieldCheck,
  Umbrella,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ADD_LISTING_STEPS,
  createListingDocumentUpload,
  getStepLabelKey,
  isStepValid,
  LISTING_DOCUMENTS_BY_CATEGORY,
  revokeListingDocumentUpload,
  type AddListingFormState,
  type AddListingStepId,
  type ListingDocumentId,
  type ListingDocumentUpload,
} from "@/features/vendor/data/vendor-add-listing";
import { DocumentUploadPreview, ListingMediaPreview } from "@/features/vendor/components/listing-media-preview";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const DOCUMENT_ICONS: Partial<Record<ListingDocumentId, LucideIcon>> = {
  proof_of_ownership: Car,
  roadworthiness: Shield,
  insurance: Umbrella,
  cac: Briefcase,
  agent_authorization: Briefcase,
  agent_proof_of_address: MapPin,
  address_photos: MapPin,
};

const DOCUMENT_TITLE_KEYS: Partial<Record<ListingDocumentId, TranslationKey>> = {
  insurance: "vendor.addListing.documents.insuranceDocument",
  cac: "vendor.addListing.documents.cacRegistration",
};

type DocumentsStepPageProps = {
  form: AddListingFormState;
  onChange: (patch: Partial<AddListingFormState>) => void;
  onEditListing: () => void;
  onSubmit: () => void;
};

export function DocumentsStepPage({
  form,
  onChange,
  onEditListing,
  onSubmit,
}: DocumentsStepPageProps) {
  const t = useTranslation();
  const canSubmit = isStepValid("documents", form);

  const handleUpload = (documentId: ListingDocumentId, upload: ListingDocumentUpload) => {
    const existing = form.uploadedDocuments[documentId];
    if (existing) {
      revokeListingDocumentUpload(existing);
    }

    onChange({
      uploadedDocuments: {
        ...form.uploadedDocuments,
        [documentId]: upload,
      },
    });
  };

  const documents = LISTING_DOCUMENTS_BY_CATEGORY[form.category].filter((document) => {
    if (form.category !== "accommodations") {
      return true;
    }

    if (document.id === "proof_of_ownership") {
      return form.isPropertyOwner;
    }

    if (document.id === "agent_authorization" || document.id === "agent_proof_of_address") {
      return !form.isPropertyOwner;
    }

    return true;
  });

  return (
    <div className="relative">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <aside className="w-full shrink-0 xl:hidden">
          <ListingDocumentsSidebar form={form} onEditListing={onEditListing} />
        </aside>

        <div aria-hidden="true" className="hidden w-[320px] shrink-0 xl:block" />

        <div className="min-w-0 flex-1">
          <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h3 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
              {t("vendor.addListing.documentsHeading")}
            </h3>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {t("vendor.addListing.documents.pageSubtitle")}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {documents.map((document) => {
              const Icon = DOCUMENT_ICONS[document.id] ?? Briefcase;
              const titleKey = DOCUMENT_TITLE_KEYS[document.id] ?? document.labelKey;

              return (
                <DocumentUploadCard
                  key={document.id}
                  icon={Icon}
                  label={t(titleKey)}
                  hint={document.hintKey ? t(document.hintKey) : undefined}
                  upload={form.uploadedDocuments[document.id]}
                  onUpload={(upload) => handleUpload(document.id, upload)}
                  onRemove={() => {
                    const existing = form.uploadedDocuments[document.id];
                    if (existing) {
                      revokeListingDocumentUpload(existing);
                    }
                    const nextDocuments = { ...form.uploadedDocuments };
                    delete nextDocuments[document.id];
                    onChange({ uploadedDocuments: nextDocuments });
                  }}
                />
              );
            })}
          </div>

          <div className="mt-6 rounded-lg bg-[#EBF5FB] px-4 py-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#135391]" />
              <div>
                <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {t("vendor.addListing.documents.safetyTitle")}
                </p>
                <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                  {t("vendor.addListing.documents.safetyText")}
                </p>
              </div>
            </div>
          </div>

          {form.category === "cars" ? (
            <label className="mt-4 flex items-start gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] p-4">
              <input
                type="checkbox"
                checked={form.gpsAcknowledged}
                onChange={(event) => onChange({ gpsAcknowledged: event.target.checked })}
                className="mt-1 h-4 w-4 rounded border-[#CFCFCF] text-[#D85A30] focus:ring-[#D85A30]"
              />
              <span className="text-sm font-medium font-satoshi text-[#2F2F2F]">
                {t("vendor.addListing.documents.gpsAcknowledgment")}
              </span>
            </label>
          ) : null}

          <div className="mt-6 flex flex-col items-center gap-2 border-t border-[#EEEEEE] pt-6 text-center">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className="inline-flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-6 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[280px]"
            >
              <CheckCircle2 className="h-4 w-4" />
              {t("vendor.addListing.documents.submitForReview")}
            </button>
            <p className="max-w-md text-xs font-medium font-satoshi text-[#676565]">
              {t("vendor.addListing.documents.submitHint")}
            </p>
          </div>
        </section>
        </div>
      </div>

      <aside className="pointer-events-none hidden xl:absolute xl:left-0 xl:top-0 xl:block xl:w-[320px]">
        <div className="pointer-events-auto">
          <ListingDocumentsSidebar form={form} onEditListing={onEditListing} />
        </div>
      </aside>
    </div>
  );
}

function ListingDocumentsSidebar({
  form,
  onEditListing,
}: {
  form: AddListingFormState;
  onEditListing: () => void;
}) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const currentStepIndex = ADD_LISTING_STEPS.indexOf("documents");
  const progressPercent = Math.round(((currentStepIndex + 1) / ADD_LISTING_STEPS.length) * 100);

  const listingTitle =
    form.category === "cars"
      ? [form.carName, form.year].filter(Boolean).join(" ") || t("vendor.addListing.documents.untitledListing")
      : form.category === "accommodations"
        ? form.propertyName || t("vendor.addListing.documents.untitledListing")
        : form.experienceName || t("vendor.addListing.documents.untitledListing");

  return (
    <aside className="space-y-4">
      <section className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F0F0F0] px-4 py-3">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.documents.sidebar.listingPreview")}
          </p>
          <button
            type="button"
            onClick={onEditListing}
            className="inline-flex items-center gap-1 text-xs font-bold font-satoshi text-[#135391] hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t("vendor.addListing.documents.sidebar.edit")}
          </button>
        </div>

        <ListingMediaPreview items={form.mediaItems} className="rounded-none" />

        <div className="space-y-3 p-4">
          <div>
            <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">{listingTitle}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[11px] font-semibold font-satoshi text-[#E65100]">
              <Car className="h-3 w-3" />
              {t(`vendor.addListing.documents.sidebar.${form.category}Listing`)}
            </span>
          </div>

          {form.category === "cars" ? (
            <ul className="space-y-1.5 text-xs font-medium font-satoshi text-[#676565]">
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Lagos, NG
              </li>
              <li>
                {t(
                  form.transmission === "automatic"
                    ? "vendor.addListing.transmission.automatic"
                    : "vendor.addListing.transmission.manual",
                )}
              </li>
              <li>
                {form.comesWithDriver
                  ? t("vendor.addListing.documents.sidebar.comesWithDriver")
                  : t("vendor.addListing.documents.sidebar.selfDrive")}
              </li>
            </ul>
          ) : null}
        </div>
      </section>

      {form.category === "cars" ? (
        <section className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.documents.sidebar.pricing")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PricingPill
              label={t("vendor.addListing.documents.sidebar.halfDay")}
              value={
                form.price12hr
                  ? formatPrice("NGN", Number(form.price12hr))
                  : "—"
              }
            />
            <PricingPill
              label={t("vendor.addListing.documents.sidebar.fullDay")}
              value={
                form.price24hr
                  ? formatPrice("NGN", Number(form.price24hr))
                  : "—"
              }
            />
            <PricingPill
              label={t("vendor.addListing.documents.sidebar.extraHour")}
              value={
                form.driverAddonPrice
                  ? formatPrice("NGN", Number(form.driverAddonPrice))
                  : "—"
              }
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.documents.sidebar.progress")}
          </p>
          <span className="text-sm font-bold font-satoshi text-[#D85A30]">{progressPercent}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0F0F0]">
          <div
            className="h-full rounded-full bg-[#D85A30] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <ol className="mt-4 space-y-3">
          {ADD_LISTING_STEPS.map((step, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = step === "documents";

            return (
              <li key={step} className="flex items-center gap-3">
                <StepStatusIcon isComplete={isComplete} isCurrent={isCurrent} />
                <span
                  className={`text-sm font-medium font-satoshi ${
                    isComplete || isCurrent ? "text-[#2F2F2F]" : "text-[#9E9E9E]"
                  }`}
                >
                  {t(getStepLabelKey(step, form.category))}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </aside>
  );
}

function StepStatusIcon({
  isComplete,
  isCurrent,
}: {
  isComplete: boolean;
  isCurrent: boolean;
}) {
  if (isComplete) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }

  if (isCurrent) {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#D85A30]" />;
  }

  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center">
      <Circle className="h-4 w-4 text-[#D0D0D0]" strokeWidth={1.5} />
    </span>
  );
}

function PricingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-2 py-2 text-center">
      <p className="text-[10px] font-medium font-satoshi text-[#676565]">{label}</p>
      <p className="mt-1 text-[11px] font-bold font-satoshi text-[#2F2F2F]">{value}</p>
    </div>
  );
}

function DocumentUploadCard({
  icon: Icon,
  label,
  hint,
  upload,
  onUpload,
  onRemove,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  upload?: ListingDocumentUpload;
  onUpload: (upload: ListingDocumentUpload) => void;
  onRemove: () => void;
}) {
  const t = useTranslation();

  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5]">
          <Icon className="h-5 w-5 text-[#676565]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">{label}</p>
            <span className="rounded-full bg-[#FDEBEB] px-2 py-0.5 text-[10px] font-bold font-satoshi uppercase tracking-wide text-[#C0392B]">
              {t("vendor.addListing.documents.requiredBadge")}
            </span>
          </div>
          {hint ? (
            <p className="mt-1 text-xs font-medium font-satoshi leading-relaxed text-[#676565]">
              {hint}
            </p>
          ) : null}
        </div>
      </div>

      {upload ? (
        <div className="mt-4 space-y-2">
          <DocumentUploadPreview upload={upload} />
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-bold font-satoshi text-[#C0392B] hover:underline"
          >
            {t("vendor.addListing.removeFile")}
          </button>
        </div>
      ) : (
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#D0D0D0] bg-[#FAFAFA] px-4 py-8 text-center transition-colors hover:border-[#135391] hover:bg-[#F8FBFF]">
          <CloudUpload className="h-6 w-6 text-[#676565]" />
          <p className="mt-2 text-xs font-semibold font-satoshi text-[#2F2F2F]">
            {t("vendor.addListing.documents.uploadPrompt")}
          </p>
          <p className="mt-1 text-[11px] font-medium font-satoshi text-[#676565]">
            {t("vendor.addListing.documents.uploadFormats")}
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(createListingDocumentUpload(file));
              }
              event.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
