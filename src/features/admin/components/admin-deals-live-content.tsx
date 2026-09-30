"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminCreateDeal,
  adminDeleteDeal,
  adminListDeals,
  adminListListings,
  adminListPackages,
  adminSetDealStatus,
  adminUpdateDeal,
  uploadAdminImage,
  type AdminDeal,
  type AdminDealInput,
  type DealCabin,
  type DealStatus,
  type DealType,
} from "@/lib/api/admin";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";

const TYPE_OPTIONS: { value: DealType; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "package", label: "Package" },
  { value: "tour", label: "Tour / experience" },
  { value: "stay", label: "Stay" },
  { value: "car", label: "Car" },
];
const CURRENCY_OPTIONS = ["NGN", "USD", "EUR", "GBP"] as const;
const CABIN_OPTIONS: { value: DealCabin; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];
// Deal type → vendor listing category its target is picked from.
const LISTING_CATEGORY: Partial<Record<DealType, string>> = {
  tour: "experiences",
  stay: "accommodations",
  car: "cars",
};

const STATE_BADGE: Record<AdminDeal["state"], string> = {
  live: "bg-[#E7F6EC] text-[#2E7D32]",
  scheduled: "bg-[#E8F0FA] text-[#135391]",
  paused: "bg-[#FFF4E5] text-[#B26A00]",
  expired: "bg-[#FDECEA] text-[#C0392B]",
  draft: "bg-[#EEEEEE] text-[#5A5A5A]",
};

// Which status moves each deal row offers.
const STATUS_ACTIONS: Record<
  DealStatus,
  { to: DealStatus; label: string; primary?: boolean }[]
> = {
  draft: [{ to: "published", label: "Publish", primary: true }],
  published: [
    { to: "paused", label: "Pause", primary: true },
    { to: "draft", label: "Move to draft" },
  ],
  paused: [
    { to: "published", label: "Resume", primary: true },
    { to: "draft", label: "Move to draft" },
  ],
};

type DealForm = {
  type: DealType;
  title: string;
  subtitle: string;
  image: string;
  currency: string;
  originalPrice: number;
  dealPrice: number;
  // datetime-local values ("2026-10-03T04:00"), local time.
  startsAt: string;
  endsAt: string;
  status: DealStatus;
  sortOrder: number;
  // Flight target
  origin: string;
  destination: string;
  cabin: DealCabin;
  adults: number;
  departureDate: string;
  // Package / listing target
  targetId: string;
};

const EMPTY_FORM: DealForm = {
  type: "flight",
  title: "",
  subtitle: "",
  image: "",
  currency: "NGN",
  originalPrice: 0,
  dealPrice: 0,
  startsAt: "",
  endsAt: "",
  status: "draft",
  sortOrder: 0,
  origin: "",
  destination: "",
  cabin: "economy",
  adults: 1,
  departureDate: "",
  targetId: "",
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

function toForm(d: AdminDeal): DealForm {
  const t = d.target;
  return {
    ...EMPTY_FORM,
    type: d.type,
    title: d.title,
    subtitle: d.subtitle ?? "",
    image: d.image ?? "",
    currency: d.currency,
    originalPrice: d.originalPrice,
    dealPrice: d.dealPrice,
    startsAt: toLocalInput(d.startsAt),
    endsAt: toLocalInput(d.endsAt),
    status: d.status,
    sortOrder: d.sortOrder,
    ...(t.kind === "flight"
      ? {
          origin: t.origin,
          destination: t.destination,
          cabin: t.cabin,
          adults: t.adults,
          departureDate: t.departureDate ?? "",
        }
      : { targetId: t.id }),
  };
}

// The PATCH endpoint replaces the whole deal, so every save sends every field.
function toInput(form: DealForm): AdminDealInput {
  return {
    type: form.type,
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    image: form.image.trim() || undefined,
    currency: form.currency,
    originalPrice: form.originalPrice,
    dealPrice: form.dealPrice,
    startsAt: fromLocalInput(form.startsAt),
    endsAt: fromLocalInput(form.endsAt),
    status: form.status,
    sortOrder: form.sortOrder,
    target:
      form.type === "flight"
        ? {
            origin: form.origin.trim().toUpperCase(),
            destination: form.destination.trim().toUpperCase(),
            cabin: form.cabin,
            adults: form.adults,
            ...(form.departureDate ? { departureDate: form.departureDate } : {}),
          }
        : { id: form.targetId },
  };
}

function discountOf(original: number, deal: number): number {
  if (!(original > 0) || !(deal < original)) return 0;
  return Math.round(((original - deal) / original) * 100);
}

function validate(form: DealForm): string | null {
  if (!form.title.trim()) return "Add a title.";
  if (!(form.originalPrice > 0)) return "Set an original price above 0.";
  if (!(form.dealPrice >= 0) || form.dealPrice >= form.originalPrice)
    return "The deal price must be lower than the original price.";
  if (
    form.startsAt &&
    form.endsAt &&
    new Date(form.endsAt) <= new Date(form.startsAt)
  )
    return "The end must be after the start.";
  if (form.type === "flight") {
    if (!/^[A-Za-z]{3}$/.test(form.origin.trim()))
      return "Origin must be a 3-letter airport code (e.g. LOS).";
    if (!/^[A-Za-z]{3}$/.test(form.destination.trim()))
      return "Destination must be a 3-letter airport code (e.g. LHR).";
  } else if (!form.targetId) {
    return form.type === "package"
      ? "Choose the package this deal opens."
      : "Choose the listing this deal opens.";
  }
  return null;
}

function formatWindow(d: AdminDeal): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  if (d.startsAt && d.endsAt) return `${fmt(d.startsAt)} → ${fmt(d.endsAt)}`;
  if (d.endsAt) return `Ends ${fmt(d.endsAt)}`;
  if (d.startsAt) return `Starts ${fmt(d.startsAt)}`;
  return "No deadline";
}

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]";
const labelClass = "text-sm font-semibold font-satoshi text-[#2F2F2F]";

export function AdminDealsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DealForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<DealForm>) => setForm((f) => ({ ...f, ...patch }));

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: () => adminListDeals(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  // Target pickers.
  const { data: packages } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => adminListPackages(token as string),
    enabled: Boolean(token) && form.type === "package",
  });
  const { data: liveListings } = useQuery({
    queryKey: ["admin-listings", "live"],
    queryFn: () => adminListListings(token as string, "live"),
    enabled: Boolean(token) && Boolean(LISTING_CATEGORY[form.type]),
  });
  const listingOptions = (liveListings ?? []).filter(
    (l) => l.category === LISTING_CATEGORY[form.type],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-deals"] });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = toInput(form);
      return editingId
        ? adminUpdateDeal(token as string, editingId, input)
        : adminCreateDeal(token as string, input);
    },
    onMutate: () => setFormError(null),
    onSuccess: () => {
      resetForm();
      invalidate();
    },
    onError: (err) =>
      setFormError(
        errorMessage(
          err,
          editingId
            ? "Couldn't save this deal. Please try again."
            : "Couldn't create this deal. Please try again.",
        ),
      ),
  });
  // Row status buttons: publish, pause, resume, back to draft.
  const statusMutation = useMutation({
    mutationFn: (v: { id: string; status: DealStatus }) =>
      adminSetDealStatus(token as string, v.id, v.status),
    onMutate: () => setListError(null),
    onSuccess: (updated) => {
      // Keep an open edit form in step with the row.
      if (updated.id === editingId) setForm((f) => ({ ...f, status: updated.status }));
      invalidate();
    },
    onError: (err) => setListError(errorMessage(err, "Couldn't update the deal.")),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteDeal(token as string, id),
    onMutate: () => setListError(null),
    onSuccess: (_data, id) => {
      if (id === editingId) resetForm();
      invalidate();
    },
    onError: (err) => setListError(errorMessage(err, "Couldn't delete the deal.")),
  });

  const startEdit = (d: AdminDeal) => {
    setEditingId(d.id);
    setForm(toForm(d));
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titleRef.current?.focus({ preventScroll: true });
  };

  const handleImage = async (file: File | undefined) => {
    if (!file || !token) return;
    setUploading(true);
    setFormError(null);
    try {
      set({ image: await uploadAdminImage(token, file) });
    } catch (err) {
      setFormError(errorMessage(err, "Couldn't upload the image."));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!token) {
      setFormError("Your session has expired. Sign in again and retry.");
      return;
    }
    const problem = validate(form);
    if (problem) {
      setFormError(problem);
      return;
    }
    saveMutation.mutate();
  };

  const deals = data ?? [];
  const discount = discountOf(form.originalPrice, form.dealPrice);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">Deals</h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Time-limited offers on the app&apos;s Deals screen. Published deals show
          between their start and end; those ending within 7 days also appear
          under &quot;Ending soon&quot;. Pause hides a deal without losing its
          schedule; drafts stay hidden until published.
        </p>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className={`grid scroll-mt-24 gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2 ${
          editingId ? "border-[#135391] ring-2 ring-[#135391]/15" : "border-[#EEEEEE]"
        }`}
      >
        <h2 className="text-base font-bold font-satoshi text-[#2F2F2F] sm:col-span-2">
          {editingId ? `Edit deal — ${form.title || "Untitled"}` : "New deal"}
        </h2>

        <label className={labelClass}>
          Type
          <select
            value={form.type}
            onChange={(e) =>
              set({ type: e.target.value as DealType, targetId: "" })
            }
            className={inputClass}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Status
          <select
            value={form.status}
            onChange={(e) =>
              set({ status: e.target.value as DealForm["status"] })
            }
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
          </select>
        </label>

        <label className={labelClass}>
          Title
          <input
            ref={titleRef}
            value={form.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Lagos → London"
            className={inputClass}
            required
          />
        </label>
        <label className={labelClass}>
          Subtitle
          <input
            value={form.subtitle}
            onChange={(e) => set({ subtitle: e.target.value })}
            placeholder="Economy • 1 adult"
            className={inputClass}
          />
        </label>

        {/* What the deal opens */}
        {form.type === "flight" ? (
          <div className="grid gap-4 rounded-lg bg-[#FAFAFA] p-4 sm:col-span-2 sm:grid-cols-5">
            <label className={labelClass}>
              From (IATA)
              <input
                value={form.origin}
                onChange={(e) => set({ origin: e.target.value.toUpperCase() })}
                placeholder="LOS"
                maxLength={3}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              To (IATA)
              <input
                value={form.destination}
                onChange={(e) =>
                  set({ destination: e.target.value.toUpperCase() })
                }
                placeholder="LHR"
                maxLength={3}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Cabin
              <select
                value={form.cabin}
                onChange={(e) => set({ cabin: e.target.value as DealCabin })}
                className={inputClass}
              >
                {CABIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Adults
              <input
                type="number"
                min={1}
                max={9}
                value={form.adults}
                onChange={(e) => set({ adults: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Departure (optional)
              <input
                type="date"
                value={form.departureDate}
                onChange={(e) => set({ departureDate: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
        ) : (
          <label className={`${labelClass} sm:col-span-2`}>
            {form.type === "package" ? "Package" : "Listing (live only)"}
            <select
              value={form.targetId}
              onChange={(e) => set({ targetId: e.target.value })}
              className={inputClass}
            >
              <option value="">Choose…</option>
              {form.type === "package"
                ? (packages ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                      {p.status === "draft" ? " (draft — hidden until published)" : ""}
                    </option>
                  ))
                : listingOptions.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                      {l.location ? ` — ${l.location}` : ""}
                    </option>
                  ))}
              {/* Keep an edited deal's target selectable even if it has
                  since left the live list. */}
              {form.targetId &&
              !(packages ?? []).some((p) => p.id === form.targetId) &&
              !listingOptions.some((l) => l.id === form.targetId) ? (
                <option value={form.targetId}>Current target (not live)</option>
              ) : null}
            </select>
          </label>
        )}

        <label className={labelClass}>
          Original price
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.originalPrice || ""}
            onChange={(e) => set({ originalPrice: Number(e.target.value) })}
            className={inputClass}
            required
          />
        </label>
        <label className={labelClass}>
          Deal price{discount > 0 ? ` (−${discount}%)` : ""}
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.dealPrice || ""}
            onChange={(e) => set({ dealPrice: Number(e.target.value) })}
            className={inputClass}
            required
          />
        </label>
        <label className={labelClass}>
          Currency
          <select
            value={form.currency}
            onChange={(e) => set({ currency: e.target.value })}
            className={inputClass}
          >
            {CURRENCY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Sort order
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => set({ sortOrder: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Starts (optional)
          <input
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => set({ startsAt: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Ends (optional — drives the countdown)
          <input
            type="datetime-local"
            value={form.endsAt}
            onChange={(e) => set({ endsAt: e.target.value })}
            className={inputClass}
          />
        </label>

        <div className="sm:col-span-2">
          <span className={labelClass}>Image</span>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary bucket URL
              <img
                src={form.image}
                alt=""
                className="h-20 w-32 rounded-lg border border-[#EEEEEE] object-cover"
              />
            ) : null}
            <label className="cursor-pointer rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-bold font-satoshi text-[#2F2F2F]">
              {uploading ? "Uploading…" : form.image ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  void handleImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            {form.image ? (
              <button
                type="button"
                onClick={() => set({ image: "" })}
                className="text-sm font-bold font-satoshi text-[#C0392B] hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>

        {formError ? (
          <p
            role="alert"
            className="rounded-lg border border-[#DD2222]/30 bg-[#DD2222]/5 px-3 py-2 text-sm font-medium font-satoshi text-[#C0392B] sm:col-span-2"
          >
            {formError}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saveMutation.isPending || uploading}
            className="h-10 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white disabled:opacity-60"
          >
            {saveMutation.isPending
              ? editingId
                ? "Saving…"
                : "Creating…"
              : editingId
                ? "Save changes"
                : "Create deal"}
          </button>
          {editingId ? (
            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={resetForm}
              className="h-10 rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] disabled:opacity-60"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {listError ? (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-[#DD2222]/30 bg-[#DD2222]/5 px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
        >
          <span>{listError}</span>
          <button
            type="button"
            onClick={() => setListError(null)}
            className="shrink-0 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">Loading…</p>
      ) : loadError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#DD2222]/30 bg-[#DD2222]/5 px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
        >
          {errorMessage(loadError, "Couldn't load deals.")}
        </p>
      ) : deals.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No deals yet.
        </p>
      ) : (
        <div className="space-y-3">
          {deals.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary bucket URL
                  <img
                    src={d.image}
                    alt=""
                    className="h-12 w-16 shrink-0 rounded-md object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                    {d.title}
                    <span className="ml-2 text-xs font-semibold text-[#676565]">
                      {TYPE_OPTIONS.find((o) => o.value === d.type)?.label}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                    <span className="line-through">
                      {d.currency} {d.originalPrice.toLocaleString()}
                    </span>{" "}
                    {d.currency} {d.dealPrice.toLocaleString()} · −
                    {d.discountPercent}% · {formatWindow(d)}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${STATE_BADGE[d.state]}`}
                >
                  {d.state}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(d)}
                  className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F]"
                >
                  Edit
                </button>
                {STATUS_ACTIONS[d.status].map((action) => (
                  <button
                    key={action.to}
                    type="button"
                    disabled={
                      statusMutation.isPending &&
                      statusMutation.variables?.id === d.id
                    }
                    onClick={() =>
                      statusMutation.mutate({ id: d.id, status: action.to })
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-bold font-satoshi disabled:opacity-60 ${
                      action.primary
                        ? "bg-[#135391] text-white"
                        : "border border-[#E5E5E5] text-[#2F2F2F]"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete "${d.title}"?`))
                      deleteMutation.mutate(d.id);
                  }}
                  className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
