"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useSession } from "next-auth/react";

import { submitReview } from "@/lib/api/reviews";

// A lightweight post-booking review form. Works for any listing (accommodation,
// car, experience) — pass the listing id.
export function LeaveReviewForm({
  listingId,
  bookingId,
}: {
  listingId: string;
  bookingId?: string;
}) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  if (state === "done") {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[#E7F6EC] bg-[#F3FBF5] px-6 py-5 text-center">
        <p className="text-sm font-semibold font-satoshi text-[#2E7D32]">
          Thanks for your review!
        </p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (rating < 1 || state === "saving") return;
    setState("saving");
    submitReview(
      {
        listingId,
        rating,
        comment: comment.trim() || undefined,
        authorName: authorName.trim() || undefined,
        bookingId,
      },
      token,
    )
      .then(() => setState("done"))
      .catch(() => setState("error"));
  };

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-xl border border-[#EEEEEE] bg-white px-6 py-5">
      <p className="text-base font-bold font-satoshi text-[#2F2F2F]">
        Leave a review
      </p>

      <div className="mt-3 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              aria-label={`${value} star`}
            >
              <Star
                className={`h-6 w-6 ${
                  value <= (hover || rating)
                    ? "fill-[#FFCE31] text-[#FFCE31]"
                    : "fill-zinc-200 text-zinc-200"
                }`}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={3}
        className="mt-3 w-full resize-y rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-satoshi outline-none focus:border-[#135391]"
      />
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name (optional)"
        className="mt-2 h-10 w-full rounded-lg border border-[#E5E5E5] px-3 text-sm font-satoshi outline-none focus:border-[#135391]"
      />

      {state === "error" ? (
        <p className="mt-2 text-xs font-medium font-satoshi text-[#C0392B]">
          Couldn&apos;t submit — please try again.
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={rating < 1 || state === "saving"}
        className="mt-4 h-10 rounded-lg bg-[#D85A30] px-5 text-sm font-bold font-satoshi text-white disabled:opacity-60"
      >
        {state === "saving" ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
