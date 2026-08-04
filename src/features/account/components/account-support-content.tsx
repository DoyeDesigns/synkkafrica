"use client";

import { ChevronDown, Mail, MessageCircle, Paperclip, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AccountSupportFaqAccordion } from "@/features/account/components/account-support-faq-accordion";
import { AccountSupportTicketsTab } from "@/features/account/components/account-support-tickets-tab";
import {
  ACCOUNT_SUPPORT_CATEGORIES,
  ACCOUNT_SUPPORT_CONTACT,
  EMPTY_ACCOUNT_SUPPORT_FORM,
  type AccountSupportCategory,
  type AccountSupportTicket,
  type CreateAccountSupportTicketInput,
} from "@/features/account/data/account-support";
import { useAccountBookings } from "@/features/account/hooks/use-account-bookings";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/lib/preferences/translations";
import {
  createSupportTicket,
  getSupportTicket,
  listMyTickets,
  replySupportTicket,
  type SupportTicketApi,
  type SupportTicketDetailApi,
} from "@/lib/api/users";

function toAccountTicket(
  s: SupportTicketApi,
  messages: AccountSupportTicket["messages"] = [],
): AccountSupportTicket {
  return {
    id: s.id,
    ticketNumber: s.ticketNumber,
    category: s.category as AccountSupportCategory,
    subject: s.subject,
    status: s.status,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    relatedOrderNumber: s.bookingReference ?? undefined,
    messages,
  };
}

function toMessages(
  detail: SupportTicketDetailApi,
): AccountSupportTicket["messages"] {
  return detail.messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    text: m.body,
    createdAt: m.createdAt,
  }));
}

type SupportTab = "contact" | "tickets";

const selectClassName =
  "h-11 w-full appearance-none rounded-lg border border-[#E5E5E5] bg-[#F5F5F5] px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

const textareaClassName =
  "min-h-[140px] w-full resize-y rounded-lg border border-[#E5E5E5] bg-white px-3 py-2.5 text-sm font-medium font-satoshi text-foreground outline-none focus:border-[#004785]";

const TAB_LABEL_KEYS: Record<SupportTab, TranslationKey> = {
  contact: "account.contactSupport",
  tickets: "account.support.yourTickets",
};

const CATEGORY_LABEL_KEYS: Record<AccountSupportCategory, TranslationKey> = {
  booking: "account.support.category.booking",
  payment_refund: "account.support.category.paymentRefund",
  account: "account.support.category.account",
  other: "account.support.category.other",
};

type AccountSupportContentProps = {
  userId: string;
  userEmail: string;
};

export function AccountSupportContent({
  userId,
  userEmail,
}: AccountSupportContentProps) {
  const t = useTranslation();
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();
  const { bookings, ready } = useAccountBookings(userId, userEmail);
  const [activeTab, setActiveTab] = useState<SupportTab>("contact");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAccountSupportTicketInput>(
    EMPTY_ACCOUNT_SUPPORT_FORM,
  );
  const [submittedTicketNumber, setSubmittedTicketNumber] = useState<
    string | null
  >(null);

  const { data: rawTickets = [] } = useQuery({
    queryKey: ["account-tickets"],
    queryFn: () => listMyTickets(token as string),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const { data: selectedDetail } = useQuery({
    queryKey: ["account-ticket", selectedTicketId],
    queryFn: () => getSupportTicket(token as string, selectedTicketId as string),
    enabled: Boolean(token && selectedTicketId),
    refetchOnWindowFocus: false,
  });

  // Tickets for the tab: merge the selected ticket's fetched messages in.
  const tickets = useMemo<AccountSupportTicket[]>(
    () =>
      rawTickets.map((s) =>
        s.id === selectedTicketId && selectedDetail
          ? toAccountTicket(s, toMessages(selectedDetail))
          : toAccountTicket(s),
      ),
    [rawTickets, selectedTicketId, selectedDetail],
  );

  const invalidateTickets = () => {
    queryClient.invalidateQueries({ queryKey: ["account-tickets"] });
    if (selectedTicketId) {
      queryClient.invalidateQueries({
        queryKey: ["account-ticket", selectedTicketId],
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateAccountSupportTicketInput) =>
      createSupportTicket(token as string, {
        category: input.category,
        subject: input.subject.trim(),
        message: input.message.trim(),
        bookingReference:
          input.relatedOrderNumber && input.relatedOrderNumber !== "none"
            ? input.relatedOrderNumber
            : undefined,
      }),
    onSuccess: (ticket) => {
      setForm(EMPTY_ACCOUNT_SUPPORT_FORM);
      setSubmittedTicketNumber(ticket.ticketNumber);
      setActiveTab("tickets");
      setSelectedTicketId(ticket.id);
      invalidateTickets();
      window.setTimeout(() => setSubmittedTicketNumber(null), 4000);
    },
  });

  const replyMutation = useMutation({
    mutationFn: (v: { ticketId: string; body: string }) =>
      replySupportTicket(token as string, v.ticketId, v.body),
    onSuccess: () => invalidateTickets(),
  });

  const orderOptions = useMemo(
    () =>
      bookings.map((booking) => ({
        value: booking.orderNumber,
        label: `${booking.orderNumber} · ${booking.title}`,
      })),
    [bookings],
  );

  const updateForm = (patch: Partial<CreateAccountSupportTicketInput>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !form.subject.trim() || !form.message.trim()) {
      return;
    }
    if (!createMutation.isPending) createMutation.mutate(form);
  };

  // The tab appends the new message locally, then hands us the updated ticket.
  // We extract the newest customer message and persist it via the reply API.
  const handleUpdateTicket = (updatedTicket: AccountSupportTicket) => {
    const last = updatedTicket.messages[updatedTicket.messages.length - 1];
    if (!token || !last || last.sender !== "user" || !last.text) return;
    replyMutation.mutate({ ticketId: updatedTicket.id, body: last.text });
  };

  const isFormValid =
    form.subject.trim().length > 0 && form.message.trim().length > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#EEEEEE] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <h1 className="text-xl font-bold font-satoshi text-[#2F2F2F]">
        {t("account.contactSupport")}
      </h1>

      <div className="mt-6">
        <div
          className="flex items-center gap-6 overflow-x-auto border-b border-[#E8E8E8]"
          role="tablist"
          aria-label={t("account.support.tabs.label")}
        >
          {(["contact", "tickets"] as const).map((tabId) => {
            const isActive = activeTab === tabId;

            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tabId);
                  if (tabId === "contact") {
                    setSelectedTicketId(null);
                  }
                }}
                className={`shrink-0 pb-3 text-sm font-bold font-satoshi transition-colors ${
                  isActive
                    ? "border-b-2 border-[#D85A30] text-[#2F2F2F]"
                    : "text-[#676565] hover:text-[#2F2F2F]"
                }`}
              >
                {t(TAB_LABEL_KEYS[tabId])}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {activeTab === "contact" ? (
            <div className="space-y-8">
              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
                <ContactCard
                  icon={
                    <MessageCircle className="h-6 w-6 text-[#D85A30]" strokeWidth={1.75} />
                  }
                  label={t("account.support.contact.whatsapp")}
                  value={ACCOUNT_SUPPORT_CONTACT.whatsapp}
                  href={ACCOUNT_SUPPORT_CONTACT.whatsappHref}
                />
                <ContactCard
                  icon={<Mail className="h-6 w-6 text-[#D85A30]" strokeWidth={1.75} />}
                  label={t("account.support.contact.email")}
                  value={ACCOUNT_SUPPORT_CONTACT.email}
                  href={ACCOUNT_SUPPORT_CONTACT.emailHref}
                />
                <ContactCard
                  icon={<Phone className="h-6 w-6 text-[#D85A30]" strokeWidth={1.75} />}
                  label={t("account.support.contact.phone")}
                  value={ACCOUNT_SUPPORT_CONTACT.phone}
                  href={ACCOUNT_SUPPORT_CONTACT.phoneHref}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div>
                  <h2 className="text-base font-bold font-satoshi text-[#2F2F2F]">
                    {t("account.support.createTicket")}
                  </h2>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                          {t("account.support.topic")}
                        </span>
                        <div className="relative">
                          <select
                            value={form.category}
                            onChange={(event) =>
                              updateForm({
                                category: event.target.value as AccountSupportCategory,
                              })
                            }
                            className={`${selectClassName} pr-10`}
                          >
                            {ACCOUNT_SUPPORT_CATEGORIES.map((category) => (
                              <option key={category} value={category}>
                                {t(CATEGORY_LABEL_KEYS[category])}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                        </div>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                          {t("account.support.relatedOrder")}
                        </span>
                        <div className="relative">
                          <select
                            value={form.relatedOrderNumber ?? "none"}
                            onChange={(event) =>
                              updateForm({ relatedOrderNumber: event.target.value })
                            }
                            className={`${selectClassName} pr-10`}
                            disabled={!ready}
                          >
                            <option value="none">
                              {t("account.support.relatedOrderNone")}
                            </option>
                            {orderOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#676565]" />
                        </div>
                      </label>
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                        {t("account.support.subject")}
                      </span>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(event) => updateForm({ subject: event.target.value })}
                        placeholder={t("account.support.subjectPlaceholder")}
                        className={inputClassName}
                        required
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold font-satoshi text-[#2F2F2F]">
                        {t("account.support.message")}
                      </span>
                      <textarea
                        value={form.message}
                        onChange={(event) => updateForm({ message: event.target.value })}
                        placeholder={t("account.support.messagePlaceholder")}
                        className={textareaClassName}
                        required
                      />
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#D0D0D0] bg-[#FAFAFA] px-4 py-8 transition-colors hover:bg-[#F5F5F5]">
                      <Paperclip className="h-5 w-5 text-[#676565]" strokeWidth={1.75} />
                      <span className="text-sm font-medium font-satoshi text-[#676565]">
                        {t("account.support.attachFile")}
                      </span>
                      <input type="file" accept="image/*" className="sr-only" />
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {submittedTicketNumber ? (
                        <p className="text-sm font-semibold font-satoshi text-[#2E7D32]">
                          {t("account.support.ticketSubmitted", {
                            number: submittedTicketNumber,
                          })}
                        </p>
                      ) : (
                        <span className="hidden sm:block" />
                      )}

                      <button
                        type="submit"
                        disabled={!isFormValid}
                        className="inline-flex items-center justify-center rounded-lg bg-[#D85A30] px-6 py-2.5 text-sm font-bold font-satoshi text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("account.support.submitTicket")}
                      </button>
                    </div>
                  </form>
                </div>

                <AccountSupportFaqAccordion />
              </div>
            </div>
          ) : (
            <AccountSupportTicketsTab
              tickets={tickets}
              selectedTicketId={selectedTicketId}
              onSelectTicket={setSelectedTicketId}
              onUpdateTicket={handleUpdateTicket}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex flex-col items-center rounded-xl border border-[#EEEEEE] px-4 py-5 text-center transition-colors hover:border-[#D85A30]/30"
    >
      {icon}
      <p className="mt-3 text-sm font-bold font-satoshi text-[#2F2F2F]">{label}</p>
      <p className="mt-1 text-sm font-medium font-satoshi text-[#676565]">{value}</p>
    </a>
  );
}
