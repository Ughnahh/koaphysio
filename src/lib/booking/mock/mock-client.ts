/**
 * In-browser mock of the booking backend.
 *
 * - State lives in memory and is mirrored to sessionStorage so a request made
 *   on /book shows up in /admin during the same browser session.
 * - Responses are delayed to exercise loading states.
 * - Append `?demo=error`, `?demo=conflict`, `?demo=empty` or `?demo=slow` to a
 *   URL to preview error, slot-taken, empty and slow states.
 *
 * Nothing here is sent anywhere. Phase 2 replaces this file with a real client.
 */
import { serviceAreas as seedAreas } from "@/content/service-areas";
import type { AdminClient, BookingClient } from "../client";
import { BOOKING_POLICY } from "../policy";
import {
  addDays,
  blockedRange,
  bufferPlan,
  computeHoldExpiry,
  findConflict,
  generateSlots,
  isExpiredHold,
  mergeSlotsForAnyPractitioner,
  toDateKey,
} from "../rules";
import type {
  AdminAction,
  AdminActionResult,
  Appointment,
  AppointmentRequestInput,
  AppointmentRequestResult,
  AvailabilityException,
  AvailabilityQuery,
  BookableService,
  PractitionerSummary,
  ServiceArea,
  TimeSlot,
  WeeklyHours,
} from "../types";
import { validateClientDetails } from "../validation";
import {
  seedAppointments,
  seedExceptions,
  seedPractitioners,
  seedServices,
  seedWeeklyHours,
} from "./mock-data";

const STORAGE_KEY = "koa-prototype-state-v1";
const policy = BOOKING_POLICY;

interface State {
  services: BookableService[];
  practitioners: PractitionerSummary[];
  weeklyHours: WeeklyHours[];
  exceptions: AvailabilityException[];
  appointments: Appointment[];
  serviceAreas: ServiceArea[];
}

type DemoScenario = "error" | "conflict" | "empty" | "slow" | null;

function demoScenario(): DemoScenario {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("demo");
  return v === "error" || v === "conflict" || v === "empty" || v === "slow" ? v : null;
}

function delay(min = 250, max = 650): Promise<void> {
  const ms = demoScenario() === "slow" ? 2500 : min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeFail(): void {
  if (demoScenario() === "error") {
    throw new Error("Demo error: the booking service is unavailable.");
  }
}

function uid(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

function newReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `KOA-${out}`;
}

const clone = <T,>(value: T): T => structuredClone(value);

export function createMockClient(): { booking: BookingClient; admin: AdminClient } {
  let state: State | undefined;

  function load(): State {
    if (state) return state;
    if (typeof window !== "undefined") {
      try {
        const saved = window.sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          state = JSON.parse(saved) as State;
          return state;
        }
      } catch {
        // Storage unavailable (private mode etc.) — fall back to fresh seed data.
      }
    }
    const now = new Date();
    state = {
      services: seedServices(),
      practitioners: seedPractitioners(),
      weeklyHours: seedWeeklyHours(),
      exceptions: seedExceptions(now),
      appointments: seedAppointments(now),
      serviceAreas: clone(seedAreas),
    };
    return state;
  }

  function save(): void {
    if (typeof window === "undefined" || !state) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota/private-mode errors; the prototype still works in memory.
    }
  }

  /** Equivalent of the pg_cron sweep: mark lapsed holds as expired. */
  function sweepExpired(now: Date): void {
    const s = load();
    let changed = false;
    for (const a of s.appointments) {
      if (isExpiredHold(a, now)) {
        a.status = "expired";
        changed = true;
      }
    }
    if (changed) save();
  }

  function slotsFor(query: AvailabilityQuery, now: Date, merge = true): TimeSlot[] {
    const s = load();
    const service = s.services.find((x) => x.id === query.serviceId);
    if (!service) return [];
    const area = s.serviceAreas.find((a) => a.id === query.serviceAreaId);
    if (query.mode === "home" && !area) return [];

    const practitionerIds =
      query.practitioner === "any" ? s.practitioners.map((p) => p.id) : [query.practitioner];

    const slots = generateSlots({
      date: query.date,
      service,
      mode: query.mode,
      practitionerIds,
      weeklyHours: s.weeklyHours,
      exceptions: s.exceptions,
      appointments: s.appointments,
      policy,
      now,
      travelBufferMin: area?.travelBufferMin,
    });

    return query.practitioner === "any" && merge
      ? mergeSlotsForAnyPractitioner(
          slots,
          s.practitioners.map((p) => p.id),
          s.appointments,
          query.date,
          policy.timeZone,
          now,
        )
      : slots;
  }

  const booking: BookingClient = {
    async listServices() {
      await delay();
      maybeFail();
      return clone(load().services.filter((x) => x.active));
    },

    async listPractitioners() {
      await delay(100, 250);
      return clone(load().practitioners);
    },

    async searchServiceAreas(query) {
      await delay(150, 300);
      maybeFail();
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return clone(
        load().serviceAreas.filter(
          (a) => a.suburb.toLowerCase().includes(q) || a.postcode.startsWith(q),
        ),
      );
    },

    async getDateAvailability(query, fromDate, days) {
      await delay();
      maybeFail();
      const now = new Date();
      sweepExpired(now);
      const empty = demoScenario() === "empty";
      return Array.from({ length: days }, (_, i) => {
        const date = addDays(fromDate, i);
        return { date, slotCount: empty ? 0 : slotsFor({ ...query, date }, now).length };
      });
    },

    async getAvailability(query) {
      await delay();
      maybeFail();
      if (demoScenario() === "empty") return [];
      const now = new Date();
      sweepExpired(now);
      return slotsFor(query, now);
    },

    async requestAppointment(input: AppointmentRequestInput): Promise<AppointmentRequestResult> {
      await delay(500, 900);
      maybeFail();
      const s = load();
      const now = new Date();

      const existing = s.appointments.find((a) => a.id === `req-${input.idempotencyKey}`);
      if (existing) return { ok: true, appointment: clone(existing) };

      if (demoScenario() === "conflict") {
        return {
          ok: false,
          reason: "slot_taken",
          message: "Sorry — that time was just requested by someone else. Please choose another time.",
        };
      }

      const service = s.services.find((x) => x.id === input.serviceId && x.active);
      if (!service || !service.modes.includes(input.mode)) {
        return { ok: false, reason: "invalid", message: "That service isn't available. Please choose again." };
      }
      if (!input.consent) {
        return {
          ok: false,
          reason: "invalid",
          message: "Please confirm you've read the collection notice.",
          fieldErrors: { consent: "Please confirm to continue." },
        };
      }

      const area = s.serviceAreas.find((a) => a.id === input.serviceAreaId);
      if (input.mode === "home" && !area) {
        return {
          ok: false,
          reason: "outside_area",
          message: "We don't currently visit that area. Please contact us to discuss options.",
        };
      }

      const fieldErrors = validateClientDetails(input.client, { requireAddress: input.mode === "home" });
      if (Object.keys(fieldErrors).length) {
        return { ok: false, reason: "invalid", message: "Please check your details.", fieldErrors };
      }

      // Re-derive availability server-side; never trust the slot the browser sent.
      sweepExpired(now);
      const date = toDateKey(new Date(input.startsAt), policy.timeZone);
      const candidates = slotsFor(
        { serviceId: service.id, mode: input.mode, practitioner: input.practitioner, date, serviceAreaId: area?.id },
        now,
        false,
      ).filter((slot) => slot.startsAt === new Date(input.startsAt).toISOString());

      const buffers = bufferPlan(service, input.mode, area?.travelBufferMin);
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);

      for (const slot of candidates) {
        const draft = {
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          ...buffers,
        };
        // Mirrors the Postgres exclusion constraint.
        if (findConflict(blockedRange(draft), slot.practitionerId, s.appointments, now)) continue;

        const appointment: Appointment = {
          id: `req-${input.idempotencyKey}`,
          reference: newReference(),
          practitionerId: slot.practitionerId,
          serviceId: service.id,
          mode: input.mode,
          serviceAreaId: area?.id,
          ...draft,
          status: "pending",
          expiresAt: computeHoldExpiry(now, startsAt, policy).toISOString(),
          client: clone(input.client),
          createdAt: now.toISOString(),
        };
        s.appointments.push(appointment);
        save();
        return { ok: true, appointment: clone(appointment) };
      }

      return {
        ok: false,
        reason: "slot_taken",
        message: "Sorry — that time is no longer available. Please choose another time.",
      };
    },
  };

  function applyAction(appt: Appointment, action: AdminAction, now: Date): AdminActionResult {
    const s = load();
    const isLiveHold = (appt.status === "pending" || appt.status === "offered") && !isExpiredHold(appt, now);

    switch (action.type) {
      case "approve":
        if (!isLiveHold) return { ok: false, message: "Only live pending or offered requests can be approved." };
        appt.status = "approved";
        appt.expiresAt = null;
        return { ok: true, appointment: appt };

      case "decline":
        if (!isLiveHold) return { ok: false, message: "This request is no longer pending." };
        appt.status = "declined";
        appt.expiresAt = null;
        appt.adminNote = action.note || appt.adminNote;
        return { ok: true, appointment: appt };

      case "cancel":
        if (!["approved", "pending", "offered"].includes(appt.status))
          return { ok: false, message: "This appointment can't be cancelled." };
        appt.status = "cancelled";
        appt.expiresAt = null;
        appt.adminNote = action.note || appt.adminNote;
        return { ok: true, appointment: appt };

      case "complete":
      case "no_show":
        if (appt.status !== "approved") return { ok: false, message: "Only confirmed appointments can be closed." };
        appt.status = action.type === "complete" ? "completed" : "no_show";
        return { ok: true, appointment: appt };

      case "propose_alternative":
      case "reschedule": {
        const service = s.services.find((x) => x.id === appt.serviceId)!;
        const startsAt = new Date(action.startsAt);
        if (Number.isNaN(startsAt.getTime()) || startsAt <= now)
          return { ok: false, message: "Please choose a future date and time." };
        const endsAt = new Date(startsAt.getTime() + service.durationMin * 60_000);
        const draft = {
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          preBufferMin: appt.preBufferMin,
          postBufferMin: appt.postBufferMin,
        };
        const conflict = findConflict(blockedRange(draft), appt.practitionerId, s.appointments, now, appt.id);
        if (conflict)
          return { ok: false, message: `That time overlaps ${conflict.reference} (${conflict.status}).` };

        if (action.type === "reschedule") {
          if (appt.status !== "approved") return { ok: false, message: "Only confirmed appointments can be rescheduled." };
          Object.assign(appt, draft);
          return { ok: true, appointment: appt };
        }

        if (!isLiveHold || appt.status !== "pending")
          return { ok: false, message: "Alternatives can only be offered for pending requests." };
        const offered: Appointment = {
          ...clone(appt),
          ...draft,
          id: uid("offer"),
          reference: newReference(),
          status: "offered",
          parentId: appt.id,
          createdAt: now.toISOString(),
          expiresAt: computeHoldExpiry(now, startsAt, policy).toISOString(),
          adminNote: action.note,
        };
        appt.status = "declined";
        appt.expiresAt = null;
        appt.adminNote = `Alternative offered (${offered.reference})`;
        s.appointments.push(offered);
        return { ok: true, appointment: appt, created: offered };
      }
    }
  }

  const admin: AdminClient = {
    async listAppointments() {
      await delay();
      maybeFail();
      sweepExpired(new Date());
      return clone(load().appointments);
    },

    async applyAction(id, action) {
      await delay(300, 600);
      maybeFail();
      const now = new Date();
      sweepExpired(now);
      const appt = load().appointments.find((a) => a.id === id);
      if (!appt) return { ok: false, message: "Appointment not found." };
      const result = applyAction(appt, action, now);
      if (result.ok) save();
      return clone(result);
    },

    async listServices() {
      await delay();
      maybeFail();
      return clone(load().services);
    },

    async updateService(service) {
      await delay(200, 400);
      const s = load();
      s.services = s.services.map((x) => (x.id === service.id ? clone(service) : x));
      save();
      return clone(service);
    },

    async listPractitioners() {
      await delay(100, 250);
      return clone(load().practitioners);
    },

    async listWeeklyHours() {
      await delay();
      maybeFail();
      return clone(load().weeklyHours);
    },

    async saveWeeklyHours(practitionerId, hours) {
      await delay(300, 500);
      const s = load();
      s.weeklyHours = [
        ...s.weeklyHours.filter((h) => h.practitionerId !== practitionerId),
        ...hours.map((h) => ({ ...h, id: h.id || uid("wh"), practitionerId })),
      ];
      save();
      return clone(s.weeklyHours);
    },

    async listExceptions() {
      await delay();
      maybeFail();
      return clone(load().exceptions);
    },

    async addException(exception) {
      await delay(200, 400);
      const created = { ...exception, id: uid("ex") };
      load().exceptions.push(created);
      save();
      return clone(created);
    },

    async removeException(id) {
      await delay(200, 400);
      const s = load();
      s.exceptions = s.exceptions.filter((e) => e.id !== id);
      save();
    },

    async listServiceAreas() {
      await delay(100, 250);
      return clone(load().serviceAreas);
    },
  };

  return { booking, admin };
}

/** Clears prototype state (used by the admin "Reset demo data" button). */
export function resetMockState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
