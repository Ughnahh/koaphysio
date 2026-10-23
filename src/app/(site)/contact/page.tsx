import type { Metadata } from "next";
import { ContactForm } from "@/components/shared/contact-form";
import { PageHeader } from "@/components/shared/page-header";
import { Clock, Mail, MapPin, Phone } from "@/components/ui/icons";
import { Container } from "@/components/ui/primitives";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Koa Physiotherapy by phone, email or our contact form.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We'd love to hear from you."
        intro="Questions about whether physiotherapy can help, home visits or referrals? Reach out and we'll get back to you."
      />
      <section className="pb-24">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <ContactCard icon={<Phone className="size-5" />} title="Phone">
              <a href={site.phoneHref} className="text-lg font-medium hover:underline">
                {site.phone}
              </a>
            </ContactCard>
            <ContactCard icon={<Mail className="size-5" />} title="Email">
              <a href={`mailto:${site.email}`} className="text-lg font-medium break-all hover:underline">
                {site.email}
              </a>
            </ContactCard>
            <ContactCard icon={<MapPin className="size-5" />} title="Clinic">
              <p>{site.address.line1}</p>
              <p className="mt-1 text-sm text-muted">Home visits available across our service area.</p>
            </ContactCard>
            <ContactCard icon={<Clock className="size-5" />} title="Hours">
              <dl className="space-y-1">
                {site.hours.map((h) => (
                  <div key={h.days} className="flex flex-wrap justify-between gap-x-4">
                    <dt className="text-muted">{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </ContactCard>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}

function ContactCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 rounded-3xl bg-sand-50 p-6">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-sand-200">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="eyebrow mb-2">{title}</h2>
        {children}
      </div>
    </div>
  );
}
