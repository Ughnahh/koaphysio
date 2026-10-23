"use client";

import Link from "next/link";
import { useState } from "react";
import type { ClientDetails } from "@/lib/booking/types";
import { type FieldErrors, LIMITS, validateClientDetails } from "@/lib/booking/validation";
import { TextArea, TextField } from "@/components/ui/fields";
import { Alert } from "@/components/ui/icons";
import { Notice } from "@/components/ui/primitives";
import type { Action, BookingDraft } from "./booking-state";
import { StepShell } from "./step-shell";

export function DetailsStep({
  draft,
  dispatch,
  headingRef,
  onNext,
  onBack,
  serverErrors,
}: {
  draft: BookingDraft;
  dispatch: React.Dispatch<Action>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
  onBack: () => void;
  serverErrors?: FieldErrors;
}) {
  const [errors, setErrors] = useState<FieldErrors>(serverErrors ?? {});
  const isHome = draft.mode === "home";
  const d = draft.details;
  const address = d.address ?? { street: "", suburb: "", postcode: "" };

  const update = (patch: Partial<ClientDetails>) => dispatch({ type: "details", details: { ...d, ...patch } });
  const field = (key: "firstName" | "lastName" | "email" | "phone" | "notes") => (value: string) => update({ [key]: value });

  function submit() {
    const found = validateClientDetails(d, { requireAddress: isHome });
    if (!draft.consent) found.consent = "Please confirm you've read the collection notice.";
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onNext();
      return;
    }
    const first = Object.keys(found)[0];
    document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  const errorCount = Object.keys(errors).length;

  return (
    <StepShell
      headingRef={headingRef}
      title="Your details"
      description="We'll use these details to confirm your appointment."
      onBack={onBack}
      onNext={submit}
      nextLabel="Review request"
    >
      {errorCount ? (
        <div className="mb-8">
          <Notice tone="danger" role="alert" title={`Please check ${errorCount === 1 ? "1 field" : `${errorCount} fields`}.`} />
        </div>
      ) : null}

      <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-5 sm:grid-cols-2">
        <TextField label="First name" name="firstName" autoComplete="given-name" value={d.firstName} onChange={field("firstName")} error={errors.firstName} required maxLength={LIMITS.name} />
        <TextField label="Last name" name="lastName" autoComplete="family-name" value={d.lastName} onChange={field("lastName")} error={errors.lastName} required maxLength={LIMITS.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" value={d.email} onChange={field("email")} error={errors.email} required maxLength={LIMITS.email} />
        <TextField label="Mobile or phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={field("phone")} error={errors.phone} required />

        {isHome ? (
          <fieldset className="grid gap-5 sm:col-span-2 sm:grid-cols-6">
            <legend className="mb-1 text-lg font-semibold sm:col-span-6">Home visit address</legend>
            <TextField
              label="Street address"
              name="street"
              autoComplete="address-line1"
              value={address.street}
              onChange={(v) => update({ address: { ...address, street: v } })}
              error={errors.street}
              required
              maxLength={LIMITS.street}
              className="sm:col-span-6"
            />
            <TextField
              label="Suburb"
              name="suburb"
              autoComplete="address-level2"
              value={address.suburb}
              onChange={(v) => update({ address: { ...address, suburb: v } })}
              error={errors.suburb}
              required
              className="sm:col-span-4"
              hint="From the service area you selected."
            />
            <TextField
              label="Postcode"
              name="postcode"
              inputMode="numeric"
              autoComplete="postal-code"
              value={address.postcode}
              onChange={(v) => update({ address: { ...address, postcode: v } })}
              error={errors.postcode}
              required
              maxLength={4}
              className="sm:col-span-2"
            />
          </fieldset>
        ) : null}

        <TextArea
          label="Anything we should know? (optional)"
          name="notes"
          value={d.notes ?? ""}
          onChange={field("notes")}
          error={errors.notes}
          maxLength={LIMITS.notes}
          rows={3}
          hint="For example access instructions, or if you're booking for someone else. Please don't include detailed medical information — we'll discuss that at your appointment."
          className="sm:col-span-2"
        />

        <div className="sm:col-span-2">
          <div className="rounded-2xl bg-sand-50 p-5 text-sm text-muted">
            <p className="font-semibold text-ink">Collection notice</p>
            <p className="mt-1.5">
              Koa Physiotherapy collects these details to respond to your request and arrange your care. They
              won&apos;t be used for marketing. See our{" "}
              <Link href="/privacy" className="underline underline-offset-2" target="_blank">
                privacy policy
              </Link>{" "}
              for how we handle your information. <em>(Placeholder wording — to be reviewed.)</em>
            </p>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="consent"
              checked={draft.consent}
              onChange={(e) => dispatch({ type: "consent", consent: e.target.checked })}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
              className="mt-0.5 size-5 shrink-0 accent-ink"
            />
            <span>I&apos;ve read the collection notice and agree to Koa contacting me about this request.</span>
          </label>
          {errors.consent ? (
            <p id="consent-error" className="field-error">
              <Alert className="mt-0.5 size-4 shrink-0" />
              {errors.consent}
            </p>
          ) : null}
        </div>
        {/* Lets Enter submit the form; the visible button lives in the step footer. */}
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </StepShell>
  );
}
