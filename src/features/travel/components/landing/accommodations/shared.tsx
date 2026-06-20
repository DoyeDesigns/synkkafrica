import { Star } from "lucide-react";
import Image from "next/image";

type PropertyTypeImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function PropertyTypeImage({
  src,
  alt,
  className = "h-9 w-9",
}: PropertyTypeImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={36}
      height={36}
      className={className}
    />
  );
}

type StarRatingProps = {
  rating: number;
  reviewCount: number;
};

export function StarRating({ rating, reviewCount }: StarRatingProps) {
  const fullStars = Math.floor(rating);

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              index < fullStars
                ? "fill-amber-400 text-amber-400"
                : "fill-zinc-200 text-zinc-200"
            }`}
          />
        ))}
      </div>
      <span className="text-foreground">
        {rating}/5 ({reviewCount} Reviews)
      </span>
    </div>
  );
}
