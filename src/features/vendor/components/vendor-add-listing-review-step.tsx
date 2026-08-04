"use client";

import { Car, CheckCircle2 } from "lucide-react";

import {
  DocumentUploadPreview,
  ListingMediaPreview,
  ListingMediaThumbnail,
} from "@/features/vendor/components/listing-media-preview";
import {
  LISTING_DOCUMENTS_BY_CATEGORY,
  type AddListingFormState,
} from "@/features/vendor/data/vendor-add-listing";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

export function ReviewStepPage({
  form,
  showIntro = true,
}: {
  form: AddListingFormState;
  showIntro?: boolean;
}) {
  if (form.category === "cars") {
    return <CarListingReview form={form} showIntro={showIntro} />;
  }

  if (form.category === "accommodations") {
    return <AccommodationListingReview form={form} showIntro={showIntro} />;
  }

  return <ExperienceListingReview form={form} showIntro={showIntro} />;
}

function CarListingReview({
  form,
  showIntro,
}: {
  form: AddListingFormState;
  showIntro: boolean;
}) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();

  const listingTitle = [form.carName, form.year].filter(Boolean).join(" ") || "—";
  const documents = LISTING_DOCUMENTS_BY_CATEGORY.cars.filter(
    (document) => form.uploadedDocuments[document.id],
  );

  const formatOptionalPrice = (value: string) =>
    value.trim() ? formatPrice("NGN", Number(value)) : "—";

  return (
    <section className="space-y-6">
      {showIntro ? <ReviewIntro /> : null}

      <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="border-b border-[#F0F0F0] lg:border-b-0 lg:border-r">
            <ListingMediaPreview
              items={form.mediaItems}
              className="aspect-[4/3] lg:aspect-auto lg:min-h-[280px] lg:rounded-none"
            />

            {form.mediaItems.length > 1 ? (
              <div className="grid grid-cols-4 gap-2 p-3">
                {form.mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-md border border-[#EEEEEE] bg-[#F5F5F5]"
                  >
                    <ListingMediaThumbnail
                      item={item}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[11px] font-semibold font-satoshi text-[#E65100]">
                <Car className="h-3 w-3" />
                {t("vendor.addListing.category.car.title")}
              </span>
              <h4 className="mt-3 text-xl font-bold font-satoshi text-[#2F2F2F]">{listingTitle}</h4>
              {form.carModel ? (
                <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">{form.carModel}</p>
              ) : null}
            </div>

            <ul className="flex flex-wrap gap-2">
              <ReviewChip
                label={t(
                  form.transmission === "automatic"
                    ? "vendor.addListing.transmission.automatic"
                    : "vendor.addListing.transmission.manual",
                )}
              />
              <ReviewChip
                label={
                  form.comesWithDriver
                    ? t("vendor.addListing.documents.sidebar.comesWithDriver")
                    : t("vendor.addListing.documents.sidebar.selfDrive")
                }
              />
              {form.handoverMethods.includes("client_pickup") ? (
                <ReviewChip label={t("vendor.addListing.clientPickup")} />
              ) : null}
              {form.handoverMethods.includes("delivery") ? (
                <ReviewChip label={t("vendor.addListing.deliveryDropoff")} />
              ) : null}
            </ul>

            {form.shortDescription ? (
              <ReviewBlock heading={t("vendor.addListing.review.description")}>
                <p className="text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
                  {form.shortDescription}
                </p>
              </ReviewBlock>
            ) : null}

            {form.perks.length > 0 ? (
              <ReviewBlock heading={t("vendor.addListing.perksFeatures")}>
                <ul className="flex flex-wrap gap-2">
                  {form.perks.map((perk) => (
                    <li
                      key={perk}
                      className="rounded-full bg-[#F0F6FC] px-3 py-1 text-xs font-semibold font-satoshi text-[#135391]"
                    >
                      {perk}
                    </li>
                  ))}
                </ul>
              </ReviewBlock>
            ) : null}

            {form.pickupAddress ? (
              <ReviewBlock heading={t("vendor.addListing.pickupAddress")}>
                <p className="text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
                  {form.pickupAddress}
                </p>
              </ReviewBlock>
            ) : null}
          </div>
        </div>
      </div>

      <ReviewBlock heading={t("vendor.addListing.carPricingHeading")} boxed>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReviewPriceCard
            label={t("vendor.addListing.documents.sidebar.halfDay")}
            value={formatOptionalPrice(form.price12hr)}
          />
          <ReviewPriceCard
            label={t("vendor.addListing.documents.sidebar.fullDay")}
            value={formatOptionalPrice(form.price24hr)}
          />
          <ReviewPriceCard
            label={t("vendor.addListing.priceMultiDay")}
            value={formatOptionalPrice(form.priceMultiDay)}
          />
          {form.comesWithDriver ? (
            <ReviewPriceCard
              label={t("vendor.addListing.driverAddonPrice")}
              value={formatOptionalPrice(form.driverAddonPrice)}
            />
          ) : null}
          {form.handoverMethods.includes("delivery") ? (
            <ReviewPriceCard
              label={t("vendor.addListing.deliveryFee")}
              value={formatOptionalPrice(form.deliveryFee)}
            />
          ) : null}
        </div>
      </ReviewBlock>

      <ReviewBlock heading={t("vendor.addListing.documentsHeading")} boxed>
        <ul className="space-y-3">
          {documents.map((document) => {
            const upload = form.uploadedDocuments[document.id];
            if (!upload) return null;

            return (
              <li
                key={document.id}
                className="flex flex-col gap-3 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-3 sm:flex-row sm:items-start"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                      {t(document.labelKey)}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                      {upload.name}
                    </p>
                  </div>
                </div>
                {upload.previewUrl ? (
                  <div className="w-full shrink-0 sm:w-28">
                    <DocumentUploadPreview upload={upload} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        {form.gpsAcknowledged ? (
          <p className="mt-4 flex items-start gap-2 text-xs font-medium font-satoshi text-[#2E7D32]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {t("vendor.addListing.review.gpsConfirmed")}
          </p>
        ) : null}
      </ReviewBlock>
    </section>
  );
}

function AccommodationListingReview({
  form,
  showIntro,
}: {
  form: AddListingFormState;
  showIntro: boolean;
}) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();

  const formatTime = (value: string) => {
    if (!value) return "—";
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return (
    <section className="space-y-6">
      {showIntro ? <ReviewIntro /> : null}

      <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <ListingMediaPreview items={form.mediaItems} className="rounded-none" />
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <h4 className="text-xl font-bold font-satoshi text-[#2F2F2F]">
              {form.propertyName || "—"}
            </h4>
            <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
              {form.propertyType || "—"} · {form.address || "—"}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <ReviewRow
              label={t("vendor.addListing.accommodationMaxGuests")}
              value={form.accommodationMaxGuests || "—"}
            />
            <ReviewRow label={t("vendor.addListing.checkInTime")} value={formatTime(form.checkInTime)} />
            <ReviewRow label={t("vendor.addListing.checkOutTime")} value={formatTime(form.checkOutTime)} />
            <ReviewRow
              label={t("vendor.addListing.availability")}
              value={
                form.availabilityMode === "always"
                  ? t("vendor.addListing.availabilityAlways")
                  : t("vendor.addListing.availabilityDateRange")
              }
            />
          </dl>

          {form.roomTypes.length > 0 ? (
            <ReviewBlock heading={t("vendor.addListing.roomTypesPricing")}>
              <div className="overflow-x-auto rounded-lg border border-[#EEEEEE]">
                <table className="min-w-[560px] w-full text-left text-sm font-medium font-satoshi">
                  <thead>
                    <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA]">
                      <th className="px-3 py-2 font-bold text-[#2F2F2F]">
                        {t("vendor.addListing.roomType")}
                      </th>
                      <th className="px-3 py-2 font-bold text-[#2F2F2F]">
                        {t("vendor.addListing.roomDescription")}
                      </th>
                      <th className="px-3 py-2 font-bold text-[#2F2F2F]">
                        {t("vendor.addListing.roomMaxGuests")}
                      </th>
                      <th className="px-3 py-2 font-bold text-[#2F2F2F]">
                        {t("vendor.addListing.roomPricePerNight")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.roomTypes.map((room) => (
                      <tr key={room.id} className="border-b border-[#F0F0F0] last:border-b-0">
                        <td className="px-3 py-3 font-semibold text-[#2F2F2F]">{room.name}</td>
                        <td className="max-w-[180px] px-3 py-3 text-[#676565]">
                          <p className="line-clamp-2">{room.description}</p>
                        </td>
                        <td className="px-3 py-3 text-[#676565]">{room.maxGuests}</td>
                        <td className="px-3 py-3 font-semibold text-[#2F2F2F]">
                          {formatPrice("NGN", Number(room.pricePerNight))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReviewBlock>
          ) : null}

          {form.accommodationDescription ? (
            <ReviewBlock heading={t("vendor.addListing.review.description")}>
              <p className="text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
                {form.accommodationDescription}
              </p>
            </ReviewBlock>
          ) : null}

          {form.amenities.length > 0 ? (
            <ReviewBlock heading={t("vendor.addListing.popularPerks")}>
              <ul className="flex flex-wrap gap-2">
                {form.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="rounded-full bg-[#F0F6FC] px-3 py-1 text-xs font-semibold font-satoshi text-[#135391]"
                  >
                    {amenity}
                  </li>
                ))}
              </ul>
            </ReviewBlock>
          ) : null}
        </div>
      </div>

      {LISTING_DOCUMENTS_BY_CATEGORY.accommodations.some(
        (document) => form.uploadedDocuments[document.id],
      ) ? (
        <ReviewBlock heading={t("vendor.addListing.documentsHeading")} boxed>
          <ul className="space-y-3">
            {LISTING_DOCUMENTS_BY_CATEGORY.accommodations.map((document) => {
              const upload = form.uploadedDocuments[document.id];
              if (!upload) return null;

              return (
                <li
                  key={document.id}
                  className="flex items-start gap-3 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                      {t(document.labelKey)}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                      {upload.name}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </ReviewBlock>
      ) : null}
    </section>
  );
}

function ExperienceListingReview({
  form,
  showIntro,
}: {
  form: AddListingFormState;
  showIntro: boolean;
}) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();

  const documents = LISTING_DOCUMENTS_BY_CATEGORY.experiences.filter(
    (document) => form.uploadedDocuments[document.id],
  );

  return (
    <section className="space-y-6">
      {showIntro ? <ReviewIntro /> : null}

      <div className="overflow-hidden rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="border-b border-[#F0F0F0] lg:border-b-0 lg:border-r">
            <ListingMediaPreview
              items={form.mediaItems}
              className="aspect-[4/3] lg:aspect-auto lg:min-h-[280px] lg:rounded-none"
            />
            {form.mediaItems.length > 1 ? (
              <div className="grid grid-cols-4 gap-2 p-3">
                {form.mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-[4/3] overflow-hidden rounded-md border border-[#EEEEEE] bg-[#F5F5F5]"
                  >
                    <ListingMediaThumbnail
                      item={item}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <h4 className="text-xl font-bold font-satoshi text-[#2F2F2F]">
                {form.experienceName || "—"}
              </h4>
              <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
                {[form.experienceType, form.location].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <ReviewRow label={t("vendor.addListing.duration")} value={form.duration || "—"} />
              <ReviewRow label={t("vendor.addListing.maxGuests")} value={form.maxGuests || "—"} />
              <ReviewRow
                label={t("vendor.addListing.singleTicketPrice")}
                value={
                  form.pricePerPerson
                    ? formatPrice("NGN", Number(form.pricePerPerson))
                    : "—"
                }
              />
              {form.groupTicketPrice ? (
                <ReviewRow
                  label={t("vendor.addListing.groupTicketPrice")}
                  value={formatPrice("NGN", Number(form.groupTicketPrice))}
                />
              ) : null}
              {form.minGroupSize || form.maxGroupSize ? (
                <ReviewRow
                  label={t("vendor.addListing.review.groupSize")}
                  value={
                    [form.minGroupSize, form.maxGroupSize].filter(Boolean).join(" – ") ||
                    "—"
                  }
                />
              ) : null}
            </dl>

            {form.experienceDescription ? (
              <ReviewBlock heading={t("vendor.addListing.review.description")}>
                <p className="text-sm font-medium font-satoshi leading-relaxed text-[#676565]">
                  {form.experienceDescription}
                </p>
              </ReviewBlock>
            ) : null}

            {form.includes.length > 0 ? (
              <ReviewBlock heading={t("vendor.addListing.whatsIncluded")}>
                <ul className="flex flex-wrap gap-2">
                  {form.includes.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-[#F0F6FC] px-3 py-1 text-xs font-semibold font-satoshi text-[#135391]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </ReviewBlock>
            ) : null}

            {form.whatToBring.length > 0 ? (
              <ReviewBlock heading={t("vendor.addListing.whatToBring")}>
                <ul className="flex flex-wrap gap-2">
                  {form.whatToBring.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold font-satoshi text-[#676565]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </ReviewBlock>
            ) : null}
          </div>
        </div>
      </div>

      {documents.length > 0 ? (
        <ReviewBlock heading={t("vendor.addListing.documentsHeading")} boxed>
          <ul className="space-y-3">
            {documents.map((document) => {
              const upload = form.uploadedDocuments[document.id];
              if (!upload) return null;

              return (
                <li
                  key={document.id}
                  className="flex flex-col gap-3 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-3 sm:flex-row sm:items-start"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
                        {t(document.labelKey)}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium font-satoshi text-[#676565]">
                        {upload.name}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ReviewBlock>
      ) : null}
    </section>
  );
}

function ReviewIntro() {
  const t = useTranslation();

  return (
    <div>
      <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
        {t("vendor.addListing.reviewHeading")}
      </h3>
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
        {t("vendor.addListing.reviewHint")}
      </p>
    </div>
  );
}

function ReviewBlock({
  heading,
  boxed,
  children,
}: {
  heading: string;
  boxed?: boolean;
  children: React.ReactNode;
}) {
  if (boxed) {
    return (
      <div className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">{heading}</h4>
        <div className="mt-4">{children}</div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">{heading}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ReviewChip({ label }: { label: string }) {
  return (
    <li className="rounded-full border border-[#EEEEEE] bg-[#FAFAFA] px-3 py-1 text-xs font-semibold font-satoshi text-[#676565]">
      {label}
    </li>
  );
}

function ReviewPriceCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-3 py-3">
      <p className="text-[11px] font-medium font-satoshi text-[#676565]">{label}</p>
      <p className="mt-1 text-sm font-bold font-satoshi text-[#2F2F2F]">{value}</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#F0F0F0] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[#676565]">{label}</dt>
      <dd className="text-right font-semibold text-[#2F2F2F]">{value}</dd>
    </div>
  );
}
