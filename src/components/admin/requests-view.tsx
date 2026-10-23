"use client";

import { useMemo, useState } from "react";
import { formatDateTime, formatShortDate, formatTime } from "@/lib/booking/format";
import type { Appointment, AppointmentStatus } from "@/lib/booking/types";
import { Button } from "@/components/ui/button";
import { Calendar, Inbox, Refresh, Search } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/primitives";
import { LoadError } from "@/components/booking/step-shell";
import { AdminPageHeader } from "./admin-shell";
import { AppointmentDialog } from "./appointment-dialog";
import { StatusBadge } from "./status-badge";
import { useAdminData } from "./use-admin-data";

type Tab = "action" | "upcoming" | "past" | "closed" | "all";

const TABS: { id: Tab; label: string }[] = [
  { id: "action", label: "Needs action" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "closed", label: "Declined & expired" },
  { id: "all", label: "All" },
];

const CLOSED: AppointmentStatus[] = ["declined", "expired", "cancelled"];

function matchesTab(a: Appointment, tab: Tab, now: number): boolean {
  const future = Date.parse(a.startsAt) > now;
  switch (tab) {
    case "action":
      return a.status === "pending" || a.status === "offered";
    case "upcoming":
      return a.status === "approved" && future;
    case "past":
      return !future && ["approved", "completed", "no_show"].includes(a.status);
    case "closed":
      return CLOSED.includes(a.status);
    case "all":
      return true;
  }
}

export function RequestsView() {
  const { data, initialLoading, refreshing, error, retry, reload } = useAdminData();
  const [tab, setTab] = useState<Tab>("action");
  const [query, setQuery] = useState("");
  const [practitioner, setPractitioner] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [now] = useState(() => Date.now());

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.appointments
      .filter((a) => matchesTab(a, tab, now))
      .filter((a) => practitioner === "all" || a.practitionerId === practitioner)
      .filter(
        (a) =>
          !q ||
          `${a.client.firstName} ${a.client.lastName} ${a.reference} ${a.client.email}`.toLowerCase().includes(q),
      )
      .sort((x, y) =>
        tab === "past" || tab === "closed" ? y.startsAt.localeCompare(x.startsAt) : x.startsAt.localeCompare(y.startsAt),
      );
  }, [data, tab, query, practitioner, now]);

  if (initialLoading) return <LoadingState />;
  if (error || !data) return <LoadError message="We couldn't load appointments." onRetry={retry} />;

  const counts = Object.fromEntries(TABS.map((t) => [t.id, data.appointments.filter((a) => matchesTab(a, t.id, now)).length]));
  const today = formatShortDate(new Date(now).toISOString());
  const todays = data.appointments.filter(
    (a) => a.status === "approved" && formatShortDate(a.startsAt) === today,
  ).length;
  const week = data.appointments.filter(
    (a) => a.status === "approved" && Date.parse(a.startsAt) > now && Date.parse(a.startsAt) < now + 7 * 864e5,
  ).length;

  const serviceName = (id: string) => data.services.find((s) => s.id === id)?.name ?? "";
  const practitionerName = (id: string) => data.practitioners.find((p) => p.id === id)?.name ?? "";
  const open = data.appointments.find((a) => a.id === openId) ?? null;

  return (
    <>
      <AdminPageHeader
        title="Appointment requests"
        description="Review, approve and manage appointment requests."
        actions={
          <Button variant="secondary" size="sm" onClick={reload} disabled={refreshing}>
            {refreshing ? <Spinner className="size-4" /> : <Refresh className="size-4" />} Refresh
          </Button>
        }
      />

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting decision" value={counts.action} tone="warning" />
        <Stat label="Confirmed today" value={todays} />
        <Stat label="Confirmed next 7 days" value={week} />
        <Stat label="Declined & expired" value={counts.closed} />
      </dl>

      <div className="mt-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div role="tablist" aria-label="Filter appointments" className="flex gap-1 overflow-x-auto rounded-full bg-sand-200 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              aria-controls="appointments-panel"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label} <span className="ml-1 text-subtle tabular-nums">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="filter-prac">
            Physio
          </label>
          <select
            id="filter-prac"
            value={practitioner}
            onChange={(e) => setPractitioner(e.target.value)}
            className="field-input !py-2.5 sm:w-40"
          >
            <option value="all">All physios</option>
            {data.practitioners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
            <label className="sr-only" htmlFor="filter-q">
              Search by name, email or reference
            </label>
            <input
              id="filter-q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or reference"
              className="field-input !py-2.5 pl-10 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div
        id="appointments-panel"
        role="tabpanel"
        aria-busy={refreshing}
        className={`mt-6 transition-opacity ${refreshing ? "pointer-events-none opacity-60" : ""}`}
      >
        {rows.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-sand-400 px-6 py-16 text-center">
            <Inbox className="size-10 text-subtle" />
            <p className="mt-4 font-semibold">{tab === "action" ? "You're all caught up." : "Nothing to show."}</p>
            <p className="mt-1 text-sm text-muted">
              {query || practitioner !== "all" ? "Try clearing the filters." : "New requests will appear here."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-3xl border border-sand-300 bg-white md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-sand-50 text-xs uppercase tracking-wider text-subtle">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Client</th>
                    <th scope="col" className="px-5 py-3 font-medium">Appointment</th>
                    <th scope="col" className="px-5 py-3 font-medium">Physio</th>
                    <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {rows.map((a) => (
                    <tr key={a.id} className="hover:bg-sand-50">
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {a.client.firstName} {a.client.lastName}
                        </p>
                        <p className="text-xs text-subtle">{a.reference}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{formatDateTime(a.startsAt)}</p>
                        <p className="text-xs text-muted">
                          {serviceName(a.serviceId)} · {a.mode === "home" ? "Home visit" : "Clinic"}
                        </p>
                      </td>
                      <td className="px-5 py-4">{practitionerName(a.practitionerId)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button size="sm" variant={a.status === "pending" ? "primary" : "secondary"} onClick={() => setOpenId(a.id)}>
                          {a.status === "pending" ? "Review" : "View"}
                          <span className="sr-only">
                            {" "}
                            {a.client.firstName} {a.client.lastName}
                          </span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {rows.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(a.id)}
                    className="w-full rounded-2xl border border-sand-300 bg-white p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">
                        {a.client.firstName} {a.client.lastName}
                      </p>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-subtle" />
                      {formatShortDate(a.startsAt)}, {formatTime(a.startsAt)} · {practitionerName(a.practitionerId)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {serviceName(a.serviceId)} · {a.mode === "home" ? "Home visit" : "Clinic"} · {a.reference}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast ? (
          <p className="pointer-events-auto rounded-full bg-ink px-5 py-3 text-sm text-sand-50 shadow-lg">{toast}</p>
        ) : null}
      </div>

      <AppointmentDialog
        appointment={open}
        data={data}
        onClose={() => setOpenId(null)}
        onChanged={(message) => {
          setToast(message);
          setTimeout(() => setToast(""), 4000);
          reload();
        }}
      />
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warning" }) {
  return (
    <div className={`rounded-3xl p-6 ${tone === "warning" && value > 0 ? "bg-warning-bg" : "bg-white"}`}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-2 text-4xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading appointments">
      <div className="skeleton h-9 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton h-28 rounded-3xl" />
        ))}
      </div>
      <div className="skeleton mt-10 h-80 rounded-3xl" />
    </div>
  );
}
