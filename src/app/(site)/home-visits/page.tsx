import type { Metadata } from "next";
import { AreaChecker } from "@/components/shared/area-checker";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { Calendar, Check, Clock, Home } from "@/components/ui/icons";
import { Container, IconBadge, SectionHeading } from "@/components/ui/primitives";
import { serviceAreas, serviceZones } from "@/content/service-areas";

export const metadata: Metadata = {
  title: "Home Visits & Service Areas",
  description: "Mobile physiotherapy in your home. Check whether we visit your suburb.",
};

const benefits = [
  "No travel or parking when you're sore or recovering",
  "We see your home set-up and everyday challenges first-hand",
  "Ideal after surgery or a hospital stay",
  "Family members and carers can easily join in",
];

const howItWorks = [
  { icon: <Home className="size-6" />, title: "Check your area", body: "Confirm we visit your suburb using the checker below." },
  { icon: <Calendar className="size-6" />, title: "Request a time", body: "Choose a home visit when booking. We include travel time in our schedule." },
  { icon: <Clock className="size-6" />, title: "We come to you", body: "We bring everything we need. A clear space and a stable chair helps." },
];

export default function HomeVisitsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Home visits & service areas"
        title="Physiotherapy in the comfort of your home."
        intro="For many people, the best place for physiotherapy is where everyday life happens. We bring assessment, treatment and exercise programs to you."
      />

      <section className="pb-20">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="text-2xl font-semibold">Why home visits?</h2>
            <ul className="mt-6 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-lg">
                  <Check className="mt-1 size-5 shrink-0 text-clay-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <AreaChecker />
          </div>
        </Container>
      </section>

      <section className="bg-sand-50 py-20 lg:py-24">
        <Container>
          <SectionHeading eyebrow="How it works" title="Three simple steps" />
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {howItWorks.map((s) => (
              <li key={s.title}>
                <IconBadge>{s.icon}</IconBadge>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 lg:py-24" aria-labelledby="areas-heading">
        <Container>
          <SectionHeading
            eyebrow="Service areas"
            title={<span id="areas-heading">Where we visit</span>}
            intro="Suburbs below are fictional demo data for the prototype and will be replaced with Koa's real service area."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {serviceZones.map((zone) => (
              <div key={zone.id} className="rounded-3xl border border-sand-300 p-7">
                <h3 className="text-xl font-semibold">{zone.name}</h3>
                <p className="mt-1 text-sm text-muted">{zone.description}</p>
                <ul className="mt-5 space-y-2">
                  {serviceAreas
                    .filter((a) => a.zone === zone.id)
                    .map((a) => (
                      <li key={a.id} className="flex justify-between text-[0.95rem]">
                        <span>{a.suburb}</span>
                        <span className="tabular-nums text-subtle">{a.postcode}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand title="Outside our area?" body="Get in touch — we may still be able to help, or you can see us in clinic." />
    </>
  );
}
