import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";

/** Standard inner-page header: eyebrow, large title, intro, optional actions. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="pb-14 pt-8 lg:pb-20 lg:pt-14">
      <Container>
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
        {intro ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{intro}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </section>
  );
}
