"use client";

import { useTranslation } from "@/hooks/use-translation";

type CarRentalOptionsSectionProps = {
  customerPickupAddress: string;
  onCustomerPickupAddressChange: (address: string) => void;
};

export function CarRentalOptionsSection({
  customerPickupAddress,
  onCustomerPickupAddressChange,
}: CarRentalOptionsSectionProps) {
  const t = useTranslation();

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5">
      <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
        {t("booking.car.withDriver")}
      </h2>
      <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
        {t("booking.car.withDriverHint")}
      </p>

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("booking.car.customerPickupAddress")}
        </span>
        <input
          type="text"
          value={customerPickupAddress}
          onChange={(event) => onCustomerPickupAddressChange(event.target.value)}
          placeholder={t("booking.car.customerPickupAddressPlaceholder")}
          className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
        />
        <span className="text-xs font-medium font-satoshi text-[#676565]">
          {t("booking.car.customerPickupAddressHint")}
        </span>
      </label>
    </section>
  );
}
