"use client";

import { ArrowDown, Bell, Info, Map } from "lucide-react";
import Image from "next/image";

import type {
  AccountNotification,
  NotificationIconType,
  NotificationMessagePart,
} from "@/features/account/data/account-notifications";
import { useTranslation } from "@/hooks/use-translation";

function NotificationIcon({ type }: { type: NotificationIconType }) {
  const className = "h-5 w-5 shrink-0 text-[#676565]";

  switch (type) {
    case "flight":
      return <Image src="/plane.png" alt="Flight" width={16} height={16} />;
    case "info":
      return <Info className={className} strokeWidth={1.75} size={17} stroke="#3C3C3C" />;
    case "experience":
      return <Map className={className} strokeWidth={1.75} size={17} stroke="#3C3C3C" />;
  }
}

function NotificationMessage({ parts }: { parts: NotificationMessagePart[] }) {
  return (
    <p className="text-sm font-medium font-satoshi leading-relaxed text-foreground">
      {parts.map((part, index) =>
        part.type === "link" ? (
          <span
            key={`${part.value}-${index}`}
            className="text-[#D85A30] underline decoration-[#D85A30] underline-offset-2"
          >
            {part.value}
          </span>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </p>
  );
}

export function NotificationItem({ notification }: { notification: AccountNotification }) {
  return (
    <article className="flex items-center gap-4 py-4">
      <div className="pt-0.5">
        <NotificationIcon type={notification.icon} />
      </div>

      <div className="min-w-0 flex-1">
        <NotificationMessage parts={notification.message} />
      </div>

      <p className="shrink-0 text-right text-xs font-medium font-satoshi text-foreground">
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
