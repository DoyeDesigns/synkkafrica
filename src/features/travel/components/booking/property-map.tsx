"use client";

import dynamic from "next/dynamic";

const PropertyMapInner = dynamic(
  () =>
    import("./property-map-inner").then((module) => module.PropertyMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-zinc-100" />
    ),
  },
);

type PropertyMapProps = {
  coordinates: [number, number];
  label: string;
};

export function PropertyMap({ coordinates, label }: PropertyMapProps) {
  return (
    <div className="h-56 overflow-hidden rounded-xl sm:h-64">
      <PropertyMapInner coordinates={coordinates} label={label} />
    </div>
  );
}
