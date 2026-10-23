import Link from "next/link";
import { HeroVisual } from "@/components/home/hero-visual";
import { ServiceIcon } from "@/components/home/service-icon";
import { CtaBand } from "@/components/shared/cta-band";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight, Building, Home, Users } from "@/components/ui/icons";
import { Container, Eyebrow, IconBadge, SectionHeading } from "@/components/ui/primitives";
import { services } from "@/content/services";
import { team } from "@/content/team";

const approachPoints = [
  { title: "Listen first", body: "We take time to understand your history, your goals and what matters to you." },
  { title: "Explain clearly", body: "You'll know what we've found and why we're recommending each step." },
  { title: "Move with purpose", body: "Hands-on care and exercise programs designed around your everyday life." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex flex-col overflow-hidden lg:block">
        <HeroVisual className="order-2 h-[20rem] sm:h-[26rem] lg:order-none lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]" />
        <Container className="relative order-1 pb-12 pt-6 lg:min-h-[36rem] lg:pb-24 lg:pt-20">
          <div className="max-w-xl">
            <p className="eyebrow mb-6">
              Movement <span aria-hidden="true">\</span>
              <span className="sr-only">,</span> Strength <span aria-hidden="true">\</span>
              <span className="sr-only">,</span> Wellbeing
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]">
              Move better.
              <br />
              Feel stronger.
              <br />
              Live well.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft sm:text-xl">
              Personalised physiotherapy care to help you move with confidence, reduce pain and do more of what
              you love.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href="/book" arrow size="lg">
                Book an Appointment
              </ButtonLink>
              <Link href="/services" className="px-2 py-3 font-medium underline-offset-4 hover:underline">
                Explore services
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Service highlights */}
      <section aria-labelledby="services-heading" className="bg-sand-50">
        <Container className="py-14 lg:py-16">
          <h2 id="services-heading" className="sr-only">
            Our services
          </h2>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-sand-300">
            {services.map((s) => (
              <li key={s.slug} className="lg:px-8">
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex flex-col items-center rounded-2xl text-center"
                >
                  <IconBadge size="lg">
                    <ServiceIcon name={s.icon} className="size-9" />
                  </IconBadge>
                  <h3 className="mt-5 text-xl font-medium leading-snug">
                    {s.displayLines[0]}
                    <br />
                    {s.displayLines[1]}
                  </h3>
                  <p className="mt-3 max-w-[16rem] text-[0.95rem] leading-relaxed text-muted">{s.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium opacity-70 transition group-hover:gap-2.5 group-hover:opacity-100">
                    Learn more <ArrowRight className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Approach */}
      <section className="py-20 lg:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Our approach"
              title="Care that fits around your life"
              intro="Every plan starts with understanding you. We combine thorough assessment, clear explanations and practical exercise so you can keep progressing between sessions."
            />
            <ButtonLink href="/our-approach" variant="secondary" arrow className="mt-8">
              How we work
            </ButtonLink>
          </div>
          <ol className="grid gap-4 lg:col-span-7">
            {approachPoints.map((p, i) => (
              <li key={p.title} className="flex gap-6 rounded-3xl bg-sand-50 p-6 sm:p-8">
                <span className="text-sm font-semibold text-subtle tabular-nums">0{i + 1}</span>
                <div>
                  <h3 className="text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-muted">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Team */}
      <section className="bg-sand-50 py-20 lg:py-28">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Meet the team" title="Two physios. One shared approach." />
            <ButtonLink href="/about" variant="secondary" arrow>
              About us
            </ButtonLink>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {team.map((m) => (
              <li key={m.id} className="flex items-center gap-6 rounded-3xl border border-sand-300 p-6 sm:p-8">
                <span
                  className="flex size-20 shrink-0 items-center justify-center rounded-full bg-sand-200 text-2xl font-semibold sm:size-24"
                  aria-hidden="true"
                >
                  {m.name[0]}
                </span>
                <div>
                  <h3 className="text-2xl font-semibold">{m.name}</h3>
                  <p className="text-sm text-muted">{m.role}</p>
                  <p className="mt-3 text-sm text-ink-soft">{m.interests.join(" · ")}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Home visits + providers */}
      <section className="py-20 lg:py-28">
        <Container className="grid gap-6 lg:grid-cols-3">
          <FeatureCard
            icon={<Home className="size-7" />}
            eyebrow="Home visits"
            title="Physiotherapy that comes to you"
            body="We visit homes across our service area, with travel time built into every booking."
            href="/home-visits"
            linkLabel="Check your area"
          />
          <FeatureCard
            icon={<Users className="size-7" />}
            eyebrow="GPs & referrers"
            title="Simple, collaborative referrals"
            body="Information for GPs, surgeons and allied health professionals referring to Koa."
            href="/gp-referrers"
            linkLabel="Referral information"
          />
          <FeatureCard
            icon={<Building className="size-7" />}
            eyebrow="Aged care providers"
            title="Partnering with care teams"
            body="Physiotherapy for residential and home care clients, coordinated with your team."
            href="/aged-care-providers"
            linkLabel="Work with us"
          />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}

function FeatureCard({
  icon,
  eyebrow,
  title,
  body,
  href,
  linkLabel,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <article className="flex flex-col rounded-3xl bg-sand-50 p-8">
      <IconBadge size="sm">{icon}</IconBadge>
      <Eyebrow className="mt-6">{eyebrow}</Eyebrow>
      <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 flex-1 text-muted">{body}</p>
      <Link href={href} className="mt-6 inline-flex items-center gap-2 font-medium hover:gap-3 transition-all">
        {linkLabel} <ArrowRight className="size-5" />
      </Link>
    </article>
  );
}
