import Image from "next/image";

export function AppPromoCard() {
  return (
    <article className="relative min-h-[484px] overflow-hidden rounded-xl bg-zinc-100">
      <Image
        src="/promo/loan-section2.png"
        alt="Download the SynKKafrica app"
        fill
        className="object-cover"
      />
    </article>
  );
}
