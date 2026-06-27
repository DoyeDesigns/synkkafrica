export type NotificationPeriod = "most-recent" | "week-earlier" | "three-months-ago";

export type NotificationIconType = "flight" | "info" | "experience";

export type NotificationMessagePart =
  | { type: "text"; value: string }
  | { type: "link"; value: string };

export type AccountNotification = {
  id: string;
  period: NotificationPeriod;
  icon: NotificationIconType;
  message: NotificationMessagePart[];
  time: string;
  date?: string;
};

export const NOTIFICATION_PERIOD_LABELS: Record<NotificationPeriod, string> = {
  "most-recent": "Most recent",
  "week-earlier": "A week earlier",
  "three-months-ago": "3 months ago",
};

export const NOTIFICATION_PERIOD_ORDER: NotificationPeriod[] = [
  "most-recent",
  "week-earlier",
  "three-months-ago",
];

const flightBookingMessage: NotificationMessagePart[] = [
  { type: "text", value: "You've successful booked your flight " },
  { type: "link", value: "LOS [Murtala Muhammed]" },
  { type: "text", value: " to " },
  { type: "link", value: "LHR [London Heathrow]" },
  {
    type: "text",
    value: ". Kindly check your email for your e-ticket and booking confirmation.",
  },
];

const experienceBookingMessage: NotificationMessagePart[] = [
  { type: "text", value: "You've successful booked " },
  { type: "link", value: "RDPX Paintball Arena" },
  { type: "text", value: " in " },
  { type: "link", value: "Lagos, Nigeria" },
  { type: "text", value: ". Your experience is confirmed for this weekend." },
];

export const ACCOUNT_NOTIFICATIONS: AccountNotification[] = [
  {
    id: "flight-1",
    period: "most-recent",
    icon: "flight",
    message: flightBookingMessage,
    time: "11:00 PM",
  },
  {
    id: "flight-2",
    period: "most-recent",
    icon: "flight",
    message: flightBookingMessage,
    time: "11:00 PM",
  },
  {
    id: "passport-reminder",
    period: "most-recent",
    icon: "info",
    message: [
      {
        type: "text",
        value:
          "Ensure your passport is valid for at least 6 months beyond your travel date.",
      },
    ],
    time: "11:00 PM",
    date: "MAY 12",
  },
  {
    id: "experience-1",
    period: "week-earlier",
    icon: "experience",
    message: experienceBookingMessage,
    time: "11:00 PM",
    date: "MAY 12",
  },
  {
    id: "experience-2",
    period: "week-earlier",
    icon: "experience",
    message: experienceBookingMessage,
    time: "11:00 PM",
    date: "MAY 12",
  },
  {
    id: "flight-3",
    period: "three-months-ago",
    icon: "flight",
    message: flightBookingMessage,
    time: "9:30 PM",
    date: "MAR 04",
  },
  {
    id: "flight-4",
    period: "three-months-ago",
    icon: "flight",
    message: flightBookingMessage,
    time: "9:30 PM",
    date: "MAR 04",
  },
  {
    id: "hotel-reminder",
    period: "three-months-ago",
    icon: "info",
    message: [
      {
        type: "text",
        value: "Your stay at ",
      },
      { type: "link", value: "The President Hotel" },
      {
        type: "text",
        value: " was completed. We hope you enjoyed your trip.",
      },
    ],
    time: "2:15 PM",
    date: "FEB 18",
  },
];

export function groupNotificationsByPeriod(
  notifications: AccountNotification[],
): Record<NotificationPeriod, AccountNotification[]> {
  return {
    "most-recent": notifications.filter((item) => item.period === "most-recent"),
    "week-earlier": notifications.filter((item) => item.period === "week-earlier"),
    "three-months-ago": notifications.filter(
      (item) => item.period === "three-months-ago",
    ),
  };
}
