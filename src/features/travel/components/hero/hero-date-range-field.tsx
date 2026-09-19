"use client";

import { MoveRight, Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HeroRangeCalendar } from "@/features/travel/components/hero/hero-range-calendar";

function parseISO(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function displayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

type HeroDateRangeFieldProps = {
  fromLabel: string;
  toLabel: string;
  addDateLabel: string;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  showToDate?: boolean;
  className?: string;
  variant?: "hero" | "form";
  minDate?: string | null;
  maxDate?: string | null;
  disablePast?: boolean;
  showCaptionDropdown?: boolean;
};

export function HeroDateRangeField({
  fromLabel,
  toLabel,
  addDateLabel,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  showToDate = true,
  className = "",
  variant = "hero",
  minDate,
  maxDate,
  disablePast = true,
  showCaptionDropdown = false,
}: HeroDateRangeFieldProps) {
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fromSelected = parseISO(fromDate);
  const toSelected = parseISO(toDate);
  const isHero = variant === "hero";

  const updatePopoverPosition = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const preferredWidth = showToDate ? 560 : 340;
    const width = Math.min(preferredWidth, window.innerWidth - 16);
    const maxLeft = window.innerWidth - width - 8;
    const left = Math.max(8, Math.min(rect.left, maxLeft));

    setPopoverPosition({
      top: rect.bottom + 8,
      left,
      width,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePopoverPosition();

    const handleReposition = () => updatePopoverPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, showToDate]);

  const openCalendar = () => {
    updatePopoverPosition();
    setOpen(true);
  };

  const handleFromChange = (value: string) => {
    onFromDateChange(value);
    if (!showToDate) {
      setOpen(false);
    }
  };

  const handleToChange = (value: string) => {
    onToDateChange(value);
    if (value) {
      setOpen(false);
    }
  };

  const calendarPopover =
    open && popoverPosition
      ? createPortal(
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-90 cursor-default bg-transparent"
              onClick={() => setOpen(false)}
            />
            <div
              ref={popoverRef}
              style={{
                top: popoverPosition.top,
                left: popoverPosition.left,
                width: popoverPosition.width,
              }}
              className="fixed z-100 rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-2xl"
            >
              <HeroRangeCalendar
                mode={showToDate ? "range" : "single"}
                fromDate={fromDate || null}
                toDate={toDate || null}
                onFromChange={handleFromChange}
                onToChange={handleToChange}
                minDate={minDate}
                maxDate={maxDate}
                disablePast={disablePast}
                showCaptionDropdown={showCaptionDropdown}
              />
            </div>
          </>,
          document.body,
        )
      : null;

  const labelClass = isHero
    ? "block text-[10px] font-medium text-white/65"
    : "block text-[10px] font-medium text-foreground/60";
  const valueClass = (hasValue: boolean) =>
    isHero
      ? `mt-0.5 block truncate text-sm font-semibold leading-4 ${
          hasValue ? "text-white" : "text-white/75"
        }`
      : `mt-0.5 block truncate text-sm font-semibold leading-4 ${
          hasValue ? "text-foreground" : "text-foreground/50"
        }`;

  return (
    <>
      <div
        ref={containerRef}
        className={
          isHero
            ? `relative flex min-h-12 w-full min-w-0 flex-1 items-stretch rounded-xl bg-[#0000003D] text-sm text-white/90 ${className}`
            : `relative flex min-h-11 w-full min-w-0 items-stretch rounded-md border border-[#E5E5E5] bg-white text-sm text-foreground ${className}`
        }
      >
        <button
          type="button"
          onClick={openCalendar}
          className={`flex min-h-full min-w-0 flex-1 items-center gap-2 px-4 text-left transition-opacity hover:opacity-90 ${
            showToDate
              ? isHero
                ? "border-r border-white/20"
                : "border-r border-[#E5E5E5]"
              : ""
          }`}
        >
          <Calendar
            className={`h-4 w-4 shrink-0 ${isHero ? "" : "text-[#676565]"}`}
            strokeWidth={1.75}
          />
          <span className="min-w-0 leading-none">
            <span className={labelClass}>{fromLabel}</span>
            <span className={valueClass(Boolean(fromSelected))}>
              {fromSelected ? displayDate(fromSelected) : addDateLabel}
            </span>
          </span>
        </button>

        {showToDate ? (
          <>
            <div
              className={`flex shrink-0 items-center px-1.5 ${
                isHero ? "text-white/70" : "text-foreground/50"
              }`}
            >
              <MoveRight className="h-4.5 w-8" strokeWidth={2} />
            </div>

            <button
              type="button"
              onClick={openCalendar}
              className="flex min-h-full min-w-0 flex-1 items-center gap-2 px-4 text-left transition-opacity hover:opacity-90"
            >
              <span className="min-w-0 leading-none">
                <span className={labelClass}>{toLabel}</span>
                <span className={valueClass(Boolean(toSelected))}>
                  {toSelected ? displayDate(toSelected) : addDateLabel}
                </span>
              </span>
            </button>
          </>
        ) : null}
      </div>

      {calendarPopover}
    </>
  );
}
