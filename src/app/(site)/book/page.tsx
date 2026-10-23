import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Container, Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Request a physiotherapy appointment online with Alyssa or Alma.",
};

export default function BookPage() {
  return (
    <section className="pb-24 pt-4 lg:pt-8">
      <Container>
        <Eyebrow>Book an appointment</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Request an appointment</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Choose a service and time that suits you. We&apos;ll review your request and confirm by email.
        </p>
        <div className="mt-10">
          <Suspense fallback={<div className="skeleton h-96 rounded-[2rem]" aria-label="Loading booking form" />}>
            <BookingWizard />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
