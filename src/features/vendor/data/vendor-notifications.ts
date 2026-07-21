export type VendorNotificationType =
  | "new_booking"
  | "booking_reminder"
  | "payout_confirmation"
  | "admin_message";

export type VendorNotificationFilter = VendorNotificationType | "all";

export type VendorNotification = {
  id: string;
  type: VendorNotificationType;
  titleKey:
    | "vendor.notifications.sample.newBooking.title"
    | "vendor.notifications.sample.reminder.title"
    | "vendor.notifications.sample.payout.title"
    | "vendor.notifications.sample.admin.title"
    | "vendor.notifications.sample.newBooking2.title"
    | "vendor.notifications.sample.reminder2.title"
    | "vendor.notifications.sample.payout2.title"
    | "vendor.notifications.sample.admin2.title";
  messageKey:
    | "vendor.notifications.sample.newBooking.message"
    | "vendor.notifications.sample.reminder.message"
    | "vendor.notifications.sample.payout.message"
    | "vendor.notifications.sample.admin.message"
    | "vendor.notifications.sample.newBooking2.message"
    | "vendor.notifications.sample.reminder2.message"
    | "vendor.notifications.sample.payout2.message"
    | "vendor.notifications.sample.admin2.message";
  createdAt: string;
  read: boolean;
  href?: string;
};

export const VENDOR_NOTIFICATION_FILTERS: VendorNotificationFilter[] = [
  "all",
  "new_booking",
  "booking_reminder",
  "payout_confirmation",
  "admin_message",
];

export const VENDOR_NOTIFICATIONS: VendorNotification[] = [
  {
    id: "notif-1",
    type: "new_booking",
    titleKey: "vendor.notifications.sample.newBooking.title",
    messageKey: "vendor.notifications.sample.newBooking.message",
    createdAt: "2026-07-21T08:15:00",
    read: false,
    href: "/vendor/bookings",
  },
  {
    id: "notif-2",
    type: "booking_reminder",
    titleKey: "vendor.notifications.sample.reminder.title",
    messageKey: "vendor.notifications.sample.reminder.message",
    createdAt: "2026-07-21T07:30:00",
    read: false,
    href: "/vendor/bookings",
  },
  {
    id: "notif-3",
    type: "payout_confirmation",
    titleKey: "vendor.notifications.sample.payout.title",
    messageKey: "vendor.notifications.sample.payout.message",
    createdAt: "2026-07-20T16:45:00",
    read: false,
    href: "/vendor/earnings",
  },
  {
    id: "notif-4",
    type: "admin_message",
    titleKey: "vendor.notifications.sample.admin.title",
    messageKey: "vendor.notifications.sample.admin.message",
    createdAt: "2026-07-20T11:00:00",
    read: false,
  },
  {
    id: "notif-5",
    type: "new_booking",
    titleKey: "vendor.notifications.sample.newBooking2.title",
    messageKey: "vendor.notifications.sample.newBooking2.message",
    createdAt: "2026-07-19T14:20:00",
    read: true,
    href: "/vendor/bookings",
  },
  {
    id: "notif-6",
    type: "booking_reminder",
    titleKey: "vendor.notifications.sample.reminder2.title",
    messageKey: "vendor.notifications.sample.reminder2.message",
    createdAt: "2026-07-18T09:00:00",
    read: true,
    href: "/vendor/bookings",
  },
  {
    id: "notif-7",
    type: "payout_confirmation",
    titleKey: "vendor.notifications.sample.payout2.title",
    messageKey: "vendor.notifications.sample.payout2.message",
    createdAt: "2026-07-10T13:10:00",
    read: true,
    href: "/vendor/earnings",
  },
  {
    id: "notif-8",
    type: "admin_message",
    titleKey: "vendor.notifications.sample.admin2.title",
    messageKey: "vendor.notifications.sample.admin2.message",
    createdAt: "2026-07-05T10:30:00",
    read: true,
  },
];

export function filterNotifications(
  notifications: VendorNotification[],
  filter: VendorNotificationFilter,
) {
  if (filter === "all") {
    return notifications;
  }

  return notifications.filter((notification) => notification.type === filter);
}
