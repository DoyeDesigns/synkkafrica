"use client";

// Small UI/state helpers shared by the admin bookings and reviews live pages:
// URL-backed filter state, debounced search, error/success banners,
// skeletons, pagination and money/date formatting.

import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const ADMIN_LIST_PAGE_SIZE = 20;

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

// Reads/writes filter state in the query string so refresh and back/forward
// keep the view. Values equal to their default are dropped from the URL.
export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams],
  );

  const set = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const qs = next.toString();
      if (qs === searchParams.toString()) return;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { get, set };
}

// A search box whose debounced value lives in the URL under `key`. Typing
// updates the box instantly; the URL (and so the filter) follows after the
// debounce, and resets `page`. Back/forward updates the box too.
export function useUrlSearch(
  url: ReturnType<typeof useUrlState>,
  key = "q",
): [string, (value: string) => void, string] {
  const urlValue = url.get(key);
  const setUrl = url.set;
  const [input, setInput] = useState(urlValue);
  const [prevUrlValue, setPrevUrlValue] = useState(urlValue);
  if (urlValue !== prevUrlValue) {
    setPrevUrlValue(urlValue);
    if (urlValue !== input.trim()) setInput(urlValue);
  }

  const debounced = useDebouncedValue(input);
  const lastDebounced = useRef(debounced);
  useEffect(() => {
    if (lastDebounced.current === debounced) return;
    lastDebounced.current = debounced;
    const next = debounced.trim();
    if (next !== urlValue) setUrl({ [key]: next || null, page: null });
  }, [debounced, key, setUrl, urlValue]);

  return [input, setInput, urlValue.trim().toLowerCase()];
}

export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onEscape]);
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const DATE_ONLY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// dd MMM yyyy. A bare YYYY-MM-DD (a calendar date, not an instant) is
// formatted in UTC so it never shifts a day in the viewer's timezone.
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return DATE_ONLY_FORMAT.format(new Date(`${value}T00:00:00Z`));
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : DATE_FORMAT.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : DATE_TIME_FORMAT.format(d);
}

export function ErrorBanner({
  message,
  onRetry,
  retrying = false,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-[#F5C2C0] bg-[#FDEBEB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-sm font-medium font-satoshi text-[#C0392B]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {message}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="shrink-0 rounded-lg border border-[#C0392B] bg-white px-3 py-1.5 text-xs font-bold font-satoshi text-[#C0392B] transition-colors hover:bg-[#FFF5F5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C0392B] disabled:opacity-60"
        >
          {retrying ? "Retrying…" : "Retry"}
        </button>
      ) : null}
    </div>
  );
}

export type Notice = { tone: "success" | "error"; message: string };

// Inline success/failure feedback for an action. Success notices clear
// themselves after a few seconds; errors stay until dismissed.
export function NoticeBanner({
  notice,
  onDismiss,
}: {
  notice: Notice | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (notice?.tone !== "success") return;
    const id = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(id);
  }, [notice, onDismiss]);

  if (!notice) return null;
  const success = notice.tone === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? "status" : "alert"}
      aria-live="polite"
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 ${
        success
          ? "border-[#C8E6C9] bg-[#E8F5E9] text-[#2E7D32]"
          : "border-[#F5C2C0] bg-[#FDEBEB] text-[#C0392B]"
      }`}
    >
      <p className="flex items-start gap-2 text-sm font-medium font-satoshi">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {notice.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 hover:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export function SkeletonBlock({ className }: { className: string }) {
  return <span className={`block animate-pulse rounded bg-[#EEEEEE] ${className}`} />;
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize = ADMIN_LIST_PAGE_SIZE,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const buttonClass =
    "inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-semibold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={buttonClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <span className="text-sm font-medium font-satoshi text-[#676565]">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className={buttonClass}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

// Clamp a 1-based page number from the URL into range.
export function clampPage(raw: string, pageCount: number): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(1, pageCount));
}
