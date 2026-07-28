"use client";

import { ArrowRight, Loader2, TrendingDown, TrendingUp } from "lucide-react";

import type { PriceChangedBody } from "@/lib/api/bookings";

function money(amount: string, currency: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
}

export function PriceChangeDialog({
  change,
  submitting,
  onCancel,
  onConfirm,
}: {
  change: PriceChangedBody;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const prev = Number(change.previousTotal);
  const curr = Number(change.currentTotal);
  const diff = curr - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;
  const up = diff > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              up ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {up ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground">
            The fare {up ? "went up" : "dropped"}
          </h2>
        </div>

        <p className="mt-3 text-sm text-foreground/70">
          The airline updated this fare since you searched. Confirm the new
          price to continue, or go back and pick another flight.
        </p>

        <div className="mt-4 flex items-center justify-center gap-4 rounded-xl border border-black/10 bg-[#FAFAFA] p-4">
          <div className="text-center">
            <div className="text-xs text-foreground/50">Was</div>
            <div className="text-lg font-semibold text-foreground/60 line-through">
              {money(change.previousTotal, change.currency)}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-foreground/40" />
          <div className="text-center">
            <div className="text-xs text-foreground/50">Now</div>
            <div className="text-xl font-bold text-foreground">
              {money(change.currentTotal, change.currency)}
            </div>
          </div>
          <span
            className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              up
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {up ? "+" : ""}
            {pct.toFixed(1)}%
          </span>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="h-11 flex-1 rounded-lg border border-[#C9C9C9] text-sm font-semibold text-foreground hover:bg-black/[0.03] disabled:opacity-60"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#004785] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
              </>
            ) : (
              `Continue at ${money(change.currentTotal, change.currency)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
