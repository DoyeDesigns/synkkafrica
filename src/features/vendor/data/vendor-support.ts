export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketCategory =
  | "booking"
  | "payout"
  | "listing"
  | "account"
  | "complaint"
  | "other";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type SupportTicketStatusFilter = SupportTicketStatus | "all";

export type SupportTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  bookingReference?: string;
};

export type CreateSupportTicketInput = {
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description: string;
  bookingReference?: string;
};

export const SUPPORT_TICKET_PRIORITIES: SupportTicketPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export const SUPPORT_TICKET_CATEGORIES: SupportTicketCategory[] = [
  "booking",
  "payout",
  "listing",
  "account",
  "complaint",
  "other",
];

export const SUPPORT_TICKET_STATUS_FILTERS: SupportTicketStatusFilter[] = [
  "all",
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export const VENDOR_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "ticket-1",
    ticketNumber: "#SUP-1041",
    subject: "Delayed payout to GTBank",
    category: "payout",
    priority: "high",
    description:
      "Withdrawal requested on 10 Jul has not arrived after 5 business days.",
    status: "in_progress",
    createdAt: "2026-07-12T09:15:00",
    updatedAt: "2026-07-14T11:30:00",
  },
  {
    id: "ticket-2",
    ticketNumber: "#SUP-1038",
    subject: "Listing stuck in pending approval",
    category: "listing",
    priority: "medium",
    description:
      "Lagos Lagoon Sunset Cruise has been pending for over two weeks.",
    status: "open",
    createdAt: "2026-07-08T14:00:00",
    updatedAt: "2026-07-08T14:00:00",
  },
  {
    id: "ticket-3",
    ticketNumber: "#SUP-1029",
    subject: "Guest no-show dispute",
    category: "complaint",
    priority: "urgent",
    description:
      "Guest marked as no-show but claims they were at the meeting point on time.",
    status: "resolved",
    createdAt: "2026-06-28T16:45:00",
    updatedAt: "2026-07-02T10:20:00",
    bookingReference: "VB-3",
  },
  {
    id: "ticket-4",
    ticketNumber: "#SUP-1020",
    subject: "Unable to update bank details",
    category: "account",
    priority: "low",
    description: "Save button on payout account section does not respond.",
    status: "closed",
    createdAt: "2026-06-15T08:30:00",
    updatedAt: "2026-06-18T09:00:00",
  },
];

let ticketCounter = 1042;

export function createSupportTicket(
  input: CreateSupportTicketInput,
): SupportTicket {
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: `ticket-${ticketCounter}`,
    ticketNumber: `#SUP-${ticketCounter}`,
    subject: input.subject.trim(),
    category: input.category,
    priority: input.priority,
    description: input.description.trim(),
    status: "open",
    createdAt: now,
    updatedAt: now,
    bookingReference: input.bookingReference?.trim() || undefined,
  };

  ticketCounter += 1;
  return ticket;
}

export function filterTicketsByStatus(
  tickets: SupportTicket[],
  filter: SupportTicketStatusFilter,
) {
  if (filter === "all") {
    return tickets;
  }

  return tickets.filter((ticket) => ticket.status === filter);
}

export function formatTicketDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export const EMPTY_TICKET_FORM: CreateSupportTicketInput = {
  subject: "",
  category: "complaint",
  priority: "medium",
  description: "",
  bookingReference: "",
};
