"use client";

import {
  ChevronDown,
  Globe,
  Minus,
  Plus,
  Search,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  ADMIN_BOOKING_DATE_RANGES,
  ADMIN_BOOKING_PRODUCT_TYPES,
  ADMIN_BOOKING_SOURCES,
  ADMIN_BOOKING_STATUS_FILTERS,
  ADMIN_BOOKING_VENDORS,
  ADMIN_BOOKINGS,
  filterAdminBookings,
  formatAdminBookingDate,
  getAdminBookingStats,
  isAdminBookingInDateRange,
  type AdminBooking,
  type AdminBookingDateRange,
  type AdminBookingProductType,
  type AdminBookingSource,
  type AdminBookingStatus,
  type AdminBookingStatusFilter,
} from "@/features/admin/data/admin-bookings";
import { AdminCreateBookingModal } from "@/features/admin/components/admin-create-booking-modal";
import { useFormatPrice } from "@/hooks/use-format-price";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<AdminBookingStatus, TranslationKey> = {
  awaiting_confirmation: "admin.bookings.status.awaiting",
  confirmed: "admin.bookings.status.confirmed",
  completed: "admin.bookings.status.completed",
  cancelled: "admin.bookings.status.cancelled",
  disputed: "admin.bookings.status.disputed",
};

const STATUS_BADGE_STYLES: Record<AdminBookingStatus, string> = {
  awaiting_confirmation: "bg-[#FFF3E0] text-[#E65100]",
  confirmed: "bg-[#E8F5E9] text-[#2E7D32]",
  completed: "bg-[#F5F5F5] text-[#676565]",
  cancelled: "bg-[#FDEBEB] text-[#C0392B]",
  disputed: "bg-[#FDEBEB] text-[#C0392B]",
};

const PRODUCT_TAG_STYLES: Record<AdminBookingProductType, string> = {
  accommodations: "bg-[#F3E5F5] text-[#7B1FA2]",
  cars: "bg-[#E3F2FD] text-[#1565C0]",
  experiences: "bg-[#E8F5E9] text-[#2E7D32]",
  flights: "bg-[#FFF3E0] text-[#E65100]",
};

const PRODUCT_LABEL_KEYS: Record<AdminBookingProductType, TranslationKey> = {
  flights: "admin.bookings.product.flights",
  cars: "admin.bookings.product.cars",
  accommodations: "admin.bookings.product.accommodations",
  experiences: "admin.bookings.product.experiences",
};

const SOURCE_LABEL_KEYS: Record<AdminBookingSource, TranslationKey> = {
  website: "admin.bookings.source.website",
  mobile_app: "admin.bookings.source.mobileApp",
  admin: "admin.bookings.source.admin",
};

const DATE_RANGE_KEYS: Record<AdminBookingDateRange, TranslationKey> = {
  day: "admin.bookings.dateRange.day",
  week: "admin.bookings.dateRange.week",
  month: "admin.bookings.dateRange.month",
  six_months: "admin.bookings.dateRange.sixMonths",
  year: "admin.bookings.dateRange.year",
  all: "admin.bookings.dateRange.all",
};

const FILTER_LABEL_KEYS: Record<AdminBookingStatusFilter, TranslationKey> = {
  all: "admin.bookings.filter.all",
  upcoming: "admin.bookings.filter.upcoming",
  awaiting_confirmation: "admin.bookings.filter.awaiting",
  confirmed: "admin.bookings.filter.confirmed",
  completed: "admin.bookings.filter.completed",
  cancelled: "admin.bookings.filter.cancelled",
  disputed: "admin.bookings.filter.disputed",
};

export function AdminBookingsContent() {
  const t = useTranslation();
  const formatPrice = useFormatPrice();
  const [bookings, setBookings] = useState(ADMIN_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilter, setProductFilter] = useState<AdminBookingProductType | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<AdminBookingSource | "all">("all");
  const [dateRange, setDateRange] = useState<AdminBookingDateRange>("all");
  const [statusFilter, setStatusFilter] = useState<AdminBookingStatusFilter>("all");
  const [selectedId, setSelectedId] = useState(ADMIN_BOOKINGS[0]?.id ?? "");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const dateRangeBookings = useMemo(
    () => bookings.filter((booking) => isAdminBookingInDateRange(booking, dateRange)),
    [bookings, dateRange],
  );

  const stats = useMemo(() => getAdminBookingStats(dateRangeBookings), [dateRangeBookings]);

  const filteredBookings = useMemo(
    () =>
      filterAdminBookings(
        bookings,
        searchQuery,
        productFilter,
        sourceFilter,
        statusFilter,
        dateRange,
      ),
    [bookings, dateRange, productFilter, searchQuery, sourceFilter, statusFilter],
  );

  const selectedBooking = useMemo(
    () =>
      filteredBookings.find((booking) => booking.id === selectedId) ?? filteredBookings[0],
    [filteredBookings, selectedId],
  );

  const filterCounts = useMemo(() => {
    const counts = {} as Record<AdminBookingStatusFilter, number>;

    for (const filter of ADMIN_BOOKING_STATUS_FILTERS) {
      counts[filter] = filterAdminBookings(
        bookings,
        searchQuery,
        productFilter,
        sourceFilter,
        filter,
        dateRange,
      ).length;
    }

    return counts;
  }, [bookings, dateRange, productFilter, searchQuery, sourceFilter]);

  const updateBooking = (id: string, patch: Partial<AdminBooking>) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === id ? { ...booking, ...patch } : booking)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
            {t("admin.bookings.title")}
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.bookings.subtitle")}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            {t("admin.bookings.create")}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label={t("admin.bookings.stats.upcoming")}
          value={String(stats.upcoming)}
          valueClassName="text-[#135391]"
        />
        <StatCard
          label={t("admin.bookings.stats.awaiting")}
          value={String(stats.awaitingConfirmation)}
          valueClassName="text-[#D85A30]"
        />
        <StatCard
          label={t("admin.bookings.stats.confirmed")}
          value={String(stats.confirmed)}
          valueClassName="text-[#2E7D32]"
        />
        <StatCard
          label={t("admin.bookings.stats.disputed")}
          value={String(stats.disputed)}
          valueClassName="text-[#DD2222]"
        />
        <StatCard
          label={t("admin.bookings.stats.totalMonth")}
          value={String(stats.totalThisMonth)}
          valueClassName="text-[#2F2F2F]"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-[#EEEEEE] bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("admin.bookings.searchPlaceholder")}
              className="h-11 w-full rounded-full border border-[#E5E5E5] bg-white pl-11 pr-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
            />
          </div>

          <FilterSelect
            value={productFilter}
            onChange={(value) => setProductFilter(value as AdminBookingProductType | "all")}
            options={[
              { value: "all", label: t("admin.bookings.product.all") },
              ...ADMIN_BOOKING_PRODUCT_TYPES.map((type) => ({
                value: type,
                label: t(PRODUCT_LABEL_KEYS[type]),
              })),
            ]}
          />

          <FilterSelect
            value={sourceFilter}
            onChange={(value) => setSourceFilter(value as AdminBookingSource | "all")}
            options={[
              { value: "all", label: t("admin.bookings.source.all") },
              ...ADMIN_BOOKING_SOURCES.map((source) => ({
                value: source,
                label: t(SOURCE_LABEL_KEYS[source]),
              })),
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {ADMIN_BOOKING_STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold font-satoshi transition-colors ${
                statusFilter === filter
                  ? "bg-[#2F2F2F] text-white"
                  : "border border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
              }`}
            >
              {t(FILTER_LABEL_KEYS[filter], { count: filterCounts[filter] })}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="space-y-3">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isSelected={selectedBooking?.id === booking.id}
                formatPrice={formatPrice}
                onSelect={() => setSelectedId(booking.id)}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#EEEEEE] bg-white px-5 py-10 text-center text-sm font-medium text-[#676565] shadow-sm">
              {t("admin.bookings.empty")}
            </div>
          )}
        </div>

        {selectedBooking ? (
          <BookingDetailSidebar
            key={selectedBooking.id}
            booking={selectedBooking}
            formatPrice={formatPrice}
            onUpdate={(patch) => updateBooking(selectedBooking.id, patch)}
            onCancel={() => updateBooking(selectedBooking.id, { status: "cancelled" })}
            onDispute={() => updateBooking(selectedBooking.id, { status: "disputed" })}
          />
        ) : null}
      </div>

      <AdminCreateBookingModal
        open={createModalOpen}
        existingBookings={bookings}
        onClose={() => setCreateModalOpen(false)}
        onCreate={(booking) => {
          setBookings((current) => [booking, ...current]);
          setSelectedId(booking.id);
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-xl border border-[#EEEEEE] bg-white px-4 py-3 shadow-sm">
      <p className={`text-2xl font-bold font-inter ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
    </div>
  );
}

function DateRangeFilter({
  value,
  onChange,
}: {
  value: AdminBookingDateRange;
  onChange: (value: AdminBookingDateRange) => void;
}) {
  const t = useTranslation();

  return (
    <div className="relative flex h-11 min-w-[200px] items-center rounded-lg border border-[#E5E5E5] bg-white pl-4 pr-10 sm:min-w-[240px]">
      <p className="pointer-events-none text-sm font-medium font-satoshi text-[#2F2F2F]">
        {t("admin.bookings.dateRange.label")}: {t(DATE_RANGE_KEYS[value])}
      </p>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AdminBookingDateRange)}
        aria-label={t("admin.bookings.dateRange.label")}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {ADMIN_BOOKING_DATE_RANGES.map((range) => (
          <option key={range} value={range}>
            {t(DATE_RANGE_KEYS[range])}
          </option>
        ))}
      </select>
    </div>
  );
}

function BookingCard({
  booking,
  isSelected,
  formatPrice,
  onSelect,
}: {
  booking: AdminBooking;
  isSelected: boolean;
  formatPrice: (currency: string, amount: number) => string;
  onSelect: () => void;
}) {
  const t = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:bg-[#FAFAFA] ${
        isSelected ? "border-[#135391] ring-1 ring-[#135391]" : "border-[#EEEEEE]"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRODUCT_TAG_STYLES[booking.productType]}`}
            >
              {t(PRODUCT_LABEL_KEYS[booking.productType])}
            </span>
            <span className="text-xs font-medium text-[#9E9E9E]">{booking.timelineLabel}</span>
          </div>

          <p className="mt-2 font-bold font-satoshi text-[#2F2F2F]">{booking.title}</p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
            {booking.customerName} &bull; {booking.customerEmail} &bull;{" "}
            {formatAdminBookingDate(booking.startDate)} &bull; {booking.guestCount}{" "}
            {t("admin.bookings.guests")}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium font-satoshi text-[#676565]">
            <SourceBadge source={booking.source} />
            <span>
              {t("admin.bookings.vendor")}: {booking.vendorName}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right lg:min-w-[120px]">
          <p className="font-bold font-satoshi text-[#2F2F2F]">
            {formatPrice(booking.currency, booking.amount)}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_BADGE_STYLES[booking.status]}`}
          >
            {t(STATUS_LABEL_KEYS[booking.status])}
          </span>
        </div>
      </div>
    </button>
  );
}

function SourceBadge({ source }: { source: AdminBookingSource }) {
  const t = useTranslation();
  const Icon =
    source === "website" ? Globe : source === "mobile_app" ? Smartphone : UserRound;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {t(SOURCE_LABEL_KEYS[source])}
    </span>
  );
}

function BookingDetailSidebar({
  booking,
  formatPrice,
  onUpdate,
  onCancel,
  onDispute,
}: {
  booking: AdminBooking;
  formatPrice: (currency: string, amount: number) => string;
  onUpdate: (patch: Partial<AdminBooking>) => void;
  onCancel: () => void;
  onDispute: () => void;
}) {
  const t = useTranslation();
  const [draft, setDraft] = useState(booking);

  const handleVendorChange = (vendorId: string) => {
    const vendor = ADMIN_BOOKING_VENDORS.find((item) => item.id === vendorId);

    if (vendor) {
      const patch = {
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorPhone: vendor.phone,
      };
      setDraft((current) => ({ ...current, ...patch }));
      onUpdate(patch);
    }
  };

  return (
    <aside className="sticky top-6 h-fit rounded-xl border border-[#EEEEEE] bg-white shadow-sm">
      <div className="border-b border-[#F0F0F0] p-5">
        <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
          {booking.title} &mdash; {booking.id}
        </h3>
        <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
          {t(PRODUCT_LABEL_KEYS[booking.productType])} &bull;{" "}
          {t(STATUS_LABEL_KEYS[booking.status])} &bull;{" "}
          {t("admin.bookings.sidebar.source", {
            source: t(SOURCE_LABEL_KEYS[booking.source]),
          })}
        </p>
      </div>

      <div className="max-h-[calc(100vh-12rem)] space-y-5 overflow-y-auto p-5">
        <SidebarSection title={t("admin.bookings.sidebar.customer")}>
          <SidebarField label={t("admin.bookings.sidebar.name")} value={booking.customerName} />
          <SidebarField label={t("admin.bookings.sidebar.contact")} value={booking.customerEmail} />
          <SidebarField
            label={t("admin.bookings.sidebar.whatsapp")}
            value={booking.customerWhatsApp}
          />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.vendor")}>
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 text-xs font-medium font-satoshi text-[#676565]">
              {t("admin.bookings.sidebar.assignedTo")}
            </span>
            <div className="relative min-w-0 flex-1 max-w-[180px]">
              <select
                value={draft.vendorId}
                onChange={(event) => handleVendorChange(event.target.value)}
                className="h-9 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-[#F0F6FC] px-3 pr-8 text-sm font-semibold font-satoshi text-[#135391] outline-none focus:border-[#135391]"
              >
                {ADMIN_BOOKING_VENDORS.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#135391]" />
            </div>
          </div>
          <SidebarField
            label={t("admin.bookings.sidebar.vendorContact")}
            value={draft.vendorPhone}
          />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.bookingDetails")}>
          <SidebarInput
            label={t("admin.bookings.sidebar.checkIn")}
            type="date"
            value={draft.startDate}
            onChange={(value) => setDraft((current) => ({ ...current, startDate: value }))}
          />
          <SidebarInput
            label={t("admin.bookings.sidebar.checkOut")}
            type="date"
            value={draft.endDate}
            onChange={(value) => setDraft((current) => ({ ...current, endDate: value }))}
          />
          <SidebarStepper
            label={t("admin.bookings.guests")}
            value={draft.guestCount}
            onChange={(value) => setDraft((current) => ({ ...current, guestCount: value }))}
          />
          <SidebarField
            label={t("admin.bookings.sidebar.amount")}
            value={formatPrice(booking.currency, booking.amount)}
          />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.payment")}>
          <SidebarField label={t("admin.bookings.sidebar.paymentStatus")} value={booking.paymentStatus} />
          <SidebarField
            label={t("admin.bookings.sidebar.chargedCurrency")}
            value={booking.chargedCurrency}
          />
        </SidebarSection>

        <SidebarSection title={t("admin.bookings.sidebar.timeline")}>
          <ol className="space-y-4">
            {booking.timeline.map((event) => (
              <li key={`${event.label}-${event.timestamp}`} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#135391]" />
                <div>
                  <p className="text-sm font-medium font-satoshi text-[#2F2F2F]">
                    {event.label}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-[#9E9E9E]">{event.timestamp}</p>
                </div>
              </li>
            ))}
          </ol>
        </SidebarSection>
      </div>

      <div className="space-y-3 border-t border-[#F0F0F0] p-5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onUpdate(draft)}
            className="rounded-lg bg-[#2E7D32] px-3 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90"
          >
            {t("admin.bookings.saveChanges")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.bookings.contactCustomer")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.bookings.contactVendor")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.bookings.addInternalNote")}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#DD2222] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5]"
          >
            {t("admin.bookings.partialRefund")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#DD2222] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5]"
          >
            {t("admin.bookings.cancelRefund")}
          </button>
        </div>
        <button
          type="button"
          onClick={onDispute}
          className="w-full rounded-lg border border-[#DD2222] bg-white px-3 py-2.5 text-sm font-bold font-satoshi text-[#DD2222] transition-colors hover:bg-[#FFF5F5]"
        >
          {t("admin.bookings.flagDispute")}
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E9E9E]">
        {title}
      </p>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function SidebarField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="shrink-0 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
      <p className="min-w-0 text-right text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {value}
      </p>
    </div>
  );
}

function SidebarInput({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="shrink-0 text-xs font-medium font-satoshi text-[#676565]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full max-w-[160px] rounded-lg border border-[#E5E5E5] px-3 text-right text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
      />
    </label>
  );
}

function SidebarStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="shrink-0 text-xs font-medium font-satoshi text-[#676565]">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#676565] hover:bg-[#FAFAFA]"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-6 text-center text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5E5] text-[#676565] hover:bg-[#FAFAFA]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
