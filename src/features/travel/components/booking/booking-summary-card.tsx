"use client";

import Image from "next/image";

import { calculateBookingTotal } from "@/features/travel/booking/calculate-booking-total";
import { useBookingContent } from "@/hooks/use-booking-content";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import type { PropertyDetail, PropertyRoom } from "@/features/travel/data/property-booking";

type BookingSummaryCardProps = {
  property: PropertyDetail;
  rooms: PropertyRoom[];
  selectedRoomId: string;
  nights: number;
  roomCount: number;
  onSelectRoom: (roomId: string) => void;
  onBookNow: () => void;
  ctaKey?: TranslationKey;
};

export function BookingSummaryCard({
  property,
  rooms,
  selectedRoomId,
  nights,
  roomCount,
  onSelectRoom,
  onBookNow,
  ctaKey = "common.bookNow",
}: BookingSummaryCardProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const formatPrice = useFormatPrice();
  const selectedRoom =
    rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  if (!selectedRoom) return null;

  const pricing = calculateBookingTotal({
    pricePerNight: selectedRoom.pricePerNight,
    nights,
    roomCount,
    taxesAndFees: property.taxesAndFees,
    currency: property.currency,
  });

  const nightLabel = nights > 1 ? t("booking.summary.nights") : t("booking.summary.night");
  const roomLabel = roomCount > 1 ? t("booking.summary.rooms") : t("booking.summary.room");
  const isProceedCta = ctaKey === "booking.cta.proceedToPay";

  return (
    <aside className="rounded-xl bg-white p-5">
      <h2 className="text-base font-medium font-satoshi text-foreground">
        {t("booking.summary.selectRoom")}
      </h2>

      <div className="mt-4 overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
        <div className="divide-y divide-[#E5E5E5]">
          {rooms.map((room) => {
            const isSelected = room.id === selectedRoomId;

            return (
              <label key={room.id} className="block cursor-pointer px-4 py-4">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="room-selection-summary"
                      checked={isSelected}
                      onChange={() => onSelectRoom(room.id)}
                      className="h-4 w-4 shrink-0 accent-[#D85A30]"
                      />

                      <p className="text-sm font-semibold font-inter text-[#606060]">
                        {labelContent(room.name)}
                      </p>
                    </div>

                    <div className="">
                      <p className="shrink-0 text-sm font-semibold font-inter text-foreground">
                        {formatPrice(property.currency, room.pricePerNight)}
                      </p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    {isSelected ? (
                      <div className="mt-3 flex gap-3">
                        <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                          <Image
                            src={room.image}
                            alt={room.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium font-satoshi text-foreground">
                            {labelContent(room.subtitle)}
                          </p>
                          <p className="mt-1 text-xs font-satoshi text-foreground">
                            {labelContent(room.size)} | {labelContent(room.sleeps)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <h3 className="text-base mt-5  font-medium font-satoshi text-foreground">
          {t("booking.summary.priceDetails")}
      </h3>

      <div className="mt-2 rounded-xl bg-[#FFF1EA] p-4">
        <div className="space-y-2 text-sm font-satoshi">
          <div className="flex items-start justify-between gap-3">
            <span className="text-foreground/80">
              {nights} {nightLabel} x {roomCount} {roomLabel} x{" "}
              <span className="font-bold text-foreground">
                {formatPrice(property.currency, selectedRoom.pricePerNight)}
              </span>
            </span>
            <span className="shrink-0 font-medium text-foreground">
              {formatPrice(property.currency, pricing.subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground/80">{t("booking.summary.taxesAndFees")}</span>
            <span className="font-medium text-foreground">
              {formatPrice(property.currency, pricing.taxesAndFees)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onBookNow}
        className={`mt-5 w-full rounded-md bg-[#D85A30] px-5 py-3 text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90 ${
          isProceedCta ? "uppercase tracking-wide" : ""
        }`}
      >
        {t(ctaKey)}
      </button>
    </aside>
  );
}
