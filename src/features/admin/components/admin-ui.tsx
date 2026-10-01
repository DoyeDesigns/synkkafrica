"use client";

// Shared admin UX primitives: skeletons, empty/error states, confirm dialog,
// toasts, debounced URL-backed search, client-side pagination and formatters.
// Kept dependency-free so any admin page can adopt them piecemeal.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
  RotateCw,
  Search,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Styling helpers

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135391] focus-visible:ring-offset-2";

export const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Formatters

const moneyFormatters = new Map<string, Intl.NumberFormat>();

/** "₦250,000" / "$1,200.50" — falls back to "XYZ 1,000" for unknown codes. */
export function formatMoney(
  amount: number | null | undefined,
  currency: string | null | undefined = "NGN",
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return "—";
  }
  const code = (currency || "NGN").toUpperCase();
  try {
    let fmt = moneyFormatters.get(code);
    if (!fmt) {
      fmt = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      });
      moneyFormatters.set(code, fmt);
    }
    return fmt.format(amount);
  } catch {
    return `${code} ${amount.toLocaleString()}`;
  }
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

/** "01 Oct 2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : dateFormatter.format(d);
}

/** "01 Oct 2026, 14:05" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : `${dateFormatter.format(d)}, ${timeFormatter.format(d)}`;
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// ---------------------------------------------------------------------------
// URL state

/**
 * Read/write query-string state with router.replace (no history spam, no
 * scroll jump). Empty values are removed from the URL. Pages using this must
 * sit under a <Suspense> boundary.
 */
export function useUrlState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const set = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const get = useCallback(
    (key: string, fallback = "") => params.get(key) ?? fallback,
    [params],
  );

  return { params, get, set };
}

/**
 * A search box bound to `?<key>=`. Typing updates the input immediately; the
 * URL (and therefore the filtered list) follows after `delay` ms. Resets the
 * page to 1 whenever the committed term changes.
 */
export function useUrlSearch(key = "q", delay = 300) {
  const { get, set } = useUrlState();
  const committed = get(key);
  const [input, setInput] = useState(committed);

  // Keep the box in step when the URL changes elsewhere (back/forward, a
  // "clear filters" button) — adjusted during render, not in an effect.
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

  return { input, setInput, term: committed.toLowerCase() };
}

/** Slice `items` to the current `?page=` and clamp out-of-range pages. */
export function usePagedItems<T>(items: T[], pageSize = PAGE_SIZE) {
  const { get, set } = useUrlState();
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = Number.parseInt(get("page", "1"), 10);
  const page = Math.min(
    Math.max(1, Number.isFinite(requested) ? requested : 1),
    pageCount,
  );
  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );
  const setPage = useCallback(
    (p: number) => set({ page: p <= 1 ? null : p }),
    [set],
  );
  return { page, pageCount, pageItems, setPage, total: items.length, pageSize };
}

// ---------------------------------------------------------------------------
// Toasts

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };
type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {toasts.map((toast) => {
          const Icon =
            toast.tone === "success"
              ? CheckCircle2
              : toast.tone === "error"
                ? XCircle
                : Inbox;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium font-satoshi shadow-lg sm:w-80 ${
                toast.tone === "error"
                  ? "border-[#F5C2C0] text-[#9B1C1C]"
                  : toast.tone === "success"
                    ? "border-[#BFE5CB] text-[#1E5E2F]"
                    : "border-[#E5E5E5] text-[#2F2F2F]"
              }`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className={`-m-1 rounded p-1 text-[#9A9A9A] hover:text-[#2F2F2F] ${focusRing}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

const NOOP_TOASTS: ToastApi = {
  success: () => {},
  error: () => {},
  info: () => {},
};

export function useAdminToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP_TOASTS;
}

// ---------------------------------------------------------------------------
// Page header

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm font-medium font-satoshi text-[#676565]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading / empty / error

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-md bg-[#EEEEEE] ${className}`}
    />
  );
}

export function SkeletonList({
  rows = 5,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="hidden h-8 w-24 sm:block" />
        </div>
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function SkeletonTableRows({
  rows = 8,
  cols,
}: {
  rows?: number;
  cols: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-[#F2F2F2]" aria-hidden="true">
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton className={`h-3.5 ${c === 0 ? "w-28" : "w-20"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E0E0E0] bg-white px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F6FC] text-[#135391]">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-bold font-satoshi text-[#2F2F2F]">
        {title}
      </p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm font-medium font-satoshi text-[#676565]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorBanner({
  message,
  onRetry,
  retrying = false,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-[#F5C2C0] bg-[#FDF2F2] px-4 py-3 text-sm font-medium font-satoshi text-[#9B1C1C] sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {message}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-[#9B1C1C]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#9B1C1C] hover:bg-[#FFF7F7] disabled:opacity-60 ${focusRing}`}
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            {retrying ? "Retrying…" : "Retry"}
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className={`rounded p-1 hover:bg-white ${focusRing}`}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search + pagination

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9A9A9A]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 w-full rounded-lg border border-[#E5E5E5] bg-white pl-9 pr-9 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none placeholder:text-[#9A9A9A] focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#9A9A9A] hover:text-[#2F2F2F] ${focusRing}`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function ResultCount({
  shown,
  total,
  noun,
}: {
  shown: number;
  total: number;
  noun: string;
}) {
  return (
    <p
      aria-live="polite"
      className="text-xs font-semibold font-satoshi text-[#676565]"
    >
      {shown === total
        ? `${total} ${noun}${total === 1 ? "" : "s"}`
        : `${shown} of ${total} ${noun}${total === 1 ? "" : "s"}`}
    </p>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  pageSize = PAGE_SIZE,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize?: number;
  onPage: (page: number) => void;
}) {
  if (total <= pageSize) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const btn = `inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs font-semibold font-satoshi text-[#676565]">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
        </button>
        <span className="text-xs font-semibold font-satoshi text-[#676565]">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          className={btn}
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Confirm dialog (stays open while the action runs, shows its error inline)

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  pendingLabel,
  pending = false,
  destructive = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  pending?: boolean;
  destructive?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Latest handlers in refs so the effects below run only on open/close
  // (re-running them each render would yank focus back to Cancel).
  const onCloseRef = useRef(onClose);
  const pendingRef = useRef(pending);
  useEffect(() => {
    onCloseRef.current = onClose;
    pendingRef.current = pending;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pendingRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-3">
          {destructive ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDECEA] text-[#C0392B]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
          <div className="min-w-0 space-y-2">
            <h3
              id={titleId}
              className="text-lg font-bold font-satoshi text-[#2F2F2F]"
            >
              {title}
            </h3>
            <div
              id={messageId}
              className="text-sm font-medium font-satoshi leading-relaxed text-[#676565]"
            >
              {message}
            </div>
          </div>
        </div>
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-[#FDF2F2] px-3 py-2 text-sm font-medium font-satoshi text-[#9B1C1C]"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={pending}
            className={`inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] disabled:opacity-60 ${focusRing}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 ${focusRing} ${
              destructive ? "bg-[#DD2222]" : "bg-[#135391]"
            }`}
          >
            {pending ? (pendingLabel ?? "Working…") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form dialog (create/edit forms open over the list instead of above it)

export function AdminFormDialog({
  open,
  title,
  description,
  onClose,
  busy = false,
  footer,
  children,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  // Called for the ✕ button, Escape and a backdrop click. The caller decides
  // whether to close straight away or confirm discarding unsaved edits.
  onClose: () => void;
  // While saving/uploading, dismissing is ignored.
  busy?: boolean;
  // Action buttons, pinned below the scrolling body.
  footer: ReactNode;
  children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    // Focus the first field, so typing can start straight away.
    const first = panelRef.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]):not([disabled]), select, textarea",
    );
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      // Let a confirm dialog stacked on top handle its own Escape.
      if (document.querySelector('[role="alertdialog"]')) return;
      if (event.key === "Escape" && !busyRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEEEE] px-6 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate text-lg font-bold font-satoshi text-[#2F2F2F]"
            >
              {title}
            </h2>
            {description ? (
              <div className="mt-0.5 text-sm font-medium font-satoshi text-[#676565]">
                {description}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className={`-mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#676565] hover:bg-[#F5F5F5] disabled:opacity-50 ${focusRing}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex flex-col-reverse gap-3 border-t border-[#EEEEEE] bg-[#FCFCFC] px-6 py-4 sm:flex-row sm:justify-end">
          {footer}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Forms

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span
      id={id}
      role="alert"
      className="mt-1 block text-xs font-medium font-satoshi text-[#C0392B]"
    >
      {message}
    </span>
  );
}

/** Warn before leaving the page (reload / close tab) while `dirty`. */
export function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
