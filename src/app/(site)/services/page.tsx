import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIcon } from "@/components/home/service-icon";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowRight, Building, Home } from "@/components/ui/icons";
import { Container, IconBadge } from "@/components/ui/primitives";
import { services } from "@/content/services";
import { formatDuration } from "@/lib/booking/format";

export const metadata: Metadata = {
  title: "Physiotherapy Services",
  description: "Musculoskeletal physiotherapy, post-operative rehabilitation, strength & conditioning and aged care physiotherapy.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Physiotherapy for every stage of life."
        intro="From recent injuries to recovery after surgery and staying strong as you age — every service starts with a thorough assessment and a plan built around you."
      />

      <section className="pb-12">
        <Container>
          <ul className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col rounded-[2rem] bg-sand-50 p-8 transition-colors hover:bg-white sm:p-10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <IconBadge size="lg">
                      <ServiceIcon name={s.icon} className="size-9" />
                    </IconBadge>
                    <span className="inline-flex size-12 items-center justify-center rounded-full border border-sand-300 transition group-hover:border-ink group-hover:bg-ink group-hover:text-sand-50">
                      <ArrowRight className="size-5" />
                    </span>
                  </div>
                  <h2 className="mt-8 text-3xl font-semibold">{s.name}</h2>
                  <p className="mt-3 flex-1 text-lg text-muted">{s.summary}</p>
                  <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-sand-300 pt-5 text-sm text-ink-soft">
                    <div className="flex gap-1.5">
                      <dt className="text-subtle">Session</dt>
                      <dd>{formatDuration(s.durationMin)}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <dt className="sr-only">Available</dt>
                      {s.modes.includes("clinic") ? (
                        <dd className="inline-flex items-center gap-1.5">
                          <Building className="size-4" /> In clinic
                        </dd>
                      ) : null}
                      {s.modes.includes("home") ? (
                        <dd className="inline-flex items-center gap-1.5">
                          <Home className="size-4" /> Home visits
                        </dd>
                      ) : null}
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand title="Not sure which service you need?" body="Book an initial assessment and we'll work it out together, or call us for a chat." />
    </>
  );
}
