"use client";

import Link from "next/link";
import { useState } from "react";
import { type ContactMessage, type FieldErrors, validateContactMessage } from "@/lib/booking/validation";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { Notice } from "@/components/ui/primitives";
import { TextArea, TextField } from "@/components/ui/fields";

const empty: ContactMessage = { name: "", email: "", phone: "", message: "" };

/** Prototype contact form: validates locally and does not send anything. */
export function ContactForm() {
  const [values, setValues] = useState<ContactMessage>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const set = (key: keyof ContactMessage) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateContactMessage(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setState("sending");
    await new Promise((r) => setTimeout(r, 700));
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div role="status" className="rounded-[2rem] bg-white p-8 sm:p-10">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-success-bg text-success">
          <Check className="size-6" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold">Thanks, {values.name.split(" ")[0]}.</h2>
        <p className="mt-2 text-muted">
          In the live site, your message would be sent to our team and we&apos;d reply within one business day.
        </p>
        <p className="mt-4 text-sm text-subtle">Prototype: nothing was sent.</p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setValues(empty);
            setState("idle");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-[2rem] bg-white p-6 sm:p-10">
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      <p className="mt-2 text-sm text-muted">
        Please don&apos;t include detailed medical information. To book, use our{" "}
        <Link href="/book" className="underline underline-offset-4">
          appointment request form
        </Link>
        .
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} required className="sm:col-span-2" />
        <TextField label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} required />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} error={errors.phone} hint="Optional" />
        <TextArea label="Message" name="message" value={values.message} onChange={set("message")} error={errors.message} required className="sm:col-span-2" rows={5} />
      </div>
      {Object.keys(errors).length ? (
        <div className="mt-6">
          <Notice tone="danger" role="alert" title="Please check the highlighted fields." />
        </div>
      ) : null}
      <Button type="submit" arrow className="mt-8" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
