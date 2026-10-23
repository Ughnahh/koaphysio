/**
 * Pure form validation shared by the booking UI and (later) the server.
 * The server must always re-validate; client-side checks are for UX only.
 */
import type { ClientDetails } from "./types";

export type FieldErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalisePhone(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

/** Australian mobile or landline, local (0X…) or international (+61…). */
export function isValidAustralianPhone(value: string): boolean {
  return /^(?:\+61|0)[2-478]\d{8}$/.test(normalisePhone(value));
}

export function isValidPostcode(value: string): boolean {
  return /^\d{4}$/.test(value.trim());
}

export const LIMITS = {
  name: 60,
  email: 120,
  street: 120,
  notes: 500,
} as const;

export function validateClientDetails(
  details: ClientDetails,
  options: { requireAddress: boolean },
): FieldErrors {
  const errors: FieldErrors = {};
  const first = details.firstName.trim();
  const last = details.lastName.trim();

  if (!first) errors.firstName = "Please enter your first name.";
  else if (first.length > LIMITS.name) errors.firstName = "First name is too long.";

  if (!last) errors.lastName = "Please enter your last name.";
  else if (last.length > LIMITS.name) errors.lastName = "Last name is too long.";

  const email = details.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > LIMITS.email || !EMAIL.test(email))
    errors.email = "Please enter a valid email address, e.g. name@example.com.";

  if (!details.phone.trim()) errors.phone = "Please enter a phone number.";
  else if (!isValidAustralianPhone(details.phone))
    errors.phone = "Please enter a valid Australian phone number, e.g. 0412 345 678.";

  if (options.requireAddress) {
    const a = details.address;
    if (!a?.street.trim()) errors.street = "Please enter the street address for the home visit.";
    else if (a.street.length > LIMITS.street) errors.street = "Street address is too long.";
    if (!a?.suburb.trim()) errors.suburb = "Please enter the suburb.";
    if (!a?.postcode.trim()) errors.postcode = "Please enter the postcode.";
    else if (!isValidPostcode(a.postcode)) errors.postcode = "Postcode should be 4 digits.";
  }

  if (details.notes && details.notes.length > LIMITS.notes)
    errors.notes = `Please keep notes under ${LIMITS.notes} characters.`;

  return errors;
}

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function validateContactMessage(input: ContactMessage): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.name.trim()) errors.name = "Please enter your name.";
  if (!input.email.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL.test(input.email.trim())) errors.email = "Please enter a valid email address.";
  if (input.phone.trim() && !isValidAustralianPhone(input.phone))
    errors.phone = "Please enter a valid Australian phone number.";
  if (!input.message.trim()) errors.message = "Please enter a message.";
  else if (input.message.length > 1000) errors.message = "Please keep your message under 1000 characters.";
  return errors;
}
