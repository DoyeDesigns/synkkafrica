"use client";

import { AccountReviewForm } from "@/features/account/components/account-review-form";
import { useTranslation } from "@/hooks/use-translation";
import type { SubmitReviewInput } from "@/features/account/data/account-reviews";

type AccountBookingReviewModalProps = {
  bookingTitle: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (input: SubmitReviewInput) => void;
};

export function AccountBookingReviewModal({
  bookingTitle,
  open,
  onClose,
  onSubmit,
}: AccountBookingReviewModalProps) {
  const t = useTranslation();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <AccountReviewForm
          title={t("account.reviews.writeReview")}
          subtitle={bookingTitle}
          submitLabel={t("account.reviews.submit")}
          onCancel={onClose}
          onSubmit={(input) => {
            onSubmit(input);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
