"use client";

import { useState } from "react";
import { formatDateKey, formatTime } from "@/lib/booking/format";
import { BOOKING_POLICY } from "@/lib/booking/policy";
import { addDays, toDateKey, weekdayOf, zonedParts, zonedTimeToUtc } from "@/lib/booking/rules";
import type { Appointment } from "@/lib/booking/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { LoadError } from "@/components/booking/step-shell";
import { AdminPageHeader } from "./admin-shell";
import { AppointmentDialog } from "./appointment-dialog";
import { STATUS_META, StatusBadge } from "./status-badge";
import { useAdminData } from "./use-admin-data";

const tz = BOOKING_POLICY.timeZone;
const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_PX = 56;
const HIDDEN_BY_DEFAULT = new Set(["declined", "expired", "cancelled"]);

function mondayOf(dateKey: string): string {
  return addDays(dateKey, -((weekdayOf(dateKey) + 6) % 7));
}

/** Minutes since local midnight, clamped to the visible range. */
function minutesInDay(iso: string): number {
  const p = zonedParts(new Date(iso), tz);
  return p.hour * 60 + p.minute;
}

export function CalendarView() {
  const { data, initialLoading, error, retry, reload } = useAdminData();
  const [today] = useState(() => toDateKey(new Date(), tz));
  const [weekStart, setWeekStart] = useState(() => mondayOf(toDateKey(new Date(), tz)));
  const [practitioner, setPractitioner] = useState("all");
  const [showClosed, setShowClosed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (initialLoading) return <div className="skeleton h-[40rem] rounded-3xl" aria-busy="true" aria-label="Loading calendar" />;
  if (error || !data) return <LoadError message="We couldn't load the calendar." onRetry={retry} />;

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const lanes = practitioner === "all" ? data.practitioners.map((p) => p.id) : [practitioner];
  const visible = data.appointments.filter(
    (a) =>
      (practitioner === "all" || a.practitionerId === practitioner) && (showClosed || !HIDDEN_BY_DEFAULT.has(a.status)),
  );
  const byDay = (day: string) => visible.filter((a) => toDateKey(new Date(a.startsAt), tz) === day);
  const nameOf = (id: string) => data.practitioners.find((p) => p.id === id)?.name ?? "";
  const serviceOf = (id: string) => data.services.find((s) => s.id === id)?.name ?? "";
  const open = data.appointments.find((a) => a.id === openId) ?? null;

  const exceptionsFor = (day: string, lane: string) => {
    const dayStart = zonedTimeToUtc(day, `${String(START_HOUR).padStart(2, "0")}:00`, tz).getTime();
    const dayEnd = zonedTimeToUtc(day, `${END_HOUR}:00`, tz).getTime();
    return data.exceptions
      .filter((e) => e.practitionerId === lane)
      .map((e) => ({ ...e, s: Math.max(Date.parse(e.startsAt), dayStart), en: Math.min(Date.parse(e.endsAt), dayEnd) }))
      .filter((e) => e.s < e.en)
      .map((e) => ({ ...e, top: ((e.s - dayStart) / 3_600_000) * HOUR_PX, height: ((e.en - e.s) / 3_600_000) * HOUR_PX }));
  };

  const block = (a: Appointment) => {
    const startMin = minutesInDay(a.startsAt) - START_HOUR * 60;
    const duration = (Date.parse(a.endsAt) - Date.parse(a.startsAt)) / 60_000;
    return { top: (startMin / 60) * HOUR_PX, height: Math.max((duration / 60) * HOUR_PX - 2, 22) };
  };

  return (
    <>
      <AdminPageHeader
        title="Calendar"
        description={`Week of ${formatDateKey(weekStart, "long")}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setWeekStart((w) => addDays(w, -7))}>
              <ChevronLeft className="size-4" /> <span className="sr-only">Previous week</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setWeekStart(mondayOf(today))}>
              This week
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setWeekStart((w) => addDays(w, 7))}>
              <ChevronRight className="size-4" /> <span className="sr-only">Next week</span>
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="group" aria-label="Physio" className="flex gap-1 rounded-full bg-sand-200 p-1">
          {[{ id: "all", name: "Both" }, ...data.practitioners].map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={practitioner === p.id}
              onClick={() => setPractitioner(p.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                practitioner === p.id ? "bg-white shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} className="size-4 accent-ink" />
          Show declined, expired & cancelled
        </label>
        <ul className="flex flex-wrap gap-3 text-xs" aria-label="Legend">
          {(["pending", "offered", "approved", "completed"] as const).map((s) => (
            <li key={s}>
              <StatusBadge status={s} />
            </li>
          ))}
          <li className="inline-flex items-center gap-1.5 text-muted">
            <span className="h-3 w-5 rounded bg-[repeating-linear-gradient(135deg,var(--color-sand-300)_0_4px,transparent_4px_8px)]" aria-hidden="true" />
            Leave / blocked
          </li>
        </ul>
      </div>

      {/* Week grid (tablet and up) */}
      <div className="hidden overflow-x-auto rounded-3xl border border-sand-300 bg-white md:block">
        <div className="grid min-w-[56rem] grid-cols-[3.5rem_repeat(7,1fr)]">
          <div className="border-b border-sand-200" />
          {days.map((d) => (
            <div
              key={d}
              className={`border-b border-l border-sand-200 px-2 py-3 text-center text-sm ${d === today ? "bg-sand-50 font-semibold" : ""}`}
            >
              {formatDateKey(d)}
              {lanes.length > 1 ? (
                <div className="mt-1 grid grid-cols-2 text-[0.65rem] font-normal uppercase tracking-wider text-subtle">
                  {lanes.map((l) => (
                    <span key={l}>{nameOf(l)}</span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {/* Hour labels */}
          <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}>
            {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
              <span key={i} className="absolute right-2 -translate-y-1/2 text-[0.7rem] text-subtle" style={{ top: i * HOUR_PX }}>
                {i === 0 ? "" : `${((START_HOUR + i + 11) % 12) + 1}${START_HOUR + i < 12 ? "am" : "pm"}`}
              </span>
            ))}
          </div>

          {days.map((day) => (
            <div
              key={day}
              className={`relative border-l border-sand-200 ${day === today ? "bg-sand-50/60" : ""}`}
              style={{
                height: (END_HOUR - START_HOUR) * HOUR_PX,
                backgroundImage: `repeating-linear-gradient(to bottom, var(--color-sand-200) 0 1px, transparent 1px ${HOUR_PX}px)`,
              }}
            >
              {lanes.map((lane, li) => {
                const width = 100 / lanes.length;
                return (
                  <div key={lane} className="absolute inset-y-0" style={{ left: `${li * width}%`, width: `${width}%` }}>
                    {exceptionsFor(day, lane).map((e) => (
                      <div
                        key={e.id}
                        className="absolute inset-x-0.5 overflow-hidden rounded-md bg-[repeating-linear-gradient(135deg,var(--color-sand-200)_0_6px,transparent_6px_12px)] p-1 text-[0.65rem] text-muted"
                        style={{ top: e.top, height: e.height }}
                        title={`${nameOf(lane)}: ${e.note ?? e.kind}`}
                      >
                        {e.note ?? e.kind}
                      </div>
                    ))}
                    {byDay(day)
                      .filter((a) => a.practitionerId === lane)
                      .map((a) => {
                        const pos = block(a);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setOpenId(a.id)}
                            className={`absolute inset-x-0.5 overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-left text-[0.7rem] leading-tight shadow-sm transition hover:z-10 hover:shadow-md ${STATUS_META[a.status].block}`}
                            style={{ top: pos.top, height: pos.height }}
                            aria-label={`${a.client.firstName} ${a.client.lastName}, ${formatTime(a.startsAt)}, ${nameOf(a.practitionerId)}, ${STATUS_META[a.status].label}`}
                          >
                            <span className="block font-semibold">{formatTime(a.startsAt)}</span>
                            <span className="block truncate">
                              {a.client.firstName} {a.client.lastName[0]}.
                            </span>
                            {a.mode === "home" ? <span className="block truncate opacity-80">Home visit</span> : null}
                          </button>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Agenda (mobile) */}
      <div className="space-y-6 md:hidden">
        {days.map((day) => {
          const items = byDay(day).sort((x, y) => x.startsAt.localeCompare(y.startsAt));
          return (
            <section key={day} aria-label={formatDateKey(day, "long")}>
              <h2 className={`text-sm font-semibold ${day === today ? "text-ink" : "text-muted"}`}>
                {formatDateKey(day, "long")} {day === today ? "· Today" : ""}
              </h2>
              {items.length === 0 ? (
                <p className="mt-2 text-sm text-subtle">No appointments</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {items.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(a.id)}
                        className={`w-full rounded-xl border-l-4 px-4 py-3 text-left text-sm ${STATUS_META[a.status].block}`}
                      >
                        <span className="font-semibold">{formatTime(a.startsAt)}</span> · {a.client.firstName}{" "}
                        {a.client.lastName}
                        <span className="block text-xs opacity-80">
                          {nameOf(a.practitionerId)} · {serviceOf(a.serviceId)} · {STATUS_META[a.status].label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <AppointmentDialog appointment={open} data={data} onClose={() => setOpenId(null)} onChanged={reload} />
    </>
  );
}
