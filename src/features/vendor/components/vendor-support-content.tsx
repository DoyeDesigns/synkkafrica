"use client";

import { ArrowLeft, ChevronDown, CircleHelp, Plus, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  EMPTY_TICKET_FORM,
  formatTicketDate,
  SUPPORT_TICKET_CATEGORIES,
  SUPPORT_TICKET_PRIORITIES,
  SUPPORT_TICKET_STATUS_FILTERS,
  type CreateSupportTicketInput,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
  type SupportTicketStatusFilter,
} from "@/features/vendor/data/vendor-support";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  createSupportTicket,
  getSupportTicket,
  listSupportTickets,
  replySupportTicket,
  type SupportTicketApi,
  type SupportTicketMessageApi,
} from "@/lib/api/vendor";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

const textareaClassName =
  "min-h-[120px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

const PRIORITY_LABEL_KEYS: Record<SupportTicketPriority, TranslationKey> = {
  low: "vendor.support.priority.low",
  medium: "vendor.support.priority.medium",
  high: "vendor.support.priority.high",
  urgent: "vendor.support.priority.urgent",
};

const PRIORITY_STYLES: Record<SupportTicketPriority, string> = {
  low: "border-[#E5E5E5] bg-[#FAFAFA] text-[#676565]",
  medium: "border-[#E5E5E5] bg-[#FAFAFA] text-[#676565]",
  high: "border-[#FFF3E0] bg-[#FFF3E0] text-[#E65100]",
  urgent: "border-[#FDEBEB] bg-[#FDEBEB] text-[#C0392B]",
};

const PRIORITY_ACTIVE_STYLES: Record<SupportTicketPriority, string> = {
  low: "border-[#676565] bg-[#676565] text-white",
  medium: "border-[#135391] bg-[#135391] text-white",
  high: "border-[#E65100] bg-[#E65100] text-white",
  urgent: "border-[#C0392B] bg-[#C0392B] text-white",
};

const CATEGORY_LABEL_KEYS: Record<SupportTicketCategory, TranslationKey> = {
  booking: "vendor.support.category.booking",
  payout: "vendor.support.category.payout",
  listing: "vendor.support.category.listing",
  account: "vendor.support.category.account",
  complaint: "vendor.support.category.complaint",
  other: "vendor.support.category.other",
};

const STATUS_LABEL_KEYS: Record<SupportTicketStatus, TranslationKey> = {
  open: "vendor.support.status.open",
  in_progress: "vendor.support.status.inProgress",
  resolved: "vendor.support.status.resolved",
  closed: "vendor.support.status.closed",
};

const STATUS_FILTER_LABEL_KEYS: Record<
  SupportTicketStatusFilter,
  TranslationKey
> = {
  all: "vendor.support.filter.all",
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

type SupportTab = "create" | "tickets";

type VendorSupportContentProps = {
  vendorName?: string | null;
  vendorEmail?: string | null;
};

export function VendorSupportContent({
  vendorName,
  vendorEmail,
}: VendorSupportContentProps) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const displayName = vendorName?.trim() || "your business";

  const [statusFilter, setStatusFilter] =
    useState<SupportTicketStatusFilter>("all");
  const [activeTab, setActiveTab] = useState<SupportTab>("create");
  const [form, setForm] = useState<CreateSupportTicketInput>(EMPTY_TICKET_FORM);
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<
    string | null
  >(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const {
    data: tickets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vendor-support-tickets"],
    queryFn: () => listSupportTickets(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const filteredTickets = useMemo(
    () =>
      statusFilter === "all"
        ? tickets
        : tickets.filter((ticket) => ticket.status === statusFilter),
    [statusFilter, tickets],
  );

  const openTicketCount = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.status === "open" || ticket.status === "in_progress",
      ).length,
    [tickets],
  );

  const invalidateTickets = () =>
    queryClient.invalidateQueries({ queryKey: ["vendor-support-tickets"] });

  const createMutation = useMutation({
    mutationFn: (input: CreateSupportTicketInput) =>
      createSupportTicket(token as string, input),
    onSuccess: (ticket) => {
      setForm(EMPTY_TICKET_FORM);
      setSubmittedTicketNumber(ticket.ticketNumber);
      window.setTimeout(() => setSubmittedTicketNumber(null), 5000);
      invalidateTickets();
      setActiveTab("tickets");
    },
  });

  const updateForm = (patch: Partial<CreateSupportTicketInput>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !isFormValid || createMutation.isPending) {
      return;
    }
    createMutation.mutate({
      ...form,
      subject: form.subject.trim(),
      description: form.description.trim(),
      bookingReference: form.bookingReference?.trim() || undefined,
    });
  };

  const isFormValid =
    form.subject.trim().length > 0 && form.description.trim().length > 0;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-medium font-satoshi text-[#2F2F2F]">
          {t("vendor.dashboard.welcomeBack")}{" "}
          <span className="font-bold text-[#D85A30]">{displayName}</span>
        </h2>

        {openTicketCount > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E0] px-3 py-1.5 text-xs font-semibold font-satoshi text-[#E65100]">
            {t("vendor.support.openTickets", { count: openTicketCount })}
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-[#EEEEEE] bg-[#F8F8F8] px-4 py-3">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {t("vendor.support.helpBanner")}
          {vendorEmail ? (
            <>
              {" "}
              {t("vendor.support.helpBannerEmail", { email: vendorEmail })}
            </>
          ) : null}
        </p>
      </div>

      <div>
        <div
          className="flex items-center gap-6 overflow-x-auto border-b border-[#E8E8E8]"
          role="tablist"
          aria-label={t("vendor.support.tabs.label")}
        >
          {(["create", "tickets"] as const).map((tabId) => {
            const isActive = activeTab === tabId;

            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tabId);
                  setSelectedTicketId(null);
                }}
                className={`shrink-0 pb-3 text-sm font-bold font-satoshi transition-colors ${
                  isActive
                    ? "border-b-2 border-[#D85A30] text-[#2F2F2F]"
                    : "text-[#676565] hover:text-[#2F2F2F]"
                }`}
              >
                {t(
                  tabId === "create"
                    ? "vendor.support.createTicket"
                    : "vendor.support.yourTickets",
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === "create" ? (
            <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#D85A30]" strokeWidth={2} />
                <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                  {t("vendor.support.createTicket")}
                </h3>
              </div>
              <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                {t("vendor.support.createTicketHint")}
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                    {t("vendor.support.subject")}{" "}
                    <span className="text-[#C0392B]">*</span>
                  </span>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(event) =>
                      updateForm({ subject: event.target.value })
                    }
                    placeholder={t("vendor.support.subjectPlaceholder")}
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                    {t("vendor.support.category")}{" "}
                    <span className="text-[#C0392B]">*</span>
                  </span>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateForm({
                          category: event.target.value as SupportTicketCategory,
                        })
                      }
                      className={`${inputClassName} appearance-none pr-10`}
                      required
                    >
                      {SUPPORT_TICKET_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {t(CATEGORY_LABEL_KEYS[category])}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                  </div>
                </label>

                <fieldset className="flex flex-col gap-2">
                  <legend className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                    {t("vendor.support.priority")}{" "}
                    <span className="text-[#C0392B]">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {SUPPORT_TICKET_PRIORITIES.map((priority) => {
                      const isActive = form.priority === priority;

                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => updateForm({ priority })}
                          className={`rounded-lg border px-2 py-2.5 text-xs font-semibold font-satoshi transition-colors ${
                            isActive
                              ? PRIORITY_ACTIVE_STYLES[priority]
                              : PRIORITY_STYLES[priority]
                          }`}
                        >
                          {t(PRIORITY_LABEL_KEYS[priority])}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs font-medium font-satoshi text-[#676565]">
                    {t("vendor.support.priorityHint")}
                  </p>
                </fieldset>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                    {t("vendor.support.bookingReference")}
                  </span>
                  <input
                    type="text"
                    value={form.bookingReference ?? ""}
                    onChange={(event) =>
                      updateForm({ bookingReference: event.target.value })
                    }
                    placeholder={t("vendor.support.bookingReferencePlaceholder")}
                    className={inputClassName}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                    {t("vendor.support.description")}{" "}
                    <span className="text-[#C0392B]">*</span>
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm({ description: event.target.value })
                    }
                    placeholder={t("vendor.support.descriptionPlaceholder")}
                    className={textareaClassName}
                    required
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {submittedTicketNumber ? (
                    <p className="text-sm font-semibold font-satoshi text-[#2E7D32]">
                      {t("vendor.support.ticketSubmitted", {
                        number: submittedTicketNumber,
                      })}
                    </p>
                  ) : createMutation.isError ? (
                    <p className="text-sm font-semibold font-satoshi text-[#C0392B]">
                      {t("vendor.support.submitFailed")}
                    </p>
                  ) : (
                    <p className="text-xs font-medium font-satoshi text-[#676565]">
                      {t("vendor.support.responseTime")}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!isFormValid || createMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" strokeWidth={2} />
                    {createMutation.isPending
                      ? t("vendor.support.sending")
                      : t("vendor.support.submitTicket")}
                  </button>
                </div>
              </form>
            </section>
          ) : selectedTicketId ? (
            <TicketConversation
              ticketId={selectedTicketId}
              token={token}
              onBack={() => setSelectedTicketId(null)}
              onReplied={invalidateTickets}
            />
          ) : (
            <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-2">
                <CircleHelp
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#135391]"
                  strokeWidth={2}
                />
                <div>
                  <h3 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                    {t("vendor.support.yourTickets")}
                  </h3>
                  <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
                    {t("vendor.support.yourTicketsHint")}
                  </p>
                </div>
              </div>

              <div
                className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"
                role="group"
                aria-label={t("vendor.support.filter.label")}
              >
                {SUPPORT_TICKET_STATUS_FILTERS.map((filter) => {
                  const isActive = statusFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-lg border px-2 py-2 text-xs font-semibold font-satoshi transition-colors ${
                        isActive
                          ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                          : "border-[#E5E5E5] bg-[#FAFAFA] text-[#676565] hover:border-[#D0D0D0]"
                      }`}
                    >
                      {t(STATUS_FILTER_LABEL_KEYS[filter])}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3">
                {isLoading ? (
                  <p className="text-sm font-medium font-satoshi text-[#676565]">
                    {t("vendor.support.loading")}
                  </p>
                ) : isError ? (
                  <p className="text-sm font-medium font-satoshi text-[#C0392B]">
                    {t("vendor.support.loadFailed")}
                  </p>
                ) : filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <SupportTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onOpen={() => setSelectedTicketId(ticket.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-[5px] border border-[#EEEEEE] bg-[#F5F5F5] p-8 text-center">
                    <p className="text-sm font-medium font-satoshi text-[#676565]">
                      {t("vendor.support.emptyTickets")}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

function SupportTicketCard({
  ticket,
  onOpen,
}: {
  ticket: SupportTicketApi;
  onOpen: () => void;
}) {
  const t = useTranslation();

  return (
    <article className="rounded-[5px] border border-[#EEEEEE] bg-[#FAFAFA] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold font-satoshi text-[#135391]">
              {ticket.ticketNumber}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
            >
              {t(STATUS_LABEL_KEYS[ticket.status])}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${PRIORITY_STYLES[ticket.priority]}`}
            >
              {t(PRIORITY_LABEL_KEYS[ticket.priority])}
            </span>
          </div>

          <h4 className="mt-2 truncate text-sm font-bold font-satoshi text-[#2F2F2F]">
            {ticket.subject}
          </h4>

          <p className="mt-1 line-clamp-2 text-sm font-medium font-satoshi text-[#676565]">
            {ticket.description}
          </p>

          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium font-satoshi text-[#676565]">
            <div>
              <dt className="inline">{t("vendor.support.category")}: </dt>
              <dd className="inline text-[#2F2F2F]">
                {t(CATEGORY_LABEL_KEYS[ticket.category])}
              </dd>
            </div>
            {ticket.bookingReference ? (
              <div>
                <dt className="inline">
                  {t("vendor.support.bookingReference")}:{" "}
                </dt>
                <dd className="inline text-[#2F2F2F]">
                  {ticket.bookingReference}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="inline">{t("vendor.support.updated")}: </dt>
              <dd className="inline text-[#2F2F2F]">
                {formatTicketDate(ticket.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 self-start text-xs font-bold font-satoshi text-[#135391] hover:underline"
        >
          {t("vendor.support.viewConversation")}
        </button>
      </div>
    </article>
  );
}

function TicketConversation({
  ticketId,
  token,
  onBack,
  onReplied,
}: {
  ticketId: string;
  token?: string;
  onBack: () => void;
  onReplied: () => void;
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["vendor-support-ticket", ticketId],
    queryFn: () => getSupportTicket(token as string, ticketId),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      replySupportTicket(token as string, ticketId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(["vendor-support-ticket", ticketId], updated);
      setReply("");
      onReplied();
    },
  });

  const handleReply = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = reply.trim();
    if (!body || replyMutation.isPending) return;
    replyMutation.mutate(body);
  };

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold font-satoshi text-[#135391] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        {t("vendor.support.backToTickets")}
      </button>

      {isLoading || !ticket ? (
        <p className="mt-5 text-sm font-medium font-satoshi text-[#676565]">
          {t("vendor.support.loading")}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold font-satoshi text-[#135391]">
              {ticket.ticketNumber}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
            >
              {t(STATUS_LABEL_KEYS[ticket.status])}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${PRIORITY_STYLES[ticket.priority]}`}
            >
              {t(PRIORITY_LABEL_KEYS[ticket.priority])}
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold font-satoshi text-[#2F2F2F]">
            {ticket.subject}
          </h3>
          <p className="mt-1 text-xs font-medium font-satoshi text-[#676565]">
            {t("vendor.support.created")}: {formatTicketDate(ticket.createdAt)}
          </p>

          <h4 className="mt-6 text-sm font-bold font-satoshi text-[#2F2F2F]">
            {t("vendor.support.conversation")}
          </h4>
          <div className="mt-3 space-y-3">
            {ticket.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </div>

          {ticket.status !== "closed" ? (
            <form onSubmit={handleReply} className="mt-5 space-y-3">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder={t("vendor.support.replyPlaceholder")}
                className={textareaClassName}
              />
              <div className="flex items-center justify-between gap-3">
                {replyMutation.isError ? (
                  <p className="text-xs font-semibold font-satoshi text-[#C0392B]">
                    {t("vendor.support.replyFailed")}
                  </p>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={!reply.trim() || replyMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                  {replyMutation.isPending
                    ? t("vendor.support.sending")
                    : t("vendor.support.sendReply")}
                </button>
              </div>
            </form>
          ) : null}
        </>
      )}
    </section>
  );
}

function MessageBubble({ message }: { message: SupportTicketMessageApi }) {
  const t = useTranslation();
  const isVendor = message.authorRole === "vendor";

  return (
    <div className={`flex ${isVendor ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 ${
          isVendor
            ? "bg-[#FDF3EF] text-[#2F2F2F]"
            : "bg-[#F0F6FC] text-[#2F2F2F]"
        }`}
      >
        <p className="text-[11px] font-bold font-satoshi text-[#676565]">
          {isVendor
            ? t("vendor.support.you")
            : t("vendor.support.supportTeam")}
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
