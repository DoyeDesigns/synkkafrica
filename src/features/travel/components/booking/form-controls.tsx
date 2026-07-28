"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import "./date-picker.css";

const base =
  "flex h-11 w-full items-center rounded-md border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

export type Option = { value: string; label: string };

// Custom dropdown (no native <select>). Closes on outside click via a backdrop.
export function FormSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`${base} justify-between focus:border-[#004785] ${
          open ? "border-[#004785]" : ""
        }`}
      >
        <span>{current?.label}</span>
        <ChevronDown
          className={`h-4 w-4 text-foreground/50 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute left-0 top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-black/10 bg-white py-1 shadow-lg">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-[#F2F6FA] ${
                    o.value === value
                      ? "font-semibold text-[#004785]"
                      : "text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

// Parse "YYYY-MM-DD" into a *local* Date (avoids the UTC-midnight off-by-one
// that `new Date("2020-01-01")` causes in negative-offset timezones).
function parseISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}
function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function displayDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Custom calendar popover (no native date input). Month + year dropdowns make
// picking a birth year / passport-expiry year quick.
export function FormDate({
  value,
  onChange,
  min,
  max,
  placeholder,
  className,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const minDate = parseISO(min);
  const maxDate = parseISO(max);
  const today = new Date();

  const startMonth = minDate ?? new Date(1920, 0);
  const endMonth = maxDate ?? new Date(today.getFullYear() + 20, 11);
  const disabledDays: Matcher[] = [];
  if (minDate) disabledDays.push({ before: minDate });
  if (maxDate) disabledDays.push({ after: maxDate });

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={placeholder}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${className ?? base} justify-between ${
          open ? "border-[#004785]" : ""
        } disabled:cursor-default disabled:bg-[#FAFAFA]`}
      >
        <span className={selected ? "text-foreground" : "text-[#9E9E9E]"}>
          {selected ? displayDate(selected) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 text-foreground/50" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="synkka-daypicker absolute left-0 top-full z-20 mt-1 rounded-xl border border-black/10 bg-white p-3 shadow-xl">
            <DayPicker
              mode="single"
              captionLayout="dropdown"
              selected={selected}
              defaultMonth={selected ?? maxDate ?? minDate ?? today}
              startMonth={startMonth}
              endMonth={endMonth}
              disabled={disabledDays}
              onSelect={(d) => {
                if (d) {
                  onChange(toISO(d));
                  setOpen(false);
                }
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
