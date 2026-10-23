import type { Metadata } from "next";
import { CtaBand } from "@/components/shared/cta-band";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Check, FileText, Mail, Phone, Shield } from "@/components/ui/icons";
import { Container, IconBadge, Notice, SectionHeading } from "@/components/ui/primitives";
import { services } from "@/content/services";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "GP & Referrers",
  description: "Referral information for GPs, specialists and allied health professionals.",
};

const referralIncludes = [
  "Patient name, date of birth and contact details",
  "Reason for referral and relevant history",
  "Any precautions, surgical protocols or restrictions",
  "Funding details if applicable (e.g. care plan, DVA, aged care)",
  "Whether a home visit is required",
];

const commitments = [
  { title: "Prompt contact", body: "We aim to contact referred patients within two business days." },
  { title: "Clear reporting", body: "Initial assessment summaries and progress updates, with the patient's consent." },
  { title: "Shared goals", body: "We align treatment with your management plan and surgical protocols." },
];

export default function ReferrersPage() {
  return (
    <>
      <PageHeader
        eyebrow="For GPs & referrers"
        title="Working together for better outcomes."
        intro="We welcome referrals from GPs, surgeons, specialists and allied health professionals, and keep you informed every step of the way."
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#how-to-refer" arrow>
            How to refer
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </PageHeader>

      <section className="pb-20">
        <Container className="grid gap-6 md:grid-cols-3">
          {commitments.map((c) => (
            <div key={c.title} className="rounded-3xl bg-sand-50 p-8">
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <p className="mt-2 text-muted">{c.body}</p>
            </div>
          ))}
        </Container>
      </section>

      <section id="how-to-refer" className="scroll-mt-8 bg-sand-50 py-20 lg:py-24">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="How to refer" title="Sending a referral" />
            <div className="mt-8 space-y-4">
              <MethodRow icon={<FileText className="size-5" />} title="Secure messaging / fax">
                Secure messaging details to be confirmed. Fax: {site.fax}
              </MethodRow>
              <MethodRow icon={<Mail className="size-5" />} title="Email">
                {site.referralsEmail}
              </MethodRow>
              <MethodRow icon={<Phone className="size-5" />} title="Phone">
                {site.phone}
              </MethodRow>
            </div>
            <div className="mt-6">
              <Notice tone="info" title="Privacy">
                Please use secure channels for clinical information. Standard email isn&apos;t encrypted end-to-end.
              </Notice>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="rounded-[2rem] bg-sand-100 p-8">
              <IconBadge size="sm">
                <Shield className="size-5" />
              </IconBadge>
              <h3 className="mt-5 text-xl font-semibold">Helpful to include</h3>
              <ul className="mt-5 space-y-3">
                {referralIncludes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 size-5 shrink-0 text-clay-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Services" title="What we can help with" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <li key={s.slug} className="rounded-2xl border border-sand-300 p-6">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-2 text-sm text-muted">{s.summary}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand title="Questions about a referral?" body="Call us to discuss a patient or arrange a home visit." />
    </>
  );
}

function MethodRow({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-sand-100 p-5">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sand-200">{icon}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 break-all text-muted">{children}</p>
      </div>
    </div>
  );
}
