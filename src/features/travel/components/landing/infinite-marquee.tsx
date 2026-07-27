"use client";

import type { ReactNode } from "react";

type InfiniteMarqueeProps = {
  itemCount: number;
  children: ReactNode;
  className?: string;
};

export function InfiniteMarquee({
  itemCount,
  children,
  className = "",
}: InfiniteMarqueeProps) {
  const duration = Math.max(itemCount * 6, 18);

  return (
    <div className={`infinite-marquee-wrapper pb-2 ${className}`}>
      <div
        className="infinite-marquee-track flex w-max gap-5"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {children}
      </div>
    </div>
  );
}
