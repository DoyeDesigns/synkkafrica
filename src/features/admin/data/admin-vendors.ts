export type AdminVendor = {
  id: string;
  name: string;
  email: string;
  experienceCount: number;
  earnings: number;
  currency: string;
  rating: number;
  enabled: boolean;
};

export const ADMIN_VENDORS: AdminVendor[] = [
  {
    id: "vendor-alex",
    name: "Alex Autos",
    email: "alex@alexautos.ng",
    experienceCount: 3,
    earnings: 8420000,
    currency: "NGN",
    rating: 4.7,
    enabled: true,
  },
  {
    id: "vendor-coastal",
    name: "Coastal Trails NG",
    email: "hello@coastaltrails.ng",
    experienceCount: 5,
    earnings: 5120000,
    currency: "NGN",
    rating: 4.5,
    enabled: true,
  },
  {
    id: "vendor-luxe",
    name: "Luxe Lagos Stays",
    email: "ops@luxelagos.ng",
    experienceCount: 2,
    earnings: 2100000,
    currency: "NGN",
    rating: 3.9,
    enabled: false,
  },
];
