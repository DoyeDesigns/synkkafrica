"use client";

import {
  ArrowLeft,
  ChevronDown,
  LifeBuoy,
  MessageSquare,
  Send,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminGetSupportTicket,
  adminListSupportTickets,
  adminReplySupportTicket,
  adminSetSupportTicketStatus,
  type AdminSupportMessage,
  type AdminSupportTicket,
  type AdminSupportTicketDetail,
} from "@/lib/api/admin";
import {
  SUPPORT_TICKET_STATUS_FILTERS,
  type SupportTicketCategory,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";
import {
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  Pagination,
  ResultCount,
  SearchInput,
  Skeleton,
  SkeletonList,
  errorMessage,
  focusRing,
  formatDate,
  formatDateTime,
  useAdminToast,
  usePagedItems,
  useUrlSearch,
  useUrlState,
} from "@/features/admin/components/admin-ui";
import { useTranslation } from "@/hooks/use-translation";
import { LIVE_QUERY_OPTIONS } from "@/lib/live-query-options";
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

const PRIORITY_BADGE_STYLES: Record<SupportTicketPriority, string> = {
  low: "text-[#676565]",
  medium: "text-[#135391]",
  high: "text-[#E65100]",
  urgent: "text-[#C0392B] font-bold",
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

const AUDIENCES = ["all", "users", "vendors"] as const;
type AudienceFilter = (typeof AUDIENCES)[number];

const AUDIENCE_LABEL_KEYS: Record<AudienceFilter, TranslationKey> = {
  all: "admin.common.all",
  users: "admin.support.tab.users",
  vendors: "admin.support.tab.vendors",
};

function isStatus(v: string): v is SupportTicketStatus {
  return v in STATUS_LABEL_KEYS;
}

function matches(ticket: AdminSupportTicket, term: string) {
  return [
    ticket.ticketNumber,
    ticket.subject,
    ticket.requesterName,
    ticket.bookingReference,
    ticket.description,
  ]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(term));
}

export function AdminSupportContent() {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const { get, set } = useUrlState();
  const { input, setInput, term } = useUrlSearch();
  const detailRef = useRef<HTMLDivElement>(null);

  const statusParam = get("status");
  const statusFilter: SupportTicketStatus | "all" = isStatus(statusParam)
    ? statusParam
    : "all";
  const audienceParam = get("audience") as AudienceFilter;
  const audience: AudienceFilter = AUDIENCES.includes(audienceParam)
    ? audienceParam
    : "all";
  const selectedTicketId = get("ticket") || null;

  const {
    data: tickets = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-support-tickets", statusFilter],
    queryFn: () =>
      adminListSupportTickets(
        token as string,
        statusFilter === "all" ? undefined : statusFilter,
      ),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const filtered = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          (audience === "all" || ticket.audience === audience) &&
          (!term || matches(ticket, term)),
      ),
    [tickets, audience, term],
  );
  const { page, pageCount, pageItems, setPage, total } =
    usePagedItems(filtered);

  // Derive the effective selection during render (the stored id may point at a
  // ticket that's been filtered out); fall back to the first ticket on wide
  // screens only — on phones the list shows until one is picked.
  const selectedId =
    selectedTicketId &&
    filtered.some((ticket) => ticket.id === selectedTicketId)
      ? selectedTicketId
      : null;
  const shownId = selectedId ?? pageItems[0]?.id ?? null;

  const selectTicket = (id: string) => {
    set({ ticket: id });
    // On stacked (mobile) layouts bring the conversation into view.
    if (window.matchMedia("(max-width: 1279px)").matches) {
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  };

  const hasFilters =
    statusFilter !== "all" || audience !== "all" || Boolean(term);

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          {t("admin.support.title")}
        </h2>
        <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
          {t("admin.support.subtitle")}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={input}
            onChange={setInput}
            placeholder="Search ticket #, subject, requester or booking ref"
            label="Search support tickets"
            className="lg:w-96"
          />
          <div
            role="group"
            aria-label="Requester type"
            className="inline-flex w-fit rounded-lg border border-[#E5E5E5] bg-white p-1"
          >
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={audience === a}
                onClick={() =>
                  set({ audience: a === "all" ? null : a, page: null })
                }
                className={`rounded-md px-3 py-1.5 text-xs font-semibold font-satoshi transition-colors ${focusRing} ${
                  audience === a
                    ? "bg-[#135391] text-white"
                    : "text-[#676565] hover:bg-[#F5F5F5]"
                }`}
              >
                {t(AUDIENCE_LABEL_KEYS[a])}
              </button>
            ))}
          </div>
        </div>
        <div
          role="group"
          aria-label={t("vendor.support.filter.label")}
          className="flex flex-wrap items-center gap-2"
        >
          {SUPPORT_TICKET_STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={statusFilter === filter}
              onClick={() =>
                set({ status: filter === "all" ? null : filter, page: null })
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold font-satoshi transition-colors ${focusRing} ${
                statusFilter === filter
                  ? "border-[#135391] bg-[#F0F6FC] text-[#135391]"
                  : "border-[#E5E5E5] bg-white text-[#676565] hover:bg-[#FAFAFA]"
              }`}
            >
              {filter === "all"
                ? t("admin.common.all")
                : t(STATUS_LABEL_KEYS[filter])}
            </button>
          ))}
          <span className="ml-auto">
            {!isLoading ? (
              <ResultCount shown={total} total={tickets.length} noun="ticket" />
            ) : null}
          </span>
        </div>
      </div>

      {error ? (
        <ErrorBanner
          message={errorMessage(error, t("vendor.support.loadFailed"))}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-3">
          {isLoading ? (
            <SkeletonList rows={6} label={t("vendor.support.loading")} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title={
                hasFilters ? t("admin.support.empty") : "No support tickets yet"
              }
              description={
                hasFilters
                  ? "Try a different status, requester type or search."
                  : "When users or vendors ask for help, their tickets will land here."
              }
              action={
                hasFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      setInput("");
                      set({
                        status: null,
                        audience: null,
                        q: null,
                        page: null,
                      });
                    }}
                    className={`rounded-lg border border-[#135391] px-4 py-2 text-sm font-bold font-satoshi text-[#135391] hover:bg-[#F0F6FC] ${focusRing}`}
                  >
                    Clear filters
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <ul className="space-y-2" aria-label="Tickets">
                {pageItems.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      type="button"
                      onClick={() => selectTicket(ticket.id)}
                      aria-current={shownId === ticket.id ? "true" : undefined}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${focusRing} ${
                        shownId === ticket.id
                          ? "border-[#135391] bg-[#F0F6FC]"
                          : "border-[#EEEEEE] bg-white hover:bg-[#FAFAFA]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-[#135391]">
                          {ticket.ticketNumber}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
                        >
                          {t(STATUS_LABEL_KEYS[ticket.status])}
                        </span>
                        <span className="ml-auto text-[11px] font-medium text-[#9A9A9A]">
                          {formatDate(ticket.updatedAt || ticket.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-1 font-bold font-satoshi text-[#2F2F2F]">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#676565]">
                        {ticket.requesterName} ·{" "}
                        {ticket.audience === "vendors"
                          ? t("admin.support.vendor")
                          : t("admin.support.user")}{" "}
                        ·{" "}
                        <span
                          className={PRIORITY_BADGE_STYLES[ticket.priority]}
                        >
                          {t(PRIORITY_LABEL_KEYS[ticket.priority])}
                        </span>
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <Pagination
                page={page}
                pageCount={pageCount}
                total={total}
                onPage={setPage}
              />
            </>
          )}
        </div>

        <div ref={detailRef} className="scroll-mt-4">
          {shownId ? (
            <TicketDetailPanel
              key={shownId}
              ticketId={shownId}
              token={token}
              onBack={selectedId ? () => set({ ticket: null }) : undefined}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

function TicketDetailPanel({
  ticketId,
  token,
  onBack,
}: {
  ticketId: string;
  token?: string;
  onBack?: () => void;
}) {
  const t = useTranslation();
  const toast = useAdminToast();
  const queryClient = useQueryClient();
  const [responseDraft, setResponseDraft] = useState("");
  const [pendingClose, setPendingClose] = useState<SupportTicketStatus | null>(
    null,
  );

  const {
    data: ticket,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-support-ticket", ticketId],
    queryFn: () => adminGetSupportTicket(token as string, ticketId),
    enabled: Boolean(token),
    ...LIVE_QUERY_OPTIONS,
  });

  const onUpdated = (updated: AdminSupportTicketDetail) => {
    queryClient.setQueryData(["admin-support-ticket", ticketId], updated);
    void queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      adminReplySupportTicket(token as string, ticketId, body),
    onSuccess: (updated) => {
      onUpdated(updated);
      setResponseDraft("");
      toast.success(`Response sent on ${updated.ticketNumber}.`);
    },
    onError: (err) =>
      toast.error(errorMessage(err, t("vendor.support.replyFailed"))),
  });

  const statusMutation = useMutation({
    mutationFn: (status: SupportTicketStatus) =>
      adminSetSupportTicketStatus(token as string, ticketId, status),
    onSuccess: (updated) => {
      onUpdated(updated);
      setPendingClose(null);
      toast.success(
        `${updated.ticketNumber} marked ${t(STATUS_LABEL_KEYS[updated.status]).toLowerCase()}.`,
      );
    },
    onError: (err) => {
      setPendingClose(null);
      toast.error(errorMessage(err, "Couldn't update the ticket status."));
    },
  });

  const sendReply = () => {
    const body = responseDraft.trim();
    if (body && !replyMutation.isPending) replyMutation.mutate(body);
  };

  if (error) {
    return (
      <ErrorBanner
        message={errorMessage(error, "Couldn't load this ticket.")}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  if (isLoading || !ticket) {
    return (
      <section
        aria-label="Loading ticket"
        className="space-y-3 rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
      >
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-6 h-16 w-4/5" />
        <Skeleton className="ml-auto h-16 w-3/5" />
        <Skeleton className="mt-6 h-24 w-full" />
      </section>
    );
  }

  return (
    <section
      aria-label={`Ticket ${ticket.ticketNumber}`}
      className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm"
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className={`mb-3 inline-flex items-center gap-1 rounded text-xs font-bold font-satoshi text-[#135391] hover:underline xl:hidden ${focusRing}`}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {t("vendor.support.backToTickets")}
        </button>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold font-satoshi text-[#135391]">
          {ticket.ticketNumber}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-satoshi ${STATUS_BADGE_STYLES[ticket.status]}`}
        >
          {t(STATUS_LABEL_KEYS[ticket.status])}
        </span>
        <span className="ml-auto text-xs font-medium font-satoshi text-[#9A9A9A]">
          {t("vendor.support.created")} {formatDate(ticket.createdAt)}
        </span>
      </div>
      <h3 className="mt-2 font-bold font-satoshi text-[#2F2F2F]">
        {ticket.subject}
      </h3>
      <dl className="mt-2 grid gap-1 text-sm font-medium font-satoshi text-[#676565] sm:grid-cols-2">
        <div>
          <dt className="inline">
            {ticket.audience === "vendors"
              ? t("admin.support.vendor")
              : t("admin.support.user")}
            :{" "}
          </dt>
          <dd className="inline text-[#2F2F2F]">{ticket.requesterName}</dd>
        </div>
        <div>
          <dt className="inline">{t("vendor.support.category")}: </dt>
          <dd className="inline text-[#2F2F2F]">
            {t(CATEGORY_LABEL_KEYS[ticket.category])}
          </dd>
        </div>
        <div>
          <dt className="inline">{t("vendor.support.priority")}: </dt>
          <dd className={`inline ${PRIORITY_BADGE_STYLES[ticket.priority]}`}>
            {t(PRIORITY_LABEL_KEYS[ticket.priority])}
          </dd>
        </div>
        {ticket.bookingReference ? (
          <div>
            <dt className="inline">{t("vendor.support.bookingReference")}: </dt>
            <dd className="inline text-[#2F2F2F]">{ticket.bookingReference}</dd>
          </div>
        ) : null}
      </dl>

      <h4 className="mt-5 text-sm font-bold font-satoshi text-[#2F2F2F]">
        {t("vendor.support.conversation")}
      </h4>
      <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {ticket.messages.length === 0 ? (
          <p className="flex items-center gap-2 rounded-lg bg-[#FAFAFA] px-3 py-4 text-sm font-medium font-satoshi text-[#676565]">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            No messages yet — send the first response below.
          </p>
        ) : (
          ticket.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              requesterName={ticket.requesterName}
            />
          ))
        )}
      </div>

      <label className="mt-5 flex flex-col gap-2">
        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("admin.support.adminResponse")}
        </span>
        <textarea
          value={responseDraft}
          onChange={(e) => setResponseDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              sendReply();
            }
          }}
          placeholder={t("vendor.support.replyPlaceholder")}
          className="min-h-[100px] w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-medium font-satoshi outline-none focus:border-[#135391] focus:ring-2 focus:ring-[#135391]/15"
        />
        <span className="text-[11px] font-medium font-satoshi text-[#9A9A9A]">
          Press Ctrl/⌘ + Enter to send.
        </span>
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Ticket status</span>
          <select
            value={
              statusMutation.isPending && statusMutation.variables
                ? statusMutation.variables
                : ticket.status
            }
            onChange={(e) => {
              const next = e.target.value as SupportTicketStatus;
              // Closing ends the conversation for the requester — confirm it.
              if (next === "closed") setPendingClose(next);
              else statusMutation.mutate(next);
            }}
            disabled={statusMutation.isPending}
            className={`h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] px-3 pr-10 text-sm font-medium font-satoshi outline-none focus:border-[#135391] disabled:opacity-60 ${focusRing}`}
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
          {statusMutation.isPending ? (
            <span className="absolute -bottom-5 left-0 text-[11px] font-medium font-satoshi text-[#676565]">
              Updating status…
            </span>
          ) : null}
        </label>
        <button
          type="button"
          onClick={sendReply}
          disabled={!responseDraft.trim() || replyMutation.isPending}
          className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white hover:opacity-90 disabled:opacity-50 ${focusRing}`}
        >
          <Send className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {replyMutation.isPending
            ? t("vendor.support.sending")
            : t("admin.support.sendResponse")}
        </button>
      </div>

      <ConfirmDialog
        open={pendingClose !== null}
        title={`Close ${ticket.ticketNumber}?`}
        message={`${ticket.requesterName} won't be able to reply on a closed ticket. Use "Resolved" if they may still follow up.`}
        confirmLabel="Close ticket"
        pendingLabel="Closing…"
        pending={statusMutation.isPending}
        destructive
        onConfirm={() => statusMutation.mutate("closed")}
        onClose={() => setPendingClose(null)}
      />
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
          isAdmin
            ? "bg-[#FDF3EF] text-[#2F2F2F]"
            : "bg-[#F0F6FC] text-[#2F2F2F]"
        }`}
      >
        <p className="text-[11px] font-bold font-satoshi text-[#676565]">
          {isAdmin ? t("vendor.support.supportTeam") : requesterName}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm font-medium font-satoshi">
          {message.body}
        </p>
        <p className="mt-1 text-[11px] font-medium font-satoshi text-[#9A9A9A]">
          {formatDateTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
