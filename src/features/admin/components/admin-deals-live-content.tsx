'use client';

import { useMemo, useRef, useState } from 'react';
import { BadgePercent, ImagePlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  adminCreateDeal,
  adminDeleteDeal,
  adminListDeals,
  adminListListings,
  adminListPackages,
  adminSetDealStatus,
  adminUpdateDeal,
  type AdminDeal,
  type AdminDealInput,
  type DealCabin,
  type DealStatus,
  type DealType,
} from '@/lib/api/admin';
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
  focusRing,
  formatDate,
  formatDateTime,
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

const TYPE_OPTIONS: { value: DealType; label: string }[] = [
  { value: 'flight', label: 'Flight' },
  { value: 'package', label: 'Package' },
  { value: 'tour', label: 'Tour / experience' },
  { value: 'stay', label: 'Stay' },
  { value: 'car', label: 'Car' },
];
const CURRENCY_OPTIONS = ['NGN', 'USD', 'EUR', 'GBP'] as const;
const CABIN_OPTIONS: { value: DealCabin; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
];
// Deal type → vendor listing category its target is picked from.
const LISTING_CATEGORY: Partial<Record<DealType, string>> = {
  tour: 'experiences',
  stay: 'accommodations',
  car: 'cars',
};

const STATE_BADGE: Record<AdminDeal['state'], string> = {
  live: 'bg-[#E7F6EC] text-[#2E7D32]',
  scheduled: 'bg-[#E8F0FA] text-[#135391]',
  paused: 'bg-[#FFF4E5] text-[#B26A00]',
  expired: 'bg-[#FDECEA] text-[#C0392B]',
  draft: 'bg-[#EEEEEE] text-[#5A5A5A]',
};

// Which status moves each deal row offers.
const STATUS_ACTIONS: Record<
  DealStatus,
  { to: DealStatus; label: string; primary?: boolean }[]
> = {
  draft: [{ to: 'published', label: 'Publish', primary: true }],
  published: [
    { to: 'paused', label: 'Pause', primary: true },
    { to: 'draft', label: 'Move to draft' },
  ],
  paused: [
    { to: 'published', label: 'Resume', primary: true },
    { to: 'draft', label: 'Move to draft' },
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
  type: 'flight',
  title: '',
  subtitle: '',
  image: '',
  currency: 'NGN',
  originalPrice: 0,
  dealPrice: 0,
  startsAt: '',
  endsAt: '',
  status: 'draft',
  sortOrder: 0,
  origin: '',
  destination: '',
  cabin: 'economy',
  adults: 1,
  departureDate: '',
  targetId: '',
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
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
    subtitle: d.subtitle ?? '',
    image: d.image ?? '',
    currency: d.currency,
    originalPrice: d.originalPrice,
    dealPrice: d.dealPrice,
    startsAt: toLocalInput(d.startsAt),
    endsAt: toLocalInput(d.endsAt),
    status: d.status,
    sortOrder: d.sortOrder,
    ...(t.kind === 'flight'
      ? {
          origin: t.origin,
          destination: t.destination,
          cabin: t.cabin,
          adults: t.adults,
          departureDate: t.departureDate ?? '',
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
      form.type === 'flight'
        ? {
            origin: form.origin.trim().toUpperCase(),
            destination: form.destination.trim().toUpperCase(),
            cabin: form.cabin,
            adults: form.adults,
            ...(form.departureDate
              ? { departureDate: form.departureDate }
              : {}),
          }
        : { id: form.targetId },
  };
}

function discountOf(original: number, deal: number): number {
  if (!(original > 0) || !(deal < original)) return 0;
  return Math.round(((original - deal) / original) * 100);
}

type DealFieldErrors = Partial<
  Record<
    | 'title'
    | 'originalPrice'
    | 'dealPrice'
    | 'endsAt'
    | 'origin'
    | 'destination'
    | 'targetId',
    string
  >
>;

function validate(form: DealForm): DealFieldErrors {
  const errors: DealFieldErrors = {};
  if (!form.title.trim()) errors.title = 'Add a title.';
  if (!(form.originalPrice > 0))
    errors.originalPrice = 'Set an original price above 0.';
  if (!(form.dealPrice > 0)) errors.dealPrice = 'Set a deal price above 0.';
  else if (form.originalPrice > 0 && form.dealPrice >= form.originalPrice)
    errors.dealPrice = 'Must be lower than the original price.';
  if (
    form.startsAt &&
    form.endsAt &&
    new Date(form.endsAt) <= new Date(form.startsAt)
  )
    errors.endsAt = 'The end must be after the start.';
  if (form.type === 'flight') {
    if (!/^[A-Za-z]{3}$/.test(form.origin.trim()))
      errors.origin = '3-letter airport code, e.g. LOS.';
    if (!/^[A-Za-z]{3}$/.test(form.destination.trim()))
      errors.destination = '3-letter airport code, e.g. LHR.';
    else if (
      form.origin.trim().toUpperCase() === form.destination.trim().toUpperCase()
    )
      errors.destination = 'Must differ from the origin.';
  } else if (!form.targetId) {
    errors.targetId =
      form.type === 'package'
        ? 'Choose the package this deal opens.'
        : 'Choose the listing this deal opens.';
  }
  return errors;
}

function formatWindow(d: AdminDeal): string {
  if (d.startsAt && d.endsAt)
    return `${formatDate(d.startsAt)} → ${formatDate(d.endsAt)}`;
  if (d.endsAt) return `Ends ${formatDateTime(d.endsAt)}`;
  if (d.startsAt) return `Starts ${formatDateTime(d.startsAt)}`;
  return 'No deadline';
}

const STATE_FILTERS = [
  'all',
  'live',
  'scheduled',
  'paused',
  'expired',
  'draft',
] as const;

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

export function AdminDealsLiveContent() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const toast = useAdminToast();
  const { get, set: setUrl } = useUrlState();
  const { input, setInput, term } = useUrlSearch();
  const typeParam = get('type');
  const typeFilter = TYPE_OPTIONS.some((o) => o.value === typeParam)
    ? (typeParam as DealType)
    : 'all';
  const stateParam = get('state');
  const stateFilter = (STATE_FILTERS as readonly string[]).includes(stateParam)
    ? stateParam
    : 'all';

  const [form, setForm] = useState<DealForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<AdminDeal | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminDeal | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [dialogOpenState, setDialogOpenState] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // /admin/deals?new=1 opens the create dialog on load; closing the dialog
  // drops `new` from the URL.
  const wantsNew = get('new') === '1';
  const dialogOpen = dialogOpenState || wantsNew;

  const set = (patch: Partial<DealForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const baseline = useMemo(
    () => (editing ? toForm(editing) : EMPTY_FORM),
    [editing],
  );
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);
  useUnsavedChangesGuard(dialogOpen && dirty);
  const errors = validate(form);
  const showErrors: DealFieldErrors = submitted ? errors : {};

  const {
    data,
    isLoading,
    isFetching,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: () => adminListDeals(token as string),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });
  // Target pickers.
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => adminListPackages(token as string),
    enabled: Boolean(token) && form.type === 'package',
  });
  const { data: liveListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['admin-listings', 'live'],
    queryFn: () => adminListListings(token as string, 'live'),
    enabled: Boolean(token) && Boolean(LISTING_CATEGORY[form.type]),
  });
  const listingOptions = (liveListings ?? []).filter(
    (l) => l.category === LISTING_CATEGORY[form.type],
  );
  const targetsLoading =
    form.type === 'package' ? packagesLoading : listingsLoading;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-deals'] });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setFormError(null);
    setSubmitted(false);
    setUploadError(null);
  };

  const closeDialog = () => {
    resetForm();
    setConfirmDiscard(false);
    setDialogOpenState(false);
    if (wantsNew) setUrl({ new: null });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = toInput(form);
      return editing
        ? adminUpdateDeal(token as string, editing.id, payload)
        : adminCreateDeal(token as string, payload);
    },
    onMutate: () => setFormError(null),
    onSuccess: (deal) => {
      toast.success(
        editing ? `Saved “${deal.title}”.` : `Created “${deal.title}”.`,
      );
      closeDialog();
      invalidate();
    },
    onError: (err) =>
      setFormError(
        errorMessage(
          err,
          editing
            ? "Couldn't save this deal. Please try again."
            : "Couldn't create this deal. Please try again.",
        ),
      ),
  });
  // Row status buttons: publish, pause, resume, back to draft.
  const statusMutation = useMutation({
    mutationFn: (v: { deal: AdminDeal; status: DealStatus; label: string }) =>
      adminSetDealStatus(token as string, v.deal.id, v.status),
    onSuccess: (updated, v) => {
      // Keep an open edit form in step with the row.
      if (updated.id === editing?.id) {
        setEditing(updated);
        setForm((f) => ({ ...f, status: updated.status }));
      }
      invalidate();
      toast.success(
        `“${v.deal.title}” ${
          v.status === 'published'
            ? 'published'
            : v.status === 'paused'
              ? 'paused'
              : 'moved to draft'
        }.`,
      );
    },
    onError: (err) =>
      toast.error(errorMessage(err, "Couldn't update the deal.")),
  });
  const deleteMutation = useMutation({
    mutationFn: (deal: AdminDeal) => adminDeleteDeal(token as string, deal.id),
    onSuccess: (_data, deal) => {
      if (deal.id === editing?.id) resetForm();
      setToDelete(null);
      invalidate();
      toast.success(`Deleted “${deal.title}”.`);
    },
    onError: (err) =>
      setDeleteError(errorMessage(err, "Couldn't delete the deal.")),
  });

  const openNew = () => {
    resetForm();
    setDialogOpenState(true);
  };

  const startEdit = (d: AdminDeal) => {
    setEditing(d);
    setForm(toForm(d));
    setFormError(null);
    setSubmitted(false);
    setUploadError(null);
    setDialogOpenState(true);
  };

  // ✕, Escape, backdrop and Cancel: confirm first when there are unsaved edits.
  const requestClose = () => {
    if (saveMutation.isPending || uploadProgress !== null) return;
    if (dirty) setConfirmDiscard(true);
    else closeDialog();
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
      set({ image: url });
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

  const deals = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () =>
      deals.filter(
        (d) =>
          (typeFilter === 'all' || d.type === typeFilter) &&
          (stateFilter === 'all' || d.state === stateFilter) &&
          (!term ||
            d.title.toLowerCase().includes(term) ||
            (d.subtitle ?? '').toLowerCase().includes(term)),
      ),
    [deals, typeFilter, stateFilter, term],
  );
  const { page, pageCount, pageItems, setPage, total } =
    usePagedItems(filtered);
  const discount = discountOf(form.originalPrice, form.dealPrice);
  const uploading = uploadProgress !== null;
  const hasFilters =
    typeFilter !== 'all' || stateFilter !== 'all' || Boolean(term);

  return (
    <section className="space-y-8">
      <AdminPageHeader
        title="Deals"
        description={
          <>
            Time-limited offers on the app&apos;s Deals screen. Published deals
            show between their start and end; those ending within 7 days also
            appear under &quot;Ending soon&quot;. Pause hides a deal without
            losing its schedule; drafts stay hidden until published.
          </>
        }
        actions={
          <button
            type="button"
            onClick={openNew}
            className={`h-10 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white hover:opacity-90 ${focusRing}`}
          >
            New deal
          </button>
        }
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={input}
            onChange={setInput}
            placeholder="Search deals"
            label="Search deals"
            className="lg:w-72"
          />
          <div className="flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="deal-type-filter">
              Type
            </label>
            <select
              id="deal-type-filter"
              value={typeFilter}
              onChange={(e) =>
                setUrl({
                  type: e.target.value === 'all' ? null : e.target.value,
                  page: null,
                })
              }
              className={`h-10 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi outline-none focus:border-[#135391] ${focusRing}`}
            >
              <option value="all">All types</option>
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="deal-state-filter">
              State
            </label>
            <select
              id="deal-state-filter"
              value={stateFilter}
              onChange={(e) =>
                setUrl({
                  state: e.target.value === 'all' ? null : e.target.value,
                  page: null,
                })
              }
              className={`h-10 rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi capitalize outline-none focus:border-[#135391] ${focusRing}`}
            >
              {STATE_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all'
                    ? 'All states'
                    : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {!isLoading ? (
            <span className="lg:ml-auto">
              <ResultCount
                shown={filtered.length}
                total={deals.length}
                noun="deal"
              />
            </span>
          ) : null}
        </div>

        {loadError ? (
          <ErrorBanner
            message={errorMessage(loadError, "Couldn't load deals.")}
            onRetry={() => void refetch()}
            retrying={isFetching}
          />
        ) : null}

        {isLoading ? (
          <SkeletonList rows={4} label="Loading deals" />
        ) : loadError ? null : filtered.length === 0 ? (
          <EmptyState
            icon={BadgePercent}
            title={hasFilters ? 'No deals match' : 'No deals yet'}
            description={
              hasFilters
                ? 'Try another type or state, or clear the search.'
                : 'Create a time-limited offer with New deal. It stays a draft until you publish it.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    setUrl({ type: null, state: null, q: null, page: null });
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
                  Create a deal
                </button>
              )
            }
          />
        ) : (
          <>
            <ul className="space-y-3">
              {pageItems.map((d) => {
                const busy =
                  statusMutation.isPending &&
                  statusMutation.variables?.deal.id === d.id;
                return (
                  <li
                    key={d.id}
                    className={`flex flex-col gap-3 rounded-xl border bg-white px-4 py-4 lg:flex-row lg:items-center lg:justify-between ${
                      editing?.id === d.id
                        ? 'border-[#135391]'
                        : 'border-[#EEEEEE]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {d.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary bucket URL
                        <img
                          src={d.image}
                          alt=""
                          className="h-12 w-16 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-[#F5F5F5] text-[#9A9A9A]">
                          <BadgePercent
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
                          {d.title}
                          <span className="ml-2 text-xs font-semibold text-[#676565]">
                            {
                              TYPE_OPTIONS.find((o) => o.value === d.type)
                                ?.label
                            }
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs font-medium font-satoshi text-[#676565]">
                          <span className="font-bold text-[#2F2F2F]">
                            {formatMoney(d.dealPrice, d.currency)}
                          </span>{' '}
                          <span className="line-through">
                            {formatMoney(d.originalPrice, d.currency)}
                          </span>{' '}
                          <span className="font-semibold text-[#2E7D32]">
                            −{d.discountPercent}%
                          </span>{' '}
                          · {formatWindow(d)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold font-satoshi capitalize ${STATE_BADGE[d.state]}`}
                      >
                        {d.state}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(d)}
                        aria-label={`Edit ${d.title}`}
                        className={`rounded-lg border border-[#E5E5E5] px-3 py-2 text-xs font-bold font-satoshi text-[#2F2F2F] hover:bg-[#FAFAFA] ${focusRing}`}
                      >
                        Edit
                      </button>
                      {STATUS_ACTIONS[d.status].map((action) => {
                        const running =
                          busy &&
                          statusMutation.variables?.status === action.to;
                        return (
                          <button
                            key={action.to}
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              statusMutation.mutate({
                                deal: d,
                                status: action.to,
                                label: action.label,
                              })
                            }
                            className={`rounded-lg px-3 py-2 text-xs font-bold font-satoshi disabled:opacity-60 ${focusRing} ${
                              action.primary
                                ? 'bg-[#135391] text-white hover:opacity-90'
                                : 'border border-[#E5E5E5] text-[#2F2F2F] hover:bg-[#FAFAFA]'
                            }`}
                          >
                            {running ? 'Updating…' : action.label}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setToDelete(d);
                        }}
                        aria-label={`Delete ${d.title}`}
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
        title={editing ? `Edit deal — ${form.title || 'Untitled'}` : 'New deal'}
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
              form="deal-form"
              disabled={saveMutation.isPending || uploading}
              className={`h-10 rounded-lg bg-[#135391] px-5 text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-60 ${focusRing}`}
            >
              {saveMutation.isPending
                ? editing
                  ? 'Saving…'
                  : 'Creating…'
                : uploading
                  ? 'Waiting for upload…'
                  : editing
                    ? 'Save changes'
                    : 'Create deal'}
            </button>
          </>
        }
      >
        <form
          id="deal-form"
          ref={formRef}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          aria-label={editing ? 'Edit deal' : 'New deal'}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className={labelClass}>
            Type
            <select
              value={form.type}
              onChange={(e) =>
                set({ type: e.target.value as DealType, targetId: '' })
              }
              className={inputClass()}
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
                set({ status: e.target.value as DealForm['status'] })
              }
              className={inputClass()}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
              <option value="paused">Paused</option>
            </select>
          </label>

          <label className={labelClass}>
            Title *
            <input
              name="title"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Lagos → London"
              aria-invalid={Boolean(showErrors.title)}
              aria-describedby="deal-title-error"
              className={inputClass(showErrors.title)}
            />
            <FieldError id="deal-title-error" message={showErrors.title} />
          </label>
          <label className={labelClass}>
            Subtitle
            <input
              value={form.subtitle}
              onChange={(e) => set({ subtitle: e.target.value })}
              placeholder="Economy • 1 adult"
              className={inputClass()}
            />
          </label>

          {/* What the deal opens */}
          {form.type === 'flight' ? (
            <fieldset className="grid gap-4 rounded-lg bg-[#FAFAFA] p-4 sm:col-span-2 sm:grid-cols-5">
              <legend className="sr-only">Flight search this deal opens</legend>
              <label className={labelClass}>
                From (IATA) *
                <input
                  name="origin"
                  value={form.origin}
                  onChange={(e) =>
                    set({ origin: e.target.value.toUpperCase() })
                  }
                  placeholder="LOS"
                  maxLength={3}
                  autoCapitalize="characters"
                  aria-invalid={Boolean(showErrors.origin)}
                  aria-describedby="deal-origin-error"
                  className={inputClass(showErrors.origin)}
                />
                <FieldError
                  id="deal-origin-error"
                  message={showErrors.origin}
                />
              </label>
              <label className={labelClass}>
                To (IATA) *
                <input
                  name="destination"
                  value={form.destination}
                  onChange={(e) =>
                    set({ destination: e.target.value.toUpperCase() })
                  }
                  placeholder="LHR"
                  maxLength={3}
                  autoCapitalize="characters"
                  aria-invalid={Boolean(showErrors.destination)}
                  aria-describedby="deal-destination-error"
                  className={inputClass(showErrors.destination)}
                />
                <FieldError
                  id="deal-destination-error"
                  message={showErrors.destination}
                />
              </label>
              <label className={labelClass}>
                Cabin
                <select
                  value={form.cabin}
                  onChange={(e) => set({ cabin: e.target.value as DealCabin })}
                  className={inputClass()}
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
                  onChange={(e) =>
                    set({
                      adults: Math.min(
                        9,
                        Math.max(1, Number(e.target.value) || 1),
                      ),
                    })
                  }
                  className={inputClass()}
                />
              </label>
              <label className={labelClass}>
                Departure (optional)
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) => set({ departureDate: e.target.value })}
                  className={inputClass()}
                />
              </label>
            </fieldset>
          ) : (
            <label className={`${labelClass} sm:col-span-2`}>
              {form.type === 'package' ? 'Package *' : 'Listing (live only) *'}
              <select
                name="targetId"
                value={form.targetId}
                onChange={(e) => set({ targetId: e.target.value })}
                aria-invalid={Boolean(showErrors.targetId)}
                aria-describedby="deal-target-error"
                disabled={targetsLoading}
                className={`${inputClass(showErrors.targetId)} disabled:opacity-60`}
              >
                <option value="">
                  {targetsLoading ? 'Loading…' : 'Choose…'}
                </option>
                {form.type === 'package'
                  ? (packages ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                        {p.status === 'draft'
                          ? ' (draft — hidden until published)'
                          : ''}
                      </option>
                    ))
                  : listingOptions.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                        {l.location ? ` — ${l.location}` : ''}
                      </option>
                    ))}
                {/* Keep an edited deal's target selectable even if it has
                    since left the live list. */}
                {form.targetId &&
                !(packages ?? []).some((p) => p.id === form.targetId) &&
                !listingOptions.some((l) => l.id === form.targetId) ? (
                  <option value={form.targetId}>
                    Current target (not live)
                  </option>
                ) : null}
              </select>
              <FieldError
                id="deal-target-error"
                message={showErrors.targetId}
              />
              {!targetsLoading &&
              (form.type === 'package'
                ? (packages ?? []).length === 0
                : listingOptions.length === 0) ? (
                <span className="mt-1 block text-xs font-medium text-[#9A7200]">
                  {form.type === 'package'
                    ? 'No packages yet — create one on the Packages page first.'
                    : 'No live listings in this category yet.'}
                </span>
              ) : null}
            </label>
          )}

          <label className={labelClass}>
            Original price *
            <input
              type="number"
              name="originalPrice"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={form.originalPrice || ''}
              onChange={(e) => set({ originalPrice: Number(e.target.value) })}
              aria-invalid={Boolean(showErrors.originalPrice)}
              aria-describedby="deal-original-error"
              className={inputClass(showErrors.originalPrice)}
            />
            <FieldError
              id="deal-original-error"
              message={showErrors.originalPrice}
            />
          </label>
          <label className={labelClass}>
            Deal price *{discount > 0 ? ` (−${discount}%)` : ''}
            <input
              type="number"
              name="dealPrice"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={form.dealPrice || ''}
              onChange={(e) => set({ dealPrice: Number(e.target.value) })}
              aria-invalid={Boolean(showErrors.dealPrice)}
              aria-describedby="deal-price-error"
              className={inputClass(showErrors.dealPrice)}
            />
            <FieldError id="deal-price-error" message={showErrors.dealPrice} />
            {!showErrors.dealPrice && form.dealPrice > 0 && discount > 0 ? (
              <span className="mt-1 block text-xs font-medium text-[#676565]">
                {formatMoney(form.dealPrice, form.currency)} instead of{' '}
                {formatMoney(form.originalPrice, form.currency)}
              </span>
            ) : null}
          </label>
          <label className={labelClass}>
            Currency
            <select
              value={form.currency}
              onChange={(e) => set({ currency: e.target.value })}
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
            Sort order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set({ sortOrder: Number(e.target.value) })}
              className={inputClass()}
            />
            <span className="mt-1 block text-xs font-medium text-[#9A9A9A]">
              Lower numbers show first.
            </span>
          </label>
          <label className={labelClass}>
            Starts (optional)
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set({ startsAt: e.target.value })}
              className={inputClass()}
            />
          </label>
          <label className={labelClass}>
            Ends (optional — drives the countdown)
            <input
              type="datetime-local"
              name="endsAt"
              value={form.endsAt}
              min={form.startsAt || undefined}
              onChange={(e) => set({ endsAt: e.target.value })}
              aria-invalid={Boolean(showErrors.endsAt)}
              aria-describedby="deal-ends-error"
              className={inputClass(showErrors.endsAt)}
            />
            <FieldError id="deal-ends-error" message={showErrors.endsAt} />
          </label>

          <div className="sm:col-span-2">
            <span className={labelClass}>Image</span>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary bucket URL
                <img
                  src={form.image}
                  alt="Deal preview"
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
                      onClick={() => set({ image: '' })}
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
                  id="deal-image-error"
                  message={uploadError ?? undefined}
                />
              </div>
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
        </form>
      </AdminFormDialog>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        message="Your unsaved changes to this deal will be lost."
        confirmLabel="Discard"
        destructive
        onConfirm={closeDialog}
        onClose={() => setConfirmDiscard(false)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete “${toDelete?.title ?? ''}”?`}
        message={
          toDelete?.state === 'live'
            ? "This deal is live right now. Deleting it removes it from the app immediately. This can't be undone — use Pause if you may bring it back."
            : "The deal will be removed permanently. This can't be undone."
        }
        confirmLabel="Delete deal"
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
