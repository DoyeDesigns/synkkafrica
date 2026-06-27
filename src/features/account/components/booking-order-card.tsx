import { CircleX, MapPin, Star, X } from "lucide-react";
import Image from "next/image";

import { DisplayPrice } from "@/components/display-price";
import type { AccountBooking } from "@/features/account/data/account-bookings";

type BookingOrderCardProps = {
  booking: AccountBooking;
};

export function BookingOrderCard({ booking }: BookingOrderCardProps) {
  const fullStars = Math.floor(booking.rating);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white">
      <div className="grid gap-4 border-b border-[#DEDEDE] sm:mx-4 lg:mx-6 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium font-inter text-[#888686]">
            Order date:
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            {booking.orderDate}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium font-inter text-foreground/55">
            Total amount:
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            <DisplayPrice currency={booking.currency} amount={booking.totalAmount} />
          </p>
        </div>

        <div>
          <p className="text-xs font-medium font-inter text-foreground/55">
            Total amount:
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            <DisplayPrice currency={booking.currency} amount={booking.totalAmount} />
          </p>
        </div>

        <div>
          <p className="text-xs font-medium font-inter text-foreground/55">
            Order:
          </p>
          <p className="mt-1 text-base font-bold font-satoshi text-foreground">
            {booking.orderNumber}
          </p>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[140px_minmax(0,1fr)_200px] lg:items-start">
        <div className="relative aspect-square w-full max-w-[140px] overflow-hidden rounded-xl bg-zinc-100">
          <Image
            src={booking.image}
            alt={booking.title}
            fill
            className="object-cover"
            sizes="140px"
          />
        </div>

        <div className="min-w-0 space-y-2">
          <h2 className="text-sm font-bold font-montserrat text-foreground">
            {booking.title}
          </h2>
          <p className="text-sm font-base font-satoshi text-foreground">
            {booking.description}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5 mt-2">
          <p className="inline-flex items-center gap-1.5 text-sm font-satoshi text-foreground`">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1} />
            {booking.location}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`h-3.5 w-3.5 ${
                    index < fullStars
                      ? "fill-amber-400 text-amber-400"
                      : "fill-zinc-200 text-zinc-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium font-satoshi text-[#D85A30]">
              {booking.rating} | {booking.reviewCount} Reviews
            </span>
          </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 lg:items-end">
          {booking.status === "bookings" ? (
            <button
              type="button"
              className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-[#FFE6DE] px-3 py-1.5 text-sm font-medium font-satoshi text-[#E53935] transition-colors hover:bg-[#FFF5F5]"
            >
              <CircleX className="h-4 w-4" fill="#D85A30" stroke="#FFFFFF" strokeWidth={2} />
              Cancel
            </button>
          ) : null}

          <div className="lg:text-right">
            <p className="text-xs font-medium font-inter text-[#888686]">
              Receipt and QR recipient
            </p>
            <p className="mt-1 text-base font-bold font-satoshi text-foreground">
              {booking.recipientEmail}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
