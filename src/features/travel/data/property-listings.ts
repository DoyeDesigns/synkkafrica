export type PropertyListingAmenity = {
  icon: "coffee" | "dumbbell";
  label: string;
};

export type PropertyListingItem = {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  currency: string;
  image: string;
  amenities: PropertyListingAmenity[];
};

export const FEATURED_PROPERTIES: PropertyListingItem[] = [
  {
    id: "eko-hotels",
    name: "Eko Hotels & Suites",
    location: "Lagos, Nigeria",
    rating: 5,
    price: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    amenities: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "dumbbell", label: "Gym & spa" },
    ],
  },
  {
    id: "eko-hotels-2",
    name: "Eko Hotels & Suites",
    location: "Lagos, Nigeria",
    rating: 5,
    price: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    amenities: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "dumbbell", label: "Gym & spa" },
    ],
  },
  {
    id: "eko-hotels-3",
    name: "Eko Hotels & Suites",
    location: "Lagos, Nigeria",
    rating: 5,
    price: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    amenities: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "dumbbell", label: "Gym & spa" },
    ],
  },
  {
    id: "eko-hotels-4",
    name: "Eko Hotels & Suites",
    location: "Lagos, Nigeria",
    rating: 5,
    price: 156500,
    currency: "NGN",
    image: "/hero/accommodations.png",
    amenities: [
      { icon: "coffee", label: "Breakfast included" },
      { icon: "dumbbell", label: "Gym & spa" },
    ],
  },
];
