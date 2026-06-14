"use client";

import { Suspense } from "react";

import { HeroSection } from "@/features/travel/components/hero/hero-section";
import { SectionBodyContent } from "@/features/travel/components/section-body-content";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";

function TravelHomeContent() {
  const { section, setSection, submitSearch, isPending } = useTravelNavigation();

  return (
    <>
      <HeroSection
        section={section}
        onSectionChange={setSection}
        onSearch={submitSearch}
        isPending={isPending}
      />
      <SectionBodyContent />
    </>
  );
}

export function TravelHomePage() {
  return (
    <Suspense fallback={<div className="min-h-[550px] bg-zinc-900" />}>
      <TravelHomeContent />
    </Suspense>
  );
}
