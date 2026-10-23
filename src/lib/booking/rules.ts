/**
 * Pure booking rules: time zone handling, slot generation, overlap detection
 * and hold expiry.
 *
 * These functions have no side effects and no framework dependencies, so the
 * same logic can run in the mock client today and on the server in Phase 2.
 * The database exclusion constraint remains the final guarantee against
 * double bookings; these rules decide what to *offer*.
 *
 * Only type imports are allowed here so the file runs under `node --test`.
 */
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityException,
  BookableService,
  BookingPolicy,
  DeliveryMode,
  PractitionerId,
  TimeSlot,
  WeeklyHours,
} from "./types";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/* -------------------------------------------------------------------------- */
/* Time zone helpers                                                          */
/* -------------------------------------------------------------------------- */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-AU", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const out: Record<string, number> = {};
  for (const p of partsFormatter(timeZone).formatToParts(date)) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour === 24 ? 0 : out.hour,
    minute: out.minute,
    second: out.second,
  };
}

function offsetMs(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Convert a local wall-clock date and time in `timeZone` to a UTC Date. Handles DST. */
export function zonedTimeToUtc(dateKey: string, time: string, timeZone: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = offsetMs(new Date(guess), timeZone);
  let result = guess - first;
  const second = offsetMs(new Date(result), timeZone);
  if (second !== first) result = guess - second;
  return new Date(result);
}

/** "YYYY-MM-DD" for the given instant in `timeZone`. */
export function toDateKey(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d) + days * DAY);
  return next.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, for a calendar date (independent of time zone). */
export function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timeOf(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Ranges and holds                                                           */
/* -------------------------------------------------------------------------- */

export interface Range {
  start: number; // epoch ms, inclusive
  end: number; // epoch ms, exclusive
}

/** Half-open overlap test, matching Postgres `tstzrange '[)' && '[)'`. */
export function rangesOverlap(a: Range, b: Range): boolean {
  return a.start < b.end && b.start < a.end;
}

/** The time an appointment blocks, including travel and buffers. */
export function blockedRange(
  appt: Pick<Appointment, "startsAt" | "endsAt" | "preBufferMin" | "postBufferMin">,
): Range {
  return {
    start: Date.parse(appt.startsAt) - appt.preBufferMin * MINUTE,
    end: Date.parse(appt.endsAt) + appt.postBufferMin * MINUTE,
  };
}

const HOLD_STATUSES: readonly AppointmentStatus[] = ["pending", "offered"];

/** Does this appointment currently occupy the practitioner's time? */
export function isBlocking(
  appt: Pick<Appointment, "status" | "expiresAt">,
  now: Date,
): boolean {
  if (appt.status === "approved") return true;
  if (HOLD_STATUSES.includes(appt.status)) {
    return appt.expiresAt === null || Date.parse(appt.expiresAt) > now.getTime();
  }
  return false;
}

/** A hold that has passed its expiry but has not yet been swept. */
export function isExpiredHold(appt: Pick<Appointment, "status" | "expiresAt">, now: Date): boolean {
  return (
    HOLD_STATUSES.includes(appt.status) &&
    appt.expiresAt !== null &&
    Date.parse(appt.expiresAt) <= now.getTime()
  );
}

/**
 * When a new pending request stops holding its slot: after `pendingHoldHours`,
 * or `pendingCutoffHoursBeforeStart` before the appointment, whichever is first.
 */
export function computeHoldExpiry(createdAt: Date, startsAt: Date, policy: BookingPolicy): Date {
  const byHold = createdAt.getTime() + policy.pendingHoldHours * HOUR;
  const byCutoff = startsAt.getTime() - policy.pendingCutoffHoursBeforeStart * HOUR;
  return new Date(Math.max(createdAt.getTime(), Math.min(byHold, byCutoff)));
}

export interface BufferPlan {
  preBufferMin: number;
  postBufferMin: number;
}

export function bufferPlan(
  service: Pick<BookableService, "bufferAfterMin">,
  mode: DeliveryMode,
  travelBufferMin = 0,
): BufferPlan {
  const travel = mode === "home" ? travelBufferMin : 0;
  return { preBufferMin: travel, postBufferMin: service.bufferAfterMin + travel };
}

/** First active appointment that would collide with the candidate, if any. */
export function findConflict(
  candidate: Range,
  practitionerId: PractitionerId,
  appointments: readonly Appointment[],
  now: Date,
  ignoreId?: string,
): Appointment | undefined {
  return appointments.find(
    (a) =>
      a.id !== ignoreId &&
      a.practitionerId === practitionerId &&
      isBlocking(a, now) &&
      rangesOverlap(candidate, blockedRange(a)),
  );
}

/* -------------------------------------------------------------------------- */
/* Slot generation                                                            */
/* -------------------------------------------------------------------------- */

export interface SlotContext {
  date: string; // local "YYYY-MM-DD"
  service: BookableService;
  mode: DeliveryMode;
  practitionerIds: PractitionerId[];
  weeklyHours: readonly WeeklyHours[];
  exceptions: readonly AvailabilityException[];
  appointments: readonly Appointment[];
  policy: BookingPolicy;
  now: Date;
  travelBufferMin?: number;
}

/** All bookable slots for each requested practitioner on a single local date. */
export function generateSlots(ctx: SlotContext): TimeSlot[] {
  const { date, service, mode, policy, now } = ctx;
  if (!service.active || !service.modes.includes(mode)) return [];

  const earliest = now.getTime() + policy.minNoticeHours * HOUR;
  const latest = now.getTime() + policy.horizonDays * DAY;
  const weekday = weekdayOf(date);
  const buffers = bufferPlan(service, mode, ctx.travelBufferMin);
  const slots: TimeSlot[] = [];

  for (const practitionerId of ctx.practitionerIds) {
    if (!service.practitionerIds.includes(practitionerId)) continue;

    const windows = ctx.weeklyHours.filter(
      (w) => w.practitionerId === practitionerId && w.weekday === weekday && w.modes.includes(mode),
    );
    const exceptions = ctx.exceptions
      .filter((e) => e.practitionerId === practitionerId)
      .map((e) => ({ start: Date.parse(e.startsAt), end: Date.parse(e.endsAt) }));

    for (const w of windows) {
      const windowEnd = minutesOf(w.end);
      for (
        let m = minutesOf(w.start);
        m + service.durationMin <= windowEnd;
        m += policy.slotIntervalMin
      ) {
        const start = zonedTimeToUtc(date, timeOf(m), policy.timeZone).getTime();
        const end = start + service.durationMin * MINUTE;
        if (start < earliest || start > latest) continue;

        const blocked: Range = {
          start: start - buffers.preBufferMin * MINUTE,
          end: end + buffers.postBufferMin * MINUTE,
        };
        if (exceptions.some((e) => rangesOverlap(blocked, e))) continue;
        if (findConflict(blocked, practitionerId, ctx.appointments, now)) continue;

        slots.push({
          practitionerId,
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
        });
      }
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * For "no preference": one slot per start time, assigned to the practitioner
 * with the fewest active appointments that day (ties broken by list order).
 */
export function mergeSlotsForAnyPractitioner(
  slots: readonly TimeSlot[],
  practitionerOrder: readonly PractitionerId[],
  appointments: readonly Appointment[],
  date: string,
  timeZone: string,
  now: Date,
): TimeSlot[] {
  const load = new Map<PractitionerId, number>();
  for (const a of appointments) {
    if (isBlocking(a, now) && toDateKey(new Date(a.startsAt), timeZone) === date) {
      load.set(a.practitionerId, (load.get(a.practitionerId) ?? 0) + 1);
    }
  }
  const rank = (id: PractitionerId) =>
    (load.get(id) ?? 0) * 100 + Math.max(0, practitionerOrder.indexOf(id));

  const byStart = new Map<string, TimeSlot>();
  for (const slot of slots) {
    const current = byStart.get(slot.startsAt);
    if (!current || rank(slot.practitionerId) < rank(current.practitionerId)) {
      byStart.set(slot.startsAt, slot);
    }
  }
  return [...byStart.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
