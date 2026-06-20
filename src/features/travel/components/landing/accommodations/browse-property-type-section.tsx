"use client";

import { useState } from "react";

import { PROPERTY_TYPES } from "@/features/travel/data/accommodations-landing";
import { TRAVEL_CAROUSEL_SCROLL_CLASS } from "@/features/travel/constants";
import { PropertyTypeImage } from "./shared";
import Link from "next/link";

export function BrowsePropertyTypeSection() {
  const [activeType, setActiveType] = useState(PROPERTY_TYPES[0]?.id ?? "hotels");

  return (
    <section className="space-y-12 pt-22 pb-16">
      <h2 className="text-center text-[22px] font-montserrat font-bold text-foreground">
        Browse by property type
      </h2>

      <div className={`flex justify-center gap-5 overflow-x-auto ${TRAVEL_CAROUSEL_SCROLL_CLASS}`}>
        {PROPERTY_TYPES.map((type) => {
          const isActive = activeType === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setActiveType(type.id)}
              className={`relative flex min-w-[135px] h-[126px] shrink-0 flex-col items-center justify-center gap-3 rounded-xl border transition-colors ${
                isActive
                  ? "border-[#D85A30] bg-white"
                  : "border-black/10 bg-white hover:border-black/20"
              }`}
            >
              <PropertyTypeImage src={type.image} alt={type.label} />

              <div className="text-center">
                <p className="text-sm font-bold font-satoshi text-foreground">{type.label}</p>
                <p className="text-lg font-medium font-satoshi text-[#D85A30]">({type.count})</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[url('/flight-availability.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-end items-end h-[275px] rounded-[10px]">
        <div className="flex items-center w-full justify-between bg-black/10 backdrop-blur-[9px] py-10">
          <p className="text-white text-[22px] max-w-[350px] text-lg font-semibold font-montserrat ml-12">Booking flights have never been easier</p>
          <Link className="text-[#D85A30] bg-white px-6 py-2.5 mr-15 rounded-[5px] font-bold text-sm font-montserrat" href="/?section=flights&view=results">Check availability</Link>
        </div>
      </div>
    </section>
  );
}
