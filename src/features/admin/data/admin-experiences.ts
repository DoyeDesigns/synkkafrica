export type AdminExperience = {
  id: string;
  title: string;
  vendorName: string;
  vendorId: string;
  price: number;
  currency: string;
  bookings: number;
  rating: number;
  enabled: boolean;
  image: string;
};

export const ADMIN_EXPERIENCES: AdminExperience[] = [
  {
    id: "exp-1",
    title: "Lagos Lagoon Sunset Cruise",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    price: 85000,
    currency: "NGN",
    bookings: 142,
    rating: 4.8,
    enabled: true,
    image: "/destinations/lagos.png",
  },
  {
    id: "exp-2",
    title: "Lekki Garden Suites",
    vendorName: "Alex Autos",
    vendorId: "vendor-alex",
    price: 120000,
    currency: "NGN",
    bookings: 89,
    rating: 4.6,
    enabled: true,
    image: "/hero/accommodations.png",
  },
  {
    id: "exp-3",
    title: "Tarkwa Bay Boat Tour",
    vendorName: "Coastal Trails NG",
    vendorId: "vendor-coastal",
    price: 45500,
    currency: "NGN",
    bookings: 56,
    rating: 4.4,
    enabled: false,
    image: "/hero/tours.png",
  },
];
