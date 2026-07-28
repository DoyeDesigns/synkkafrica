"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { CarRentalMode } from "@/features/travel/booking/booking-params";

type CarRentalOptionsSectionProps = {
  rentalMode: CarRentalMode;
  onRentalModeChange: (mode: CarRentalMode) => void;
  requestDelivery: boolean;
  onRequestDeliveryChange: (requestDelivery: boolean) => void;
  deliveryAddress: string;
  onDeliveryAddressChange: (address: string) => void;
  customerPickupAddress: string;
  onCustomerPickupAddressChange: (address: string) => void;
  pickupAddress?: string;
  driverAddonPrice?: number;
  deliveryFee?: number;
  currency?: string;
};

export function CarRentalOptionsSection({
  rentalMode,
  onRentalModeChange,
  requestDelivery,
  onRequestDeliveryChange,
  deliveryAddress,
  onDeliveryAddressChange,
  customerPickupAddress,
  onCustomerPickupAddressChange,
  pickupAddress,
  driverAddonPrice = 0,
  deliveryFee = 0,
  currency = "NGN",
}: CarRentalOptionsSectionProps) {
  const t = useTranslation();

  const formattedDriverAddon = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(driverAddonPrice);

  const formattedDeliveryFee = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(deliveryFee);

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5">
      <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
        {t("booking.car.rentalModeHeading")}
      </h2>
      <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
        {t("booking.car.rentalModeHint")}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRentalModeChange("self_drive")}
          className={`rounded-xl border px-4 py-4 text-left transition-colors ${
            rentalMode === "self_drive"
              ? "border-[#D85A30] bg-[#FFF8F5]"
              : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
          }`}
        >
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("booking.car.selfDrive")}
          </p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("booking.car.selfDriveHint")}
          </p>
          <p className="mt-2 text-xs font-semibold font-satoshi text-[#2E7D32]">
            {t("booking.car.noExtraCost")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onRentalModeChange("with_driver")}
          className={`rounded-xl border px-4 py-4 text-left transition-colors ${
            rentalMode === "with_driver"
              ? "border-[#D85A30] bg-[#FFF8F5]"
              : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
          }`}
        >
          <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("booking.car.withDriver")}
          </p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("booking.car.withDriverHint")}
          </p>
          {driverAddonPrice > 0 ? (
            <p className="mt-2 text-xs font-semibold font-satoshi text-[#D85A30]">
              {t("booking.car.driverAddon", { amount: formattedDriverAddon })}
            </p>
          ) : null}
        </button>
      </div>

      {rentalMode === "self_drive" && pickupAddress ? (
        <div className="mt-4 rounded-lg bg-[#F0F6FC] px-4 py-3">
          <p className="text-xs font-semibold font-satoshi uppercase tracking-wide text-[#676565]">
            {t("booking.car.pickupAddress")}
          </p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
            {pickupAddress}
          </p>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("booking.car.pickupAddressHint")}
          </p>
        </div>
      ) : null}

      {rentalMode === "self_drive" ? (
        <div className="mt-4 space-y-3">
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition-colors ${
              requestDelivery
                ? "border-[#D85A30] bg-[#FFF8F5]"
                : "border-[#E5E5E5] bg-white hover:border-[#D0D0D0]"
            }`}
          >
            <input
              type="checkbox"
              checked={requestDelivery}
              onChange={(event) => {
                const checked = event.target.checked;
                onRequestDeliveryChange(checked);
                if (!checked) {
                  onDeliveryAddressChange("");
                }
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#D85A30]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold font-satoshi text-[#2F2F2F]">
                {t("booking.car.requestDelivery")}
              </span>
              <span className="mt-1 block text-xs font-medium font-satoshi text-[#676565]">
                {t("booking.car.requestDeliveryHint")}
              </span>
              {deliveryFee > 0 ? (
                <span className="mt-2 block text-xs font-semibold font-satoshi text-[#D85A30]">
                  {t("booking.car.deliveryFee", { amount: formattedDeliveryFee })}
                </span>
              ) : null}
            </span>
          </label>

          {requestDelivery ? (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {t("booking.car.deliveryAddress")}
              </span>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(event) => onDeliveryAddressChange(event.target.value)}
                placeholder={t("booking.car.deliveryAddressPlaceholder")}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {rentalMode === "with_driver" ? (
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
      ) : null}
    </section>
  );
}
