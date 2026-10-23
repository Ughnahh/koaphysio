"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef, useState } from "react";
import { getBookingClient } from "@/lib/booking/client";
import { formatDateKey, formatDuration, formatTime } from "@/lib/booking/format";
import { BOOKING_POLICY } from "@/lib/booking/policy";
import { toDateKey } from "@/lib/booking/rules";
import type { Appointment, AppointmentRequestResult, DeliveryMode } from "@/lib/booking/types";
import type { FieldErrors } from "@/lib/booking/validation";
import { useAsyncData } from "@/lib/use-async";
import { services as serviceContent } from "@/content/services";
import { site } from "@/content/site";
import { team } from "@/content/team";
import { Check, Phone } from "@/components/ui/icons";
import { type BookingDraft, emptyDetails, reducer, STEP_LABELS, type Step, stepsFor } from "./booking-state";
import { LocationStep, PractitionerStep, ServiceStep } from "./choice-steps";
import { DetailsStep } from "./details-step";
import { Confirmation, ReviewStep } from "./review-step";
import { LoadError } from "./step-shell";
import { TimeStep } from "./time-step";

type Failure = Extract<AppointmentRequestResult, { ok: false }>;

function newIdempotencyKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Pre-fill from links such as /book?service=…&practitioner=alma&mode=home */
function initialDraft(params: URLSearchParams): BookingDraft {
  const service = serviceContent.find((s) => s.slug === params.get("service"));
  const practitioner = team.find((m) => m.slug === params.get("practitioner"));
  const modeParam = params.get("mode");
  const mode: DeliveryMode | undefined =
    modeParam === "home" || modeParam === "clinic"
      ? modeParam
      : service?.modes.length === 1
        ? service.modes[0]
        : undefined;
  return {
    serviceId: service?.id,
    mode: service && mode && !service.modes.includes(mode) ? undefined : mode,
    practitioner: practitioner?.id,
    details: emptyDetails,
    consent: false,
  };
}

export function BookingWizard() {
  const params = useSearchParams();
  const [draft, dispatch] = useReducer(reducer, params, initialDraft);
  const [step, setStep] = useState<Step>("service");
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure>();
  const [submitError, setSubmitError] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>();
  const [result, setResult] = useState<Appointment>();
  const [refreshKey, setRefreshKey] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const catalog = useAsyncData("catalog", async () => {
    const client = getBookingClient();
    const [services, practitioners] = await Promise.all([client.listServices(), client.listPractitioners()]);
    return { services, practitioners };
  });

  const steps = stepsFor(draft);
  // If the visible steps change (e.g. switching from home visit to clinic), fall forward safely.
  const current: Step = steps.includes(step) ? step : step === "location" ? "practitioner" : steps[0];
  const index = steps.indexOf(current);

  // Move focus to the new step heading so screen reader and keyboard users keep their place.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const top = topRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current, result]);

  const goTo = (s: Step) => {
    setFailure(undefined);
    setSubmitError(false);
    setStep(s);
  };
  const next = () => goTo(steps[Math.min(index + 1, steps.length - 1)]);
  const back = () => goTo(steps[Math.max(index - 1, 0)]);

  async function submit() {
    if (!draft.slot || !draft.serviceId || !draft.mode || !draft.practitioner) return;
    setSubmitting(true);
    setFailure(undefined);
    setSubmitError(false);
    try {
      const res = await getBookingClient().requestAppointment({
        serviceId: draft.serviceId,
        mode: draft.mode,
        practitioner: draft.practitioner,
        startsAt: draft.slot.startsAt,
        serviceAreaId: draft.area?.id,
        // Only home visits need an address; never send one for clinic appointments.
        client: draft.mode === "home" ? draft.details : { ...draft.details, address: undefined },
        consent: draft.consent,
        idempotencyKey,
      });
      if (res.ok) {
        setResult(res.appointment);
      } else if (res.fieldErrors) {
        setServerErrors(res.fieldErrors);
        goTo("details");
      } else {
        setFailure(res);
        if (res.reason === "slot_taken") setRefreshKey((k) => k + 1);
      }
    } catch {
      // Network/server failure: keep the same idempotency key so a retry can't double-submit.
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function edit(s: Step) {
    if (s === "time" && failure?.reason === "slot_taken") {
      dispatch({ type: "clearSlot" });
      setIdempotencyKey(newIdempotencyKey());
    }
    goTo(s);
  }

  function startAgain() {
    dispatch({ type: "reset" });
    setResult(undefined);
    setIdempotencyKey(newIdempotencyKey());
    setRefreshKey((k) => k + 1);
    goTo("service");
  }

  const services = catalog.data?.services ?? [];
  const practitioners = catalog.data?.practitioners ?? [];
  const service = services.find((s) => s.id === draft.serviceId);

  let body: React.ReactNode;
  if (catalog.loading) {
    body = (
      <div aria-busy="true" aria-label="Loading booking options" className="space-y-4">
        <div className="skeleton h-9 w-2/3" />
        <div className="skeleton h-5 w-1/2" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-28" />
          ))}
        </div>
      </div>
    );
  } else if (catalog.error || !catalog.data) {
    body = <LoadError message="We couldn't load booking options." onRetry={catalog.retry} />;
  } else if (services.length === 0) {
    body = (
      <div>
        <h2 className="text-2xl font-semibold">Online requests are unavailable right now.</h2>
        <p className="mt-2 text-muted">
          Please call us on <a href={site.phoneHref} className="underline">{site.phone}</a> to book.
        </p>
      </div>
    );
  } else if (result) {
    body = (
      <Confirmation
        appointment={result}
        service={services.find((s) => s.id === result.serviceId)}
        practitioner={practitioners.find((p) => p.id === result.practitionerId)}
        headingRef={headingRef}
        onAnother={startAgain}
      />
    );
  } else {
    const common = { draft, dispatch, headingRef };
    switch (current) {
      case "service":
        body = <ServiceStep {...common} onNext={next} services={services} />;
        break;
      case "location":
        body = <LocationStep {...common} onNext={next} onBack={back} />;
        break;
      case "practitioner":
        body = (
          <PractitionerStep {...common} onNext={next} onBack={back} practitioners={practitioners} service={service} />
        );
        break;
      case "time":
        body = (
          <TimeStep {...common} onNext={next} onBack={back} practitioners={practitioners} refreshKey={refreshKey} />
        );
        break;
      case "details":
        body = <DetailsStep {...common} onNext={next} onBack={back} serverErrors={serverErrors} />;
        break;
      case "review":
        body = (
          <ReviewStep
            draft={draft}
            service={service}
            practitioners={practitioners}
            headingRef={headingRef}
            onBack={back}
            onEdit={edit}
            onSubmit={submit}
            submitting={submitting}
            failure={failure}
            submitError={submitError}
          />
        );
        break;
    }
  }

  const done = Boolean(result);

  return (
    <div ref={topRef} className="scroll-mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        {!done && catalog.data ? <Progress steps={steps} index={index} /> : null}
        <div className="rounded-[2rem] bg-sand-50 p-6 sm:p-10">{body}</div>
      </div>

      <aside className="space-y-4 lg:col-span-4" aria-label="Booking summary">
        {!done ? <Summary draft={draft} serviceName={service?.name} durationMin={service?.durationMin} practitioners={practitioners} /> : null}
        <div className="rounded-3xl border border-sand-300 p-6">
          <h2 className="font-semibold">Prefer to talk to someone?</h2>
          <p className="mt-1 text-sm text-muted">We&apos;re happy to help you book over the phone.</p>
          <a href={site.phoneHref} className="mt-4 inline-flex items-center gap-2 font-medium hover:underline">
            <Phone className="size-5" /> {site.phone}
          </a>
        </div>
      </aside>
    </div>
  );
}

function Progress({ steps, index }: { steps: Step[]; index: number }) {
  return (
    <nav aria-label="Booking progress" className="mb-6">
      <p className="mb-3 text-sm text-muted sm:hidden">
        Step {index + 1} of {steps.length}: <span className="font-medium text-ink">{STEP_LABELS[steps[index]]}</span>
      </p>
      <ol className="flex gap-1.5 sm:gap-2">
        {steps.map((s, i) => {
          const state = i < index ? "done" : i === index ? "current" : "todo";
          return (
            <li key={s} className="flex-1" aria-current={state === "current" ? "step" : undefined}>
              <span
                className={`block h-1 rounded-full ${state === "todo" ? "bg-sand-300" : "bg-ink"}`}
                aria-hidden="true"
              />
              <span
                className={`mt-2 hidden items-center gap-1.5 text-xs sm:flex ${
                  state === "current" ? "font-semibold text-ink" : "text-subtle"
                }`}
              >
                {state === "done" ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
                {STEP_LABELS[s]}
                <span className="sr-only">{state === "done" ? " (completed)" : state === "todo" ? " (not started)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Summary({
  draft,
  serviceName,
  durationMin,
  practitioners,
}: {
  draft: BookingDraft;
  serviceName?: string;
  durationMin?: number;
  practitioners: { id: string; name: string }[];
}) {
  const practitionerName =
    draft.slot && draft.practitioner === "any"
      ? `${practitioners.find((p) => p.id === draft.slot!.practitionerId)?.name ?? ""} (no preference)`
      : draft.practitioner === "any"
        ? "No preference"
        : practitioners.find((p) => p.id === draft.practitioner)?.name;

  const rows: [string, string | undefined][] = [
    ["Service", serviceName ? `${serviceName}${durationMin ? ` · ${formatDuration(durationMin)}` : ""}` : undefined],
    ["Where", draft.mode === "home" ? `Home visit${draft.area ? ` · ${draft.area.suburb}` : ""}` : draft.mode === "clinic" ? "In clinic" : undefined],
    ["Physio", practitionerName],
    [
      "When",
      draft.slot
        ? `${formatDateKey(toDateKey(new Date(draft.slot.startsAt), BOOKING_POLICY.timeZone))}, ${formatTime(draft.slot.startsAt)}`
        : undefined,
    ],
  ];

  return (
    <div className="rounded-3xl bg-white p-6 lg:sticky lg:top-6">
      <h2 className="font-semibold">Your request</h2>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-subtle">{label}</dt>
            <dd className={`text-right ${value ? "font-medium" : "text-subtle"}`}>{value ?? "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 border-t border-sand-200 pt-4 text-xs text-muted">
        Requests are confirmed by our team, usually within one business day.
      </p>
    </div>
  );
}
