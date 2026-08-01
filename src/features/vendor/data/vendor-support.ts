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
