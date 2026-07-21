"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { ADMIN_EXPERIENCES, type AdminExperience } from "@/features/admin/data/admin-experiences";
import { ADMIN_VENDORS } from "@/features/admin/data/admin-vendors";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";

export function AdminExperiencesContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [experiences, setExperiences] = useState(ADMIN_EXPERIENCES);

  const toggleEnabled = (id: string) => {
    setExperiences((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.experiences.title")}{" "}
          <span className="text-[#D85A30]">({experiences.length})</span>
        </h2>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-[5px] bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          {t("admin.experiences.add")}
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((experience) => (
          <ExperienceRow
            key={experience.id}
            experience={experience}
            formatPrice={formatPrice}
            onToggle={() => toggleEnabled(experience.id)}
          />
        ))}
      </div>
    </>
  );
}

function ExperienceRow({
  experience,
  formatPrice,
  onToggle,
}: {
  experience: AdminExperience;
  formatPrice: (currency: string, amount: number) => string;
  onToggle: () => void;
}) {
  const t = useTranslation();

  return (
    <article className="rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg sm:w-20">
          <Image
            src={experience.image}
            alt={experience.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold font-satoshi text-[#004785]">{experience.title}</h3>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.experiences.vendor")}: {experience.vendorName} ·{" "}
            {formatPrice(experience.currency, experience.price)} ·{" "}
            {t("admin.experiences.bookings")}: {experience.bookings} ·{" "}
            {t("admin.experiences.rating")}: {experience.rating}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            defaultValue={experience.vendorId}
            className="h-10 rounded-lg border border-[#E5E5E5] px-3 text-sm font-medium font-satoshi"
          >
            {ADMIN_VENDORS.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggle}
            className={`rounded-lg px-4 py-2 text-sm font-bold font-satoshi ${
              experience.enabled
                ? "bg-[#E8F5E9] text-[#2E7D32]"
                : "bg-[#F5F5F5] text-[#676565]"
            }`}
          >
            {experience.enabled
              ? t("admin.common.enabled")
              : t("admin.common.disabled")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#135391] px-4 py-2 text-sm font-bold font-satoshi text-[#135391]"
          >
            {t("admin.common.edit")}
          </button>
        </div>
      </div>
    </article>
  );
}
