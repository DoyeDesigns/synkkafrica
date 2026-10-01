"use client";

import { useState } from "react";

export type BarDatum = {
  key: string;
  // Short x-axis label and full tooltip label.
  label: string;
  longLabel: string;
  value: number;
};

type Props = {
  title: string;
  data: BarDatum[];
  formatValue: (n: number) => string;
  formatAxis: (n: number) => string;
  // Column header for the screen-reader table.
  valueLabel: string;
};

// Single-series bar chart in plain HTML/CSS so it reflows from phone to
// laptop. Hover shows a tooltip; screen readers get a summary + a data table.
export function AdminDashboardBarChart({
  title,
  data,
  formatValue,
  formatAxis,
  valueLabel,
}: Props) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...data.map((d) => d.value));
  const total = data.reduce((a, d) => a + d.value, 0);
  const peak = data.reduce<BarDatum | null>(
    (best, d) => (d.value > (best?.value ?? 0) ? d : best),
    null,
  );
  const ticks = max > 0 ? [max, max / 2, 0] : [0];
  // Show at most ~6 x labels so they never collide.
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));
  const hovered = active !== null ? data[active] : null;

  const summary =
    data.length === 0
      ? `${title}: no data`
      : `${title}, ${data[0].longLabel} to ${data[data.length - 1].longLabel}. Total ${formatValue(total)}${
          peak
            ? `; highest ${formatValue(peak.value)} on ${peak.longLabel}`
            : ""
        }.`;

  return (
    <figure className="min-w-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">
          {title}
        </span>
        <span className="text-sm font-semibold font-inter text-[#676565]">
          {hovered ? (
            <>
              {hovered.longLabel}:{" "}
              <span className="text-[#2F2F2F]">
                {formatValue(hovered.value)}
              </span>
            </>
          ) : (
            <>
              Total <span className="text-[#2F2F2F]">{formatValue(total)}</span>
            </>
          )}
        </span>
      </figcaption>

      <div className="mt-3 flex gap-2" role="img" aria-label={summary}>
        {/* y-axis */}
        <div
          aria-hidden
          className="flex h-40 w-12 shrink-0 flex-col justify-between text-right text-[11px] font-medium font-inter text-[#9A9A9A]"
        >
          {ticks.map((t, i) => (
            <span key={i} className="leading-none">
              {formatAxis(t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* gridlines */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between"
          >
            {ticks.map((_, i) => (
              <div key={i} className="border-t border-[#F0F0F0]" />
            ))}
          </div>

          <div
            className="relative flex h-40 items-end gap-[2px]"
            onMouseLeave={() => setActive(null)}
          >
            {data.map((d, i) => {
              const pct = max > 0 ? (d.value / max) * 100 : 0;
              return (
                <div
                  key={d.key}
                  aria-hidden
                  onMouseEnter={() => setActive(i)}
                  className="group relative flex h-full min-w-0 flex-1 items-end"
                >
                  <div
                    className={`w-full rounded-t-[4px] transition-colors ${
                      active === i ? "bg-[#B4441F]" : "bg-[#D85A30]"
                    }`}
                    style={{
                      height: d.value > 0 ? `max(${pct}%, 2px)` : "0px",
                    }}
                  />
                  {active === i ? (
                    <div
                      className={`pointer-events-none absolute bottom-full z-10 mb-1 whitespace-nowrap ${
                        i < data.length / 2 ? "left-0" : "right-0"
                      } rounded-md bg-[#2F2F2F] px-2 py-1 text-xs font-semibold font-inter text-white shadow`}
                    >
                      {d.longLabel}: {formatValue(d.value)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* x labels */}
          <div
            aria-hidden
            className="mt-2 flex gap-[2px] overflow-hidden text-[11px] font-medium font-inter text-[#9A9A9A]"
          >
            {data.map((d, i) => (
              <div key={d.key} className="relative min-w-0 flex-1">
                {i % labelEvery === 0 ? (
                  <span className="absolute left-0 whitespace-nowrap">
                    {d.label}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <div className="h-3" />
        </div>
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{d.longLabel}</td>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
