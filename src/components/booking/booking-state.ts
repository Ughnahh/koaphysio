import type {
  ClientDetails,
  DeliveryMode,
  PractitionerPreference,
  ServiceArea,
  TimeSlot,
} from "@/lib/booking/types";

export type Step = "service" | "location" | "practitioner" | "time" | "details" | "review";

export interface BookingDraft {
  serviceId?: string;
  mode?: DeliveryMode;
  area?: ServiceArea;
  practitioner?: PractitionerPreference;
  date?: string;
  slot?: TimeSlot;
  details: ClientDetails;
  consent: boolean;
}

export const emptyDetails: ClientDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: { street: "", suburb: "", postcode: "" },
  notes: "",
};

export const STEP_LABELS: Record<Step, string> = {
  service: "Service",
  location: "Location",
  practitioner: "Physio",
  time: "Date & time",
  details: "Your details",
  review: "Review",
};

export function stepsFor(draft: BookingDraft): Step[] {
  return draft.mode === "home"
    ? ["service", "location", "practitioner", "time", "details", "review"]
    : ["service", "practitioner", "time", "details", "review"];
}

export type Action =
  | { type: "service"; serviceId: string; mode?: DeliveryMode }
  | { type: "mode"; mode: DeliveryMode }
  | { type: "area"; area: ServiceArea }
  | { type: "practitioner"; practitioner: PractitionerPreference }
  | { type: "date"; date: string }
  | { type: "slot"; slot: TimeSlot }
  | { type: "clearSlot" }
  | { type: "details"; details: ClientDetails }
  | { type: "consent"; consent: boolean }
  | { type: "reset" };

export function reducer(state: BookingDraft, action: Action): BookingDraft {
  switch (action.type) {
    // Changing an earlier choice clears the choices that depend on it.
    case "service":
      return {
        ...state,
        serviceId: action.serviceId,
        mode: action.mode,
        practitioner: undefined,
        date: undefined,
        slot: undefined,
      };
    case "mode":
      return { ...state, mode: action.mode, date: undefined, slot: undefined };
    case "area":
      return {
        ...state,
        area: action.area,
        date: undefined,
        slot: undefined,
        details: {
          ...state.details,
          address: {
            street: state.details.address?.street ?? "",
            suburb: action.area.suburb,
            postcode: action.area.postcode,
          },
        },
      };
    case "practitioner":
      return { ...state, practitioner: action.practitioner, date: undefined, slot: undefined };
    case "date":
      return { ...state, date: action.date, slot: undefined };
    case "slot":
      return { ...state, slot: action.slot };
    case "clearSlot":
      return { ...state, slot: undefined };
    case "details":
      return { ...state, details: action.details };
    case "consent":
      return { ...state, consent: action.consent };
    case "reset":
      return { details: emptyDetails, consent: false };
  }
}
