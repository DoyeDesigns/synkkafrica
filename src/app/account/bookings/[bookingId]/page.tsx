import { AccountBookingDetailContent } from "@/features/account/components/account-booking-detail-content";
import { getAccountSession } from "@/features/account/get-account-session";

type AccountBookingDetailPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function AccountBookingDetailPage({
  params,
}: AccountBookingDetailPageProps) {
  const { bookingId } = await params;
  const session = await getAccountSession();

  return (
    <AccountBookingDetailContent
      bookingId={bookingId}
      userId={session?.user?.id ?? "guest"}
      userEmail={session?.user?.email ?? "guest@synkkaffric.com"}
      authorName={session?.user?.name ?? "Guest"}
    />
  );
}
