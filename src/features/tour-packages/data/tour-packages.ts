export const TOUR_PACKAGES_PATH = "/tour-packages";

export type TourPackageCarouselItem = {
  id: string;
  name: string;
  image: string;
};

export const TOUR_PACKAGE_CAROUSEL_ITEMS: TourPackageCarouselItem[] = [
  {
    id: "italy",
    name: "Italy",
    image: "/promo/experience.png",
  },
  {
    id: "thailand",
    name: "Thailand",
    image: "/hero/tours.png",
  },
  {
    id: "malaysia",
    name: "Malaysia",
    image: "/destinations/dubai.png",
  },
  {
    id: "singapore",
    name: "Singapore",
    image: "/destinations/lagos.png",
  },
  {
    id: "monaco",
    name: "Monaco",
    image: "/destinations/monaco.png",
  },
];

export type TourPackage = {
  id: string;
  country: string;
  title: string;
  nights: number;
  days: number;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  image: string;
};

export const TOUR_PACKAGE_LOCATIONS = [
  "Lagos Nigeria",
  "UAE Dubai",
  "Cotonou",
  "South Africa",
  "Monaco",
] as const;

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "italy-at-night",
    country: "ITALY",
    title: "Italy at Night",
    nights: 5,
    days: 6,
    startDate: "18 June 2026",
    endDate: "23 June 2026",
    price: 143500,
    currency: "NGN",
    image: "/promo/experience.png",
  },
  {
    id: "malaysia-getaway",
    country: "MALAYSIA",
    title: "Italy at Night",
    nights: 5,
    days: 6,
    startDate: "18 June 2026",
    endDate: "23 June 2026",
    price: 143500,
    currency: "NGN",
    image: "/destinations/dubai.png",
  },
  {
    id: "thailand-escape",
    country: "THAILAND",
    title: "Italy at Night",
    nights: 5,
    days: 6,
    startDate: "18 June 2026",
    endDate: "23 June 2026",
    price: 143500,
    currency: "NGN",
    image: "/hero/tours.png",
  },
  {
    id: "singapore-lights",
    country: "SINGAPORE",
    title: "Italy at Night",
    nights: 5,
    days: 6,
    startDate: "18 June 2026",
    endDate: "23 June 2026",
    price: 143500,
    currency: "NGN",
    image: "/destinations/lagos.png",
  },
  {
    id: "monaco-coast",
    country: "MONACO",
    title: "Italy at Night",
    nights: 5,
    days: 6,
    startDate: "18 June 2026",
    endDate: "23 June 2026",
    price: 143500,
    currency: "NGN",
    image: "/destinations/monaco.png",
  },
  {
    id: "south-africa-safari",
    country: "SOUTH AFRICA",
    title: "Italy at Night",
    nights: 5,
    days: 6,
    startDate: "18 June 2026",
    endDate: "23 June 2026",
    price: 143500,
    currency: "NGN",
    image: "/destinations/south-africa.png",
  },
];
