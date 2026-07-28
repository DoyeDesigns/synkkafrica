"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { MoonLoader } from "react-spinners";

import { FlightBookingHeader } from "@/features/travel/components/booking/flight-booking-header";
import { getBooking } from "@/lib/api/bookings";

// Terminal booking states we stop polling on.
const DONE = new Set([
  "TICKETED",
  "REFUNDED",
  "CANCELLED",
  "PAYMENT_FAILED",
  "MANUAL_REVIEW_REQUIRED",
]);

function Confirmation() {
  const params = useSearchParams();
  const { data: session } = useSession();
  // Paystack appends ?reference=<bookingId>&trxref=...
  const bookingId = params.get("reference") ?? params.get("trxref") ?? "";
  const token = session?.accessToken;

  const { data } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBooking(bookingId, token as string),
    enabled: Boolean(bookingId && token),
    refetchInterval: (q) =>
      q.state.data && DONE.has(q.state.data.state) ? false : 3000,
  });

  const state = data?.state;
  const ticketed = state === "TICKETED";
  const failed =
    state === "PAYMENT_FAILED" || state === "MANUAL_REVIEW_REQUIRED";

  return (
    <div className="bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mt-15">
          <FlightBookingHeader trip="Your booking" currentStep="confirmation" />
        </div>

        <div className="mt-16 flex flex-col items-center pb-16">
          <div className="w-full max-w-xl rounded-xl bg-white px-8 py-14 text-center sm:px-12 sm:py-16">
            {ticketed ? (
              <>
                <div className="mx-auto flex items-center justify-center">
                  <Image
                    src="/successful.png"
                    alt="Payment successful"
                    width={177}
                    height={108}
                  />
                </div>
                <h2 className="mt-6 text-2xl font-bold font-montserrat text-[#D85A30] sm:text-[28px]">
                  Payment successful
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm font-normal font-inter text-foreground sm:text-base">
                  Kindly check your email for your e-ticket and receipt.
                </p>
                {data?.pnr ? (
                  <p className="mt-4 text-sm font-satoshi text-foreground">
                    Booking reference:{" "}
                    <span className="font-semibold">{data.pnr}</span>
                  </p>
                ) : null}
              </>
            ) : failed ? (
              <>
                <div className="mx-auto flex items-center justify-center">
                  <AlertCircle className="h-16 w-16 text-red-500" strokeWidth={1.25} />
                </div>
                <h2 className="mt-6 text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
                  Booking needs attention
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm font-normal font-inter text-foreground sm:text-base">
                  We couldn&apos;t complete ticketing. If you were charged, a
                  refund is being processed — please check your email.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex min-h-[108px] items-center justify-center">
                  <MoonLoader color="#004785" size={56} speedMultiplier={0.8} />
                </div>
                <h2 className="mt-6 text-2xl font-bold font-montserrat text-foreground sm:text-[28px]">
                  Confirming your booking
                </h2>
                <p className="mx-auto mt-4 max-w-md text-sm font-normal font-inter text-foreground sm:text-base">
                  {token
                    ? "We're confirming your seat with the airline. This only takes a moment…"
                    : "We're confirming your seat with the airline. Your e-ticket will arrive by email shortly."}
                </p>
              </>
            )}
          </div>

          {ticketed || failed ? (
            <Link
              href="/?section=flights"
              className="mt-8 rounded-md bg-[#004785] px-5 py-2.5 text-sm font-semibold font-montserrat text-white transition-opacity hover:opacity-90"
            >
              Back to flights
            </Link>
          ) : bookingId ? (
            <p className="mt-8 text-xs font-satoshi text-foreground/50">
              Ref: {bookingId}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#F5F5F5] py-40 text-center text-foreground/60">
          Loading…
        </div>
      }
    >
      <Confirmation />
    </Suspense>
  );
}
