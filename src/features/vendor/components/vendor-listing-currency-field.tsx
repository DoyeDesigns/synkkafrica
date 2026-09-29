"use client";

import { useTranslation } from "@/hooks/use-translation";
import { LISTING_CURRENCIES, type ListingCurrency } from "@/lib/api/vendor";

// Currency picker for the add-listing pricing step. The chosen currency is the
// one every price on the listing is quoted in and the one customers are
// charged in — NGN checks out via Paystack, USD/EUR/GBP via Stripe.
export function ListingCurrencyField({
  value,
  onChange,
}: {
  value: ListingCurrency;
  onChange: (currency: ListingCurrency) => void;
}) {
  const t = useTranslation();

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
        {t("vendor.addListing.currency")}
        <span className="text-[#C0392B]"> *</span>
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ListingCurrency)}
        className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-[#2F2F2F] outline-none focus:border-[#135391] sm:max-w-xs"
      >
        {LISTING_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
      <p className="text-xs font-medium font-satoshi text-[#676565]">
        {t("vendor.addListing.currencyHint")}
      </p>
    </label>
  );
}
