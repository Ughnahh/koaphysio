import type { Metadata } from "next";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Building, Check, Heart, Home, Users } from "@/components/ui/icons";
import { Container, IconBadge, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Aged Care Providers",
  description: "Physiotherapy for residential aged care and home care clients.",
};

const offerings = [
  {
    icon: <Building className="size-6" />,
    title: "Residential aged care",
    body: "Individual assessments, mobility and falls-prevention programs, and support for care staff.",
  },
  {
    icon: <Home className="size-6" />,
    title: "Home care clients",
    body: "In-home physiotherapy for clients living independently, coordinated with their care package.",
  },
  {
    icon: <Users className="size-6" />,
    title: "Group sessions",
    body: "Strength and balance classes tailored to residents' abilities. (To be confirmed.)",
  },
];

const partnership = [
  "Clear communication with care managers and nursing staff",
  "Assessments and progress notes in an agreed format",
  "Mobility and transfer recommendations for care plans",
  "Flexible scheduling around facility routines",
  "Support with funding documentation where applicable",
];

export default function AgedCarePage() {
  return (
    <>
      <PageHeader
        eyebrow="For aged care providers"
        title="Helping older adults stay strong, steady and independent."
        intro="We partner with residential facilities and home care providers to deliver physiotherapy that fits into your clients' routines and care plans."
      >
        <ButtonLink href="/contact" arrow>
          Discuss a partnership
        </ButtonLink>
      </PageHeader>

      <section className="pb-20">
        <Container className="grid gap-6 md:grid-cols-3">
          {offerings.map((o) => (
            <div key={o.title} className="rounded-3xl bg-sand-50 p-8">
              <IconBadge>{o.icon}</IconBadge>
              <h2 className="mt-6 text-xl font-semibold">{o.title}</h2>
              <p className="mt-2 text-muted">{o.body}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="bg-sand-50 py-20 lg:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Partnership"
            title="A reliable extension of your care team"
            intro="Our physiotherapists work alongside your staff, families and GPs so that progress made in a session carries over into everyday care."
          />
          <ul className="space-y-3 rounded-[2rem] bg-sand-100 p-8">
            {partnership.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-clay-500" />
                {p}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-20">
        <Container className="flex flex-col items-start gap-6 rounded-[2rem] border border-sand-300 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-5">
            <IconBadge size="sm">
              <Heart className="size-5" />
            </IconBadge>
            <div>
              <h2 className="text-2xl font-semibold">Funding & programs</h2>
              <p className="mt-2 max-w-2xl text-muted">
                Details of the aged care funding programs Koa works with will be confirmed here.
              </p>
            </div>
          </div>
          <ButtonLink href="/contact" variant="secondary">
            Ask us
          </ButtonLink>
        </Container>
      </section>

      <CtaBand title="Let's work together" body="Tell us about your facility or clients and we'll put together a plan that suits." />
    </>
  );
}
