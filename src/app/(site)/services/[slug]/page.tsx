import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceIcon } from "@/components/home/service-icon";
import { CtaBand } from "@/components/shared/cta-band";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Building, Check, Clock, Home } from "@/components/ui/icons";
import { Container, Eyebrow, IconBadge } from "@/components/ui/primitives";
import { getService, services } from "@/content/services";
import { team } from "@/content/team";
import { formatDuration } from "@/lib/booking/format";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return service ? { title: service.name, description: service.summary } : {};
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const practitioners = team.filter((m) => service.practitionerIds.includes(m.id));
  const others = services.filter((s) => s.slug !== slug);

  return (
    <>
      <section className="pb-16 pt-6 lg:pb-24 lg:pt-12">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-10">
            <Link href="/services" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
              <ArrowLeft className="size-4" /> All services
            </Link>
          </nav>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <IconBadge size="lg">
                <ServiceIcon name={service.icon} className="size-9" />
              </IconBadge>
              <h1 className="mt-8 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{service.name}</h1>
              <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">{service.intro}</p>
            </div>
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="rounded-[2rem] bg-sand-50 p-8">
                <h2 className="text-lg font-semibold">At a glance</h2>
                <ul className="mt-5 space-y-4 text-ink-soft">
                  <li className="flex items-center gap-3">
                    <Clock className="size-5 text-clay-500" /> {formatDuration(service.durationMin)} sessions
                  </li>
                  {service.modes.includes("clinic") ? (
                    <li className="flex items-center gap-3">
                      <Building className="size-5 text-clay-500" /> Available in clinic
                    </li>
                  ) : null}
                  {service.modes.includes("home") ? (
                    <li className="flex items-center gap-3">
                      <Home className="size-5 text-clay-500" />
                      <span>
                        Home visits <Link href="/home-visits" className="underline underline-offset-4">in our area</Link>
                      </span>
                    </li>
                  ) : null}
                </ul>
                <p className="mt-6 text-sm text-muted">With {practitioners.map((p) => p.name).join(" or ")}</p>
                <ButtonLink href={`/book?service=${service.slug}`} arrow className="mt-6 w-full">
                  Request this service
                </ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-sand-50 py-20 lg:py-24">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>How we can help</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Common reasons people see us</h2>
            <ul className="mt-8 space-y-3">
              {service.helpsWith.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg">
                  <Check className="mt-1 size-5 shrink-0 text-clay-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Eyebrow>What to expect</Eyebrow>
            <ol className="mt-6 space-y-4">
              {service.whatToExpect.map((step, i) => (
                <li key={step.title} className="flex gap-5 rounded-3xl bg-sand-100 p-6">
                  <span className="text-sm font-semibold tabular-nums text-subtle">0{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <h2 className="text-2xl font-semibold">Other services</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-sand-300 p-5 hover:border-ink"
                >
                  <span className="flex items-center gap-4">
                    <IconBadge size="sm">
                      <ServiceIcon name={s.icon} className="size-6" />
                    </IconBadge>
                    <span className="font-medium">{s.name}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
