"use client";

import { useMemo, useState } from "react";

import {
  NotificationItem,
  NotificationPeriodHeader,
  NotificationsCardHeader,
  ShowMoreNotificationsButton,
} from "@/features/account/components/notifications-panel";
import {
  ACCOUNT_NOTIFICATIONS,
  NOTIFICATION_PERIOD_ORDER,
  groupNotificationsByPeriod,
  type NotificationPeriod,
} from "@/features/account/data/account-notifications";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const INITIAL_VISIBLE_PERIODS: NotificationPeriod[] = [
  "most-recent",
  "week-earlier",
];

const PERIOD_LABEL_KEYS: Record<NotificationPeriod, TranslationKey> = {
  "most-recent": "account.notifications.period.mostRecent",
  "week-earlier": "account.notifications.period.weekEarlier",
  "three-months-ago": "account.notifications.period.threeMonthsAgo",
};

export function AccountNotificationsContent() {
  const t = useTranslation();
  const [showOlder, setShowOlder] = useState(false);

  const groups = useMemo(() => {
    const grouped = groupNotificationsByPeriod(ACCOUNT_NOTIFICATIONS);
    const visiblePeriods = showOlder
      ? NOTIFICATION_PERIOD_ORDER
      : INITIAL_VISIBLE_PERIODS;

    return visiblePeriods
      .map((period) => ({
        period,
        label: t(PERIOD_LABEL_KEYS[period]),
        items: grouped[period],
      }))
      .filter((group) => group.items.length > 0);
  }, [showOlder, t]);

  const hasOlderNotifications =
    groupNotificationsByPeriod(ACCOUNT_NOTIFICATIONS)["three-months-ago"].length >
    0;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white shadow-sm">
      <NotificationsCardHeader />

      {groups.map((group) => (
        <div key={group.period}>
          <NotificationPeriodHeader label={group.label} />

          <div className="px-6 sm:px-8">
            {group.items.map((notification, index) => (
              <div
                key={notification.id}
                className={
                  index === group.items.length - 1
                    ? "mb-2 border-t border-b border-[#E8E8E8]"
                    : "border-t border-[#E8E8E8]"
                }
              >
                <NotificationItem notification={notification} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {!showOlder && hasOlderNotifications ? (
        <ShowMoreNotificationsButton onClick={() => setShowOlder(true)} />
      ) : null}
    </section>
  );
}
