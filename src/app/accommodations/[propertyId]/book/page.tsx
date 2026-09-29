import { notFound } from "next/navigation";

import { PropertyBookingPage } from "@/features/travel/components/booking/property-booking-page";
import {
  getAccommodation,
  toPropertyDetail,
  type AccommodationDetailApi,
} from "@/lib/api/accommodations";
import { listReviews } from "@/lib/api/reviews";
import type { PropertyDetail } from "@/features/travel/data/property-booking";

type PropertyBookingRouteProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function PropertyBookingRoute({
  params,
}: PropertyBookingRouteProps) {
  const { propertyId } = await params;

  let accommodation: AccommodationDetailApi;
  try {
    accommodation = await getAccommodation(propertyId);
  } catch {
    notFound();
  }

  // Raw listing payload so the image fields (coverImageUrl, images, media)
  // are visible in the dev server terminal and the browser console.
  console.log("[accommodations/book] listing", accommodation);

  let property: PropertyDetail = toPropertyDetail(accommodation);

  // Merge in real published reviews (best-effort — never block the page).
  try {
    const reviews = await listReviews(propertyId);
    property = {
      ...property,
      reviews: reviews.map((r) => ({
        id: r.id,
        author: r.authorName ?? "Guest",
        avatarInitial: (r.authorName ?? "Guest").charAt(0).toUpperCase(),
        rating: r.rating,
        text: r.comment ?? "",
      })),
    };
  } catch {
    // Leave reviews empty on failure.
  }

  return (
    <PropertyBookingPage
      property={property}
      currentStep="rooms"
      listingData={accommodation}
    />
  );
}
