import { AppPromoCard } from "./app-promo-card";
import { ExperiencesPromoCard } from "./experiences-promo-card";

export function ExperiencePromoSection() {
  return (
    <section className="py-35">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1">
          <AppPromoCard />
        </div>
        <div className="md:col-span-2">
          <ExperiencesPromoCard />
        </div>
      </div>
    </section>
  );
}
