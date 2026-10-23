import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Container, Notice } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Koa Physiotherapy collects, uses and protects your personal information.",
};

/**
 * PLACEHOLDER. The real privacy policy must be written for Koa's actual data
 * flows and reviewed by someone qualified in Australian health privacy
 * (Privacy Act 1988 / APPs, applicable state health records law).
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Your privacy matters." />
      <section className="pb-24">
        <Container className="max-w-3xl">
          <Notice tone="warning" title="Placeholder policy">
            This page is a structural placeholder for the prototype. It is not Koa&apos;s privacy policy and must be
            replaced with a reviewed policy before any real personal information is collected.
          </Notice>
          <div className="prose-koa mt-10 space-y-8">
            <Block title="What we collect">
              When you request an appointment we ask for your name, contact details and, for home visits, your
              address. We ask you not to include detailed health information in online forms.
            </Block>
            <Block title="Why we collect it">
              To respond to your request, arrange and confirm your appointment, and contact you about your care.
            </Block>
            <Block title="Who we share it with">
              The final policy will list every service provider that processes your information, including any
              located outside Australia.
            </Block>
            <Block title="Access and correction">
              You can ask to access or correct the personal information we hold about you.
            </Block>
            <Block title="Complaints">
              Details of how to make a privacy complaint, and how to contact the OAIC, will be provided here.
            </Block>
          </div>
        </Container>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2">{children}</p>
    </div>
  );
}
