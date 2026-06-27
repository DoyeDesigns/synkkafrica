"use client";

import { useFormatPrice } from "@/hooks/use-format-price";

type DisplayPriceProps = {
  currency: string;
  amount: number;
};

export function DisplayPrice({ currency, amount }: DisplayPriceProps) {
  const formatPrice = useFormatPrice();

  return <>{formatPrice(currency, amount)}</>;
}
