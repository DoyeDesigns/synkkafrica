"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  ADMIN_SUPPORT_TICKETS,
  filterAdminTicketsByAudience,
  filterAdminTicketsByStatus,
  type AdminSupportAudience,
  type AdminSupportTicket,
} from "@/features/admin/data/admin-support";
import {
  SUPPORT_TICKET_STATUS_FILTERS,
  type SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";

const TAB_KEYS: Record<AdminSupportAudience, TranslationKey> = {
  users: "admin.support.tab.users",
  vendors: "admin.support.tab.vendors",
};

const REQUESTER_LABEL_KEYS: Record<AdminSupportAudience, TranslationKey> = {
  users: "admin.support.user",
  vendors: "admin.support.vendor",
};

const STATUS_LABEL_KEYS: Record<SupportTicketStatus, TranslationKey> = {
  open: "vendor.support.status.open",
  in_progress: "vendor.support.status.inProgress",
  resolved: "vendor.support.status.resolved",
  closed: "vendor.support.status.closed",
};

const PRIORITY_LABEL_KEYS = {
  low: "vendor.support.priority.low",
  medium: "vendor.support.priority.medium",
  high: "vendor.support.priority.high",
  urgent: "vendor.support.priority.urgent",
} as const satisfies Record<string, TranslationKey>;

const CATEGORY_LABEL_KEYS = {
  booking: "vendor.support.category.booking",
  payout: "vendor.support.category.payout",
  listing: "vendor.support.category.listing",
  account: "vendor.support.category.account",
  complaint: "vendor.support.category.complaint",
  other: "vendor.support.category.other",
} as const satisfies Record<string, TranslationKey>;

export function AdminSupportContent() {
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminSupportAudience>("users");
  const [tickets, setTickets] = useState(ADMIN_SUPPORT_TICKETS);
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">(
    "all",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responseDraft, setResponseDraft] = useState("");

  const tabTickets = useMemo(
    () => filterAdminTicketsByAudience(tickets, activeTab),
    [activeTab, tickets],
  );

  const filtered = useMemo(
    () => filterAdminTicketsByStatus(tabTickets, statusFilter),
    [statusFilter, tabTickets],
  );

  useEffect(() => {
    setSelectedId((current) => {
      if (current && filtered.some((ticket) => ticket.id === current)) {
        return current;
      }

      return filtered[0]?.id ?? null;
    });
  }, [activeTab, filtered]);

  useEffect(() => {
    setResponseDraft("");
  }, [activeTab, selectedId]);

  const selected = tickets.find((ticket) => ticket.id === selectedId);

  const updateStatus = (id: string, status: SupportTicketStatus) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              status,
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    );
  };

  const submitResponse = () => {
    if (!selected || !responseDraft.trim()) {
      return;
    }

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selected.id
          ? {
              ...ticket,
              adminResponse: responseDraft.trim(),
              status: "in_progress",
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    );
    setResponseDraft("");
  };

  return (
    <>
      <h2 className="text-lg font-bold font-satoshi text-[#2F2F2F]">
        {t("admin.support.title")}
      </h2>
      <p className="text-sm font-medium font-satoshi text-[#676565]">
        {t("admin.support.subtitle")}
      </p>

      <div className="flex items-center gap-6 overflow-x-auto border-b border-[#E8E8E8]">
        {(["users", "vendors"] as const).map((tabId) => {
          const isActive = activeTab === tabId;
          const count = filterAdminTicketsByAudience(tickets, tabId).length;

          return (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`shrink-0 pb-3 text-sm font-bold font-satoshi transition-colors ${
                isActive
                  ? "border-b-2 border-[#D85A30] text-[#2F2F2F]"
                  : "text-[#676565] hover:text-[#2F2F2F]"
              }`}
            >
              {t(TAB_KEYS[tabId])}{" "}
              <span className={isActive ? "text-[#D85A30]" : "text-[#676565]"}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

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
          {filtered.length > 0 ? (
            filtered.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  selectedId === ticket.id
                    ? "border-[#135391] bg-[#F0F6FC]"
                    : "border-[#EEEEEE] bg-white hover:bg-[#FAFAFA]"
                }`}
              >
                <p className="text-xs font-bold text-[#135391]">
                  {ticket.ticketNumber}
                </p>
                <p className="mt-1 font-bold font-satoshi text-[#2F2F2F]">
                  {ticket.subject}
                </p>
                <p className="mt-1 text-xs font-medium text-[#676565]">
                  {ticket.requesterName} · {t(PRIORITY_LABEL_KEYS[ticket.priority])}
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

        {selected && selected.audience === activeTab ? (
          <TicketDetailPanel
            ticket={selected}
            responseDraft={responseDraft}
            onResponseChange={setResponseDraft}
            onStatusChange={(status) => updateStatus(selected.id, status)}
            onSubmitResponse={submitResponse}
          />
        ) : null}
      </div>
    </>
  );
}

function TicketDetailPanel({
  ticket,
  responseDraft,
  onResponseChange,
  onStatusChange,
  onSubmitResponse,
}: {
  ticket: AdminSupportTicket;
  responseDraft: string;
  onResponseChange: (value: string) => void;
  onStatusChange: (status: SupportTicketStatus) => void;
  onSubmitResponse: () => void;
}) {
  const t = useTranslation();

  return (
    <section className="rounded-xl border border-[#EEEEEE] bg-white p-5 shadow-sm">
      <h3 className="font-bold font-satoshi text-[#2F2F2F]">{ticket.subject}</h3>
      <p className="mt-2 text-sm font-medium font-satoshi text-[#676565]">
        {t(REQUESTER_LABEL_KEYS[ticket.audience])}: {ticket.requesterName}
      </p>
      <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">
        {t("vendor.support.category")}: {t(CATEGORY_LABEL_KEYS[ticket.category])}{" "}
        · {t("vendor.support.priority")}:{" "}
        {t(PRIORITY_LABEL_KEYS[ticket.priority])}
      </p>
      <p className="mt-4 text-sm font-satoshi text-[#2F2F2F]">{ticket.description}</p>

      {ticket.adminResponse ? (
        <div className="mt-4 rounded-lg bg-[#F0F6FC] px-4 py-3">
          <p className="text-xs font-semibold font-satoshi text-[#135391]">
            {t("admin.support.previousResponse")}
          </p>
          <p className="mt-1 text-sm font-medium font-satoshi text-[#2F2F2F]">
            {ticket.adminResponse}
          </p>
        </div>
      ) : null}

      <label className="mt-4 flex flex-col gap-2">
        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
          {t("admin.support.adminResponse")}
        </span>
        <textarea
          value={responseDraft}
          onChange={(e) => onResponseChange(e.target.value)}
          className="min-h-[100px] w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm font-medium font-satoshi outline-none focus:border-[#004785]"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <select
            value={ticket.status}
            onChange={(e) =>
              onStatusChange(e.target.value as SupportTicketStatus)
            }
            className="h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] px-3 pr-10 text-sm font-medium font-satoshi outline-none focus:border-[#004785]"
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
          onClick={onSubmitResponse}
          disabled={!responseDraft.trim()}
          className="rounded-lg bg-[#D85A30] px-5 py-2.5 text-sm font-bold font-satoshi text-white disabled:opacity-50"
        >
          {t("admin.support.sendResponse")}
        </button>
      </div>
    </section>
  );
}
