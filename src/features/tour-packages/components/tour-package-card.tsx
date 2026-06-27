import { CalendarDays, Clock, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { DisplayPrice } from "@/components/display-price";
import { T } from "@/components/translation";
import { getTourPackageBookingPath } from "@/features/tour-packages/booking/tour-package-paths";
import type { TourPackage } from "@/features/tour-packages/data/tour-packages";

type TourPackageCardProps = {
  item: TourPackage;
};

export function TourPackageCard({ item }: TourPackageCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="relative h-50 m-4 mb-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover rounded-[15px]"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <button
          type="button"
          aria-label="Save package"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <Heart className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-bold font-montserrat uppercase tracking-wide text-[#D85A30]">
            {item.country}
          </p>
          <h2 className="mt-1 text-base font-bold font-montserrat text-foreground">
            {item.title}
          </h2>
        </div>

        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-sm font-satoshi text-foreground/65">
            <Clock className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {item.nights} Nights / {item.days} Days
          </p>
          <p className="inline-flex items-center gap-2 text-sm font-satoshi text-foreground/65">
            <CalendarDays className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {item.startDate} - {item.endDate}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-1">
          <p className="text-sm font-medium font-satoshi text-foreground">
            <T k="common.startingFrom" />{" "}
            <span className="font-bold font-montserrat text-xl text-foreground">
              <DisplayPrice currency={item.currency} amount={item.price} />
            </span>
          </p>

          <Link
            href={getTourPackageBookingPath(item.id)}
            className="block w-full rounded-md bg-[#3A3A3A] px-5 py-2.5 text-center text-sm font-bold font-montserrat text-white transition-opacity hover:opacity-90"
          >
            <T k="common.bookNow" />
          </Link>
        </div>
      </div>
    </article>
  );
}
