"use client";

import { Plane } from "lucide-react";

// Airlines the platform surfaces (Duffel content). Logos are asset-dependent;
// until they're added we render tidy name pills so the row is faithful.
const AIRLINES = [
  "British Airways",
  "Lufthansa",
  "KLM",
  "Iberia",
  "Aer Lingus",
  "Air France",
  "Finnair",
];

export function AirlinePartnersSection() {
  return (
    <section className="mx-auto max-w-6xl px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {AIRLINES.map((name) => (
          <div
            key={name}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#1E1E1E] shadow-sm"
          >
            <Plane className="h-4 w-4 text-[#004785]" />
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
