import { site } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Phone } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";

export function CtaBand({
  title = "Ready to move better?",
  body = "Send an appointment request online and we'll confirm a time with you, or give us a call.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-sand-50 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/5" aria-hidden="true" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-semibold sm:text-4xl">{title}</h2>
            <p className="mt-4 text-sand-300 sm:text-lg">{body}</p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <ButtonLink href="/book" arrow size="lg" className="bg-sand-50 !text-ink hover:bg-white">
              Book an Appointment
            </ButtonLink>
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base hover:bg-white/10"
            >
              <Phone className="size-5" /> {site.phone}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
