"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { getBookingClient } from "@/lib/booking/client";
import { formatDuration } from "@/lib/booking/format";
import type { BookableService, DeliveryMode, PractitionerSummary } from "@/lib/booking/types";
import { useAsyncData } from "@/lib/use-async";
import { services as serviceContent } from "@/content/services";
import { site } from "@/content/site";
import { ServiceIcon } from "@/components/home/service-icon";
import { Building, Home, Search, Users } from "@/components/ui/icons";
import { IconBadge, Notice } from "@/components/ui/primitives";
import type { Action, BookingDraft } from "./booking-state";
import { RadioCard } from "./radio-card";
import { LoadError, StepShell } from "./step-shell";

interface StepProps {
  draft: BookingDraft;
  dispatch: React.Dispatch<Action>;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
  onBack?: () => void;
}

/* -------------------------------- Service -------------------------------- */

export function ServiceStep({ draft, dispatch, headingRef, onNext, services }: StepProps & { services: BookableService[] }) {
  const selected = services.find((s) => s.id === draft.serviceId);
  const modes = (selected?.modes ?? []).filter((m) => m === "home" || site.clinicAvailable);

  return (
    <StepShell
      headingRef={headingRef}
      title="What would you like to book?"
      description="Choose a service. Not sure? Musculoskeletal Physiotherapy is a good starting point."
      onNext={onNext}
      nextDisabled={!draft.serviceId || !draft.mode}
    >
      <fieldset>
        <legend className="sr-only">Service</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const icon = serviceContent.find((c) => c.id === s.id)?.icon;
            return (
              <RadioCard
                key={s.id}
                name="service"
                value={s.id}
                checked={draft.serviceId === s.id}
                onChange={(id) => {
                  const svc = services.find((x) => x.id === id);
                  const onlyMode = svc && svc.modes.length === 1 ? svc.modes[0] : undefined;
                  dispatch({ type: "service", serviceId: id, mode: onlyMode ?? (draft.mode && svc?.modes.includes(draft.mode) ? draft.mode : undefined) });
                }}
                icon={icon ? <IconBadge size="sm"><ServiceIcon name={icon} className="size-6" /></IconBadge> : null}
                title={s.name}
                description={s.summary}
                meta={formatDuration(s.durationMin)}
              />
            );
          })}
        </div>
      </fieldset>

      {selected ? (
        <fieldset className="mt-10">
          <legend className="text-lg font-semibold">Where would you like to be seen?</legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {modes.includes("clinic") ? (
              <RadioCard
                name="mode"
                value="clinic"
                checked={draft.mode === "clinic"}
                onChange={() => dispatch({ type: "mode", mode: "clinic" })}
                icon={<IconBadge size="sm"><Building className="size-5" /></IconBadge>}
                title="In clinic"
                description="Visit us at the clinic."
              />
            ) : null}
            {modes.includes("home") ? (
              <RadioCard
                name="mode"
                value="home"
                checked={draft.mode === "home"}
                onChange={() => dispatch({ type: "mode", mode: "home" as DeliveryMode })}
                icon={<IconBadge size="sm"><Home className="size-5" /></IconBadge>}
                title="Home visit"
                description="We come to you, within our service area."
              />
            ) : null}
          </div>
        </fieldset>
      ) : null}
    </StepShell>
  );
}

/* -------------------------------- Location ------------------------------- */

export function LocationStep({ draft, dispatch, headingRef, onNext, onBack }: StepProps) {
  const inputId = useId();
  const [query, setQuery] = useState(draft.area?.suburb ?? "");
  const q = query.trim();
  const search = useAsyncData(q.length >= 2 ? `areas:${q.toLowerCase()}` : null, () =>
    getBookingClient().searchServiceAreas(q),
  );

  return (
    <StepShell
      headingRef={headingRef}
      title="Where should we visit?"
      description="Enter your suburb or postcode to check we visit your area."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!draft.area}
    >
      <label htmlFor={inputId} className="field-label">
        Suburb or postcode
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-subtle" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="address-level2"
          placeholder="e.g. Riverbend or 9103"
          className="field-input pl-12"
          aria-describedby={`${inputId}-hint`}
        />
      </div>
      <p id={`${inputId}-hint`} className="field-hint">
        Demo data: try “Koa Bay”, “Banksia” or “911”.
      </p>

      <div className="mt-6" aria-live="polite">
        {q.length < 2 ? null : search.loading ? (
          <div className="space-y-3" aria-busy="true">
            <div className="skeleton h-16" />
            <div className="skeleton h-16" />
          </div>
        ) : search.error ? (
          <LoadError message="We couldn't check service areas." onRetry={search.retry} />
        ) : search.data && search.data.length > 0 ? (
          <fieldset>
            <legend className="sr-only">Matching areas</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {search.data.map((a) => (
                <RadioCard
                  key={a.id}
                  name="area"
                  value={a.id}
                  checked={draft.area?.id === a.id}
                  onChange={() => dispatch({ type: "area", area: a })}
                  title={`${a.suburb} ${a.postcode}`}
                  description={`Travel time of ${a.travelBufferMin} min is reserved either side of your visit.`}
                />
              ))}
            </div>
          </fieldset>
        ) : (
          <Notice tone="warning" title="We don't currently visit that area.">
            You&apos;re welcome to{" "}
            <button type="button" className="underline" onClick={() => dispatch({ type: "mode", mode: "clinic" })}>
              book in clinic instead
            </button>
            , or <Link href="/contact" className="underline">contact us</Link> to discuss options.
          </Notice>
        )}
      </div>
    </StepShell>
  );
}

/* ------------------------------ Practitioner ----------------------------- */

export function PractitionerStep({
  draft,
  dispatch,
  headingRef,
  onNext,
  onBack,
  practitioners,
  service,
}: StepProps & { practitioners: PractitionerSummary[]; service?: BookableService }) {
  const eligible = practitioners.filter((p) => service?.practitionerIds.includes(p.id));

  return (
    <StepShell
      headingRef={headingRef}
      title="Who would you like to see?"
      description="Choose a physiotherapist, or select no preference to see the earliest available times."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!draft.practitioner}
    >
      <fieldset>
        <legend className="sr-only">Physiotherapist</legend>
        <div className="grid gap-3">
          <RadioCard
            name="practitioner"
            value="any"
            checked={draft.practitioner === "any"}
            onChange={() => dispatch({ type: "practitioner", practitioner: "any" })}
            icon={<IconBadge size="sm"><Users className="size-5" /></IconBadge>}
            title="No preference"
            description="Show me the earliest available times with either physio."
          />
          {eligible.map((p) => (
            <RadioCard
              key={p.id}
              name="practitioner"
              value={p.id}
              checked={draft.practitioner === p.id}
              onChange={() => dispatch({ type: "practitioner", practitioner: p.id })}
              icon={
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-sand-200 text-lg font-semibold" aria-hidden="true">
                  {p.name[0]}
                </span>
              }
              title={p.name}
              description={p.role}
            />
          ))}
        </div>
      </fieldset>
    </StepShell>
  );
}
