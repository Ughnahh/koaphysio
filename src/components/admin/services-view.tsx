"use client";

import { useState } from "react";
import { getAdminClient } from "@/lib/booking/client";
import type { BookableService, DeliveryMode } from "@/lib/booking/types";
import { useAsyncData } from "@/lib/use-async";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/primitives";
import { LoadError } from "@/components/booking/step-shell";
import { AdminPageHeader } from "./admin-shell";

export function ServicesView() {
  const [version, setVersion] = useState(0);
  const state = useAsyncData(`services:${version}`, async () => {
    const c = getAdminClient();
    const [services, practitioners] = await Promise.all([c.listServices(), c.listPractitioners()]);
    return { services, practitioners };
  }, { keepPrevious: true });

  if (state.loading && !state.data) return <div className="skeleton h-96 rounded-3xl" aria-busy="true" aria-label="Loading services" />;
  if (state.error || !state.data) return <LoadError message="We couldn't load services." onRetry={state.retry} />;

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Set durations, buffers and where each service is offered. Changes apply to new requests."
      />
      <ul className="grid gap-4 xl:grid-cols-2">
        {state.data.services.map((s) => (
          <li key={s.id}>
            <ServiceCard service={s} practitioners={state.data!.practitioners} onSaved={() => setVersion((v) => v + 1)} />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">
        Service descriptions shown on the website are managed in the site content for now.
      </p>
    </>
  );
}

function ServiceCard({
  service,
  practitioners,
  onSaved,
}: {
  service: BookableService;
  practitioners: { id: string; name: string }[];
  onSaved: () => void;
}) {
  // The last saved values; avoids flashing stale data while the list reloads.
  const [baseline, setBaseline] = useState(service);
  const [draft, setDraft] = useState(service);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const id = service.id;

  async function save() {
    if (draft.durationMin < 15 || draft.durationMin > 240) return setError("Duration must be between 15 and 240 minutes.");
    if (draft.bufferAfterMin < 0 || draft.bufferAfterMin > 120) return setError("Buffer must be between 0 and 120 minutes.");
    if (draft.modes.length === 0) return setError("Offer the service in clinic and/or as a home visit.");
    if (draft.practitionerIds.length === 0) return setError("Choose at least one physio.");
    setError(undefined);
    setSaving(true);
    try {
      setBaseline(await getAdminClient().updateService(draft));
      onSaved();
    } catch {
      setError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const toggle = <T,>(list: T[], value: T, on: boolean) => (on ? [...list, value] : list.filter((x) => x !== value));

  return (
    <div className={`rounded-3xl bg-white p-6 ${draft.active ? "" : "opacity-70"}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold">{service.name}</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="size-4 accent-ink" />
          Bookable online
        </label>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-dur`} className="field-label">Duration (min)</label>
          <input id={`${id}-dur`} type="number" min={15} max={240} step={5} value={draft.durationMin} onChange={(e) => setDraft({ ...draft, durationMin: Number(e.target.value) })} className="field-input" />
        </div>
        <div>
          <label htmlFor={`${id}-buf`} className="field-label">Buffer after (min)</label>
          <input id={`${id}-buf`} type="number" min={0} max={120} step={5} value={draft.bufferAfterMin} onChange={(e) => setDraft({ ...draft, bufferAfterMin: Number(e.target.value) })} className="field-input" />
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="field-label">Offered</legend>
        <div className="flex gap-5">
          {(["clinic", "home"] as DeliveryMode[]).map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.modes.includes(m)} onChange={(e) => setDraft({ ...draft, modes: toggle(draft.modes, m, e.target.checked) })} className="size-4 accent-ink" />
              {m === "clinic" ? "In clinic" : "Home visits"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="field-label">Physios</legend>
        <div className="flex gap-5">
          {practitioners.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.practitionerIds.includes(p.id)} onChange={(e) => setDraft({ ...draft, practitionerIds: toggle(draft.practitionerIds, p.id, e.target.checked) })} className="size-4 accent-ink" />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <div className="mt-4">
          <Notice tone="danger" role="alert" title={error} />
        </div>
      ) : null}

      <div className="mt-6 flex gap-2">
        <Button size="sm" onClick={save} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {dirty ? (
          <Button size="sm" variant="ghost" onClick={() => setDraft(baseline)}>
            Discard
          </Button>
        ) : null}
      </div>
    </div>
  );
}
