import type { BookingPolicy } from "./types";

/**
 * Booking policy defaults. All values are placeholders pending client
 * decisions (clinic state/time zone, hold period, notice period).
 */
export const BOOKING_POLICY: BookingPolicy = {
  timeZone: "Australia/Sydney",
  slotIntervalMin: 30,
  minNoticeHours: 24,
  horizonDays: 56,
  pendingHoldHours: 24,
  pendingCutoffHoursBeforeStart: 12,
};
