"use client";

import { User } from "lucide-react";
import Image from "next/image";

import { useBookingContent } from "@/hooks/use-booking-content";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { PropertyRoom } from "@/features/travel/data/property-booking";

type RoomSelectionTableProps = {
  rooms: PropertyRoom[];
  selectedRoomId: string;
  currency: string;
  onSelectRoom: (roomId: string) => void;
};

function GuestIcons({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 text-[#676565]">
      {Array.from({ length: count }).map((_, index) => (
        <User key={index} className="h-4 w-4" fill="#817B7B" strokeWidth={1.75} />
      ))}
    </div>
  );
}

export function RoomSelectionTable({
  rooms,
  selectedRoomId,
  currency,
  onSelectRoom,
}: RoomSelectionTableProps) {
  const t = useTranslation();
  const { labelContent } = useBookingContent();
  const formatPrice = useFormatPrice();

  return (
    <div className="bg-white p-5 py-8 pb-10 rounded-xl">
      <div className="mb-3 hidden grid-cols-[minmax(0,1.6fr)_120px_180px] gap-4 text-sm font-medium font-montserrat text-foreground md:grid">
        <span>{t("booking.table.selectRoom")}</span>
        <span className="pl-2">{t("booking.table.guestCount")}</span>
        <span className="text-left pl-2">{t("booking.table.pricePerNight")}</span>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-white">
      <div className="divide-y divide-[#E5E5E5]">
        {rooms.map((room) => {
          const isSelected = room.id === selectedRoomId;

          return (
            <label
              key={room.id}
              className={`block cursor-pointer transition-colors`}
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_120px_180px] md:items-center">
                <div className="flex flex-col items-start gap-3 border-r border-[#D9D9D9] px-4 py-4 md:px-5">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="room-selection-table"
                      checked={isSelected}
                      onChange={() => onSelectRoom(room.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#D85A30]"
                    />

                    <span className="text-sm font-inter font-semibold text-[#606060]">
                      {labelContent(room.name)}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="flex items-start gap-6">
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                        <Image
                          src={room.image}
                          alt={room.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-sm font-satoshi text-foreground">
                          {labelContent(room.name)}
                        </p>
                        <p className="mt-1 text-sm font-medium font-satoshi text-foreground">
                          {labelContent(room.subtitle)}
                        </p>
                        <p className="mt-1 text-sm font-satoshi font-medium text-foreground">
                          {labelContent(room.size)} | {labelContent(room.sleeps)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between md:justify-start px-4 py-4 md:px-5 h-full border-r border-[#D9D9D9]">
                  <span className="text-xs font-medium font-satoshi text-foreground/60 md:hidden">
                    {t("booking.table.guestCount")}
                  </span>
                  <GuestIcons count={room.guestCount} />
                </div>

                <div className="flex items-end justify-between md:flex-col md:items-end px-4 py-4 md:px-5">
                  <span className="text-xs font-medium font-satoshi text-foreground/60 md:hidden">
                    {t("booking.table.pricePerNight")}
                  </span>
                  <div className="text-right">
                    <p className="text-base font-bold font-montserrat text-foreground">
                      {formatPrice(currency, room.pricePerNight)}
                    </p>
                    {isSelected && room.includesTaxesInDisplay ? (
                      <p className="mt-1 text-xs font-satoshi text-[#135391]">
                        {t("booking.table.includesTaxes")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
      </div>
    </div>
  );
}
