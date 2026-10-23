"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminClient } from "@/lib/booking/client";
import { formatDateTime, formatDuration, formatLongDate, formatTime } from "@/lib/booking/format";
import { BOOKING_POLICY } from "@/lib/booking/policy";
import { toDateKey, zonedParts, zonedTimeToUtc } from "@/lib/booking/rules";
import type { AdminAction, Appointment } from "@/lib/booking/types";
import { Button } from "@/components/ui/button";
import { Close, Mail, MapPin, Phone } from "@/components/ui/icons";
import { Notice } from "@/components/ui/primitives";
import type { AdminData } from "./use-admin-data";
import { StatusBadge } from "./status-badge";

const tz = BOOKING_POLICY.timeZone;

function toLocalInput(iso: string): string {
  const p = zonedParts(new Date(iso), tz);
  return `${toDateKey(new Date(iso), tz)}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

function fromLocalInput(value: string): string {
  const [date, time] = value.split("T");
  return zonedTimeToUtc(date, time, tz).toISOString();
}

function relative(iso: string, now: number): string {
  const mins = Math.round((Date.parse(iso) - now) / 60_000);
  if (mins <= 0) return "now";
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.round(mins / 60);
  return hours < 48 ? `in ${hours} hr` : `in ${Math.round(hours / 24)} days`;
}

type Mode = null | "decline" | "alternative" | "reschedule" | "cancel";

/** Modal detail view with the admin actions available for the appointment's status. */
export function AppointmentDialog({
  appointment,
  data,
  onClose,
  onChanged,
}: {
  appointment: Appointment | null;
  data: AdminData;
  onClose: () => void;
  onChanged: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState("");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [now] = useState(() => Date.now());
  const [shownId, setShownId] = useState<string>();

  // Reset the form whenever a different appointment is opened.
  if (appointment && appointment.id !== shownId) {
    setShownId(appointment.id);
    setMode(null);
    setNote("");
    setWhen(toLocalInput(appointment.startsAt));
    setError(undefined);
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (appointment && !dialog.open) dialog.showModal();
    if (!appointment && dialog.open) dialog.close();
  }, [appointment]);

  if (!appointment) return <dialog ref={ref} onClose={onClose} />;

  const a = appointment;
  const service = data.services.find((s) => s.id === a.serviceId);
  const practitioner = data.practitioners.find((p) => p.id === a.practitionerId);
  const parent = a.parentId ? data.appointments.find((x) => x.id === a.parentId) : undefined;
  const isFuture = Date.parse(a.startsAt) > now;
  const isLiveHold = (a.status === "pending" || a.status === "offered") && (!a.expiresAt || Date.parse(a.expiresAt) > now);

  async function run(action: AdminAction, success: string) {
    setBusy(true);
    setError(undefined);
    try {
      const res = await getAdminClient().applyAction(a.id, action);
      if (res.ok) {
        onChanged(res.created ? `${success} New reference ${res.created.reference}.` : success);
        onClose();
      } else {
        setError(res.message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const name = `${a.client.firstName} ${a.client.lastName}`;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="appt-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-lg overflow-y-auto bg-sand-50 p-0 text-ink shadow-2xl backdrop:bg-ink/40 sm:rounded-l-3xl"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-sand-300 bg-sand-50 px-6 py-5">
        <div>
          <p className="text-sm text-muted">{a.reference}</p>
          <h2 id="appt-title" className="text-xl font-semibold">
            {name}
          </h2>
          <div className="mt-2">
            <StatusBadge status={a.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-10 items-center justify-center rounded-full hover:bg-sand-200"
        >
          <Close className="size-5" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {isLiveHold && a.expiresAt ? (
          <Notice tone="warning" title={`Hold expires ${relative(a.expiresAt, now)}`}>
            The slot is reserved until {formatDateTime(a.expiresAt)}. After that it is released automatically.
          </Notice>
        ) : null}

        <section aria-label="Appointment">
          <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-subtle">When</dt>
            <dd>
              <span className="font-medium">{formatLongDate(a.startsAt)}</span>
              <br />
              {formatTime(a.startsAt)} – {formatTime(a.endsAt)}
            </dd>
            <dt className="text-subtle">Service</dt>
            <dd>
              {service?.name} {service ? `(${formatDuration(service.durationMin)})` : ""}
            </dd>
            <dt className="text-subtle">Physio</dt>
            <dd>{practitioner?.name}</dd>
            <dt className="text-subtle">Location</dt>
            <dd>{a.mode === "home" ? "Home visit" : "In clinic"}</dd>
            {a.preBufferMin || a.postBufferMin ? (
              <>
                <dt className="text-subtle">Blocked</dt>
                <dd>
                  {a.preBufferMin ? `${a.preBufferMin} min travel before, ` : ""}
                  {a.postBufferMin} min after
                </dd>
              </>
            ) : null}
            <dt className="text-subtle">Requested</dt>
            <dd>{formatDateTime(a.createdAt)}</dd>
            {parent ? (
              <>
                <dt className="text-subtle">Replaces</dt>
                <dd>
                  {parent.reference} ({formatDateTime(parent.startsAt)})
                </dd>
              </>
            ) : null}
            {a.adminNote ? (
              <>
                <dt className="text-subtle">Admin note</dt>
                <dd>{a.adminNote}</dd>
              </>
            ) : null}
          </dl>
        </section>

        <section aria-label="Client" className="rounded-2xl bg-white p-5 text-sm">
          <h3 className="font-semibold">Client</h3>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2.5 break-all">
              <Mail className="size-4 shrink-0 text-subtle" /> {a.client.email}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-subtle" /> {a.client.phone}
            </li>
            {a.client.address?.street ? (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-subtle" />
                {a.client.address.street}, {a.client.address.suburb} {a.client.address.postcode}
              </li>
            ) : null}
          </ul>
          {a.client.notes ? <p className="mt-3 border-t border-sand-200 pt-3 text-muted">“{a.client.notes}”</p> : null}
        </section>

        {error ? <Notice tone="danger" role="alert" title={error} /> : null}

        {/* Secondary forms */}
        {mode ? (
          <section aria-label="Action details" className="space-y-4 rounded-2xl border border-sand-300 p-5">
            {mode === "alternative" || mode === "reschedule" ? (
              <div>
                <label htmlFor="appt-when" className="field-label">
                  {mode === "alternative" ? "Suggested time" : "New time"} ({tz.replace("Australia/", "")})
                </label>
                <input
                  id="appt-when"
                  type="datetime-local"
                  value={when}
                  step={900}
                  onChange={(e) => setWhen(e.target.value)}
                  className="field-input"
                />
                <p className="field-hint">Checked against existing bookings, including travel buffers.</p>
              </div>
            ) : null}
            {mode !== "reschedule" ? (
              <div>
                <label htmlFor="appt-note" className="field-label">
                  Note {mode === "alternative" ? "to client" : "(internal)"} — optional
                </label>
                <textarea id="appt-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="field-input" />
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {mode === "decline" ? (
                <Button variant="danger" disabled={busy} onClick={() => run({ type: "decline", note }, "Request declined.")}>
                  Confirm decline
                </Button>
              ) : mode === "cancel" ? (
                <Button variant="danger" disabled={busy} onClick={() => run({ type: "cancel", note }, "Appointment cancelled.")}>
                  Confirm cancellation
                </Button>
              ) : mode === "alternative" ? (
                <Button
                  disabled={busy || !when}
                  onClick={() => run({ type: "propose_alternative", startsAt: fromLocalInput(when), note }, "Alternative time offered.")}
                >
                  Send suggestion
                </Button>
              ) : (
                <Button
                  disabled={busy || !when}
                  onClick={() => run({ type: "reschedule", startsAt: fromLocalInput(when) }, "Appointment rescheduled.")}
                >
                  Save new time
                </Button>
              )}
              <Button variant="ghost" onClick={() => setMode(null)} disabled={busy}>
                Back
              </Button>
            </div>
          </section>
        ) : (
          <section aria-label="Actions" className="flex flex-wrap gap-2">
            {a.status === "pending" && isLiveHold ? (
              <>
                <Button disabled={busy} onClick={() => run({ type: "approve" }, "Request approved. (Prototype: no email sent.)")}>
                  Approve
                </Button>
                <Button variant="secondary" disabled={busy} onClick={() => setMode("alternative")}>
                  Suggest another time
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => setMode("decline")}>
                  Decline
                </Button>
              </>
            ) : null}
            {a.status === "offered" && isLiveHold ? (
              <>
                <Button disabled={busy} onClick={() => run({ type: "approve" }, "Marked as accepted by client.")}>
                  Client accepted (demo)
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => setMode("cancel")}>
                  Withdraw offer
                </Button>
              </>
            ) : null}
            {a.status === "approved" && isFuture ? (
              <>
                <Button variant="secondary" disabled={busy} onClick={() => setMode("reschedule")}>
                  Reschedule
                </Button>
                <Button variant="danger" disabled={busy} onClick={() => setMode("cancel")}>
                  Cancel appointment
                </Button>
              </>
            ) : null}
            {a.status === "approved" && !isFuture ? (
              <>
                <Button disabled={busy} onClick={() => run({ type: "complete" }, "Marked as completed.")}>
                  Mark completed
                </Button>
                <Button variant="secondary" disabled={busy} onClick={() => run({ type: "no_show" }, "Marked as no-show.")}>
                  Mark no-show
                </Button>
              </>
            ) : null}
            {!["pending", "offered", "approved"].includes(a.status) || ((a.status === "pending" || a.status === "offered") && !isLiveHold) ? (
              <p className="text-sm text-muted">No actions available for this {isLiveHold ? "request" : "record"}.</p>
            ) : null}
          </section>
        )}
      </div>
    </dialog>
  );
}
