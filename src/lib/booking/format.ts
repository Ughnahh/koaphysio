/** Display formatting in the clinic time zone. */
import { BOOKING_POLICY } from "./policy";

const tz = BOOKING_POLICY.timeZone;

const timeFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: tz,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const longDateFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: tz,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortDateFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: tz,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const dateTimeFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: tz,
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export const formatTime = (iso: string) => timeFmt.format(new Date(iso)).replace(" ", " ");
export const formatLongDate = (iso: string) => longDateFmt.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));

/** Format a local "YYYY-MM-DD" key without shifting the day. */
export function formatDateKey(dateKey: string, style: "short" | "long" = "short"): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  // 02:00 UTC falls on the same calendar date in every Australian time zone.
  const iso = new Date(Date.UTC(y, m - 1, d, 2)).toISOString();
  return style === "long" ? formatLongDate(iso) : formatShortDate(iso);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}
