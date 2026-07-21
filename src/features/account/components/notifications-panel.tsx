"use client";

import Link from "next/link";
import { ArrowDown, Bell, CircleX, Clock, Info, Map, Star } from "lucide-react";
import Image from "next/image";

import type {
  AccountNotification,
  AccountNotificationKind,
  NotificationIconType,
  NotificationMessagePart,
} from "@/features/account/data/account-notifications";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const KIND_LABEL_KEYS: Record<AccountNotificationKind, TranslationKey> = {
  booking_confirmation: "account.notifications.kind.bookingConfirmation",
  reminder_24h: "account.notifications.kind.reminder24h",
  review_request: "account.notifications.kind.reviewRequest",
  cancellation_refund: "account.notifications.kind.cancellationRefund",
  info: "account.notifications.kind.info",
};

function NotificationIcon({ type }: { type: NotificationIconType }) {
  const className = "h-5 w-5 shrink-0 text-[#676565]";

  switch (type) {
    case "flight":
      return <Image src="/plane.png" alt="" width={16} height={16} />;
    case "info":
      return <Info className={className} strokeWidth={1.75} size={17} stroke="#3C3C3C" />;
    case "experience":
      return <Map className={className} strokeWidth={1.75} size={17} stroke="#3C3C3C" />;
    case "reminder":
      return <Clock className={className} strokeWidth={1.75} size={17} stroke="#004785" />;
    case "review":
      return <Star className={className} strokeWidth={1.75} size={17} stroke="#D85A30" />;
    case "cancellation":
      return <CircleX className={className} strokeWidth={1.75} size={17} stroke="#C0392B" />;
  }
}

function NotificationMessage({ parts }: { parts: NotificationMessagePart[] }) {
  return (
    <p className="text-sm font-medium font-satoshi leading-relaxed text-foreground">
      {parts.map((part, index) =>
        part.type === "link" ? (
          part.href ? (
            <Link
              key={`${part.value}-${index}`}
              href={part.href}
              className="text-[#D85A30] underline decoration-[#D85A30] underline-offset-2"
            >
              {part.value}
            </Link>
          ) : (
            <span
              key={`${part.value}-${index}`}
              className="text-[#D85A30] underline decoration-[#D85A30] underline-offset-2"
            >
              {part.value}
            </span>
          )
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </p>
  );
}

export function NotificationItem({
  notification,
  onOpen,
}: {
  notification: AccountNotification;
  onOpen?: (notificationId: string) => void;
}) {
  const t = useTranslation();

  const content = (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold font-satoshi uppercase tracking-wide ${
            notification.kind === "reminder_24h"
              ? "bg-[#E8F3FF] text-[#004785]"
              : notification.kind === "review_request"
                ? "bg-[#FFF1EB] text-[#D85A30]"
                : notification.kind === "cancellation_refund"
                  ? "bg-[#FDEBEB] text-[#C0392B]"
                  : "bg-[#F3F3F3] text-[#676565]"
          }`}
        >
          {t(KIND_LABEL_KEYS[notification.kind])}
        </span>
        {!notification.read ? (
          <span className="h-2 w-2 rounded-full bg-[#D85A30]" aria-hidden="true" />
        ) : null}
      </div>

      <p className="text-sm font-semibold font-inter text-foreground">
        {t(notification.titleKey)}
      </p>

      {notification.message ? (
        <div className="mt-1">
          <NotificationMessage parts={notification.message} />
        </div>
      ) : (
        <p className="mt-1 text-sm font-medium font-satoshi leading-relaxed text-foreground/85">
          {t(notification.messageKey, notification.messageParams)}
        </p>
      )}
    </div>
  );

  return (
    <article
      className={`flex items-start gap-4 py-4 ${notification.read ? "opacity-80" : ""}`}
    >
      <div className="pt-1">
        <NotificationIcon type={notification.icon} />
      </div>

      {notification.href ? (
        <Link
          href={notification.href}
          onClick={() => onOpen?.(notification.id)}
          className="min-w-0 flex-1 rounded-lg transition-colors hover:bg-[#FAFAFA]"
        >
          {content}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">{content}</div>
      )}

      <p className="shrink-0 pt-1 text-right text-xs font-medium font-satoshi text-foreground">
        {notification.time}
        {notification.date ? (
          <>
            <span className="mx-1.5 text-foreground">|</span>
            {notification.date}
          </>
        ) : null}
      </p>
    </article>
  );
}

export function NotificationsCardHeader() {
  const t = useTranslation();

  return (
    <div className="flex items-center gap-2 border-b border-[#F3F3F3] px-6 py-5 sm:px-8">
      <Bell className="h-5 w-5 text-foreground" strokeWidth={2} />
      <h1 className="text-lg font-semibold font-montserrat text-foreground">
        {t("account.notifications.title")}
      </h1>
    </div>
  );
}

export function NotificationPeriodHeader({ label }: { label: string }) {
  return (
    <div className="border-[#F3F3F3] px-6 py-8 sm:px-8">
      <p className="text-sm font-medium font-satoshi tracking-wide text-foreground">
        {label}
      </p>
    </div>
  );
}

export function ShowMoreNotificationsButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const t = useTranslation();

  return (
    <div className="border-t border-[#E8E8E8] px-6 py-4 sm:px-8">
      <button
        type="button"
        onClick={onClick}
        className="mx-auto flex items-center gap-1.5 text-sm font-medium font-satoshi text-[#004785] transition-opacity hover:opacity-80"
      >
        {t("common.showMore")}
        <ArrowDown className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
