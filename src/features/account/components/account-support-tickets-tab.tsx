"use client";

import { ArrowLeft, ImagePlus, Paperclip, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  appendAccountSupportMessage,
  formatAccountSupportMessageTime,
  formatAccountSupportTicketDate,
  type AccountSupportCategory,
  type AccountSupportTicket,
  type AccountSupportTicketStatus,
} from "@/features/account/data/account-support";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const CATEGORY_LABEL_KEYS: Record<AccountSupportCategory, TranslationKey> = {
  booking: "account.support.category.booking",
  payment_refund: "account.support.category.paymentRefund",
  account: "account.support.category.account",
  other: "account.support.category.other",
};

const STATUS_LABEL_KEYS: Record<AccountSupportTicketStatus, TranslationKey> = {
  open: "account.support.status.open",
  resolved: "account.support.status.resolved",
};

const STATUS_BADGE_STYLES: Record<AccountSupportTicketStatus, string> = {
  open: "bg-[#FFF3E0] text-[#D85A30]",
  resolved: "bg-[#E3F2FD] text-[#1565C0]",
};

type AccountSupportTicketsTabProps = {
  tickets: AccountSupportTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string | null) => void;
  onUpdateTicket: (ticket: AccountSupportTicket) => void;
};

export function AccountSupportTicketsTab({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onUpdateTicket,
}: AccountSupportTicketsTabProps) {
  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  if (selectedTicket) {
    return (
      <TicketConversation
        ticket={selectedTicket}
        onBack={() => onSelectTicket(null)}
        onUpdateTicket={onUpdateTicket}
      />
    );
  }

  return (
    <TicketList
      tickets={tickets}
      onSelectTicket={onSelectTicket}
    />
  );
}

function TicketList({
  tickets,
  onSelectTicket,
}: {
  tickets: AccountSupportTicket[];
  onSelectTicket: (ticketId: string) => void;
}) {
  const t = useTranslation();

  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] p-10 text-center">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("account.support.emptyTickets")}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#EEEEEE] rounded-xl border border-[#EEEEEE]">
      {tickets.map((ticket) => (
        <button
          key={ticket.id}
          type="button"
          onClick={() => onSelectTicket(ticket.id)}
          className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FAFAFA]"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold font-satoshi text-[#2F2F2F]">
              {t(CATEGORY_LABEL_KEYS[ticket.category])}
            </p>
            <p className="mt-1 truncate text-sm font-medium font-satoshi text-[#676565]">
              {ticket.subject}
            </p>
            <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
              {t("account.support.ticketMeta", {
                number: ticket.ticketNumber,
                date: formatAccountSupportTicketDate(ticket.createdAt),
              })}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
          >
            {t(STATUS_LABEL_KEYS[ticket.status])}
          </span>
        </button>
      ))}
    </div>
  );
}

function TicketConversation({
  ticket,
  onBack,
  onUpdateTicket,
}: {
  ticket: AccountSupportTicket;
  onBack: () => void;
  onUpdateTicket: (ticket: AccountSupportTicket) => void;
}) {
  const t = useTranslation();
  const [draft, setDraft] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket.messages.length]);

  const clearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachmentPreview(null);
    setAttachmentName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    const text = draft.trim();
    const hasContent = text.length > 0 || attachmentPreview;

    if (!hasContent) {
      return;
    }

    onUpdateTicket(
      appendAccountSupportMessage(ticket, {
        text: text || undefined,
        imageUrl: attachmentPreview ?? undefined,
      }),
    );

    setDraft("");
    clearAttachment();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }

    setAttachmentPreview(URL.createObjectURL(file));
    setAttachmentName(file.name);
  };

  const canSend = draft.trim().length > 0 || attachmentPreview;

  return (
    <div className="flex min-h-[480px] flex-col rounded-xl border border-[#EEEEEE]">
      <div className="border-b border-[#EEEEEE] px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-2 text-sm font-semibold font-satoshi text-[#D85A30] transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          {t("account.support.backToTickets")}
        </button>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold font-satoshi text-[#2F2F2F]">
              {ticket.subject}
            </p>
            <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
              {t("account.support.ticketMeta", {
                number: ticket.ticketNumber,
                date: formatAccountSupportTicketDate(ticket.createdAt),
              })}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
          >
            {t(STATUS_LABEL_KEYS[ticket.status])}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {ticket.messages.map((message) => {
          const isUser = message.sender === "user";

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? "rounded-br-md border border-[#135391]/15 bg-[#EEF3F8] text-[#2F2F2F]"
                    : "rounded-bl-md border border-[#EEEEEE] bg-[#FAFAFA] text-[#2F2F2F]"
                }`}
              >
                <p
                  className={`text-[11px] font-semibold font-satoshi uppercase tracking-wide ${
                    isUser ? "text-[#135391]" : "text-[#676565]"
                  }`}
                >
                  {isUser ? t("account.support.you") : t("account.support.supportTeam")}
                </p>

                {message.text ? (
                  <p className="mt-1 text-sm font-medium font-satoshi leading-relaxed">
                    {message.text}
                  </p>
                ) : null}

                {message.imageUrl ? (
                  <div className="relative mt-2 h-40 w-full min-w-[180px] overflow-hidden rounded-lg">
                    <Image
                      src={message.imageUrl}
                      alt={t("account.support.attachedImage")}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <p className="mt-2 text-[11px] font-medium font-satoshi text-[#676565]">
                  {formatAccountSupportMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#EEEEEE] p-4">
        {attachmentPreview ? (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
              <Image
                src={attachmentPreview}
                alt={t("account.support.attachedImage")}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold font-satoshi text-[#2F2F2F]">
                {attachmentName}
              </p>
              <button
                type="button"
                onClick={clearAttachment}
                className="mt-1 text-xs font-medium font-satoshi text-[#D85A30]"
              >
                {t("account.support.removeAttachment")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] text-[#676565] transition-colors hover:bg-[#F5F5F5]">
            <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          <div className="relative min-w-0 flex-1">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t("account.support.typeMessage")}
              rows={1}
              className="max-h-28 min-h-11 w-full resize-none rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 pr-10 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <Paperclip className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C0C0C0]" />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#D85A30] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("account.support.send")}
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
