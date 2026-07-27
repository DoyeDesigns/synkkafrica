import type {
  SupportTicket,
  SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";
import { VENDOR_SUPPORT_TICKETS } from "@/features/vendor/data/vendor-support";

export type AdminSupportAudience = "users" | "vendors";

export type AdminSupportTicket = SupportTicket & {
  audience: AdminSupportAudience;
  requesterName: string;
  adminResponse?: string;
};

export const ADMIN_USER_SUPPORT_TICKETS: AdminSupportTicket[] = [
  {
    id: "user-ticket-1",
    ticketNumber: "#SUP-U1088",
    subject: "Refund not received for cancelled booking",
    category: "booking",
    priority: "high",
    description:
      "Booking BKG-5362 was cancelled on 15 Jul but the refund has not appeared on my card.",
    status: "in_progress",
    createdAt: "2026-07-16T10:20:00",
    updatedAt: "2026-07-18T09:45:00",
    bookingReference: "BKG-5362",
    audience: "users",
    requesterName: "Zainab Ali",
  },
  {
    id: "user-ticket-2",
    ticketNumber: "#SUP-U1085",
    subject: "Unable to update profile email",
    category: "account",
    priority: "medium",
    description:
      "The save button on my account settings page does not update my email address.",
    status: "open",
    createdAt: "2026-07-14T13:10:00",
    updatedAt: "2026-07-14T13:10:00",
    audience: "users",
    requesterName: "Emeka Nwosu",
  },
  {
    id: "user-ticket-3",
    ticketNumber: "#SUP-U1079",
    subject: "Experience did not match listing description",
    category: "complaint",
    priority: "urgent",
    description:
      "The Lagos Food Experience tour was advertised as 4 hours but ended after 2 hours.",
    status: "open",
    createdAt: "2026-07-12T18:30:00",
    updatedAt: "2026-07-12T18:30:00",
    bookingReference: "BKG-5471",
    audience: "users",
    requesterName: "Amara Okafor",
  },
  {
    id: "user-ticket-4",
    ticketNumber: "#SUP-U1068",
    subject: "Payment charged twice",
    category: "booking",
    priority: "high",
    description:
      "I was charged twice for the same accommodation booking on 3 Jul.",
    status: "resolved",
    createdAt: "2026-07-04T11:00:00",
    updatedAt: "2026-07-06T15:20:00",
    bookingReference: "BKG-5310",
    audience: "users",
    requesterName: "Fatima Bello",
    adminResponse:
      "Duplicate charge confirmed and refund initiated. You should see it within 3–5 business days.",
  },
  {
    id: "user-ticket-5",
    ticketNumber: "#SUP-U1055",
    subject: "Question about loyalty points",
    category: "other",
    priority: "low",
    description: "How do Synkkafrica loyalty points work after a completed trip?",
    status: "closed",
    createdAt: "2026-06-28T08:15:00",
    updatedAt: "2026-06-29T12:00:00",
    audience: "users",
    requesterName: "Kofi Mensah",
    adminResponse:
      "Points are credited within 48 hours of trip completion. See the loyalty FAQ in your account.",
  },
];

export const ADMIN_VENDOR_SUPPORT_TICKETS: AdminSupportTicket[] =
  VENDOR_SUPPORT_TICKETS.map((ticket, index) => ({
    ...ticket,
    audience: "vendors" as const,
    requesterName: index % 2 === 0 ? "Alex Autos" : "Coastal Trails NG",
    adminResponse:
      ticket.status === "resolved"
        ? "Issue reviewed and resolved with the vendor."
        : undefined,
  }));

export const ADMIN_SUPPORT_TICKETS: AdminSupportTicket[] = [
  ...ADMIN_USER_SUPPORT_TICKETS,
  ...ADMIN_VENDOR_SUPPORT_TICKETS,
];

export type { SupportTicketStatus };

export function filterAdminTicketsByStatus(
  tickets: AdminSupportTicket[],
  status: SupportTicketStatus | "all",
) {
  if (status === "all") {
    return tickets;
  }

  return tickets.filter((ticket) => ticket.status === status);
}

export function filterAdminTicketsByAudience(
  tickets: AdminSupportTicket[],
  audience: AdminSupportAudience,
) {
  return tickets.filter((ticket) => ticket.audience === audience);
}
