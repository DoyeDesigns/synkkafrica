import Image from "next/image";

export function ExperiencesPromoCard() {
  return (
    <article className="relative min-h-[484px] overflow-hidden rounded-xl bg-zinc-900">
      <Image
        src="/promo/experience.png"
        alt="Browse African experiences"
        fill
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
        <p className="max-w-[220px] text-2xl font-semibold leading-tight text-white drop-shadow-sm">
          Enjoy the Countless experiences all in One destination.
        </p>

        <button
          type="button"
          className="shrink-0 rounded-md bg-[#D85A30] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Browse Experiences
        </button>
      </div>
    </article>
  );
}
