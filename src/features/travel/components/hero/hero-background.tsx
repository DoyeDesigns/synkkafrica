"use client";

import { useEffect, useState } from "react";

import {
  ACCOMMODATIONS_HERO_IMAGES,
  ACCOMMODATIONS_HERO_ROTATION_MS,
} from "@/features/travel/constants";

type AccommodationsHeroBackgroundProps = {
  isActive: boolean;
};

export function AccommodationsHeroBackground({
  isActive,
}: AccommodationsHeroBackgroundProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % ACCOMMODATIONS_HERO_IMAGES.length,
      );
    }, ACCOMMODATIONS_HERO_ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <>
      {ACCOMMODATIONS_HERO_IMAGES.map((image, index) => (
        <div
          key={image}
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${image}')` }}
        />
      ))}
    </>
  );
}

type HeroBackgroundProps = {
  heroImage: string;
  isAccommodations: boolean;
};

export function HeroBackground({
  heroImage,
  isAccommodations,
}: HeroBackgroundProps) {
  return (
    <>
      {isAccommodations ? (
        <AccommodationsHeroBackground isActive />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-black/45 via-black/40 to-black/50"
      />
    </>
  );
}
