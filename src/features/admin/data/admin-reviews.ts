export type AdminReviewStatus = "published" | "flagged" | "hidden";

export type AdminReview = {
  id: string;
  experienceTitle: string;
  vendorName: string;
  guestName: string;
  rating: number;
  comment: string;
  status: AdminReviewStatus;
  createdAt: string;
};

export const ADMIN_REVIEWS: AdminReview[] = [
  {
    id: "rev-1",
    experienceTitle: "Lagos Lagoon Sunset Cruise",
    vendorName: "Alex Autos",
    guestName: "Ngozi",
    rating: 5,
    comment: "Beautiful sunset and very professional crew.",
    status: "published",
    createdAt: "2026-07-05",
  },
  {
    id: "rev-2",
    experienceTitle: "Tarkwa Bay Boat Tour",
    vendorName: "Coastal Trails NG",
    guestName: "Kofi",
    rating: 2,
    comment: "Boat was late and guide was rude.",
    status: "flagged",
    createdAt: "2026-07-12",
  },
  {
    id: "rev-3",
    experienceTitle: "Lekki Garden Suites",
    vendorName: "Alex Autos",
    guestName: "Zainab",
    rating: 1,
    comment: "Spam link in review text removed by system.",
    status: "hidden",
    createdAt: "2026-07-15",
  },
];
