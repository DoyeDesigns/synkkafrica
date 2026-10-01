"use client";

// Shared building blocks for the admin customers / vendors / verifications
// pages: URL-backed filters, pagination, skeletons, banners, confirm dialog
// and the card / menu primitives from the approved mock designs.

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, type LucideIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

export const PAGE_SIZE = 20;

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-1";

// ---------------------------------------------------------------------------
// Formatting

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: string): string {
  const code = (currency || "NGN").toUpperCase();
  let fmt = moneyFormatters.get(code);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2,
      });
    } catch {
      fmt = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });
    }
    moneyFormatters.set(code, fmt);
  }
  return fmt.format(amount);
}

/** Per-currency totals joined, e.g. "₦120,000 + $40". Never summed across. */
export function formatAmounts(
  list: Array<{ currency: string; amount: number }>,
  empty = "—",
): string {
  if (list.length === 0) return empty;
  return list.map((x) => formatMoney(x.amount, x.currency)).join(" + ");
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** dd MMM yyyy, or an em dash. */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return "—";
  const ms = Date.now() - new Date(value).getTime();
  if (Number.isNaN(ms)) return "—";
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(value);
}

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const hours = mins / 60;
  if (hours < 48) return `${Math.round(hours * 10) / 10} h`;
  return `${Math.round(hours / 24)} d`;
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0]![0]! + parts[parts.length - 1]![0]! : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// ---------------------------------------------------------------------------
// URL state (pages using these must render under a <Suspense> boundary)

export function useUrlState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const set = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const get = useCallback((key: string, fallback = "") => params.get(key) ?? fallback, [params]);

  return { params, get, set };
}

/** Search box bound to `?q=`; the URL follows typing after `delay` ms. */
export function useUrlSearch(key = "q", delay = 250) {
  const { get, set } = useUrlState();
  const committed = get(key);
  const [input, setInput] = useState(committed);
  const [lastCommitted, setLastCommitted] = useState(committed);
  if (committed !== lastCommitted) {
    setLastCommitted(committed);
    if (committed !== input.trim()) setInput(committed);
  }

  useEffect(() => {
    const term = input.trim();
    if (term === committed) return;
    const id = window.setTimeout(() => set({ [key]: term, page: null }), delay);
    return () => window.clearTimeout(id);
  }, [input, committed, key, delay, set]);

  return { input, setInput, term: committed.trim().toLowerCase() };
}

export function paginate<T>(items: T[], rawPage: string, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = Number.parseInt(rawPage || "1", 10);
  const currentPage = Number.isFinite(requested) ? Math.min(Math.max(1, requested), totalPages) : 1;
  return {
    currentPage,
    totalPages,
    items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  };
}

// ---------------------------------------------------------------------------
// Sorting

export type SortDir = "asc" | "desc";

export function compareValues(a: string | number | null, b: string | number | null, dir: SortDir) {
  // Nulls always sink to the bottom regardless of direction.
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  const r = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
  return dir === "asc" ? r : -r;
}

export function SortableTh({
  label,
  column,
  sort,
  dir,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  column: string;
  sort: string;
  dir: SortDir;
  onSort: (column: string) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort === column;
  const Icon = active && dir === "asc" ? ChevronUp : ChevronDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-3 ${align === "right" ? "text-right" : ""} ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 rounded uppercase ${focusRing} ${
          active ? "text-[#2F2F2F]" : "hover:text-[#2F2F2F]"
        }`}
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? "opacity-100" : "opacity-40"}`} aria-hidden />
      </button>
    </th>
  );
}

// ---------------------------------------------------------------------------
// Dismissal (menus / dialogs)

export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}

// ---------------------------------------------------------------------------
// Feedback

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-[#EEF1F4] ${className}`} />;
}

export function SkeletonTableRows({ rows = 6, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-4 py-4">
              <Skeleton className={`h-4 ${c === 1 ? "w-36" : "w-20"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ErrorBanner({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-[#F5C2C2] bg-[#FDEBEB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm font-medium font-satoshi text-[#C0392B]">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className={`shrink-0 rounded-lg border border-[#C0392B] bg-white px-3 py-1.5 text-xs font-bold font-satoshi text-[#C0392B] hover:bg-[#FFF5F5] disabled:opacity-60 ${focusRing}`}
        >
          {retrying ? "Retrying…" : "Retry"}
        </button>
      ) : null}
    </div>
  );
}

export type Notice = { tone: "success" | "error"; message: string };

/** Inline success / failure banner that clears itself after a few seconds. */
export function useNotice(timeoutMs = 5000) {
  const [notice, setNotice] = useState<Notice | null>(null);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), timeoutMs);
    return () => window.clearTimeout(id);
  }, [notice, timeoutMs]);
  return { notice, setNotice, clear: () => setNotice(null) };
}

export function NoticeBanner({ notice, onDismiss }: { notice: Notice | null; onDismiss: () => void }) {
  if (!notice) return null;
  const ok = notice.tone === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium font-satoshi ${
        ok ? "border-[#C8E6C9] bg-[#E8F5E9] text-[#2E7D32]" : "border-[#F5C2C2] bg-[#FDEBEB] text-[#C0392B]"
      }`}
    >
      <p>{notice.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className={`shrink-0 rounded px-1 text-base leading-none opacity-70 hover:opacity-100 ${focusRing}`}
      >
        ×
      </button>
    </div>
  );
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="text-sm font-medium font-satoshi text-[#676565]">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className={`mt-3 rounded-lg border border-[#135391] px-4 py-2 text-xs font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] ${focusRing}`}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout primitives (mock look)

export function StatsBar({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-[#0F2744] lg:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`px-5 py-4 ${index > 0 ? "border-[#1E3A5F] lg:border-l" : ""} ${
            index >= 2 ? "border-t border-[#1E3A5F] lg:border-t-0" : ""
          } ${index % 2 === 1 ? "border-l border-[#1E3A5F]" : ""}`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9EB3CC]">{item.label}</p>
          <p className="mt-2 truncate text-xl font-bold font-inter text-[#D4AF37]" title={item.value}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  label,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
}) {
  // Window of at most 7 page buttons around the current page.
  const start = Math.max(1, Math.min(currentPage - 3, totalPages - 6));
  const pages = Array.from({ length: Math.min(7, totalPages) }, (_, i) => start + i);
  const btn = `inline-flex items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium font-satoshi text-[#676565]">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className={btn}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
            className={`min-w-9 rounded-lg px-3 py-2 text-xs font-bold font-satoshi transition-colors ${focusRing} ${
              page === currentPage
                ? "bg-[#135391] text-white"
                : "border border-[#E5E5E5] bg-white text-[#2F2F2F] hover:bg-[#FAFAFA]"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={btn}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
  counts,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        const n = counts?.[o.value];
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold font-satoshi transition-colors ${focusRing} ${
              active
                ? "border-[#2F2F2F] bg-[#2F2F2F] text-white"
                : "border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
            }`}
          >
            {o.label}
            {n !== undefined ? <span className={active ? "ml-1.5 text-white/70" : "ml-1.5 text-[#9E9E9E]"}>{n}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function MetricCard({ value, label, loading }: { value: string; label: string; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white px-5 py-4 shadow-sm">
      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="truncate text-2xl font-bold font-inter text-[#D85A30]" title={value}>
          {value}
        </p>
      )}
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
    </div>
  );
}

export function DetailCard({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">{title}</h3>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export type BadgeTone = "verified" | "notVerified" | "pending" | "failed" | "warning";

export const BADGE_STYLES: Record<BadgeTone, string> = {
  verified: "bg-[#E8F5E9] text-[#2E7D32]",
  notVerified: "bg-[#F5F5F5] text-[#676565]",
  pending: "bg-[#E8EAF6] text-[#3949AB]",
  failed: "bg-[#FDEBEB] text-[#C0392B]",
  warning: "bg-[#FFF3E0] text-[#E65100]",
};

export function DetailRow({
  label,
  value,
  badgeTone,
  children,
}: {
  label: string;
  value?: string;
  badgeTone?: BadgeTone;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-dotted border-[#E0E0E0] py-3 last:border-b-0">
      <span className="text-sm font-medium font-satoshi text-[#676565]">{label}</span>
      {children ??
        (badgeTone ? (
          <span
            className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${BADGE_STYLES[badgeTone]}`}
          >
            {value}
          </span>
        ) : (
          <span className="min-w-0 break-words text-right text-sm font-semibold font-satoshi text-[#2F2F2F]">
            {value?.trim() ? value : "—"}
          </span>
        ))}
    </div>
  );
}

export function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-2" role="group" aria-label={title}>
      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">{title}</p>
      <div>{children}</div>
    </div>
  );
}

export function MenuDivider() {
  return <div className="my-2 border-t border-[#F0F0F0]" />;
}

export function MenuItem({
  icon: Icon,
  label,
  onClick,
  href,
  destructive = false,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
}) {
  const className = `flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-sm font-medium font-satoshi transition-colors hover:bg-[#FAFAFA] focus-visible:bg-[#F0F6FC] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
    destructive ? "text-[#DD2222]" : "text-[#2F2F2F]"
  }`;
  const content = (
    <>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Icon className="h-4 w-4" strokeWidth={destructive ? 2 : 1.75} aria-hidden />
      </span>
      {label}
    </>
  );
  if (href) {
    return (
      <a role="menuitem" href={href} onClick={onClick} className={className}>
        {content}
      </a>
    );
  }
  return (
    <button role="menuitem" type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Confirm dialog (optional reason field)

export type ConfirmConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  pendingLabel: string;
  tone: "danger" | "primary" | "success";
  reason?: {
    label: string;
    placeholder?: string;
    required: boolean;
    min: number;
    max: number;
  };
};

export function ConfirmDialog({
  config,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  config: ConfirmConfig;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const titleId = useId();
  const reasonId = useId();
  const dialogRef = useRef<HTMLFormElement>(null);
  const trimmed = reason.trim();
  const r = config.reason;
  const reasonValid = !r || (r.required ? trimmed.length >= r.min : trimmed.length === 0 || trimmed.length >= r.min);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  useEffect(() => {
    if (!r) dialogRef.current?.querySelector<HTMLButtonElement>("button[type=submit]")?.focus();
  }, [r]);

  const toneClass =
    config.tone === "danger" ? "bg-[#DD2222]" : config.tone === "success" ? "bg-[#2E7D32]" : "bg-[#135391]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <form
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          if (pending || !reasonValid) return;
          onConfirm(trimmed);
        }}
      >
        <h3 id={titleId} className="text-xl font-bold font-satoshi text-[#2F2F2F]">
          {config.title}
        </h3>
        <p className="mt-2 text-sm font-medium font-satoshi leading-relaxed text-[#676565]">{config.message}</p>

        {r ? (
          <div className="mt-4">
            <label htmlFor={reasonId} className="text-xs font-semibold font-satoshi text-[#2F2F2F]">
              {r.label}
            </label>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={r.max}
              rows={3}
              autoFocus
              disabled={pending}
              placeholder={r.placeholder}
              className="mt-1 w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-satoshi outline-none focus:border-[#135391] disabled:opacity-60"
            />
            <p className="mt-1 text-right text-[11px] font-medium font-satoshi text-[#9E9E9E]">
              {trimmed.length}/{r.max}
              {trimmed.length > 0 && trimmed.length < r.min ? ` · at least ${r.min} characters` : ""}
            </p>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-3 rounded-lg bg-[#FDEBEB] px-3 py-2 text-xs font-medium font-satoshi text-[#C0392B]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className={`inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA] disabled:opacity-60 ${focusRing}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !reasonValid}
            className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${toneClass} ${focusRing}`}
          >
            {pending ? config.pendingLabel : config.confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="relative">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none transition-colors focus:border-[#135391] focus-visible:ring-2 focus-visible:ring-[#135391]/30"
      />
    </div>
  );
}
