"use client";

import Link from "next/link";
import { formatDateTime, formatDuration, formatLongDate, formatTime } from "@/lib/booking/format";
import type { Appointment, AppointmentRequestResult, BookableService, PractitionerSummary } from "@/lib/booking/types";
import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Notice } from "@/components/ui/primitives";
import type { BookingDraft, Step } from "./booking-state";
import { StepShell } from "./step-shell";

type Failure = Extract<AppointmentRequestResult, { ok: false }>;

export function ReviewStep({
  draft,
  service,
  practitioners,
  headingRef,
  onBack,
  onEdit,
  onSubmit,
  submitting,
  failure,
  submitError,
}: {
  draft: BookingDraft;
  service?: BookableService;
  practitioners: PractitionerSummary[];
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onEdit: (step: Step) => void;
  onSubmit: () => void;
  submitting: boolean;
  failure?: Failure;
  submitError?: boolean;
}) {
  const slot = draft.slot!;
  const practitioner = practitioners.find((p) => p.id === slot.practitionerId);
  const d = draft.details;

  return (
    <StepShell
      headingRef={headingRef}
      title="Review your request"
      description="Please check everything looks right before sending."
      onBack={onBack}
      onNext={onSubmit}
      nextLabel={submitting ? "Sending request…" : "Send request"}
      nextBusy={submitting}
      footerNote="Your appointment is confirmed only after our team approves it."
    >
      {failure?.reason === "slot_taken" ? (
        <div className="mb-6">
          <Notice
            tone="warning"
            role="alert"
            title="That time is no longer available."
            action={
              <button type="button" className="font-medium underline" onClick={() => onEdit("time")}>
                Choose another time
              </button>
            }
          >
            {failure.message}
          </Notice>
        </div>
      ) : failure ? (
        <div className="mb-6">
          <Notice tone="danger" role="alert" title={failure.message} />
        </div>
      ) : submitError ? (
        <div className="mb-6">
          <Notice tone="danger" role="alert" title="We couldn't send your request.">
            Please try again in a moment. If it keeps happening, call us on {site.phone}. Your details are still here.
          </Notice>
        </div>
      ) : null}

      <dl className="divide-y divide-sand-300 rounded-2xl border border-sand-300 bg-white">
        <Row label="Service" onEdit={() => onEdit("service")}>
          {service?.name}
          <span className="block text-sm text-muted">
            {formatDuration(service?.durationMin ?? 0)} · {draft.mode === "home" ? "Home visit" : "In clinic"}
          </span>
        </Row>
        {draft.mode === "home" && draft.area ? (
          <Row label="Visit area" onEdit={() => onEdit("location")}>
            {draft.area.suburb} {draft.area.postcode}
          </Row>
        ) : null}
        <Row label="Physio" onEdit={() => onEdit("practitioner")}>
          {practitioner?.name}
          {draft.practitioner === "any" ? <span className="block text-sm text-muted">Assigned from “no preference”</span> : null}
        </Row>
        <Row label="Date & time" onEdit={() => onEdit("time")}>
          {formatLongDate(slot.startsAt)}
          <span className="block text-sm text-muted">
            {formatTime(slot.startsAt)} – {formatTime(slot.endsAt)}
          </span>
        </Row>
        <Row label="Your details" onEdit={() => onEdit("details")}>
          {d.firstName} {d.lastName}
          <span className="block text-sm text-muted break-all">
            {d.email} · {d.phone}
          </span>
          {draft.mode === "home" && d.address ? (
            <span className="block text-sm text-muted">
              {d.address.street}, {d.address.suburb} {d.address.postcode}
            </span>
          ) : null}
          {d.notes ? <span className="mt-1 block text-sm text-muted">Notes: {d.notes}</span> : null}
        </Row>
      </dl>
    </StepShell>
  );
}

function Row({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-5">
      <dt className="w-28 shrink-0 text-sm text-subtle sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium">{children}</dd>
      <dd className="shrink-0">
        <button type="button" onClick={onEdit} className="text-sm underline underline-offset-4 hover:text-ink">
          Edit<span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </dd>
    </div>
  );
}

export function Confirmation({
  appointment,
  service,
  practitioner,
  headingRef,
  onAnother,
}: {
  appointment: Appointment;
  service?: BookableService;
  practitioner?: PractitionerSummary;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onAnother: () => void;
}) {
  return (
    <div role="status">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-sand-200">
        <Check className="size-7" />
      </span>
      <p className="eyebrow mt-6">Request received · pending approval</p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-3 text-3xl font-semibold outline-none sm:text-4xl">
        Thanks, {appointment.client.firstName}. We&apos;ve received your request.
      </h2>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Your appointment is <strong className="text-ink">not yet confirmed</strong>. Our team will review your request
        and email you once it&apos;s approved, or suggest another time if needed.
      </p>

      <div className="mt-8 rounded-2xl border border-sand-300 bg-white p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Item label="Reference">{appointment.reference}</Item>
          <Item label="Status">
            <span className="inline-flex items-center gap-2 rounded-full bg-warning-bg px-3 py-1 text-sm text-warning">
              <span className="size-2 rounded-full bg-warning" aria-hidden="true" /> Pending approval
            </span>
          </Item>
          <Item label="Requested time">{formatDateTime(appointment.startsAt)}</Item>
          <Item label="Service">
            {service?.name} with {practitioner?.name}
          </Item>
        </dl>
      </div>

      <h3 className="mt-10 text-lg font-semibold">What happens next</h3>
      <ol className="mt-4 space-y-3">
        {[
          "We review your request, usually within one business day.",
          "You'll receive an email confirming your appointment, or suggesting an alternative time.",
          "If we can't confirm in time, the request lapses and we'll let you know so you can choose another time.",
        ].map((t, i) => (
          <li key={t} className="flex gap-4">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-sand-200 text-sm font-semibold">
              {i + 1}
            </span>
            <span className="pt-0.5 text-muted">{t}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Notice tone="info" title="Prototype">
          No email was sent. The request is stored only in this browser tab — you can see it in the{" "}
          <Link href="/admin" className="underline">
            admin prototype
          </Link>
          .
        </Notice>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/" arrow>
          Back to home
        </ButtonLink>
        <button
          type="button"
          onClick={onAnother}
          className="rounded-full px-6 py-3 font-medium underline-offset-4 hover:underline"
        >
          Make another request
        </button>
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-subtle">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}
