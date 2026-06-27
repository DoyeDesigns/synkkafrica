export type AmenityTag = "additional-charge" | "free";

export type AmenityListItem = {
  label: string;
  tag?: AmenityTag;
};

export type AmenitySubsection = {
  title: string;
  tag?: AmenityTag;
  items: AmenityListItem[];
};

export type AmenityCategoryIcon =
  | "stay"
  | "outdoors"
  | "pets"
  | "wifi"
  | "parking"
  | "front-desk"
  | "family"
  | "cleaning"
  | "general"
  | "accessibility"
  | "pool";

export type AmenityCategory = {
  title: string;
  icon: AmenityCategoryIcon;
  description?: string;
  items?: AmenityListItem[];
  subsections?: AmenitySubsection[];
};

export type PropertyAmenities = AmenityCategory[][];

export const DEFAULT_PROPERTY_AMENITIES: PropertyAmenities = [
  [
    {
      title: "Great for your stay",
      icon: "stay",
      items: [
        { label: "Restaurant" },
        { label: "Free Wifi" },
        { label: "Parking" },
        { label: "Spa" },
        { label: "Family rooms" },
        { label: "Room service" },
        { label: "Airport shuttle" },
        { label: "BBQ facilities" },
        { label: "Pet friendly" },
        { label: "Non-smoking rooms" },
      ],
    },
    {
      title: "Outdoors",
      icon: "outdoors",
      items: [
        { label: "Outdoor fireplace" },
        { label: "Beachfront" },
        { label: "Sun deck" },
        { label: "Private beach area" },
        { label: "BBQ facilities", tag: "additional-charge" },
        { label: "Terrace" },
        { label: "Garden" },
      ],
    },
    {
      title: "Pets",
      icon: "pets",
      description: "Pets are allowed on request. No extra charges.",
    },
  ],
  [
    {
      title: "Internet",
      icon: "wifi",
      description: "Wifi is available in all areas and is free of charge.",
    },
    {
      title: "On-site parking",
      icon: "parking",
      description:
        "Free public parking is available on site (reservation is not needed).",
      items: [
        { label: "Valet parking" },
        { label: "Parking garage" },
        { label: "Accessible parking" },
      ],
    },
    {
      title: "Front Desk Services",
      icon: "front-desk",
      items: [
        { label: "Lockers" },
        { label: "Concierge" },
        { label: "ATM on site" },
        { label: "Baggage storage" },
        { label: "Currency exchange" },
        { label: "24-hour front desk" },
      ],
    },
    {
      title: "Entertainment & Family Services",
      icon: "family",
      items: [{ label: "Outdoor play equipment for kids" }],
    },
    {
      title: "Cleaning Services",
      icon: "cleaning",
      items: [
        { label: "Daily housekeeping" },
        { label: "Ironing service", tag: "additional-charge" },
      ],
    },
  ],
  [
    {
      title: "General",
      icon: "general",
      items: [
        { label: "Shuttle service" },
        { label: "Shared lounge/TV area" },
        { label: "Air conditioning" },
        { label: "Car rental" },
        { label: "Packed lunches" },
        { label: "Family rooms" },
        { label: "Facilities for disabled guests" },
        { label: "Airport shuttle", tag: "additional-charge" },
        { label: "Non-smoking rooms" },
        { label: "Room service" },
      ],
    },
    {
      title: "Accessibility",
      icon: "accessibility",
      items: [{ label: "Bathroom emergency cord" }],
    },
    {
      title: "2 swimming pools",
      icon: "pool",
      subsections: [
        {
          title: "Pool 1 – outdoor",
          tag: "free",
          items: [
            { label: "Open all year" },
            { label: "Adults only" },
            { label: "Pool/Beach towels" },
            { label: "Pool bar" },
            { label: "Beach chairs/Loungers" },
          ],
        },
      ],
    },
  ],
];
