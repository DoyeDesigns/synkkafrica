"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminCreatePackage,
  adminDeletePackage,
  adminListPackages,
  adminUpdatePackage,
  type AdminPackageInput,
} from "@/lib/api/admin";
import type { PackageApi } from "@/lib/api/packages";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";

const INCLUSION_OPTIONS = ["flights", "stays", "carDriver"] as const;
const CURRENCY_OPTIONS = ["NGN", "USD", "EUR", "GBP"] as const;

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

// Everything the PATCH endpoint needs to rewrite a package (it validates the
// full body, so an edit always sends every field).
function toInput(p: PackageApi): AdminPackageInput {
  return {
    title: p.title,
    days: p.days,
    nights: p.nights,
    scheduleLabel: p.scheduleLabel ?? undefined,
    savingsPercent: p.savingsPercent,
    currentPrice: p.currentPrice,
    separateBookingPrice: p.separateBookingPrice ?? undefined,
    currency: p.currency,
    image: p.image ?? undefined,
    inclusions: p.inclusions,
    status: p.status,
    sortOrder: p.sortOrder,
  };
}

// Blank optional strings are dropped rather than sent as "".
function cleanInput(input: AdminPackageInput): AdminPackageInput {
  return {
    ...input,
    title: input.title.trim(),
    scheduleLabel: input.scheduleLabel?.trim() || undefined,
    image: input.image?.trim() || undefined,
    separateBookingPrice: input.separateBookingPrice || undefined,
  };
}

const EMPTY_FORM: AdminPackageInput = {
  title: "",
  days: 1,
  nights: 0,
  scheduleLabel: "",
  savingsPercent: 0,
  currentPrice: 0,
  separateBookingPrice: 0,
  currency: "NGN",
  image: "",
  inclusions: [],
  status: "draft",
  sortOrder: 0,
};

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]";

export function AdminPackagesLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<AdminPackageInput>(EMPTY_FORM);
  // The package being edited, or null when the form creates a new one.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // /admin/packages?new=1 (dashboard "Add packages", old wizard URL) jumps
  // straight to the create form.
  const wantsNew = searchParams.get("new") === "1";
  useEffect(() => {
    if (wantsNew) titleRef.current?.focus();
  }, [wantsNew]);

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => adminListPackages(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    void queryClient.invalidateQueries({ queryKey: ["packages"] });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError(null);
  };

  // Create or save the package in the form.
  const saveMutation = useMutation({
    mutationFn: () => {
      const input = cleanInput(form);
      return editingId
        ? adminUpdatePackage(token as string, editingId, input)
        : adminCreatePackage(token as string, input);
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
            ? "Couldn't save this package. Please try again."
            : "Couldn't create this package. Please try again.",
        ),
      ),
  });
  // Row actions (publish toggle, delete) report into the list banner.
  const updateMutation = useMutation({
    mutationFn: (v: { id: string; input: AdminPackageInput }) =>
      adminUpdatePackage(token as string, v.id, v.input),
    onMutate: () => setListError(null),
    onSuccess: invalidate,
    onError: (err) =>
      setListError(errorMessage(err, "Couldn't update the package.")),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeletePackage(token as string, id),
    onMutate: () => setListError(null),
    onSuccess: (_data, id) => {
      if (id === editingId) resetForm();
      invalidate();
    },
    onError: (err) =>
      setListError(errorMessage(err, "Couldn't delete the package.")),
  });

  const togglePublish = (p: PackageApi) => {
    updateMutation.mutate({
      id: p.id,
      input: {
        ...toInput(p),
        status: p.status === "published" ? "draft" : "published",
      },
    });
  };

  const startEdit = (p: PackageApi) => {
    setEditingId(p.id);
    setForm(toInput(p));
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titleRef.current?.focus({ preventScroll: true });
  };

  const handleSubmit = () => {
    if (!token) {
      setFormError("Your session has expired. Sign in again and retry.");
      return;
    }
    if (!form.title.trim()) {
      setFormError("Add a title.");
      return;
    }
    if (!(form.currentPrice > 0)) {
      setFormError("Set a current price above 0.");
      return;
    }
    saveMutation.mutate();
  };

  const packages = data ?? [];

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          Packages
        </h1>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          Curated travel bundles shown on the landing carousel.
        </p>
      </div>

      {/* Create / edit form */}
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
          {editingId ? `Edit package — ${form.title || "Untitled"}` : "New package"}
        </h2>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F] sm:col-span-2">
          Title
          <input
            ref={titleRef}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Current price
          <input
            type="number"
            value={form.currentPrice || ""}
            onChange={(e) =>
              setForm({ ...form, currentPrice: Number(e.target.value) })
            }
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Currency
          <select
            value={form.currency ?? "NGN"}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className={inputClass}
          >
            {CURRENCY_OPTIONS.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Status
          <select
            value={form.status ?? "draft"}
            onChange={(e) =>
              setForm({
                ...form,
                status: e.target.value as AdminPackageInput["status"],
              })
            }
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          &quot;If booked separately&quot; price
          <input
            type="number"
            value={form.separateBookingPrice || ""}
            onChange={(e) =>
              setForm({ ...form, separateBookingPrice: Number(e.target.value) })
            }
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Days
          <input
            type="number"
            value={form.days ?? 1}
            onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Nights
          <input
            type="number"
            value={form.nights ?? 0}
            onChange={(e) =>
              setForm({ ...form, nights: Number(e.target.value) })
            }
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Schedule label
          <input
            value={form.scheduleLabel ?? ""}
            onChange={(e) =>
              setForm({ ...form, scheduleLabel: e.target.value })
            }
            placeholder="Thu — Mon"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          Savings %
          <input
            type="number"
            value={form.savingsPercent ?? 0}
            onChange={(e) =>
              setForm({ ...form, savingsPercent: Number(e.target.value) })
            }
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F] sm:col-span-2">
          Image URL
          <input
            value={form.image ?? ""}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="/destinations/dubai.png"
            className={inputClass}
          />
        </label>
        <div className="sm:col-span-2">
          <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
            Inclusions
          </span>
          <div className="mt-2 flex flex-wrap gap-3">
            {INCLUSION_OPTIONS.map((inc) => {
              const checked = (form.inclusions ?? []).includes(inc);
              return (
                <label
                  key={inc}
                  className="flex items-center gap-1.5 text-sm font-medium font-satoshi text-[#676565]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        inclusions: e.target.checked
                          ? [...(form.inclusions ?? []), inc]
                          : (form.inclusions ?? []).filter((i) => i !== inc),
                      })
                    }
                  />
                  {inc}
                </label>
              );
            })}
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
            disabled={saveMutation.isPending}
            className="h-10 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white disabled:opacity-60"
          >
            {saveMutation.isPending
              ? editingId
                ? "Saving…"
                : "Creating…"
              : editingId
                ? "Save changes"
                : "Create package"}
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

      {/* Existing packages */}
      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
        </p>
      ) : loadError ? (
        <p
          role="alert"
          className="rounded-lg border border-[#DD2222]/30 bg-[#DD2222]/5 px-4 py-3 text-sm font-medium font-satoshi text-[#C0392B]"
        >
          {errorMessage(loadError, "Couldn't load packages.")}
        </p>
      ) : packages.length === 0 ? (
        <p className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] px-4 py-6 text-center text-sm font-medium font-satoshi text-[#676565]">
          No packages yet.
        </p>
      ) : (
        <div className="space-y-3">
          {packages.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-[#EEEEEE] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                  {p.title}
                </p>
                <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                  {p.currency} {p.currentPrice.toLocaleString()} · {p.days}d/
                  {p.nights}n · {p.inclusions.join(", ") || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi ${
                    p.status === "published"
                      ? "bg-[#E7F6EC] text-[#2E7D32]"
                      : "bg-[#EEEEEE] text-[#5A5A5A]"
                  }`}
                >
                  {p.status}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={updateMutation.isPending}
                  onClick={() => togglePublish(p)}
                  className="rounded-lg bg-[#135391] px-3 py-2 text-xs font-bold font-satoshi text-white disabled:opacity-60"
                >
                  {p.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete "${p.title}"?`))
                      deleteMutation.mutate(p.id);
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
