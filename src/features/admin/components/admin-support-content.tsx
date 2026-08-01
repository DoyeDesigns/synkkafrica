"use client";

import { ChevronDown, Send } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminGetSupportTicket,
  adminListSupportTickets,
  adminReplySupportTicket,
  adminSetSupportTicketStatus,
  type AdminSupportMessage,
  type AdminSupportTicketDetail,
} from "@/lib/api/admin";
import {
  SUPPORT_TICKET_STATUS_FILTERS,
  formatTicketDate,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const STATUS_LABEL_KEYS: Record<SupportTicketStatus, TranslationKey> = {
  open: "vendor.support.status.open",
  in_progress: "vendor.support.status.inProgress",
  resolved: "vendor.support.status.resolved",
  closed: "vendor.support.status.closed",
};

const STATUS_BADGE_STYLES: Record<SupportTicketStatus, string> = {
  open: "bg-[#E3F2FD] text-[#1565C0]",
  in_progress: "bg-[#FFF3E0] text-[#E65100]",
  resolved: "bg-[#E8F5E9] text-[#2E7D32]",
  closed: "bg-[#F5F5F5] text-[#676565]",
};

const PRIORITY_LABEL_KEYS = {
  low: "vendor.support.priority.low",
  medium: "vendor.support.priority.medium",
  high: "vendor.support.priority.high",
  urgent: "vendor.support.priority.urgent",
} as const satisfies Record<SupportTicketPriority, TranslationKey>;

const CATEGORY_LABEL_KEYS = {
  booking: "vendor.support.category.booking",
  payout: "vendor.support.category.payout",
  listing: "vendor.support.category.listing",
  account: "vendor.support.category.account",
  complaint: "vendor.support.category.complaint",
  other: "vendor.support.category.other",
} as const satisfies Record<SupportTicketCategory, TranslationKey>;

export function AdminSupportContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">(
    "all",
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets", statusFilter],
    queryFn: () =>
      adminListSupportTickets(
        token as string,
        statusFilter === "all" ? undefined : statusFilter,
      ),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  // Derive the effective selection during render (the stored id may point at a
  // ticket that's been filtered out); fall back to the first ticket.
  const selectedId =
    selectedTicketId && tickets.some((ticket) => ticket.id === selectedTicketId)
      ? selectedTicketId
      : (tickets[0]?.id ?? null);

  return (
    <>
      <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
        {t("admin.support.title")}
      </h2>
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t("admin.support.subtitle")}
      </p>

      <div className="flex flex-wrap gap-2">
        {SUPPORT_TICKET_STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold font-satoshi ${
              statusFilter === filter
                ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                : "border-[#E5E5E5] bg-white text-[#676565]"
            }`}
          >
            {filter === "all"
              ? t("admin.common.all")
              : t(STATUS_LABEL_KEYS[filter])}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm font-medium font-satoshi text-[#676565]">
              {t("vendor.support.loading")}
            </p>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedId === ticket.id
                    ? "border-[#135391] bg-[#F0F6FC]"
                    : "border-[#EEEEEE] bg-white hover:bg-[#FAFAFA]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#135391]">
                    {ticket.ticketNumber}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
                  >
                    {t(STATUS_LABEL_KEYS[ticket.status])}
                  </span>
                </div>
                <p className="mt-1 font-bold font-satoshi text-[#2F2F2F]">
                  {ticket.subject}
                </p>
                <p className="mt-1 text-xs font-medium text-[#676565]">
                  {ticket.requesterName} ·{" "}
                  {t(PRIORITY_LABEL_KEYS[ticket.priority])}
                </p>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-8 text-center">
              <p className="text-sm font-medium font-satoshi text-[#676565]">
                {t("admin.support.empty")}
              </p>
            </div>
          )}
        </div>

        {selectedId ? (
          <TicketDetailPanel
            key={selectedId}
            ticketId={selectedId}
            token={token}
          />
        ) : null}
      </div>
    </>
  );
}

function TicketDetailPanel({
  ticketId,
  token,
}: {
  ticketId: string;
  token?: string;
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const [responseDraft, setResponseDraft] = useState("");

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["admin-support-ticket", ticketId],
    queryFn: () => adminGetSupportTicket(token as string, ticketId),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const onUpdated = (updated: AdminSupportTicketDetail) => {
    queryClient.setQueryData(["admin-support-ticket", ticketId], updated);
    queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
  };

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      adminReplySupportTicket(token as string, ticketId, body),
    onSuccess: (updated) => {
      onUpdated(updated);
      setResponseDraft("");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: SupportTicketStatus) =>
      adminSetSupportTicketStatus(token as string, ticketId, status),
    onSuccess: onUpdated,
  });

  if (isLoading || !ticket) {
    return (
      <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("vendor.support.loading")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold font-satoshi text-[#135391]">
          {ticket.ticketNumber}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
        >
          {t(STATUS_LABEL_KEYS[ticket.status])}
        </span>
      </div>
      <h3 className="mt-2 font-bold font-satoshi text-[#2F2F2F]">
        {ticket.subject}
      </h3>
      <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
        {t("admin.support.vendor")}: {ticket.requesterName}
      </p>
      <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
        {t("vendor.support.category")}: {t(CATEGORY_LABEL_KEYS[ticket.category])}{" "}
        · {t("vendor.support.priority")}:{" "}
        {t(PRIORITY_LABEL_KEYS[ticket.priority])}
      </p>

      <h4 className="mt-5 text-sm font-bold font-satoshi text-[#2F2F2F]">
        {t("vendor.support.conversation")}
      </h4>
      <div className="mt-3 space-y-3">
        {ticket.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            requesterName={ticket.requesterName}
          />
        ))}
      </div>

      <label className="mt-5 flex flex-col gap-2">
        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("admin.support.adminResponse")}
        </span>
        <textarea
          value={responseDraft}
          onChange={(e) => setResponseDraft(e.target.value)}
          placeholder={t("vendor.support.replyPlaceholder")}
          className="min-h-[100px] w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-medium font-satoshi outline-none focus:border-[#004785]"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <select
            value={ticket.status}
            onChange={(e) =>
              statusMutation.mutate(e.target.value as SupportTicketStatus)
            }
            disabled={statusMutation.isPending}
            className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] px-3 pr-10 text-sm font-medium font-satoshi outline-none focus:border-[#004785] disabled:opacity-60"
          >
            {(["open", "in_progress", "resolved", "closed"] as const).map(
              (status) => (
                <option key={status} value={status}>
                  {t(STATUS_LABEL_KEYS[status])}
                </option>
              ),
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
        </div>
        <button
          type="button"
          onClick={() => {
            const body = responseDraft.trim();
            if (body && !replyMutation.isPending) replyMutation.mutate(body);
          }}
          disabled={!responseDraft.trim() || replyMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
          {replyMutation.isPending
            ? t("vendor.support.sending")
            : t("admin.support.sendResponse")}
        </button>
      </div>
    </section>
  );
}

function MessageBubble({
  message,
  requesterName,
}: {
  message: AdminSupportMessage;
  requesterName: string;
}) {
  const t = useTranslation();
  const isAdmin = message.authorRole === "admin";

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 ${
          isAdmin ? "bg-[#FDF3EF] text-[#2F2F2F]" : "bg-[#F0F6FC] text-[#2F2F2F]"
        }`}
      >
        <p className="text-[11px] font-bold font-satoshi text-[#676565]">
          {isAdmin ? t("vendor.support.supportTeam") : requesterName}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm font-medium font-satoshi">
          {message.body}
        </p>
        <p className="mt-1 text-[11px] font-medium font-satoshi text-[#9A9A9A]">
          {formatTicketDate(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
