import { Heart } from "lucide-react";
import Image from "next/image";

import type { SavedTourItem } from "@/features/account/data/account-saved";

type SavedTourCardProps = {
  item: SavedTourItem;
};

export function SavedTourCard({ item }: SavedTourCardProps) {
  return (
    <article className="relative h-[232px] w-[260px] shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
      <Image
        src={item.image}
        alt={item.alt}
        fill
        className="object-cover"
        sizes="260px"
      />

      <button
        type="button"
        aria-label="Remove from saved"
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
      >
        <Heart className="h-4 w-4 fill-[#E53935] text-[#E53935]" strokeWidth={1.5} />
      </button>
    </article>
  );
}
