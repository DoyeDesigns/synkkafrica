import type {
  SupportTicket,
  SupportTicketStatus,
} from "@/features/vendor/data/vendor-support";
import { VENDOR_SUPPORT_TICKETS } from "@/features/vendor/data/vendor-support";

export type AdminSupportTicket = SupportTicket & {
  vendorName: string;
  adminResponse?: string;
};

export const ADMIN_SUPPORT_TICKETS: AdminSupportTicket[] =
  VENDOR_SUPPORT_TICKETS.map((ticket, index) => ({
    ...ticket,
    vendorName:
      index % 2 === 0 ? "Alex Autos" : "Coastal Trails NG",
    adminResponse:
      ticket.status === "resolved"
        ? "Issue reviewed and resolved with the vendor."
        : undefined,
  }));

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
