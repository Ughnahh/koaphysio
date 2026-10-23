import { PrototypeBanner } from "@/components/layout/prototype-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PrototypeBanner />
      <SiteHeader />
      <main id="main" className="flex-1">
    <Container className="py-24 lg:py-32">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">We couldn&apos;t find that page.</h1>
      <p className="mt-5 max-w-lg text-lg text-muted">It may have moved, or the link might be incorrect.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/" arrow>
          Back to home
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
