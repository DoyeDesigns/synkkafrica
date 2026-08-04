"use client";

import { useState } from "react";
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

const INCLUSION_OPTIONS = ["flights", "stays", "carDriver"] as const;

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
  const [form, setForm] = useState<AdminPackageInput>(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => adminListPackages(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    void queryClient.invalidateQueries({ queryKey: ["packages"] });
  };

  const createMutation = useMutation({
    mutationFn: () => adminCreatePackage(token as string, form),
    onSuccess: () => {
      setForm(EMPTY_FORM);
      invalidate();
    },
  });
  const updateMutation = useMutation({
    mutationFn: (v: { id: string; input: AdminPackageInput }) =>
      adminUpdatePackage(token as string, v.id, v.input),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeletePackage(token as string, id),
    onSuccess: invalidate,
  });

  const togglePublish = (p: PackageApi) => {
    updateMutation.mutate({
      id: p.id,
      input: {
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
        status: p.status === "published" ? "draft" : "published",
        sortOrder: p.sortOrder,
      },
    });
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

      {/* Create form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (form.title && form.currentPrice > 0) createMutation.mutate();
        }}
        className="grid gap-4 rounded-xl border border-[#EEEEEE] bg-white p-5 sm:grid-cols-2"
      >
        <label className="text-sm font-semibold font-satoshi text-[#2F2F2F] sm:col-span-2">
          Title
          <input
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
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="h-10 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white disabled:opacity-60"
          >
            {createMutation.isPending ? "Creating…" : "Create package"}
          </button>
        </div>
      </form>

      {/* Existing packages */}
      {isLoading ? (
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          Loading…
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
