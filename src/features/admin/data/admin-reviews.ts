export type AdminReviewStatus = "published" | "flagged" | "deleted";

export type AdminReviewCategoryFilter =
  | "unanswered"
  | "responseRequired"
  | "flagged"
  | "deleted"
  | "published";

export type AdminReview = {
  id: string;
  experienceTitle: string;
  vendorName: string;
  guestName: string;
  rating: number;
  comment: string;
  photos: string[];
  status: AdminReviewStatus;
  responseRequired: boolean;
  adminResponse?: string;
  createdAt: string;
};

export const ADMIN_REVIEW_CATEGORY_FILTERS: AdminReviewCategoryFilter[] = [
  "unanswered",
  "responseRequired",
  "flagged",
  "deleted",
  "published",
];

export const ADMIN_REVIEWS: AdminReview[] = [
  {
    id: "rev-1",
    experienceTitle: "Lagos Lagoon Sunset Cruise",
    vendorName: "Alex Autos",
    guestName: "Ngozi",
    rating: 5,
    comment: "Beautiful sunset and very professional crew.",
    photos: ["/hero/tours.png", "/destinations/lagos.png"],
    status: "published",
    responseRequired: false,
    adminResponse:
      "Thank you for sharing your experience. We're glad you enjoyed the cruise.",
    createdAt: "2026-07-05",
  },
  {
    id: "rev-2",
    experienceTitle: "Tarkwa Bay Boat Tour",
    vendorName: "Coastal Trails NG",
    guestName: "Kofi",
    rating: 2,
    comment: "Boat was late and guide was rude.",
    photos: ["/promo/experience.png"],
    status: "flagged",
    responseRequired: true,
    createdAt: "2026-07-12",
  },
  {
    id: "rev-3",
    experienceTitle: "Lekki Garden Suites",
    vendorName: "Alex Autos",
    guestName: "Zainab",
    rating: 1,
    comment: "Spam link in review text removed by system.",
    photos: [],
    status: "deleted",
    responseRequired: false,
    createdAt: "2026-07-15",
  },
  {
    id: "rev-4",
    experienceTitle: "Lagos Food Experience",
    vendorName: "Alex Autos",
    guestName: "Amara",
    rating: 4,
    comment: "Great food stops but the group size was larger than expected.",
    photos: [
      "/destinations/lagos.png",
      "/hero/tours.png",
      "/promo/experience.png",
    ],
    status: "published",
    responseRequired: true,
    createdAt: "2026-07-18",
  },
  {
    id: "rev-5",
    experienceTitle: "Toyota Camry 2021",
    vendorName: "Alex Autos",
    guestName: "Emeka",
    rating: 3,
    comment: "Car was clean but pickup was delayed by 45 minutes.",
    photos: ["/hero/car-rentals.png", "/destinations/cotonou.png"],
    status: "flagged",
    responseRequired: false,
    createdAt: "2026-07-20",
  },
  {
    id: "rev-6",
    experienceTitle: "Victoria Island Loft",
    vendorName: "Alex Autos",
    guestName: "Fatima",
    rating: 5,
    comment: "Perfect stay — would book again.",
    photos: ["/hero/accommodations.png"],
    status: "published",
    responseRequired: false,
    adminResponse: "Thank you for your kind words, Fatima.",
    createdAt: "2026-07-22",
  },
];

export function matchesAdminReviewCategory(
  review: AdminReview,
  category: AdminReviewCategoryFilter,
) {
  switch (category) {
    case "unanswered":
      return !review.adminResponse?.trim();
    case "responseRequired":
      return review.responseRequired;
    case "flagged":
      return review.status === "flagged";
    case "deleted":
      return review.status === "deleted";
    case "published":
      return review.status === "published";
  }
}

export function filterAdminReviewsByCategory(
  reviews: AdminReview[],
  category: AdminReviewCategoryFilter,
) {
  return reviews.filter((review) => matchesAdminReviewCategory(review, category));
}
