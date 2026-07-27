"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  ADMIN_CREATE_BOOKING_PAYMENT_STATUSES,
  createAdminBooking,
  searchAdminBookingCustomers,
  searchAdminBookingListings,
  type AdminBooking,
  type AdminBookingCustomerOption,
  type AdminBookingListingOption,
  type AdminBookingProductType,
  type AdminCreateBookingPaymentStatus,
  type CreateAdminBookingInput,
} from "@/features/admin/data/admin-bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const CREATE_PRODUCT_TYPES: AdminBookingProductType[] = [
  "accommodations",
  "flights",
  "cars",
  "experiences",
];

const CREATE_PRODUCT_LABEL_KEYS: Record<AdminBookingProductType, TranslationKey> = {
  accommodations: "admin.bookings.createModal.product.accommodations",
  flights: "admin.bookings.createModal.product.flights",
  cars: "admin.bookings.createModal.product.cars",
  experiences: "admin.bookings.createModal.product.experiences",
};

const PAYMENT_STATUS_LABEL_KEYS: Record<AdminCreateBookingPaymentStatus, TranslationKey> = {
  send_payment_link: "admin.bookings.createModal.payment.sendLink",
  paid_in_full: "admin.bookings.createModal.payment.paidInFull",
  payment_pending: "admin.bookings.createModal.payment.pending",
};

type AdminCreateBookingModalProps = {
  open: boolean;
  existingBookings: AdminBooking[];
  onClose: () => void;
  onCreate: (booking: AdminBooking) => void;
};

const EMPTY_FORM = {
  productType: "accommodations" as AdminBookingProductType,
  customerQuery: "",
  listingQuery: "",
  startDate: "",
  endDate: "",
  guestCount: "",
  amount: "",
  paymentStatus: "send_payment_link" as AdminCreateBookingPaymentStatus,
  internalNote: "",
};

export function AdminCreateBookingModal({
  open,
  existingBookings,
  onClose,
  onCreate,
}: AdminCreateBookingModalProps) {
  const t = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminBookingCustomerOption | null>(
    null,
  );
  const [selectedListing, setSelectedListing] = useState<AdminBookingListingOption | null>(null);
  const [customerFocused, setCustomerFocused] = useState(false);
  const [listingFocused, setListingFocused] = useState(false);

  const customerResults = useMemo(
    () => searchAdminBookingCustomers(form.customerQuery),
    [form.customerQuery],
  );

  const listingResults = useMemo(
    () => searchAdminBookingListings(form.listingQuery, form.productType),
    [form.listingQuery, form.productType],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setSelectedCustomer(null);
      setSelectedListing(null);
      setCustomerFocused(false);
      setListingFocused(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const canSubmit =
    selectedCustomer &&
    selectedListing &&
    form.startDate &&
    form.endDate &&
    Number(form.guestCount) > 0 &&
    Number(form.amount) > 0;

  const handleSubmit = () => {
    if (!canSubmit || !selectedCustomer || !selectedListing) {
      return;
    }

    const input: CreateAdminBookingInput = {
      productType: form.productType,
      customer: selectedCustomer,
      listing: selectedListing,
      startDate: form.startDate,
      endDate: form.endDate,
      guestCount: Number(form.guestCount),
      amount: Number(form.amount),
      paymentStatus: form.paymentStatus,
      internalNote: form.internalNote.trim() || undefined,
    };

    onCreate(createAdminBooking(input, existingBookings));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-booking-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="space-y-1">
          <h3
            id="create-booking-title"
            className="text-xl font-bold font-satoshi text-[#2F2F2F]"
          >
            {t("admin.bookings.createModal.title")}
          </h3>
          <p className="text-sm font-medium font-satoshi text-[#676565]">
            {t("admin.bookings.createModal.subtitle")}
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-[#EBF5FB] px-4 py-3 text-sm font-medium font-satoshi text-[#2F2F2F]">
          {t("admin.bookings.createModal.infoBannerPrefix")}{" "}
          <span className="font-bold">{t("admin.bookings.createModal.infoBannerSource")}</span>{" "}
          {t("admin.bookings.createModal.infoBannerSuffix")}
        </div>

        <div className="mt-6 space-y-5">
          <FormField label={t("admin.bookings.createModal.productType")}>
            <div className="relative">
              <select
                value={form.productType}
                onChange={(event) => {
                  const productType = event.target.value as AdminBookingProductType;
                  setForm((current) => ({
                    ...current,
                    productType,
                    listingQuery: "",
                  }));
                  setSelectedListing(null);
                }}
                className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              >
                {CREATE_PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(CREATE_PRODUCT_LABEL_KEYS[type])}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          <FormField label={t("admin.bookings.createModal.customer")}>
            <SearchField
              value={form.customerQuery}
              placeholder={t("admin.bookings.createModal.customerPlaceholder")}
              onChange={(value) => {
                setForm((current) => ({ ...current, customerQuery: value }));
                setSelectedCustomer(null);
              }}
              onFocus={() => setCustomerFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setCustomerFocused(false), 150);
              }}
              showDropdown={customerFocused && customerResults.length > 0}
              dropdown={
                <SuggestionList
                  items={customerResults.map((customer) => ({
                    id: customer.id,
                    primary: customer.name,
                    secondary: `${customer.email} · ${customer.phone}`,
                  }))}
                  onSelect={(id) => {
                    const customer = customerResults.find((item) => item.id === id);
                    if (!customer) {
                      return;
                    }

                    setSelectedCustomer(customer);
                    setForm((current) => ({ ...current, customerQuery: customer.name }));
                    setCustomerFocused(false);
                  }}
                />
              }
            />
          </FormField>

          <FormField label={t("admin.bookings.createModal.vendorListing")}>
            <SearchField
              value={form.listingQuery}
              placeholder={t("admin.bookings.createModal.vendorPlaceholder")}
              onChange={(value) => {
                setForm((current) => ({ ...current, listingQuery: value }));
                setSelectedListing(null);
              }}
              onFocus={() => setListingFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setListingFocused(false), 150);
              }}
              showDropdown={listingFocused && listingResults.length > 0}
              dropdown={
                <SuggestionList
                  items={listingResults.map((listing) => ({
                    id: listing.id,
                    primary: listing.title,
                    secondary: listing.vendorName,
                  }))}
                  onSelect={(id) => {
                    const listing = listingResults.find((item) => item.id === id);
                    if (!listing) {
                      return;
                    }

                    setSelectedListing(listing);
                    setForm((current) => ({
                      ...current,
                      listingQuery: `${listing.title} — ${listing.vendorName}`,
                    }));
                    setListingFocused(false);
                  }}
                />
              }
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("admin.bookings.createModal.startDate")}>
              <DateInput
                value={form.startDate}
                onChange={(value) => setForm((current) => ({ ...current, startDate: value }))}
              />
            </FormField>
            <FormField label={t("admin.bookings.createModal.endDate")}>
              <DateInput
                value={form.endDate}
                onChange={(value) => setForm((current) => ({ ...current, endDate: value }))}
              />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("admin.bookings.createModal.guestsUnits")}>
              <input
                type="number"
                min={1}
                value={form.guestCount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, guestCount: event.target.value }))
                }
                placeholder={t("admin.bookings.createModal.guestsPlaceholder")}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              />
            </FormField>
            <FormField label={t("admin.bookings.createModal.totalAmount")}>
              <input
                type="number"
                min={0}
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
                placeholder={t("admin.bookings.createModal.amountPlaceholder")}
                className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              />
            </FormField>
          </div>

          <FormField label={t("admin.bookings.createModal.paymentStatus")}>
            <div className="relative">
              <select
                value={form.paymentStatus}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    paymentStatus: event.target.value as AdminCreateBookingPaymentStatus,
                  }))
                }
                className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] pl-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
              >
                {ADMIN_CREATE_BOOKING_PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(PAYMENT_STATUS_LABEL_KEYS[status])}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
            </div>
          </FormField>

          <FormField label={t("admin.bookings.createModal.internalNote")}>
            <textarea
              value={form.internalNote}
              onChange={(event) =>
                setForm((current) => ({ ...current, internalNote: event.target.value }))
              }
              rows={4}
              placeholder={t("admin.bookings.createModal.internalNotePlaceholder")}
              className="w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
            />
          </FormField>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-lg border border-[#E5E5E5] bg-white px-5 text-sm font-bold font-satoshi text-[#2F2F2F] transition-colors hover:bg-[#FAFAFA]"
          >
            {t("admin.bookings.createModal.cancel")}
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="inline-flex h-11 items-center rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("admin.bookings.createModal.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold font-satoshi text-[#2F2F2F]">{label}</span>
      {children}
    </label>
  );
}

function SearchField({
  value,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  showDropdown,
  dropdown,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  showDropdown: boolean;
  dropdown: ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391]"
      />
      {showDropdown ? dropdown : null}
    </div>
  );
}

function SuggestionList({
  items,
  onSelect,
}: {
  items: Array<{ id: string; primary: string; secondary: string }>;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[#E5E5E5] bg-white py-1 shadow-lg">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item.id)}
            className="flex w-full flex-col px-4 py-2 text-left transition-colors hover:bg-[#FAFAFA]"
          >
            <span className="text-sm font-medium font-satoshi text-[#2F2F2F]">{item.primary}</span>
            <span className="text-xs font-medium font-satoshi text-[#676565]">{item.secondary}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-4 pr-10 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] [&::-webkit-calendar-picker-indicator]:opacity-0"
      />
      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
    </div>
  );
}
