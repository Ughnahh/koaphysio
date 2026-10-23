/**
 * FICTIONAL demo data for the Phase 1 prototype.
 *
 * All clients are invented. Phone numbers use ACMA's reserved fictional
 * range (0491 570 xxx) and emails use example.com. Appointments are generated
 * relative to "today" so the calendar always has something to show.
 */
import { services } from "@/content/services";
import { serviceAreas } from "@/content/service-areas";
import { team } from "@/content/team";
import { BOOKING_POLICY } from "../policy";
import { addDays, toDateKey, weekdayOf, zonedTimeToUtc } from "../rules";
import type {
  Appointment,
  AppointmentStatus,
  AvailabilityException,
  BookableService,
  ClientDetails,
  DeliveryMode,
  PractitionerSummary,
  WeeklyHours,
} from "../types";

const tz = BOOKING_POLICY.timeZone;

export function seedServices(): BookableService[] {
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    summary: s.summary,
    durationMin: s.durationMin,
    bufferAfterMin: s.bufferAfterMin,
    modes: [...s.modes],
    practitionerIds: [...s.practitionerIds],
    active: true,
  }));
}

export function seedPractitioners(): PractitionerSummary[] {
  return team.map((m) => ({ id: m.id, slug: m.slug, name: m.name, role: m.role }));
}

const BOTH: DeliveryMode[] = ["clinic", "home"];

export function seedWeeklyHours(): WeeklyHours[] {
  const rows: Omit<WeeklyHours, "id">[] = [];
  for (const weekday of [1, 2, 3, 4, 5]) {
    rows.push({ practitionerId: "prac-alyssa", weekday, start: "08:00", end: "12:00", modes: BOTH });
    rows.push({ practitionerId: "prac-alyssa", weekday, start: "13:00", end: "17:00", modes: BOTH });
  }
  for (const weekday of [1, 2, 4, 5]) {
    rows.push({ practitionerId: "prac-alma", weekday, start: "08:30", end: "12:30", modes: BOTH });
    rows.push({ practitionerId: "prac-alma", weekday, start: "13:30", end: "16:30", modes: ["home"] });
  }
  rows.push({ practitionerId: "prac-alma", weekday: 6, start: "09:00", end: "12:00", modes: ["clinic"] });
  return rows.map((r, i) => ({ ...r, id: `wh-${i + 1}` }));
}

const FICTIONAL_CLIENTS: ClientDetails[] = [
  { firstName: "Harper", lastName: "Quinlan", email: "harper.q@example.com", phone: "0491 570 006" },
  { firstName: "Theo", lastName: "Marchetti", email: "theo.m@example.com", phone: "0491 570 156" },
  { firstName: "Ivy", lastName: "Okonkwo", email: "ivy.o@example.com", phone: "0491 570 157" },
  { firstName: "Ruben", lastName: "Castellano", email: "ruben.c@example.com", phone: "0491 570 158" },
  { firstName: "Mabel", lastName: "Fairweather", email: "mabel.f@example.com", phone: "0491 570 159" },
  { firstName: "Kofi", lastName: "Lindqvist", email: "kofi.l@example.com", phone: "0491 570 110" },
  { firstName: "Elsie", lastName: "Thornbury", email: "elsie.t@example.com", phone: "0491 570 313" },
  { firstName: "Arjun", lastName: "Whitcombe", email: "arjun.w@example.com", phone: "0491 570 737" },
  { firstName: "Noor", lastName: "Haddad-Price", email: "noor.h@example.com", phone: "0491 571 266" },
  { firstName: "Wren", lastName: "Abernethy", email: "wren.a@example.com", phone: "0491 571 491" },
  { firstName: "Felix", lastName: "Oyelaran", email: "felix.o@example.com", phone: "0491 571 804" },
  { firstName: "Clementine", lastName: "Vos", email: "clem.v@example.com", phone: "0491 572 549" },
];

interface Spec {
  day: number; // business days from today
  time: string;
  prac: "prac-alyssa" | "prac-alma";
  svc: string;
  mode: DeliveryMode;
  status: AppointmentStatus;
  client: number;
  areaId?: string;
  createdHoursAgo?: number;
  note?: string;
}

/** Move `n` business days (Mon–Fri) from `dateKey`; negative goes backwards. */
function businessDay(dateKey: string, n: number): string {
  const step = n < 0 ? -1 : 1;
  let date = dateKey;
  let remaining = Math.abs(n);
  while (remaining > 0) {
    date = addDays(date, step);
    if (weekdayOf(date) !== 0 && weekdayOf(date) !== 6) remaining--;
  }
  return date;
}

const SPECS: Spec[] = [
  // Past
  { day: -6, time: "09:00", prac: "prac-alyssa", svc: "svc-msk", mode: "clinic", status: "completed", client: 0 },
  { day: -5, time: "10:30", prac: "prac-alma", svc: "svc-aged", mode: "home", status: "completed", client: 4, areaId: "area-02" },
  { day: -4, time: "14:00", prac: "prac-alyssa", svc: "svc-strength", mode: "clinic", status: "no_show", client: 5 },
  { day: -3, time: "09:30", prac: "prac-alma", svc: "svc-postop", mode: "home", status: "completed", client: 6, areaId: "area-05" },
  { day: -2, time: "11:00", prac: "prac-alyssa", svc: "svc-msk", mode: "clinic", status: "cancelled", client: 7, note: "Client unwell" },
  { day: -1, time: "13:00", prac: "prac-alyssa", svc: "svc-postop", mode: "home", status: "completed", client: 8, areaId: "area-03" },
  // Upcoming, confirmed
  { day: 1, time: "08:00", prac: "prac-alyssa", svc: "svc-msk", mode: "clinic", status: "approved", client: 1 },
  { day: 1, time: "10:00", prac: "prac-alma", svc: "svc-aged", mode: "home", status: "approved", client: 4, areaId: "area-02" },
  { day: 2, time: "09:00", prac: "prac-alyssa", svc: "svc-strength", mode: "clinic", status: "approved", client: 9 },
  { day: 2, time: "13:30", prac: "prac-alma", svc: "svc-postop", mode: "home", status: "approved", client: 6, areaId: "area-05" },
  { day: 3, time: "14:00", prac: "prac-alyssa", svc: "svc-postop", mode: "home", status: "approved", client: 8, areaId: "area-03" },
  { day: 4, time: "08:30", prac: "prac-alma", svc: "svc-msk", mode: "clinic", status: "approved", client: 10 },
  { day: 6, time: "11:00", prac: "prac-alyssa", svc: "svc-msk", mode: "clinic", status: "approved", client: 0 },
  // Awaiting a decision
  { day: 2, time: "15:00", prac: "prac-alyssa", svc: "svc-msk", mode: "clinic", status: "pending", client: 2, createdHoursAgo: 3 },
  { day: 3, time: "09:30", prac: "prac-alma", svc: "svc-aged", mode: "home", status: "pending", client: 11, areaId: "area-07", createdHoursAgo: 20 },
  { day: 5, time: "10:00", prac: "prac-alyssa", svc: "svc-strength", mode: "clinic", status: "pending", client: 3, createdHoursAgo: 1 },
  { day: 7, time: "13:30", prac: "prac-alma", svc: "svc-postop", mode: "home", status: "offered", client: 7, areaId: "area-04", createdHoursAgo: 5, note: "Alternative offered: original 1:30pm the day before" },
  // Closed requests
  { day: 3, time: "16:00", prac: "prac-alyssa", svc: "svc-msk", mode: "clinic", status: "declined", client: 5, createdHoursAgo: 30, note: "Outside clinic hours for this service" },
  { day: 4, time: "11:00", prac: "prac-alma", svc: "svc-aged", mode: "home", status: "expired", client: 9, areaId: "area-09", createdHoursAgo: 40 },
];

const HOUR = 3_600_000;

export function seedAppointments(now: Date): Appointment[] {
  const today = toDateKey(now, tz);
  const serviceById = new Map(seedServices().map((s) => [s.id, s]));

  return SPECS.map((spec, i) => {
    const date = businessDay(today, spec.day);
    const svc = serviceById.get(spec.svc)!;
    const start = zonedTimeToUtc(date, spec.time, tz);
    const end = new Date(start.getTime() + svc.durationMin * 60_000);
    const area = serviceAreas.find((a) => a.id === spec.areaId);
    const travel = spec.mode === "home" ? (area?.travelBufferMin ?? 30) : 0;
    const created = new Date(
      spec.createdHoursAgo !== undefined
        ? now.getTime() - spec.createdHoursAgo * HOUR
        : start.getTime() - 7 * 24 * HOUR,
    );
    const isHold = spec.status === "pending" || spec.status === "offered";
    const client = FICTIONAL_CLIENTS[spec.client];

    return {
      id: `appt-${String(i + 1).padStart(3, "0")}`,
      reference: `KOA-${(4821 + i * 37).toString(36).toUpperCase()}`,
      practitionerId: spec.prac,
      serviceId: spec.svc,
      mode: spec.mode,
      serviceAreaId: area?.id,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      preBufferMin: travel,
      postBufferMin: svc.bufferAfterMin + travel,
      status: spec.status,
      expiresAt: isHold
        ? new Date(Math.min(created.getTime() + 24 * HOUR, start.getTime() - 12 * HOUR)).toISOString()
        : null,
      client: area
        ? {
            ...client,
            address: { street: `${12 + i} Example Street`, suburb: area.suburb, postcode: area.postcode },
          }
        : client,
      createdAt: created.toISOString(),
      adminNote: spec.note,
    };
  });
}

export function seedExceptions(now: Date): AvailabilityException[] {
  const today = toDateKey(now, tz);
  const leaveStart = businessDay(today, 10);
  const pdDay = businessDay(today, 2);
  return [
    {
      id: "ex-1",
      practitionerId: "prac-alma",
      startsAt: zonedTimeToUtc(leaveStart, "00:00", tz).toISOString(),
      endsAt: zonedTimeToUtc(addDays(leaveStart, 3), "00:00", tz).toISOString(),
      kind: "leave",
      note: "Annual leave",
    },
    {
      id: "ex-2",
      practitionerId: "prac-alyssa",
      startsAt: zonedTimeToUtc(pdDay, "08:00", tz).toISOString(),
      endsAt: zonedTimeToUtc(pdDay, "09:00", tz).toISOString(),
      kind: "blocked",
      note: "Team meeting",
    },
  ];
}
