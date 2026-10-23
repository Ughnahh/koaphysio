/**
 * Unit tests for the pure booking rules.
 * Run with `npm test` (Node's built-in test runner; no extra dependencies).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blockedRange,
  computeHoldExpiry,
  findConflict,
  generateSlots,
  isBlocking,
  mergeSlotsForAnyPractitioner,
  rangesOverlap,
  toDateKey,
  zonedTimeToUtc,
} from "./rules.ts";
import type { Appointment, BookableService, BookingPolicy, WeeklyHours } from "./types";

const TZ = "Australia/Sydney";

const policy: BookingPolicy = {
  timeZone: TZ,
  slotIntervalMin: 30,
  minNoticeHours: 0,
  horizonDays: 60,
  pendingHoldHours: 24,
  pendingCutoffHoursBeforeStart: 12,
};

const service: BookableService = {
  id: "svc",
  slug: "svc",
  name: "Test service",
  summary: "",
  durationMin: 60,
  bufferAfterMin: 15,
  modes: ["clinic", "home"],
  practitionerIds: ["a", "b"],
  active: true,
};

// 2030-03-04 is a Monday.
const DATE = "2030-03-04";
const hours: WeeklyHours[] = [
  { id: "1", practitionerId: "a", weekday: 1, start: "09:00", end: "12:00", modes: ["clinic", "home"] },
  { id: "2", practitionerId: "b", weekday: 1, start: "09:00", end: "11:00", modes: ["clinic"] },
];
const NOW = new Date("2030-03-01T00:00:00Z");

function appt(partial: Partial<Appointment>): Appointment {
  return {
    id: "x",
    reference: "KOA-X",
    practitionerId: "a",
    serviceId: "svc",
    mode: "clinic",
    startsAt: zonedTimeToUtc(DATE, "10:00", TZ).toISOString(),
    endsAt: zonedTimeToUtc(DATE, "11:00", TZ).toISOString(),
    preBufferMin: 0,
    postBufferMin: 15,
    status: "approved",
    expiresAt: null,
    client: { firstName: "T", lastName: "T", email: "t@example.com", phone: "0491570006" },
    createdAt: NOW.toISOString(),
    ...partial,
  };
}

const times = (slots: { startsAt: string }[]) =>
  slots.map((s) =>
    new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(
      new Date(s.startsAt),
    ),
  );

describe("time zones", () => {
  it("converts Sydney wall-clock time across daylight saving", () => {
    // AEDT (UTC+11) in January, AEST (UTC+10) in July.
    assert.equal(zonedTimeToUtc("2030-01-15", "09:00", TZ).toISOString(), "2030-01-14T22:00:00.000Z");
    assert.equal(zonedTimeToUtc("2030-07-15", "09:00", TZ).toISOString(), "2030-07-14T23:00:00.000Z");
  });

  it("derives local date keys", () => {
    assert.equal(toDateKey(new Date("2030-01-14T22:00:00Z"), TZ), "2030-01-15");
  });
});

describe("overlap", () => {
  it("treats ranges as half-open, like Postgres [)", () => {
    assert.equal(rangesOverlap({ start: 0, end: 10 }, { start: 10, end: 20 }), false);
    assert.equal(rangesOverlap({ start: 0, end: 11 }, { start: 10, end: 20 }), true);
  });

  it("includes buffers in the blocked range", () => {
    const r = blockedRange({
      startsAt: "2030-01-01T10:00:00Z",
      endsAt: "2030-01-01T11:00:00Z",
      preBufferMin: 30,
      postBufferMin: 45,
    });
    assert.equal(new Date(r.start).toISOString(), "2030-01-01T09:30:00.000Z");
    assert.equal(new Date(r.end).toISOString(), "2030-01-01T11:45:00.000Z");
  });

  it("ignores expired holds and closed statuses", () => {
    const past = new Date(NOW.getTime() - 1000).toISOString();
    assert.equal(isBlocking(appt({ status: "pending", expiresAt: past }), NOW), false);
    assert.equal(isBlocking(appt({ status: "declined" }), NOW), false);
    assert.equal(isBlocking(appt({ status: "pending", expiresAt: "2030-03-02T00:00:00Z" }), NOW), true);
  });

  it("finds conflicts for the same practitioner only", () => {
    const existing = [appt({})];
    const r = blockedRange(appt({}));
    assert.ok(findConflict(r, "a", existing, NOW));
    assert.equal(findConflict(r, "b", existing, NOW), undefined);
  });
});

describe("slot generation", () => {
  const base = {
    date: DATE,
    service,
    mode: "clinic" as const,
    practitionerIds: ["a"],
    weeklyHours: hours,
    exceptions: [],
    appointments: [],
    policy,
    now: NOW,
  };

  it("fits whole appointments inside working hours", () => {
    assert.deepEqual(times(generateSlots(base)), ["09:00", "09:30", "10:00", "10:30", "11:00"]);
  });

  it("removes slots that overlap an appointment plus its buffers", () => {
    // Existing 10:00–11:00 + 15 min buffer blocks 10:00–11:15.
    // New slots also need their own 15 min after-buffer.
    const slots = generateSlots({ ...base, appointments: [appt({})] });
    assert.deepEqual(times(slots), []);
    const early = generateSlots({
      ...base,
      appointments: [appt({ startsAt: zonedTimeToUtc(DATE, "11:00", TZ).toISOString(), endsAt: zonedTimeToUtc(DATE, "12:00", TZ).toISOString() })],
    });
    assert.deepEqual(times(early), ["09:00", "09:30"]);
  });

  it("removes slots during leave", () => {
    const slots = generateSlots({
      ...base,
      exceptions: [
        {
          id: "e",
          practitionerId: "a",
          kind: "leave",
          startsAt: zonedTimeToUtc(DATE, "00:00", TZ).toISOString(),
          endsAt: zonedTimeToUtc("2030-03-05", "00:00", TZ).toISOString(),
        },
      ],
    });
    assert.equal(slots.length, 0);
  });

  it("respects delivery mode per working window", () => {
    const slots = generateSlots({ ...base, mode: "home", practitionerIds: ["a", "b"] });
    assert.ok(slots.every((s) => s.practitionerId === "a"));
  });

  it("adds travel buffers for home visits", () => {
    // 30 min travel each side: 09:00 start would need 08:30 travel (before hours is allowed),
    // but must end + 15 + 30 before the next booking.
    const slots = generateSlots({
      ...base,
      mode: "home",
      travelBufferMin: 30,
      appointments: [appt({ startsAt: zonedTimeToUtc(DATE, "11:00", TZ).toISOString(), endsAt: zonedTimeToUtc(DATE, "12:00", TZ).toISOString() })],
    });
    assert.deepEqual(times(slots), ["09:00"]);
  });

  it("enforces minimum notice", () => {
    const now = zonedTimeToUtc(DATE, "08:00", TZ);
    const slots = generateSlots({ ...base, now, policy: { ...policy, minNoticeHours: 2 } });
    assert.deepEqual(times(slots), ["10:00", "10:30", "11:00"]);
  });

  it("merges 'no preference' slots, preferring the less busy practitioner", () => {
    const slots = generateSlots({ ...base, practitionerIds: ["a", "b"] });
    const busyA = [appt({ startsAt: zonedTimeToUtc(DATE, "15:00", TZ).toISOString(), endsAt: zonedTimeToUtc(DATE, "16:00", TZ).toISOString() })];
    const merged = mergeSlotsForAnyPractitioner(slots, ["a", "b"], busyA, DATE, TZ, NOW);
    assert.deepEqual(times(merged), ["09:00", "09:30", "10:00", "10:30", "11:00"]);
    assert.equal(merged[0].practitionerId, "b");
    assert.equal(merged.at(-1)!.practitionerId, "a"); // only "a" works until 12:00
  });
});

describe("hold expiry", () => {
  it("uses the hold period when the appointment is far away", () => {
    const created = new Date("2030-03-01T00:00:00Z");
    const start = new Date("2030-03-10T00:00:00Z");
    assert.equal(computeHoldExpiry(created, start, policy).toISOString(), "2030-03-02T00:00:00.000Z");
  });

  it("releases the hold before the appointment cut-off", () => {
    const created = new Date("2030-03-01T00:00:00Z");
    const start = new Date("2030-03-01T20:00:00Z");
    assert.equal(computeHoldExpiry(created, start, policy).toISOString(), "2030-03-01T08:00:00.000Z");
  });
});
