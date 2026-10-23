"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { site } from "@/content/site";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-24 lg:py-32">
      <Eyebrow>Something went wrong</Eyebrow>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Sorry, this page didn&apos;t load properly.</h1>
      <p className="mt-5 max-w-lg text-lg text-muted">
        Please try again. If the problem continues, call us on{" "}
        <a href={site.phoneHref} className="underline">
          {site.phone}
        </a>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}
