/**
 * The seam between the UI and the booking backend.
 *
 * Phase 1 ships a mock implementation (./mock). Phase 2 replaces it with an
 * implementation backed by server actions and Postgres, without changing any
 * UI component: components only ever call `getBookingClient()` /
 * `getAdminClient()`.
 */
import type {
  AdminAction,
  AdminActionResult,
  Appointment,
  AppointmentRequestInput,
  AppointmentRequestResult,
  AvailabilityException,
  AvailabilityQuery,
  BookableService,
  DateAvailability,
  PractitionerSummary,
  ServiceArea,
  TimeSlot,
  WeeklyHours,
} from "./types";
import { createMockClient, resetMockState } from "./mock/mock-client";

/** Public, unauthenticated operations used by the booking flow. */
export interface BookingClient {
  listServices(): Promise<BookableService[]>;
  listPractitioners(): Promise<PractitionerSummary[]>;
  searchServiceAreas(query: string): Promise<ServiceArea[]>;
  getDateAvailability(
    query: Omit<AvailabilityQuery, "date">,
    fromDate: string,
    days: number,
  ): Promise<DateAvailability[]>;
  getAvailability(query: AvailabilityQuery): Promise<TimeSlot[]>;
  requestAppointment(input: AppointmentRequestInput): Promise<AppointmentRequestResult>;
}

/** Operations that will require an authenticated administrator in Phase 2. */
export interface AdminClient {
  listAppointments(): Promise<Appointment[]>;
  applyAction(appointmentId: string, action: AdminAction): Promise<AdminActionResult>;
  listServices(): Promise<BookableService[]>;
  updateService(service: BookableService): Promise<BookableService>;
  listPractitioners(): Promise<PractitionerSummary[]>;
  listWeeklyHours(): Promise<WeeklyHours[]>;
  saveWeeklyHours(practitionerId: string, hours: WeeklyHours[]): Promise<WeeklyHours[]>;
  listExceptions(): Promise<AvailabilityException[]>;
  addException(exception: Omit<AvailabilityException, "id">): Promise<AvailabilityException>;
  removeException(id: string): Promise<void>;
  listServiceAreas(): Promise<ServiceArea[]>;
}

let mock: ReturnType<typeof createMockClient> | undefined;

function instance() {
  mock ??= createMockClient();
  return mock;
}

export function getBookingClient(): BookingClient {
  return instance().booking;
}

export function getAdminClient(): AdminClient {
  return instance().admin;
}

/** Prototype only: clears demo data stored in this browser tab. */
export function resetPrototypeData(): void {
  resetMockState();
  mock = undefined;
}
