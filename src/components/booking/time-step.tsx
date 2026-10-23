"use client";

import { useState } from "react";
import { getBookingClient } from "@/lib/booking/client";
import { formatDateKey, formatTime } from "@/lib/booking/format";
import { BOOKING_POLICY } from "@/lib/booking/policy";
import { addDays, toDateKey, zonedParts } from "@/lib/booking/rules";
import type { AvailabilityQuery, PractitionerSummary, TimeSlot } from "@/lib/booking/types";
import { useAsyncData } from "@/lib/use-async";
import { site } from "@/content/site";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { Notice } from "@/components/ui/primitives";
import type { Action, BookingDraft } from "./booking-state";
import { LoadError, StepShell } from "./step-shell";

const DAYS_PER_PAGE = 7;
const tz = BOOKING_POLICY.timeZone;

export function TimeStep({
  draft,
  dispatch,
  headingRef,
  onNext,
  onBack,
  practitioners,
  refreshKey = 0,
}: {
  refreshKey?: number;
  draft: BookingDraft;
  dispatch: React.Dispatch<Action>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
  onBack: () => void;
  practitioners: PractitionerSummary[];
}) {
  const [today] = useState(() => toDateKey(new Date(), tz));
  const maxPage = Math.ceil(BOOKING_POLICY.horizonDays / DAYS_PER_PAGE) - 1;
  const [page, setPage] = useState(0);
  const pageStart = addDays(today, page * DAYS_PER_PAGE);

  const base: Omit<AvailabilityQuery, "date"> = {
    serviceId: draft.serviceId!,
    mode: draft.mode!,
    practitioner: draft.practitioner!,
    serviceAreaId: draft.area?.id,
  };
  const baseKey = `${base.serviceId}|${base.mode}|${base.practitioner}|${base.serviceAreaId ?? ""}|${refreshKey}`;

  const days = useAsyncData(`days:${baseKey}:${pageStart}`, () =>
    getBookingClient().getDateAvailability(base, pageStart, DAYS_PER_PAGE),
  );

  const firstAvailable = days.data?.find((d) => d.slotCount > 0)?.date;
  const selectedDate =
    draft.date && days.data?.some((d) => d.date === draft.date) ? draft.date : firstAvailable;

  const slots = useAsyncData(selectedDate ? `slots:${baseKey}:${selectedDate}` : null, () =>
    getBookingClient().getAvailability({ ...base, date: selectedDate! }),
  );

  const nameOf = (id: string) => practitioners.find((p) => p.id === id)?.name ?? "";
  const selectSlot = (slot: TimeSlot) => {
    if (selectedDate !== draft.date) dispatch({ type: "date", date: selectedDate! });
    dispatch({ type: "slot", slot });
  };

  const groups = groupSlots(slots.data ?? []);

  return (
    <StepShell
      headingRef={headingRef}
      title="Choose a date and time"
      description={
        <>
          Times shown are in {tz.replace("Australia/", "")} time. Requests need at least{" "}
          {BOOKING_POLICY.minNoticeHours} hours&apos; notice.
        </>
      }
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!draft.slot}
      footerNote={
        draft.slot ? (
          <>
            {formatDateKey(toDateKey(new Date(draft.slot.startsAt), tz), "long")} at {formatTime(draft.slot.startsAt)}
            {draft.practitioner === "any" ? ` with ${nameOf(draft.slot.practitionerId)}` : ""}
          </>
        ) : null
      }
    >
      {/* Date picker */}
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold" aria-live="polite">
          {formatDateKey(pageStart)} – {formatDateKey(addDays(pageStart, DAYS_PER_PAGE - 1))}
        </p>
        <div className="flex gap-2">
          <PagerButton label="Previous week" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-5" />
          </PagerButton>
          <PagerButton label="Next week" disabled={page >= maxPage} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-5" />
          </PagerButton>
        </div>
      </div>

      <div className="mt-4">
        {days.loading ? (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2" aria-busy="true" aria-label="Loading dates">
            {Array.from({ length: DAYS_PER_PAGE }, (_, i) => (
              <div key={i} className="skeleton h-20" />
            ))}
          </div>
        ) : days.error ? (
          <LoadError message="We couldn't load availability." onRetry={days.retry} />
        ) : (
          <div role="group" aria-label="Available dates" className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.data?.map((d) => {
              const [y, m, dd] = d.date.split("-").map(Number);
              const weekday = new Intl.DateTimeFormat("en-AU", { weekday: "short", timeZone: "UTC" }).format(
                new Date(Date.UTC(y, m - 1, dd)),
              );
              const available = d.slotCount > 0;
              const active = d.date === selectedDate;
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={!available}
                  aria-pressed={active}
                  aria-label={`${formatDateKey(d.date, "long")}, ${available ? `${d.slotCount} times available` : "no times available"}`}
                  onClick={() => dispatch({ type: "date", date: d.date })}
                  className={`flex flex-col items-center rounded-2xl border px-1 py-3 transition-colors ${
                    active
                      ? "border-ink bg-ink text-sand-50"
                      : available
                        ? "border-sand-300 bg-white hover:border-ink"
                        : "cursor-not-allowed border-transparent bg-sand-200/60 text-subtle"
                  }`}
                >
                  <span className="text-[0.7rem] uppercase tracking-wider">{weekday}</span>
                  <span className="mt-1 text-xl font-semibold tabular-nums">{dd}</span>
                  <span className={`mt-1 hidden text-[0.7rem] sm:block ${active ? "text-sand-300" : "text-subtle"}`}>
                    {available ? `${d.slotCount} times` : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Slots */}
      <div className="mt-8" aria-live="polite">
        {days.loading || days.error ? null : !firstAvailable ? (
          <Notice
            tone="info"
            title="No times available this week."
            action={
              page < maxPage ? (
                <button type="button" className="font-medium underline" onClick={() => setPage((p) => p + 1)}>
                  Check next week
                </button>
              ) : (
                <a className="font-medium underline" href={site.phoneHref}>
                  Call us on {site.phone}
                </a>
              )
            }
          >
            Try another week, choose a different physio, or call us and we&apos;ll do our best to fit you in.
          </Notice>
        ) : slots.loading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true" aria-label="Loading times">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton h-12" />
            ))}
          </div>
        ) : slots.error ? (
          <LoadError message="We couldn't load times for this day." onRetry={slots.retry} />
        ) : groups.length === 0 ? (
          <Notice tone="info" title="No times left on this day.">
            Please choose another date.
          </Notice>
        ) : (
          <div className="space-y-6">
            <h3 className="font-semibold">{formatDateKey(selectedDate!, "long")}</h3>
            {groups.map((g) => (
              <div key={g.label} role="group" aria-label={`${g.label} times`}>
                <p className="eyebrow mb-3 text-subtle">{g.label}</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {g.slots.map((slot) => {
                    const active = draft.slot?.startsAt === slot.startsAt && draft.slot.practitionerId === slot.practitionerId;
                    return (
                      <button
                        key={`${slot.practitionerId}-${slot.startsAt}`}
                        type="button"
                        aria-pressed={active}
                        onClick={() => selectSlot(slot)}
                        className={`rounded-xl border px-2 py-3 text-sm font-medium tabular-nums transition-colors ${
                          active ? "border-ink bg-ink text-sand-50" : "border-sand-300 bg-white hover:border-ink"
                        }`}
                      >
                        {formatTime(slot.startsAt)}
                        {draft.practitioner === "any" ? (
                          <span className={`block text-xs font-normal ${active ? "text-sand-300" : "text-subtle"}`}>
                            {nameOf(slot.practitionerId)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StepShell>
  );
}

function groupSlots(slots: TimeSlot[]) {
  const morning: TimeSlot[] = [];
  const afternoon: TimeSlot[] = [];
  for (const s of slots) (zonedParts(new Date(s.startsAt), tz).hour < 12 ? morning : afternoon).push(s);
  return [
    { label: "Morning", slots: morning },
    { label: "Afternoon", slots: afternoon },
  ].filter((g) => g.slots.length);
}

function PagerButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex size-11 items-center justify-center rounded-full border border-sand-300 bg-white hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
