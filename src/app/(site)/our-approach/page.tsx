import type { Metadata } from "next";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { Heart, Search, Sparkle, Users } from "@/components/ui/icons";
import { Container, IconBadge, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Our Approach",
  description: "How Koa Physiotherapy works: listen, assess, explain and move with purpose.",
};

const steps = [
  {
    title: "Listen",
    body: "Your first session starts with a conversation about your history, your day-to-day life and what you'd like to get back to.",
  },
  {
    title: "Assess",
    body: "We look at how you move, your strength and your range of motion to understand what's contributing to your symptoms.",
  },
  {
    title: "Explain",
    body: "We share what we've found in plain language, so you understand your body and the reasons behind your plan.",
  },
  {
    title: "Treat & train",
    body: "Hands-on care where it helps, combined with targeted exercise you can continue between sessions.",
  },
  {
    title: "Review & progress",
    body: "We track your progress against your goals and adjust the plan as you improve.",
  },
];

const principles = [
  { icon: <Search className="size-6" />, title: "Thorough", body: "Unhurried appointments with time to properly assess and explain." },
  { icon: <Heart className="size-6" />, title: "Personal", body: "Plans shaped around your goals, preferences and lifestyle." },
  { icon: <Sparkle className="size-6" />, title: "Active", body: "An emphasis on movement and exercise to build lasting capacity." },
  { icon: <Users className="size-6" />, title: "Connected", body: "With your consent, we keep your GP, specialists and carers in the loop." },
];

export default function ApproachPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our approach"
        title="Understand first. Then move with purpose."
        intro="Good physiotherapy isn't a one-size-fits-all routine. Here's what you can expect when you see us."
      />

      <section className="pb-20 lg:pb-28">
        <Container>
          <ol className="relative grid gap-4 lg:grid-cols-5">
            {steps.map((step, i) => (
              <li key={step.title} className="relative rounded-3xl bg-sand-50 p-7">
                <span className="text-5xl font-semibold tabular-nums text-sand-300">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="mt-6 text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-sand-50 py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow="What guides us" title="Our principles" />
          <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => (
              <li key={p.title}>
                <IconBadge>{p.icon}</IconBadge>
                <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
