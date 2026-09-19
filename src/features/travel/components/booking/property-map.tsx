"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { geocodeAddress } from "@/lib/api/places";

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
  // Free-text location (e.g. "Lekki Phase 1, Lagos, Nigeria") to geocode when
  // real coordinates aren't available.
  query?: string;
};

// [0, 0] (and anything within ~100m of it) is "null island" — the placeholder
// listings carry when they have no real geodata. Treat it as unknown.
function isRealCoord(c: [number, number]): boolean {
  return (
    Number.isFinite(c[0]) &&
    Number.isFinite(c[1]) &&
    (Math.abs(c[0]) > 0.001 || Math.abs(c[1]) > 0.001)
  );
}

export function PropertyMap({ coordinates, label, query }: PropertyMapProps) {
  const immediate = isRealCoord(coordinates) ? coordinates : null;
  const q = query?.trim() ?? "";
  const [geocoded, setGeocoded] = useState<[number, number] | null>(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const resolved = immediate ?? geocoded;

  useEffect(() => {
    if (immediate || !q) return;

    let active = true;
    setGeocoded(null);
    setGeoFailed(false);

    geocodeAddress(q)
      .then((place) => {
        if (!active) return;
        if (place) {
          setGeocoded([place.lat, place.lon]);
        } else {
          setGeoFailed(true);
        }
      })
      .catch(() => {
        if (active) setGeoFailed(true);
      });

    return () => {
      active = false;
    };
  }, [immediate, q]);

  const unavailable = !resolved && (geoFailed || !q);

  return (
    <div className="h-56 overflow-hidden rounded-xl sm:h-64">
      {resolved ? (
        <PropertyMapInner
          key={`${resolved[0]},${resolved[1]}`}
          coordinates={resolved}
          label={label}
        />
      ) : unavailable ? (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-100 px-4 text-center text-sm font-medium font-satoshi text-foreground/60">
          {q || "Location not available"}
        </div>
      ) : (
        <div className="h-full w-full animate-pulse rounded-2xl bg-zinc-100" />
      )}
    </div>
  );
}
