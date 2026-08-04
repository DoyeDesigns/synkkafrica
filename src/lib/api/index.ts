export { ApiError, apiFetch } from "@/lib/api/backend";

export {
  requestOtp,
  refreshTokens,
  signOutBackend,
  verifyOtp,
  type BackendTokens,
} from "@/lib/api/auth";

export {
  cancelBooking,
  createBooking,
  getBooking,
  isPriceChanged,
  previewCancelBooking,
  requestBookingAccess,
  resendBookingETicket,
  type BookingTravelerEntry,
  type BookingView,
  type CancelBookingInput,
  type CancelBookingResult,
  type CancellationEstimate,
  type CreateBookingInput,
  type CreateBookingResult,
  type PriceChangedBody,
  type RequestBookingAccessInput,
  type TravelerInput,
} from "@/lib/api/bookings";

export {
  getPopularFares,
  priceOffer,
  searchFlights,
  type CabinClass,
  type FlightItinerary,
  type FlightOffer,
  type FlightPriceResponse,
  type FlightSearchInput,
  type FlightSearchResponse,
  type FlightSegment,
  type PopularFare,
  type PopularFaresResponse,
} from "@/lib/api/flights";

export {
  exportMyData,
  getProfile,
  requestErasure,
  updateProfile,
  type UpdateProfileInput,
  type UserProfile,
} from "@/lib/api/users";

export {
  createSavedTraveler,
  deleteSavedTraveler,
  getSavedTraveler,
  listSavedTravelers,
  updateSavedTraveler,
  type SavedTraveler,
  type SavedTravelerInput,
  type TravelerGender,
  type TravelerTitle,
  type UpdateSavedTravelerInput,
} from "@/lib/api/saved-travelers";

export { getPaymentProviders, type PaymentProvider } from "@/lib/api/payments";

export { getPrivacyNotice, type PrivacyNotice } from "@/lib/api/legal";

export { getHealth, getHealthLive, getHealthReady } from "@/lib/api/health";

export * as adminAuth from "@/lib/api/admin/auth";
export * as adminAudit from "@/lib/api/admin/audit";
export * as adminBookings from "@/lib/api/admin/bookings";
export * as adminCarrierCapability from "@/lib/api/admin/carrier-capability";
export * as adminMarkup from "@/lib/api/admin/markup";
export * as adminOpsQueue from "@/lib/api/admin/ops-queue";
export * as adminRefunds from "@/lib/api/admin/refunds";
export * as adminReports from "@/lib/api/admin/reports";
export * as adminUsers from "@/lib/api/admin/users";
