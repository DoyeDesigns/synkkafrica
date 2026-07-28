export type AccountSupportCategory =
  | "booking"
  | "payment_refund"
  | "account"
  | "other";

export type AccountSupportTicketStatus = "open" | "resolved";

export type AccountSupportMessageSender = "user" | "support";

export type AccountSupportMessage = {
  id: string;
  sender: AccountSupportMessageSender;
  text?: string;
  imageUrl?: string;
  createdAt: string;
};

export type AccountSupportTicket = {
  id: string;
  ticketNumber: string;
  category: AccountSupportCategory;
  subject: string;
  status: AccountSupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  relatedOrderNumber?: string;
  messages: AccountSupportMessage[];
};

export type CreateAccountSupportTicketInput = {
  category: AccountSupportCategory;
  subject: string;
  message: string;
  relatedOrderNumber?: string;
};

export type SendAccountSupportMessageInput = {
  text?: string;
  imageUrl?: string;
};

export const ACCOUNT_SUPPORT_CATEGORIES: AccountSupportCategory[] = [
  "booking",
  "payment_refund",
  "account",
  "other",
];

export const ACCOUNT_SUPPORT_CONTACT = {
  whatsapp: "+234 800 SYNKKA",
  whatsappHref: "https://wa.me/2348007965522",
  email: "support@synkkaafrica.com",
  emailHref: "mailto:support@synkkaafrica.com",
  phone: "+234 700 000 1234",
  phoneHref: "tel:+2347000001234",
} as const;

export const ACCOUNT_SUPPORT_FAQ_ITEMS = [
  {
    id: "cancel-booking",
    questionKey: "account.support.faq.cancelBooking",
    answerKey: "account.support.faq.cancelBookingAnswer",
  },
  {
    id: "refund-timing",
    questionKey: "account.support.faq.refundTiming",
    answerKey: "account.support.faq.refundTimingAnswer",
  },
  {
    id: "change-date",
    questionKey: "account.support.faq.changeDate",
    answerKey: "account.support.faq.changeDateAnswer",
  },
  {
    id: "payment-security",
    questionKey: "account.support.faq.paymentSecurity",
    answerKey: "account.support.faq.paymentSecurityAnswer",
  },
] as const;

export const ACCOUNT_SUPPORT_TICKETS: AccountSupportTicket[] = [
  {
    id: "user-ticket-1",
    ticketNumber: "SUP-1042",
    category: "payment_refund",
    subject: "Refund not received",
    status: "open",
    createdAt: "2026-07-20T10:00:00",
    updatedAt: "2026-07-21T09:15:00",
    messages: [
      {
        id: "msg-1-1",
        sender: "user",
        text: "I cancelled my booking last week but have not received the refund yet.",
        createdAt: "2026-07-20T10:00:00",
      },
      {
        id: "msg-1-2",
        sender: "support",
        text: "Thanks for reaching out. We have escalated your refund request and will update you within 2 business days.",
        createdAt: "2026-07-20T14:30:00",
      },
      {
        id: "msg-1-3",
        sender: "user",
        text: "Could you confirm the amount that will be refunded?",
        createdAt: "2026-07-21T09:15:00",
      },
    ],
  },
  {
    id: "user-ticket-2",
    ticketNumber: "SUP-0981",
    category: "booking",
    subject: "Wrong experience date shown",
    status: "resolved",
    createdAt: "2026-07-02T14:30:00",
    updatedAt: "2026-07-04T11:00:00",
    messages: [
      {
        id: "msg-2-1",
        sender: "user",
        text: "My confirmation email shows a different date than what I selected.",
        createdAt: "2026-07-02T14:30:00",
      },
      {
        id: "msg-2-2",
        sender: "support",
        text: "We have corrected the date on your booking and sent an updated confirmation to your email.",
        createdAt: "2026-07-03T10:00:00",
      },
      {
        id: "msg-2-3",
        sender: "user",
        text: "Got it, thank you!",
        createdAt: "2026-07-04T11:00:00",
      },
    ],
  },
];

let ticketCounter = 1043;
let messageCounter = 100;

function createMessage(
  sender: AccountSupportMessageSender,
  input: SendAccountSupportMessageInput,
): AccountSupportMessage {
  const message: AccountSupportMessage = {
    id: `msg-${messageCounter}`,
    sender,
    text: input.text?.trim() || undefined,
    imageUrl: input.imageUrl,
    createdAt: new Date().toISOString(),
  };

  messageCounter += 1;
  return message;
}

export function createAccountSupportTicket(
  input: CreateAccountSupportTicketInput,
): AccountSupportTicket {
  const now = new Date().toISOString();
  const ticket: AccountSupportTicket = {
    id: `user-ticket-${ticketCounter}`,
    ticketNumber: `SUP-${ticketCounter}`,
    category: input.category,
    subject: input.subject.trim(),
    status: "open",
    createdAt: now,
    updatedAt: now,
    relatedOrderNumber: input.relatedOrderNumber?.trim() || undefined,
    messages: [
      createMessage("user", {
        text: input.message.trim(),
      }),
    ],
  };

  ticketCounter += 1;
  return ticket;
}

export function appendAccountSupportMessage(
  ticket: AccountSupportTicket,
  input: SendAccountSupportMessageInput,
): AccountSupportTicket {
  const message = createMessage("user", input);

  return {
    ...ticket,
    updatedAt: message.createdAt,
    messages: [...ticket.messages, message],
  };
}

export function formatAccountSupportTicketDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function formatAccountSupportMessageTime(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export const EMPTY_ACCOUNT_SUPPORT_FORM: CreateAccountSupportTicketInput = {
  category: "booking",
  subject: "",
  message: "",
  relatedOrderNumber: "",
};
