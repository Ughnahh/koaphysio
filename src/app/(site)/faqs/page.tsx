import type { Metadata } from "next";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { ChevronDown } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";
import { faqGroups } from "@/content/faqs";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about booking, home visits, fees and what to expect.",
};

export default function FaqsPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQs"
        title="Questions, answered."
        intro="Can't find what you're looking for? Get in touch and we'll be happy to help."
      />

      <section className="pb-12">
        <Container className="grid gap-12 lg:grid-cols-12">
          <nav aria-label="FAQ topics" className="lg:col-span-3">
            <ul className="flex flex-wrap gap-2 lg:sticky lg:top-8 lg:flex-col lg:gap-1">
              {faqGroups.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="inline-block rounded-full border border-sand-300 px-4 py-2 text-sm hover:border-ink lg:border-0 lg:px-0 lg:text-base lg:text-muted lg:hover:text-ink"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-14 lg:col-span-8 lg:col-start-5">
            {faqGroups.map((group) => (
              <section key={group.id} id={group.id} aria-labelledby={`${group.id}-h`} className="scroll-mt-8">
                <h2 id={`${group.id}-h`} className="text-2xl font-semibold">
                  {group.title}
                </h2>
                <div className="mt-5 divide-y divide-sand-300 border-y border-sand-300">
                  {group.items.map((item) => (
                    <details key={item.q} className="group py-1">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="pb-5 pr-10 leading-relaxed text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand title="Still have questions?" body="Call or email us — we're happy to talk through whether physiotherapy is right for you." />
    </>
  );
}
