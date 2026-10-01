'use client';

import { useMemo, useRef, useState } from 'react';
import { ImagePlus, Package, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adminCreatePackage,
  adminDeletePackage,
  adminListPackages,
  adminUpdatePackage,
  type AdminPackageInput,
} from '@/lib/api/admin';
import type { PackageApi } from '@/lib/api/packages';
import { describeUploadError } from '@/lib/api/vendor';
import { LIVE_QUERY_OPTIONS } from '@/lib/live-query-options';
import {
  AdminFormDialog,
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  FieldError,
  Pagination,
  ResultCount,
  SearchInput,
  SkeletonList,
  errorMessage,
  focusRing,
  formatMoney,
  useAdminToast,
  usePagedItems,
  useUnsavedChangesGuard,
  useUrlSearch,
  useUrlState,
} from '@/features/admin/components/admin-ui';
import {
  ADMIN_IMAGE_ACCEPT,
  checkAdminImage,
  uploadAdminImageWithProgress,
} from '@/features/admin/lib/admin-image-upload';

const INCLUSION_OPTIONS = [
  { value: 'flights', label: 'Flights' },
  { value: 'stays', label: 'Stays' },
  { value: 'carDriver', label: 'Car & driver' },
] as const;
const CURRENCY_OPTIONS = ['NGN', 'USD', 'EUR', 'GBP'] as const;
const STATUS_FILTERS = ['all', 'published', 'draft'] as const;

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
  title: '',
  days: 1,
  nights: 0,
  scheduleLabel: '',
  savingsPercent: 0,
  currentPrice: 0,
  separateBookingPrice: 0,
  currency: 'NGN',
  image: '',
  inclusions: [],
  status: 'draft',
  sortOrder: 0,
};

type FieldErrors = Partial<
  Record<
    | 'title'
    | 'currentPrice'
    | 'separateBookingPrice'
    | 'days'
    | 'nights'
    | 'savingsPercent',
    string
  >
>;

function validate(form: AdminPackageInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.title.trim()) errors.title = 'Add a title.';
  if (!(form.currentPrice > 0))
    errors.currentPrice = 'Set a current price above 0.';
  if (
    form.separateBookingPrice &&
    form.separateBookingPrice > 0 &&
    form.separateBookingPrice <= form.currentPrice
  )
    errors.separateBookingPrice =
      'Should be higher than the current price, or leave it empty.';
  const days = form.days ?? 1;
  const nights = form.nights ?? 0;
  if (!Number.isInteger(days) || days < 1) errors.days = 'At least 1 day.';
  if (!Number.isInteger(nights) || nights < 0)
    errors.nights = '0 or more nights.';
  else if (nights > days) errors.nights = "Nights can't exceed days.";
  const savings = form.savingsPercent ?? 0;
  if (savings < 0 || savings > 100)
    errors.savingsPercent = 'Between 0 and 100.';
  return errors;
}

function sameForm(a: AdminPackageInput, b: AdminPackageInput) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const inputBase =
  'mt-1 h-10 w-full rounded-lg border px-3 text-sm font-satoshi outline-none focus:ring-2 focus:ring-[#135391]/15';
function inputClass(error?: string) {
  return `${inputBase} ${
    error
      ? 'border-[#C0392B] focus:border-[#C0392B]'
      : 'border-[#E5E5E5] focus:border-[#135391]'
  }`;
}
const labelClass = 'text-sm font-semibold font-satoshi text-[#2F2F2F]';

export function AdminPackagesLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const { get, set } = useUrlState();
  const { input, setInput, term } = useUrlSearch();
  const statusParam = get('status');
  const statusFilter = (STATUS_FILTERS as readonly string[]).includes(
    statusParam,
  )
    ? statusParam
    : 'all';

  const [form, setForm] = useState<AdminPackageInput>(EMPTY_FORM);
  // The package being edited, or null when the form creates a new one.
  const [editing, setEditing] = useState<PackageApi | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<PackageApi | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // /admin/packages?new=1 (dashboard "Add packages", old wizard URL) opens
  // the create dialog straight away; `new` is dropped when it closes.
  const wantsNew = get('new') === '1';
  const dialogOpen = formOpen || wantsNew;

  const baseline = useMemo(
    () => (editing ? toInput(editing) : EMPTY_FORM),
    [editing],
  );
  const dirty = !sameForm(form, baseline);
  useUnsavedChangesGuard(dialogOpen && dirty);

  const errors = validate(form);
  const showErrors: FieldErrors = submitted ? errors : {};

  const {
    data,
    isLoading,
    isFetching,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => adminListPackages(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
    void queryClient.invalidateQueries({ queryKey: ['packages'] });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormError(null);
    setSubmitted(false);
    setUploadError(null);
  };

  // Create or save the package in the form.
  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = cleanInput(form);
      return editing
        ? adminUpdatePackage(token as string, editing.id, payload)
        : adminCreatePackage(token as string, payload);
    },
    onMutate: () => setFormError(null),
    onSuccess: () => {
      toast.success(
        editing
          ? `Saved “${form.title.trim()}”.`
          : `Created “${form.title.trim()}”.`,
      );
      closeForm();
      invalidate();
    },
    onError: (err) =>
      setFormError(
        errorMessage(
          err,
          editing
            ? "Couldn't save this package. Please try again."
            : "Couldn't create this package. Please try again.",
        ),
      ),
  });
  // Row publish toggle.
  const updateMutation = useMutation({
    mutationFn: (v: { pkg: PackageApi; input: AdminPackageInput }) =>
      adminUpdatePackage(token as string, v.pkg.id, v.input),
    onSuccess: (_d, v) => {
      invalidate();
      toast.success(
        v.input.status === 'published'
          ? `“${v.pkg.title}” is now live.`
          : `“${v.pkg.title}” moved to draft.`,
      );
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Couldn't update the package.")),
  });
  const deleteMutation = useMutation({
    mutationFn: (pkg: PackageApi) =>
      adminDeletePackage(token as string, pkg.id),
    onSuccess: (_data, pkg) => {
      if (pkg.id === editing?.id) resetForm();
      setToDelete(null);
      invalidate();
      toast.success(`Deleted “${pkg.title}”.`);
    },
    onError: (err) =>
      setDeleteError(errorMessage(err, "Couldn't delete the package.")),
  });

  const togglePublish = (p: PackageApi) => {
    updateMutation.mutate({
      pkg: p,
      input: {
        ...toInput(p),
        status: p.status === 'published' ? 'draft' : 'published',
      },
    });
  };

  const openNew = () => {
    resetForm();
    setFormOpen(true);
  };

  const startEdit = (p: PackageApi) => {
    setEditing(p);
    setForm(toInput(p));
    setFormError(null);
    setSubmitted(false);
    setUploadError(null);
    setFormOpen(true);
  };

  // Close the dialog without asking, reset the form and drop ?new=1.
  function closeForm() {
    resetForm();
    setConfirmDiscard(false);
    setFormOpen(false);
    if (wantsNew) set({ new: null });
  }

  // ✕ / Escape / backdrop / Cancel: confirm first when there are unsaved edits.
  const requestClose = () => {
    if (saveMutation.isPending || uploadProgress !== null) return;
    if (dirty) setConfirmDiscard(true);
    else closeForm();
  };

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    if (!token) {
      setUploadError('Your session has expired. Sign in again and retry.');
      return;
    }
    const problem = checkAdminImage(file);
    if (problem) {
      setUploadError(problem);
      return;
    }
    setUploadError(null);
    setUploadProgress(0);
    try {
      const url = await uploadAdminImageWithProgress(
        token,
        file,
        setUploadProgress,
      );
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setUploadError(`Upload failed — ${describeUploadError(err)}`);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!token) {
      setFormError('Your session has expired. Sign in again and retry.');
      return;
    }
    const first = Object.keys(errors)[0];
    if (first) {
      setFormError('Fix the highlighted fields.');
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    saveMutation.mutate();
  };

  const packages = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () =>
      packages.filter(
        (p) =>
          (statusFilter === 'all' || p.status === statusFilter) &&
          (!term ||
            p.title.toLowerCase().includes(term) ||
            (p.scheduleLabel ?? '').toLowerCase().includes(term)),
      ),
    [packages, statusFilter, term],
  );
  const { page, pageCount, pageItems, setPage, total } =
    usePagedItems(filtered);
  const uploading = uploadProgress !== null;
  const hasFilters = statusFilter !== 'all' || Boolean(term);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Packages"
        description="Curated travel bundles shown on the landing carousel. Drafts stay hidden until published."
        actions={
          <button
            type="button"
            onClick={openNew}
            className={`inline-flex h-10 items-center gap-2 rounded-lg bg-[#135391] px-4 text-sm font-bold font-satoshi text-white hover:opacity-90 ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New package
          </button>
        }
      />

      {/* Existing packages */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={input}
            onChange={setInput}
            placeholder="Search packages"
            label="Search packages"
            className="sm:w-72"
          />
          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex w-fit rounded-lg border border-[#E5E5E5] bg-white p-1"
          >
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={statusFilter === s}
                onClick={() =>
                  set({ status: s === 'all' ? null : s, page: null })
                }
                className={`rounded-md px-3 py-1.5 text-xs font-semibold font-satoshi capitalize ${focusRing} ${
                  statusFilter === s
                    ? 'bg-[#135391] text-white'
                    : 'text-[#676565] hover:bg-[#F5F5F5]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {!isLoading ? (
            <span className="sm:ml-auto">
              <ResultCount
                shown={filtered.length}
                total={packages.length}
                noun="package"
              />
            </span>
          ) : null}
        </div>

        {loadError ? (
          <ErrorBanner
            message={errorMessage(loadError, "Couldn't load packages.")}
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        ) : null}

        {isLoading ? (
          <SkeletonList rows={4} label="Loading packages" />
        ) : loadError ? null : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={hasFilters ? 'No packages match' : 'No packages yet'}
            description={
              hasFilters
                ? 'Try another status or clear the search.'
                : 'Create your first bundle — it stays a draft until you publish it.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    set({ status: null, q: null, page: null });
                  }}
                  className={`rounded-lg border border-[#135391] px-4 py-2 text-sm font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] ${focusRing}`}
                >
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openNew}
                  className={`rounded-lg bg-[#135391] px-4 py-2 text-sm font-bold font-satoshi text-white ${focusRing}`}
                >
                  Create a package
                </button>
              )
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {pageItems.map((p) => {
                const toggling =
                  updateMutation.isPending &&
                  updateMutation.variables?.pkg.id === p.id;
                return (
                  <li
                    key={p.id}
                    className={`flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                      editing?.id === p.id
                        ? 'border-[#135391]'
                        : 'border-[#EEEEEE]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary bucket URL
                        <img
                          src={p.image}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-[#F5F5F5] text-[#9A9A9A]">
                          <Package className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                          {p.title}
                        </p>
                        <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                          {formatMoney(p.currentPrice, p.currency)}
                          {p.separateBookingPrice ? (
                            <span className="ml-1 line-through">
                              {formatMoney(p.separateBookingPrice, p.currency)}
                            </span>
                          ) : null}{' '}
                          · {p.days}d/{p.nights}n ·{' '}
                          {p.inclusions
                            .map(
                              (i) =>
                                INCLUSION_OPTIONS.find((o) => o.value === i)
                                  ?.label ?? i,
                            )
                            .join(', ') || 'No inclusions'}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${
                          p.status === 'published'
                            ? 'bg-[#E7F6EC] text-[#2E7D32]'
                            : 'bg-[#EEEEEE] text-[#5A5A5A]'
                        }`}
                      >
                        {p.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        aria-label={`Edit ${p.title}`}
                        className={`rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] ${focusRing}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={toggling}
                        onClick={() => togglePublish(p)}
                        className={`rounded-lg bg-[#135391] px-3 py-2 text-xs font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 ${focusRing}`}
                      >
                        {toggling
                          ? p.status === 'published'
                            ? 'Unpublishing…'
                            : 'Publishing…'
                          : p.status === 'published'
                            ? 'Unpublish'
                            : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setToDelete(p);
                        }}
                        aria-label={`Delete ${p.title}`}
                        className={`rounded-lg border border-[#F5C2C0] px-3 py-2 text-xs font-bold font-satoshi text-[#C0392B] hover:bg-[#FDF2F2] ${focusRing}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={page}
              pageCount={pageCount}
              total={total}
              onPage={setPage}
            />
          </>
        )}
      </div>

      <AdminFormDialog
        open={dialogOpen}
        title={
          editing
            ? `Edit package — ${editing.title || 'Untitled'}`
            : 'New package'
        }
        description={
          dirty ? (
            <span className="rounded-full bg-[#FFF4E5] px-2.5 py-0.5 text-[11px] font-semibold font-satoshi text-[#9A7200]">
              Unsaved changes
            </span>
          ) : undefined
        }
        onClose={requestClose}
        busy={saveMutation.isPending || uploading}
        footer={
          <>
            <button
              type="button"
              disabled={saveMutation.isPending || uploading}
              onClick={requestClose}
              className={`h-10 rounded-lg border border-[#E5E5E5] px-5 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] disabled:opacity-60 ${focusRing}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="package-form"
              disabled={saveMutation.isPending || uploading}
              className={`h-10 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 ${focusRing}`}
            >
              {saveMutation.isPending
                ? editing
                  ? 'Saving…'
                  : 'Creating…'
                : editing
                  ? 'Save changes'
                  : 'Create package'}
            </button>
          </>
        }
      >
        <form
          ref={formRef}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          id="package-form"
          aria-label={editing ? 'Edit package' : 'New package'}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className={`${labelClass} sm:col-span-2`}>
            Title *
            <input
              name="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="5 days in Zanzibar"
              aria-invalid={Boolean(showErrors.title)}
              aria-describedby="pkg-title-error"
              className={inputClass(showErrors.title)}
            />
            <FieldError id="pkg-title-error" message={showErrors.title} />
          </label>
          <label className={labelClass}>
            Current price *
            <input
              type="number"
              name="currentPrice"
              min={0}
              inputMode="decimal"
              value={form.currentPrice || ''}
              onChange={(e) =>
                setForm({ ...form, currentPrice: Number(e.target.value) })
              }
              aria-invalid={Boolean(showErrors.currentPrice)}
              aria-describedby="pkg-price-error pkg-price-preview"
              className={inputClass(showErrors.currentPrice)}
            />
            <FieldError
              id="pkg-price-error"
              message={showErrors.currentPrice}
            />
            {form.currentPrice > 0 && !showErrors.currentPrice ? (
              <span
                id="pkg-price-preview"
                className="mt-1 block text-xs font-medium text-[#676565]"
              >
                Shows as {formatMoney(form.currentPrice, form.currency)}
              </span>
            ) : null}
          </label>
          <label className={labelClass}>
            Currency
            <select
              value={form.currency ?? 'NGN'}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputClass()}
            >
              {CURRENCY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Status
            <select
              value={form.status ?? 'draft'}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as AdminPackageInput['status'],
                })
              }
              className={inputClass()}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published (live)</option>
            </select>
          </label>
          <label className={labelClass}>
            &quot;If booked separately&quot; price
            <input
              type="number"
              name="separateBookingPrice"
              min={0}
              inputMode="decimal"
              value={form.separateBookingPrice || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  separateBookingPrice: Number(e.target.value),
                })
              }
              aria-invalid={Boolean(showErrors.separateBookingPrice)}
              aria-describedby="pkg-sep-error"
              className={inputClass(showErrors.separateBookingPrice)}
            />
            <FieldError
              id="pkg-sep-error"
              message={showErrors.separateBookingPrice}
            />
          </label>
          <label className={labelClass}>
            Days
            <input
              type="number"
              name="days"
              min={1}
              value={form.days ?? 1}
              onChange={(e) =>
                setForm({ ...form, days: Number(e.target.value) })
              }
              aria-invalid={Boolean(showErrors.days)}
              aria-describedby="pkg-days-error"
              className={inputClass(showErrors.days)}
            />
            <FieldError id="pkg-days-error" message={showErrors.days} />
          </label>
          <label className={labelClass}>
            Nights
            <input
              type="number"
              name="nights"
              min={0}
              value={form.nights ?? 0}
              onChange={(e) =>
                setForm({ ...form, nights: Number(e.target.value) })
              }
              aria-invalid={Boolean(showErrors.nights)}
              aria-describedby="pkg-nights-error"
              className={inputClass(showErrors.nights)}
            />
            <FieldError id="pkg-nights-error" message={showErrors.nights} />
          </label>
          <label className={labelClass}>
            Schedule label
            <input
              value={form.scheduleLabel ?? ''}
              onChange={(e) =>
                setForm({ ...form, scheduleLabel: e.target.value })
              }
              placeholder="Thu — Mon"
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            Savings %
            <input
              type="number"
              name="savingsPercent"
              min={0}
              max={100}
              value={form.savingsPercent ?? 0}
              onChange={(e) =>
                setForm({ ...form, savingsPercent: Number(e.target.value) })
              }
              aria-invalid={Boolean(showErrors.savingsPercent)}
              aria-describedby="pkg-savings-error"
              className={inputClass(showErrors.savingsPercent)}
            />
            <FieldError
              id="pkg-savings-error"
              message={showErrors.savingsPercent}
            />
          </label>

          <div className="sm:col-span-2">
            <span className={labelClass}>Image</span>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary bucket URL
                <img
                  src={form.image}
                  alt="Package preview"
                  className="h-20 w-32 rounded-lg border border-[#EEEEEE] object-cover"
                />
              ) : (
                <span className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-[#E0E0E0] text-[#9A9A9A]">
                  <ImagePlus className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`cursor-pointer rounded-lg border border-[#E5E5E5] px-4 py-2 text-sm font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] focus-within:ring-2 focus-within:ring-[#135391] ${
                      uploading ? 'pointer-events-none opacity-60' : ''
                    }`}
                  >
                    {uploading
                      ? `Uploading… ${uploadProgress}%`
                      : form.image
                        ? 'Replace image'
                        : 'Upload image'}
                    <input
                      type="file"
                      accept={ADMIN_IMAGE_ACCEPT}
                      className="sr-only"
                      disabled={uploading}
                      onChange={(e) => {
                        void handleImage(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {form.image && !uploading ? (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      className={`rounded text-sm font-bold font-satoshi text-[#C0392B] hover:underline ${focusRing}`}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {uploading ? (
                  <div
                    role="progressbar"
                    aria-label="Image upload progress"
                    aria-valuenow={uploadProgress ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 w-48 overflow-hidden rounded-full bg-[#EEEEEE]"
                  >
                    <div
                      className="h-full rounded-full bg-[#135391] transition-[width]"
                      style={{ width: `${uploadProgress ?? 0}%` }}
                    />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-[#9A9A9A]">
                    PNG, JPEG or WebP, up to 10 MB.
                  </span>
                )}
                <FieldError
                  id="pkg-image-error"
                  message={uploadError ?? undefined}
                />
              </div>
            </div>
            <label className="mt-3 block text-xs font-semibold font-satoshi text-[#676565]">
              …or paste an image URL
              <input
                value={form.image ?? ''}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="/destinations/dubai.png"
                className={inputClass()}
              />
            </label>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Inclusions</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {INCLUSION_OPTIONS.map((inc) => {
                const checked = (form.inclusions ?? []).includes(inc.value);
                return (
                  <label
                    key={inc.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium font-satoshi focus-within:ring-2 focus-within:ring-[#135391] ${
                      checked
                        ? 'border-[#135391] bg-[#F0F6FC] text-[#135391]'
                        : 'border-[#E5E5E5] text-[#676565]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      className="accent-[#135391]"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          inclusions: e.target.checked
                            ? [...(form.inclusions ?? []), inc.value]
                            : (form.inclusions ?? []).filter(
                                (i) => i !== inc.value,
                              ),
                        })
                      }
                    />
                    {inc.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          {formError ? (
            <p
              role="alert"
              className="rounded-lg border border-[#DD2222]/30 bg-[#DD2222]/5 px-3 py-2 text-sm font-medium font-satoshi text-[#C0392B] sm:col-span-2"
            >
              {formError}
            </p>
          ) : null}
        </form>
      </AdminFormDialog>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        message="Your unsaved changes to this package will be lost."
        confirmLabel="Discard changes"
        destructive
        onConfirm={closeForm}
        onClose={() => setConfirmDiscard(false)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete “${toDelete?.title ?? ''}”?`}
        message={
          toDelete?.status === 'published'
            ? "This package is live. Deleting it removes it from the landing carousel and any deals that open it will stop working. This can't be undone."
            : "The package will be removed permanently. This can't be undone."
        }
        confirmLabel="Delete package"
        pendingLabel="Deleting…"
        pending={deleteMutation.isPending}
        destructive
        error={deleteError}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete);
        }}
        onClose={() => setToDelete(null)}
      />
    </section>
  );
}
