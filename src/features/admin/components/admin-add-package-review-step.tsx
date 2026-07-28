"use client";

import Image from "next/image";

import {
  calculatePackageSavings,
  getPackageDisplaySavingsPercent,
  PACKAGE_MODULE_TYPE_LABEL_KEYS,
  PACKAGE_MODULE_TYPE_STYLES,
  type AddPackageFormState,
} from "@/features/admin/data/admin-add-package";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

type PackageReviewStepProps = {
  form: AddPackageFormState;
};

export function PackageReviewStep({ form }: PackageReviewStepProps) {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const savings = calculatePackageSavings(form.normalPrice, form.salesPrice);
  const displayPercent = getPackageDisplaySavingsPercent(form);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.packages.review.heading")}
        </h3>
        <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
          {t("admin.packages.review.hint")}
        </p>
      </div>

      <ReviewSection title={t("admin.packages.steps.details")}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <ReviewRow label={t("admin.packages.fields.packageName")} value={form.packageName} />
          <ReviewRow label={t("admin.packages.fields.packageSlug")} value={form.packageSlug} />
          <ReviewRow label={t("admin.packages.fields.category")} value={form.category} />
          <ReviewRow
            label={t("admin.packages.fields.bestFor")}
            value={form.bestFor.join(", ") || "—"}
          />
          <ReviewRow
            label={t("admin.packages.fields.tags")}
            value={form.tags.join(", ") || "—"}
          />
          <ReviewRow
            label={t("admin.packages.fields.featuredDeal")}
            value={form.featuredDeal ? t("admin.common.enabled") : t("admin.common.disabled")}
          />
        </dl>
        <ReviewBlock label={t("admin.packages.fields.shortDescription")} value={form.shortDescription} />
        <ReviewBlock label={t("admin.packages.fields.detailedDescription")} value={form.detailedDescription} />
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReviewRow label={t("admin.packages.fields.includedMeals")} value={form.includedMeals || "—"} />
          <ReviewRow
            label={t("admin.packages.fields.cancellationPolicy")}
            value={form.cancellationPolicy || "—"}
          />
          <ReviewRow label={t("admin.packages.fields.refundPolicy")} value={form.refundPolicy || "—"} />
          <ReviewRow label={t("admin.packages.fields.maxGuests")} value={form.maxGuests || "—"} />
        </dl>
      </ReviewSection>

      <ReviewSection title={t("admin.packages.steps.modules")}>
        <ul className="space-y-3">
          {form.modules.map((module, index) => {
            const styles = PACKAGE_MODULE_TYPE_STYLES[module.type];

            return (
              <li
                key={module.id}
                className="flex items-center gap-3 rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                  <Image src={module.image} alt="" fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-satoshi uppercase ${styles.badge}`}>
                      {t(PACKAGE_MODULE_TYPE_LABEL_KEYS[module.type])}
                    </span>
                    <span className="text-xs font-medium font-satoshi text-[#676565]">#{index + 1}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold font-satoshi text-[#2F2F2F]">{module.title}</p>
                  <p className="text-xs font-medium font-satoshi text-[#676565]">{module.subtitle}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </ReviewSection>

      <ReviewSection title={t("admin.packages.steps.pricing")}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <ReviewRow label={t("admin.packages.fields.currency")} value={form.currency} />
          <ReviewRow
            label={t("admin.packages.fields.normalPrice")}
            value={form.normalPrice ? formatPrice(form.currency, Number(form.normalPrice)) : "—"}
          />
          <ReviewRow
            label={t("admin.packages.fields.salesPrice")}
            value={form.salesPrice ? formatPrice(form.currency, Number(form.salesPrice)) : "—"}
          />
          <ReviewRow
            label={t("admin.packages.fields.showSavingsBadge")}
            value={form.showSavingsBadge ? t("admin.common.enabled") : t("admin.common.disabled")}
          />
          {form.showSavingsBadge ? (
            <ReviewRow
              label={t("admin.packages.fields.savingsBadgePercent")}
              value={displayPercent !== null ? `${displayPercent}%` : "—"}
            />
          ) : null}
          <ReviewRow label={t("admin.packages.fields.validFrom")} value={form.validFrom || "—"} />
          <ReviewRow label={t("admin.packages.fields.validUntil")} value={form.validUntil || "—"} />
          <ReviewRow
            label={t("admin.packages.fields.minimumBookingNotice")}
            value={form.minimumBookingNotice}
          />
          <ReviewRow
            label={t("admin.packages.fields.packageActive")}
            value={form.packageActive ? t("admin.common.enabled") : t("admin.common.disabled")}
          />
        </dl>
        {savings && displayPercent !== null ? (
          <p className="mt-3 text-sm font-semibold font-satoshi text-[#2E7D32]">
            {t("admin.packages.pricing.savingsDisplay", {
              amount: formatPrice(form.currency, savings.amount),
              percent: displayPercent,
            })}
          </p>
        ) : null}
      </ReviewSection>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <h4 className="text-sm font-bold font-satoshi text-[#2F2F2F]">{title}</h4>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold font-satoshi text-[#676565]">{label}</dt>
      <dd className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">{value || "—"}</dd>
    </div>
  );
}

function ReviewBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold font-satoshi text-[#676565]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium font-satoshi text-[#2F2F2F]">
        {value || "—"}
      </p>
    </div>
  );
}
