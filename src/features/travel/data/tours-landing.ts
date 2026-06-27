export type TourAttraction = {
  id: string;
  name: string;
  activityCount: number;
  image: string;
};

export type TourEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  category: string;
  experience: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  image: string;
  available: boolean;
  selfDriveAvailable: boolean;
};

export const TOUR_EVENT_LOCATIONS = [
  "Lagos Nigeria",
  "UAE Dubai",
  "Cotonou",
  "South Africa",
  "Monaco",
] as const;

export const TOUR_EVENT_CATEGORIES = [
  "All categories",
  "Outdoor",
  "Arts & Culture",
  "Adventure",
  "Food & Drink",
] as const;

export const TOUR_EVENT_EXPERIENCES = [
  "All experiences",
  "Tours",
  "Activities",
  "Workshops",
  "Day trips",
] as const;

export const TOUR_EVENTS: TourEvent[] = [
  {
    id: "tarkwa-bay-tour",
    title: "Tarkwa Bay Tour",
    description:
      "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Outdoor",
    experience: "Tours",
    rating: 4.6,
    reviewCount: 12,
    price: 30500,
    currency: "NGN",
    image: "/destinations/lagos.png",
    available: true,
    selfDriveAvailable: true,
  },
  {
    id: "rdpx-paintball",
    title: "RDPX Paintball Arena",
    description:
      "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Adventure",
    experience: "Activities",
    rating: 4.6,
    reviewCount: 12,
    price: 30500,
    currency: "NGN",
    image: "/hero/tours.png",
    available: true,
    selfDriveAvailable: true,
  },
  {
    id: "sip-and-paint",
    title: "Sip and Paint Lagos",
    description:
      "Accessible only by boat or water taxi. It is famous for its relatively calm waters.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Arts & Culture",
    experience: "Workshops",
    rating: 4.6,
    reviewCount: 12,
    price: 30500,
    currency: "NGN",
    image: "/promo/experience.png",
    available: true,
    selfDriveAvailable: true,
  },
  {
    id: "lekki-conservation",
    title: "Lekki Conservation Centre",
    description:
      "Walk the longest canopy bridge in Africa and explore lush mangrove trails.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Outdoor",
    experience: "Day trips",
    rating: 4.8,
    reviewCount: 48,
    price: 12500,
    currency: "NGN",
    image: "/destinations/lagos.png",
    available: true,
    selfDriveAvailable: false,
  },
  {
    id: "nike-art-gallery",
    title: "Nike Art Gallery Tour",
    description:
      "Discover one of the largest collections of contemporary African art in West Africa.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Arts & Culture",
    experience: "Tours",
    rating: 4.7,
    reviewCount: 31,
    price: 18000,
    currency: "NGN",
    image: "/promo/experience.png",
    available: true,
    selfDriveAvailable: false,
  },
  {
    id: "badagry-heritage",
    title: "Badagry Heritage Walk",
    description:
      "Trace the history of the transatlantic slave trade through museums and landmarks.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Arts & Culture",
    experience: "Tours",
    rating: 4.5,
    reviewCount: 19,
    price: 22000,
    currency: "NGN",
    image: "/hero/tours.png",
    available: true,
    selfDriveAvailable: true,
  },
  {
    id: "dubai-desert-safari",
    title: "Dubai Desert Safari",
    description:
      "Dune bashing, camel rides, and a traditional Bedouin camp under the stars.",
    location: "UAE Dubai",
    city: "UAE Dubai",
    category: "Adventure",
    experience: "Day trips",
    rating: 4.9,
    reviewCount: 86,
    price: 95000,
    currency: "NGN",
    image: "/destinations/dubai.png",
    available: true,
    selfDriveAvailable: false,
  },
  {
    id: "cotonou-city-tour",
    title: "Cotonou City Tour",
    description:
      "Explore markets, colonial architecture, and the vibrant coastline of Benin.",
    location: "Cotonou",
    city: "Cotonou",
    category: "Outdoor",
    experience: "Tours",
    rating: 4.4,
    reviewCount: 14,
    price: 28000,
    currency: "NGN",
    image: "/destinations/cotonou.png",
    available: true,
    selfDriveAvailable: true,
  },
  {
    id: "cape-town-winelands",
    title: "Cape Town Winelands",
    description:
      "Visit Stellenbosch vineyards with tastings and scenic mountain views.",
    location: "South Africa",
    city: "South Africa",
    category: "Food & Drink",
    experience: "Day trips",
    rating: 4.8,
    reviewCount: 52,
    price: 78000,
    currency: "NGN",
    image: "/destinations/south-africa.png",
    available: true,
    selfDriveAvailable: false,
  },
  {
    id: "monaco-yacht-cruise",
    title: "Monaco Yacht Cruise",
    description:
      "Sail the French Riviera coastline with views of Monte Carlo and luxury harbours.",
    location: "Monaco",
    city: "Monaco",
    category: "Outdoor",
    experience: "Activities",
    rating: 4.7,
    reviewCount: 23,
    price: 145000,
    currency: "NGN",
    image: "/destinations/monaco.png",
    available: false,
    selfDriveAvailable: false,
  },
  {
    id: "lagos-food-tour",
    title: "Lagos Street Food Tour",
    description:
      "Sample suya, puff-puff, and local delicacies across the city's best food spots.",
    location: "Lagos, Nigeria",
    city: "Lagos Nigeria",
    category: "Food & Drink",
    experience: "Tours",
    rating: 4.6,
    reviewCount: 37,
    price: 24000,
    currency: "NGN",
    image: "/destinations/lagos.png",
    available: true,
    selfDriveAvailable: false,
  },
  {
    id: "dubai-marina-kayak",
    title: "Dubai Marina Kayak",
    description:
      "Paddle through the marina at sunset with skyline views and guided instruction.",
    location: "UAE Dubai",
    city: "UAE Dubai",
    category: "Adventure",
    experience: "Activities",
    rating: 4.5,
    reviewCount: 21,
    price: 62000,
    currency: "NGN",
    image: "/destinations/dubai.png",
    available: true,
    selfDriveAvailable: false,
  },
];

export const TOUR_ATTRACTIONS: TourAttraction[] = [
  {
    id: "lagos",
    name: "Lagos, Nigeria",
    activityCount: 153,
    image: "/destinations/lagos.png",
  },
  {
    id: "dubai",
    name: "UAE Dubai",
    activityCount: 47,
    image: "/destinations/dubai.png",
  },
  {
    id: "cotonou",
    name: "Cotonou",
    activityCount: 28,
    image: "/destinations/cotonou.png",
  },
  {
    id: "south-africa",
    name: "South Africa",
    activityCount: 2,
    image: "/destinations/south-africa.png",
  },
  {
    id: "monaco",
    name: "Monaco",
    activityCount: 12,
    image: "/destinations/monaco.png",
  },
];
