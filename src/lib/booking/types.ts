/**
 * Booking domain types.
 *
 * Shared by the UI, the mock client and (in Phase 2) the real backend.
 * Keep this file free of framework imports.
 */

export type PractitionerId = string;
export type ServiceId = string;

/** Where the appointment takes place. */
export type DeliveryMode = "clinic" | "home";

export type AppointmentStatus =
  | "pending" // requested by a client, holding the slot until approved or expired
  | "offered" // admin proposed an alternative time, awaiting the client's response
  | "approved"
  | "declined"
  | "expired" // pending/offered hold lapsed without a decision
  | "cancelled"
  | "completed"
  | "no_show";

export interface PractitionerSummary {
  id: PractitionerId;
  slug: string;
  name: string;
  role: string;
}

export interface BookableService {
  id: ServiceId;
  slug: string;
  name: string;
  summary: string;
  durationMin: number;
  /** Buffer after each appointment (notes, cleaning, reset). */
  bufferAfterMin: number;
  modes: DeliveryMode[];
  practitionerIds: PractitionerId[];
  active: boolean;
}

/** Recurring weekly working hours. Times are local to the clinic time zone. */
export interface WeeklyHours {
  id: string;
  practitionerId: PractitionerId;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  modes: DeliveryMode[];
}

export type ExceptionKind = "leave" | "blocked" | "break";

/** One-off unavailable time: leave, public holidays, training, breaks. */
export interface AvailabilityException {
  id: string;
  practitionerId: PractitionerId;
  startsAt: string; // ISO
  endsAt: string; // ISO
  kind: ExceptionKind;
  note?: string;
}

export interface ServiceArea {
  id: string;
  suburb: string;
  postcode: string;
  zone: string;
  /** Travel time added before and after a home visit in this area. */
  travelBufferMin: number;
}

export interface ClientAddress {
  street: string;
  suburb: string;
  postcode: string;
}

export interface ClientDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: ClientAddress;
  /** Optional, non-clinical notes (e.g. access instructions). */
  notes?: string;
}

export interface Appointment {
  id: string;
  /** Short human-friendly reference shown to the client. */
  reference: string;
  practitionerId: PractitionerId;
  serviceId: ServiceId;
  mode: DeliveryMode;
  serviceAreaId?: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  preBufferMin: number;
  postBufferMin: number;
  status: AppointmentStatus;
  /** When a pending/offered hold lapses. */
  expiresAt: string | null;
  client: ClientDetails;
  createdAt: string; // ISO
  /** For "offered" appointments: the original request they replace. */
  parentId?: string;
  adminNote?: string;
}

export interface TimeSlot {
  practitionerId: PractitionerId;
  startsAt: string; // ISO
  endsAt: string; // ISO
}

export interface BookingPolicy {
  /** IANA time zone used for working hours and display. */
  timeZone: string;
  slotIntervalMin: number;
  /** Earliest bookable time, measured from now. */
  minNoticeHours: number;
  /** How far ahead clients can request. */
  horizonDays: number;
  /** How long a pending request holds its slot… */
  pendingHoldHours: number;
  /** …but never later than this many hours before the appointment starts. */
  pendingCutoffHoursBeforeStart: number;
}

export type PractitionerPreference = PractitionerId | "any";

export interface AvailabilityQuery {
  serviceId: ServiceId;
  mode: DeliveryMode;
  practitioner: PractitionerPreference;
  /** Local date "YYYY-MM-DD" in the policy time zone. */
  date: string;
  serviceAreaId?: string;
}

export interface DateAvailability {
  date: string;
  slotCount: number;
}

export interface AppointmentRequestInput {
  serviceId: ServiceId;
  mode: DeliveryMode;
  practitioner: PractitionerPreference;
  startsAt: string; // ISO
  serviceAreaId?: string;
  client: ClientDetails;
  consent: boolean;
  /** Prevents duplicate requests from double-clicks or retries. */
  idempotencyKey: string;
}

export type RequestFailureReason = "slot_taken" | "invalid" | "outside_area" | "unavailable";

export type AppointmentRequestResult =
  | { ok: true; appointment: Appointment }
  | {
      ok: false;
      reason: RequestFailureReason;
      message: string;
      fieldErrors?: Record<string, string>;
    };

export type AdminAction =
  | { type: "approve" }
  | { type: "decline"; note?: string }
  | { type: "cancel"; note?: string }
  | { type: "complete" }
  | { type: "no_show" }
  | { type: "propose_alternative"; startsAt: string; note?: string }
  | { type: "reschedule"; startsAt: string };

export type AdminActionResult =
  | { ok: true; appointment: Appointment; created?: Appointment }
  | { ok: false; message: string };
