// Formatting helpers for the admin dashboard. Money is always shown in its own
// currency (no FX conversion, never summed across currencies).

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "dd MMM yyyy" in UTC (bucket keys are UTC).
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Short axis label: "01 Oct" for days, "Oct 2026" for months.
export function formatBucketShort(iso: string, unit: "day" | "month"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return unit === "month"
    ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
    : `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}`;
}

// Full tooltip label: "01 Oct 2026" for days, "Oct 2026" for months.
export function formatBucketLong(iso: string, unit: "day" | "month"): string {
  return unit === "month" ? formatBucketShort(iso, unit) : formatDate(iso);
}

const moneyFormatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: string, compact: boolean, cents: boolean) {
  const key = `${currency}|${compact}|${cents}`;
  let f = moneyFormatters.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        notation: compact ? "compact" : "standard",
        maximumFractionDigits: compact ? 1 : 2,
        minimumFractionDigits: cents ? 2 : 0,
      });
    } catch {
      // Unknown ISO code: fall back to "XYZ 1,234".
      f = new Intl.NumberFormat("en-NG", {
        notation: compact ? "compact" : "standard",
        maximumFractionDigits: compact ? 1 : 2,
      });
      const plain = f;
      f = {
        format: (n: number) => `${currency} ${plain.format(n)}`,
      } as Intl.NumberFormat;
    }
    moneyFormatters.set(key, f);
  }
  return f;
}

export function formatMoney(
  currency: string,
  amount: number,
  opts: { compact?: boolean } = {},
): string {
  const compact = Boolean(opts.compact);
  // Whole amounts drop the ".00"; fractional ones always show 2 decimals.
  const cents = !compact && !Number.isInteger(amount);
  return moneyFormatter(currency, compact, cents).format(amount);
}

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const fullNumber = new Intl.NumberFormat("en");

// 950 -> "950", 1_240 -> "1.2K", 18_500 -> "18.5K".
export function formatCount(n: number): string {
  return Math.abs(n) >= 1000 ? compactNumber.format(n) : fullNumber.format(n);
}

export function formatCountFull(n: number): string {
  return fullNumber.format(n);
}
