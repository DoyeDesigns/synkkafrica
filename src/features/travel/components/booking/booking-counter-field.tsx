"use client";

import { Minus, Plus } from "lucide-react";

type BookingCounterFieldProps = {
  icon?: React.ReactNode;
  label: string;
  value: number;
  min?: number;
  max?: number;
  decreaseLabel?: string;
  increaseLabel?: string;
  onChange: (value: number) => void;
};

export function BookingCounterField({
  icon,
  label,
  value,
  min = 1,
  max = 30,
  decreaseLabel,
  increaseLabel,
  onChange,
}: BookingCounterFieldProps) {
  return (
    <div className="flex min-w-[140px] flex-1 items-center justify-between gap-3 rounded-[10px] border border-[#E5E5E5] bg-[#F8F8F8] px-3 py-2.5">
      <div>
        <p className="text-[11px] font-medium font-satoshi text-foreground/60">
          {label}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm font-medium font-satoshi text-foreground">
          {icon ? <span className="text-[#676565]">{icon}</span> : null}
          {value}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="rounded-md border border-[#E5E5E5] bg-white p-1 text-[#676565]"
          aria-label={decreaseLabel ?? `Decrease ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="rounded-md border border-[#E5E5E5] bg-white p-1 text-[#676565]"
          aria-label={increaseLabel ?? `Increase ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
