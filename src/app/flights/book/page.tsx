"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import "@/features/travel/components/booking/phone-input.css";

import {
  FlightTravelerFields,
  type TravelerValue,
} from "@/features/travel/components/booking/flight-traveler-fields";
import { FlightBookingSummary } from "@/features/travel/components/booking/flight-booking-summary";
import { FlightBookingHeader } from "@/features/travel/components/booking/flight-booking-header";
import {
  createBooking,
  isPriceChanged,
  type PriceChangedBody,
  type TravelerInput,
} from "@/lib/api/bookings";
import { priceOffer } from "@/lib/api/flights";
import { ApiError } from "@/lib/api/backend";
import { PriceChangeDialog } from "@/features/travel/components/booking/price-change-dialog";

const contactInput =
  "w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none placeholder:text-foreground/40 focus:border-[#004785]";

function BookFlight() {
  const params = useSearchParams();
  const { data: session } = useSession();

  const offerId = params.get("offerId") ?? "";
  const adults = Math.max(1, Math.min(9, Number(params.get("adults") ?? "1")));

  const [travelers, setTravelers] = useState<TravelerValue[]>(() =>
    Array.from({ length: adults }, () => ({ title: "MR", gender: "M" })),
  );
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [priceChange, setPriceChange] = useState<PriceChangedBody | null>(null);

  // Shared with the sidebar summary (same query key → one request).
  const { data: priced } = useQuery({
    queryKey: ["offer-price", offerId],
    queryFn: ({ signal }) => priceOffer(offerId, signal),
    enabled: Boolean(offerId),
    staleTime: 60 * 1000,
    retry: 0,
  });

  const route = useMemo(() => {
    const its = priced?.offer.itineraries ?? [];
    const firstSeg = its[0]?.segments[0];
    const lastIt = its[its.length - 1]?.segments ?? [];
    const lastSeg = lastIt[lastIt.length - 1];
    if (!firstSeg || !lastSeg) return null;
    const oneWay = its.length === 1;
    return {
      from: firstSeg.departureAirport,
      to: oneWay
        ? lastSeg.arrivalAirport
        : (its[0].segments[its[0].segments.length - 1]?.arrivalAirport ??
          lastSeg.arrivalAirport),
      date: new Date(firstSeg.departureAt).toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      oneWay,
    };
  }, [priced]);

  const filledCount = travelers.filter(
    (t) => t.firstName && t.lastName,
  ).length;

  const canSubmit = Boolean(offerId) && Boolean(email) && !submitting;

  async function doSubmit(confirm?: {
    acknowledgedTotalAmount: string;
    offerId: string;
  }) {
    setError(null);
    setPriceChange(null);
    setSubmitting(true);
    // PhoneInput yields a full E.164 number (with dial code). Ignore a value
    // that's only the dial code (nothing actually typed yet).
    const normalizedPhone =
      phone.replace(/\D/g, "").length >= 8 ? phone : undefined;
    try {
      const { authorizationUrl } = await createBooking(
        {
          // On a price-change confirm, book the exact re-priced offer the
          // backend returned — not the original search offer.
          offerId: confirm?.offerId ?? offerId,
          contactEmail: email,
          contactPhone: normalizedPhone,
          travelers: travelers as TravelerInput[],
          acknowledgedTotalAmount: confirm?.acknowledgedTotalAmount,
        },
        session?.accessToken,
      );
      window.location.href = authorizationUrl;
    } catch (err) {
      setSubmitting(false);
      if (
        err instanceof ApiError &&
        err.status === 409 &&
        isPriceChanged(err.body)
      ) {
        setPriceChange(err.body);
      } else if (err instanceof ApiError && err.status === 404) {
        setError("This offer expired. Please run a new search.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }
  }

  if (!offerId) {
    return (
      <div className="bg-[#F5F5F5]">
        <div className="mx-auto max-w-2xl px-4 py-40 text-center text-foreground/70">
          No flight selected. Please search and select a flight first.
        </div>
      </div>
    );
  }

  const trip = route ? `${route.from} → ${route.to}` : "Book your flight";

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15">
          <FlightBookingHeader trip={trip} currentStep="details" />
        </div>

        {route ? (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">
              {route.oneWay ? "One-way" : "Round trip"} · {adults} traveller
              {adults > 1 ? "s" : ""} · {route.date}
            </p>
            <h1 className="mt-1 text-2xl font-bold font-montserrat text-foreground">
              {route.from} to {route.to}
            </h1>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left column */}
          <div className="space-y-6">
            <section className="rounded-[10px] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold font-inter text-foreground">
                Passenger Details
              </h2>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#004785] text-white">
                    <User className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm font-semibold font-inter text-foreground">
                    {adults > 1 ? "Travellers" : "Traveller"}
                  </p>
                </div>
                <span className="text-sm font-medium font-satoshi text-foreground/70">
                  {filledCount}/{adults} added
                </span>
              </div>

              <div className="mt-4 rounded-md bg-[#FFF1EA] px-4 py-3 text-sm font-normal font-inter text-foreground">
                Enter your name as it is mentioned on your passport. Passport
                should be valid for a minimum of 6 months from date of travel.
              </div>

              <div className="mt-5 space-y-4">
                {travelers.map((t, i) => (
                  <FlightTravelerFields
                    key={i}
                    index={i}
                    value={t}
                    onChange={(next) =>
                      setTravelers((prev) =>
                        prev.map((p, j) => (j === i ? next : p)),
                      )
                    }
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[10px] bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold font-inter text-foreground">
                Contact details
              </h2>
              <p className="mt-1 text-sm font-satoshi text-foreground/60">
                Your e-ticket and receipt are sent here.
              </p>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold font-satoshi text-foreground">
                    Email Address<span className="text-[#004785]"> *</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder="user@mail.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className={contactInput}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold font-satoshi text-foreground">
                    Mobile No
                  </span>
                  <div className="synkka-phone w-full font-satoshi">
                    <PhoneInput
                      defaultCountry="ng"
                      value={phone}
                      onChange={(value) => setPhone(value)}
                      placeholder="801 234 5678"
                      disableDialCodeAndPrefix
                      showDisabledDialCodeAndPrefix
                      className="w-full"
                    />
                  </div>
                </label>
              </div>
            </section>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          {/* Right sidebar */}
          <div>
            <div className="xl:sticky xl:top-10">
              <FlightBookingSummary
                offerId={offerId}
                adults={adults}
                submitting={submitting}
                disabled={!canSubmit}
                onProceed={() => void doSubmit()}
              />
            </div>
          </div>
        </div>
      </div>

      {priceChange ? (
        <PriceChangeDialog
          change={priceChange}
          submitting={submitting}
          onCancel={() => setPriceChange(null)}
          onConfirm={() =>
            void doSubmit({
              acknowledgedTotalAmount: priceChange.currentTotal,
              offerId: priceChange.confirmOfferId,
            })
          }
        />
      ) : null}
    </div>
  );
}

export default function BookFlightPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#F5F5F5] py-40 text-center text-foreground/60">
          Loading…
        </div>
      }
    >
      <BookFlight />
    </Suspense>
  );
}
