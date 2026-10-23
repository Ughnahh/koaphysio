"use client";

import { useState } from "react";
import { getAdminClient } from "@/lib/booking/client";
import { formatDateTime } from "@/lib/booking/format";
import { BOOKING_POLICY } from "@/lib/booking/policy";
import { toDateKey, zonedTimeToUtc } from "@/lib/booking/rules";
import type { AvailabilityException, DeliveryMode, ExceptionKind, WeeklyHours } from "@/lib/booking/types";
import { useAsyncData } from "@/lib/use-async";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "@/components/ui/icons";
import { Notice } from "@/components/ui/primitives";
import { LoadError } from "@/components/booking/step-shell";
import { AdminPageHeader } from "./admin-shell";

const tz = BOOKING_POLICY.timeZone;
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEKDAY_INDEX = [1, 2, 3, 4, 5, 6, 0];
const KIND_LABEL: Record<ExceptionKind, string> = { leave: "Leave", blocked: "Unavailable", break: "Break" };

export function AvailabilityView() {
  const [version, setVersion] = useState(0);
  const state = useAsyncData(`availability:${version}`, async () => {
    const c = getAdminClient();
    const [practitioners, hours, exceptions] = await Promise.all([
      c.listPractitioners(),
      c.listWeeklyHours(),
      c.listExceptions(),
    ]);
    return { practitioners, hours, exceptions };
  }, { keepPrevious: true });
  const [selected, setSelected] = useState<string>();

  if (state.loading && !state.data) return <div className="skeleton h-[36rem] rounded-3xl" aria-busy="true" aria-label="Loading availability" />;
  if (state.error || !state.data) return <LoadError message="We couldn't load availability." onRetry={state.retry} />;

  const { practitioners, hours, exceptions } = state.data;
  const practitionerId = selected ?? practitioners[0]?.id;
  const reload = () => setVersion((v) => v + 1);

  return (
    <>
      <AdminPageHeader
        title="Availability"
        description="Set regular working hours and add leave, breaks or unavailable time."
      />

      <div role="tablist" aria-label="Physio" className="mb-8 inline-flex gap-1 rounded-full bg-sand-200 p-1">
        {practitioners.map((p) => (
          <button
            key={p.id}
            role="tab"
            type="button"
            aria-selected={p.id === practitionerId}
            onClick={() => setSelected(p.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium ${p.id === practitionerId ? "bg-white shadow-sm" : "text-ink-soft"}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="grid gap-8 xl:grid-cols-[3fr_2fr]">
        {/* Remount the editor when switching practitioner. */}
        <WeeklyHoursEditor
          key={practitionerId}
          practitionerId={practitionerId}
          initial={hours.filter((h) => h.practitionerId === practitionerId)}
          onSaved={reload}
        />
        <ExceptionsPanel
          key={`ex-${practitionerId}`}
          practitionerId={practitionerId}
          exceptions={exceptions.filter((e) => e.practitionerId === practitionerId)}
          onChanged={reload}
        />
      </div>
    </>
  );
}

type Row = Omit<WeeklyHours, "practitionerId">;

function WeeklyHoursEditor({
  practitionerId,
  initial,
  onSaved,
}: {
  practitionerId: string;
  initial: WeeklyHours[];
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string }>();

  const update = (id: string, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  function validate(): string | undefined {
    for (const r of rows) {
      if (r.start >= r.end) return `${WEEKDAYS[WEEKDAY_INDEX.indexOf(r.weekday)]}: finish time must be after start time.`;
      if (r.modes.length === 0) return `${WEEKDAYS[WEEKDAY_INDEX.indexOf(r.weekday)]}: choose clinic and/or home visits.`;
    }
    for (const day of WEEKDAY_INDEX) {
      const ranges = rows.filter((r) => r.weekday === day).sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 1; i < ranges.length; i++) {
        if (ranges[i].start < ranges[i - 1].end) return `${WEEKDAYS[WEEKDAY_INDEX.indexOf(day)]}: time ranges overlap.`;
      }
    }
  }

  async function save() {
    const problem = validate();
    if (problem) {
      setMessage({ tone: "danger", text: problem });
      return;
    }
    setSaving(true);
    try {
      await getAdminClient().saveWeeklyHours(practitionerId, rows.map((r) => ({ ...r, practitionerId })));
      setMessage({ tone: "success", text: "Working hours saved. New availability applies to future requests." });
      onSaved();
    } catch {
      setMessage({ tone: "danger", text: "Couldn't save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="hours-h" className="rounded-3xl bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 id="hours-h" className="text-lg font-semibold">
          Weekly hours
        </h2>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save hours"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted">Gaps between ranges act as breaks (e.g. lunch). Times are {tz.replace("Australia/", "")} time.</p>

      {message ? (
        <div className="mt-4">
          <Notice tone={message.tone} role={message.tone === "danger" ? "alert" : "status"} title={message.text} />
        </div>
      ) : null}

      <ul className="mt-6 divide-y divide-sand-200">
        {WEEKDAYS.map((label, i) => {
          const weekday = WEEKDAY_INDEX[i];
          const dayRows = rows.filter((r) => r.weekday === weekday).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <li key={label} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start">
              <p className="w-28 shrink-0 pt-2 font-medium">{label}</p>
              <div className="flex-1 space-y-2">
                {dayRows.length === 0 ? <p className="pt-2 text-sm text-subtle">Not working</p> : null}
                {dayRows.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`${r.id}-start`}>
                      {label} start
                    </label>
                    <input id={`${r.id}-start`} type="time" step={900} value={r.start} onChange={(e) => update(r.id, { start: e.target.value })} className="field-input !w-32 !py-2" />
                    <span className="text-subtle" aria-hidden="true">–</span>
                    <label className="sr-only" htmlFor={`${r.id}-end`}>
                      {label} finish
                    </label>
                    <input id={`${r.id}-end`} type="time" step={900} value={r.end} onChange={(e) => update(r.id, { end: e.target.value })} className="field-input !w-32 !py-2" />
                    {(["clinic", "home"] as DeliveryMode[]).map((m) => (
                      <label key={m} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          checked={r.modes.includes(m)}
                          onChange={(e) =>
                            update(r.id, { modes: e.target.checked ? [...r.modes, m] : r.modes.filter((x) => x !== m) })
                          }
                          className="size-4 accent-ink"
                        />
                        {m === "clinic" ? "Clinic" : "Home"}
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                      className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-sand-100 hover:text-danger"
                    >
                      <Trash className="size-4" />
                      <span className="sr-only">Remove {label} {r.start}–{r.end}</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setRows((rs) => [
                      ...rs,
                      { id: `new-${weekday}-${rs.length}-${Date.now()}`, weekday, start: "09:00", end: "12:00", modes: ["clinic", "home"] },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                >
                  <Plus className="size-4" /> Add hours<span className="sr-only"> on {label}</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ExceptionsPanel({
  practitionerId,
  exceptions,
  onChanged,
}: {
  practitionerId: string;
  exceptions: AvailabilityException[];
  onChanged: () => void;
}) {
  const [today] = useState(() => toDateKey(new Date(), tz));
  const [kind, setKind] = useState<ExceptionKind>("leave");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const starts = zonedTimeToUtc(startDate, allDay ? "00:00" : startTime, tz);
    const endDay = allDay ? toDateKey(new Date(zonedTimeToUtc(endDate, "12:00", tz).getTime() + 864e5), tz) : endDate;
    const ends = zonedTimeToUtc(endDay, allDay ? "00:00" : endTime, tz);
    if (ends <= starts) {
      setError("The end must be after the start.");
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      await getAdminClient().addException({
        practitionerId,
        kind,
        startsAt: starts.toISOString(),
        endsAt: ends.toISOString(),
        note: note.trim() || undefined,
      });
      setNote("");
      onChanged();
    } catch {
      setError("Couldn't add. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await getAdminClient().removeException(id);
    onChanged();
  }

  const sorted = [...exceptions].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return (
    <section aria-labelledby="ex-h" className="space-y-6">
      <div className="rounded-3xl bg-white p-6">
        <h2 id="ex-h" className="text-lg font-semibold">
          Leave & unavailable time
        </h2>
        {sorted.length === 0 ? (
          <p className="mt-4 text-sm text-subtle">No leave or blocked time scheduled.</p>
        ) : (
          <ul className="mt-4 divide-y divide-sand-200">
            {sorted.map((ex) => (
              <li key={ex.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {KIND_LABEL[ex.kind]}
                    {ex.note ? ` — ${ex.note}` : ""}
                  </p>
                  <p className="text-muted">
                    {formatDateTime(ex.startsAt)} → {formatDateTime(ex.endsAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(ex.id)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-sand-100 hover:text-danger"
                >
                  <Trash className="size-4" />
                  <span className="sr-only">Remove {KIND_LABEL[ex.kind]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={add} className="space-y-4 rounded-3xl bg-white p-6">
        <h3 className="font-semibold">Add time off</h3>
        {error ? <Notice tone="danger" role="alert" title={error} /> : null}
        <div>
          <label htmlFor="ex-kind" className="field-label">Type</label>
          <select id="ex-kind" value={kind} onChange={(e) => setKind(e.target.value as ExceptionKind)} className="field-input">
            <option value="leave">Leave</option>
            <option value="blocked">Unavailable (meeting, training…)</option>
            <option value="break">Break</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="size-4 accent-ink" />
          All day
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="ex-sd" className="field-label">From</label>
            <input id="ex-sd" type="date" value={startDate} min={today} onChange={(e) => setStartDate(e.target.value)} className="field-input" />
            {!allDay ? (
              <input aria-label="Start time" type="time" step={900} value={startTime} onChange={(e) => setStartTime(e.target.value)} className="field-input mt-2" />
            ) : null}
          </div>
          <div>
            <label htmlFor="ex-ed" className="field-label">To</label>
            <input id="ex-ed" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="field-input" />
            {!allDay ? (
              <input aria-label="End time" type="time" step={900} value={endTime} onChange={(e) => setEndTime(e.target.value)} className="field-input mt-2" />
            ) : null}
          </div>
        </div>
        <div>
          <label htmlFor="ex-note" className="field-label">Note (optional)</label>
          <input id="ex-note" value={note} onChange={(e) => setNote(e.target.value)} className="field-input" placeholder="e.g. Annual leave" />
        </div>
        <p className="text-xs text-muted">
          Existing appointments in this period aren&apos;t cancelled automatically — review them in the calendar.
        </p>
        <Button type="submit" disabled={busy}>
          <Plus className="size-4" /> Add
        </Button>
      </form>
    </section>
  );
}
