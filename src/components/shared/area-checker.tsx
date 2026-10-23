"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { getBookingClient } from "@/lib/booking/client";
import type { ServiceArea } from "@/lib/booking/types";
import { serviceZones } from "@/content/service-areas";
import { buttonClasses } from "@/components/ui/button";
import { Check, Search } from "@/components/ui/icons";
import { Notice, Spinner } from "@/components/ui/primitives";

type Status = "idle" | "loading" | "done" | "error";

/** Suburb/postcode lookup against the (mock) service area list. */
export function AreaChecker() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceArea[]>([]);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const found = await getBookingClient().searchServiceAreas(q);
        if (!cancelled) {
          setResults(found);
          setStatus("done");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const showResults = query.trim().length >= 2;
  const zoneName = (id: string) => serviceZones.find((z) => z.id === id)?.name ?? id;

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:p-8">
      <label htmlFor={inputId} className="text-lg font-semibold">
        Check your suburb or postcode
      </label>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-subtle" />
        <input
          id={inputId}
          type="search"
          autoComplete="address-level2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Riverbend or 9103"
          className="field-input pl-12"
          aria-describedby={`${inputId}-hint`}
        />
      </div>
      <p id={`${inputId}-hint`} className="field-hint">
        Demo data: try “Koa Bay”, “Saltwater” or “912”.
      </p>

      <div aria-live="polite" className="mt-5 min-h-12">
        {!showResults ? null : status === "loading" ? (
          <Spinner label="Checking…" />
        ) : status === "error" ? (
          <Notice tone="danger" title="We couldn't check that just now.">
            Please try again, or call us to confirm.
          </Notice>
        ) : results.length > 0 ? (
          <div>
            <p className="flex items-center gap-2 font-medium text-success">
              <Check className="size-5" /> Good news — we visit {results.length === 1 ? "this area" : "these areas"}.
            </p>
            <ul className="mt-3 divide-y divide-sand-200 rounded-2xl border border-sand-200">
              {results.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium">{a.suburb}</span> {a.postcode}
                  </span>
                  <span className="text-muted">{zoneName(a.zone)}</span>
                </li>
              ))}
            </ul>
            <Link href="/book?mode=home" className={buttonClasses("primary", "md", "mt-5")}>
              Request a home visit
            </Link>
          </div>
        ) : status === "done" ? (
          <Notice tone="warning" title="We don't currently list that area.">
            Please <Link href="/contact" className="underline">get in touch</Link> — we may still be able to help, or
            you&apos;re welcome to visit us in clinic.
          </Notice>
        ) : null}
      </div>
    </div>
  );
}
