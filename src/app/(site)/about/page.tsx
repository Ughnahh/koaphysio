import type { Metadata } from "next";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { team } from "@/content/team";

export const metadata: Metadata = {
  title: "About & Meet the Team",
  description: "Meet Alyssa and Alma, the physiotherapists behind Koa Physiotherapy.",
};

const values = [
  { title: "Personal", body: "One-on-one care that's built around your goals, not a template." },
  { title: "Practical", body: "Advice and exercise you can fit into your real life." },
  { title: "Collaborative", body: "We work with you, your family and your healthcare team." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Koa"
        title="Physiotherapy with time, care and a clear plan."
        intro="Koa Physiotherapy was founded by Alyssa and Alma to offer unhurried, personalised care — in clinic or in the comfort of your home."
      />

      <section className="pb-20">
        <Container className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl bg-sand-50 p-8">
              <h2 className="text-2xl font-semibold">{v.title}</h2>
              <p className="mt-3 text-muted">{v.body}</p>
            </div>
          ))}
        </Container>
      </section>

      <section id="team" aria-labelledby="team-heading" className="bg-sand-50 py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="Meet the team" title={<span id="team-heading">Alyssa & Alma</span>} />
          <div className="mt-14 space-y-16 lg:space-y-24">
            {team.map((m, i) => (
              <article
                key={m.id}
                id={m.slug}
                className="grid scroll-mt-8 items-center gap-10 lg:grid-cols-12 lg:gap-16"
              >
                <div className={`lg:col-span-5 ${i % 2 ? "lg:order-2" : ""}`}>
                  {/* PLACEHOLDER: replace with a professional portrait. */}
                  <div
                    className="relative flex aspect-[4/5] items-end overflow-hidden rounded-[2rem] bg-gradient-to-br from-sand-200 to-sand-300 p-6"
                    role="img"
                    aria-label={`Portrait of ${m.name} (placeholder)`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9rem] font-black lowercase tracking-[-0.06em] text-white/50">
                      {m.name.toLowerCase()}
                    </span>
                    <span className="relative rounded-full bg-white/60 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                      Portrait placeholder
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <Eyebrow>{m.role}</Eyebrow>
                  <h3 className="mt-3 text-4xl font-semibold sm:text-5xl">{m.name}</h3>
                  <div className="prose-koa mt-6">
                    {m.bio.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  <h4 className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    Areas of interest
                  </h4>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {m.interests.map((interest) => (
                      <li key={interest} className="flex items-center gap-2.5">
                        <Check className="size-5 text-clay-500" />
                        {interest}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-subtle">{m.credentials}</p>
                  <ButtonLink href={`/book?practitioner=${m.slug}`} arrow className="mt-8">
                    Book with {m.name}
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
