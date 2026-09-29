// Format an amount in its own currency (no FX conversion). Use for amounts
// that are actually charged — checkout totals, vendor earnings — where showing
// the display-currency conversion would misstate what the provider bills.
export function formatMoney(currency: string, amount: number): string {
  const code = (currency || "NGN").toUpperCase();
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  }
}
