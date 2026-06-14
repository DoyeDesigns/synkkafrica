"use client";

import { useSectionContent } from "@/features/travel/hooks/use-section-content";
import { useTravelNavigation } from "@/features/travel/hooks/use-travel-navigation";

export function SectionBodyContent() {
  const { view, resetToLanding } = useTravelNavigation();
  const { content, isLoading, config } = useSectionContent();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#e45d25]">
          {config.label} · {view === "results" ? "Results" : "Landing"}
        </p>

        {isLoading ? (
          <p className="mt-3 text-foreground/70">Loading section content...</p>
        ) : (
          <p className="mt-3 text-lg text-foreground">{content}</p>
        )}

        {view === "results" && (
          <button
            type="button"
            onClick={resetToLanding}
            className="mt-6 text-sm font-medium text-[#e45d25] hover:underline"
          >
            Back to {config.label} landing
          </button>
        )}
      </div>
    </section>
  );
}
