"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@/components/ui/icons";

export function StepShell({
  headingRef,
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  nextBusy,
  footerNote,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextBusy?: boolean;
  footerNote?: ReactNode;
}) {
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold outline-none sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-2 text-muted">{description}</p> : null}
      <div className="mt-8">{children}</div>
      {onBack || onNext ? (
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-sand-300 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {onBack ? (
            <Button variant="ghost" onClick={onBack} className="self-start">
              <ArrowLeft className="size-5" /> Back
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {onNext ? (
              <Button onClick={onNext} arrow={!nextBusy} disabled={nextDisabled || nextBusy} size="lg">
                {nextLabel}
              </Button>
            ) : null}
            {footerNote ? <p className="text-sm text-muted">{footerNote}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-danger-bg p-5 text-danger">
      <p className="font-semibold">{message}</p>
      <p className="mt-1 text-sm opacity-90">Please try again, or call us to book over the phone.</p>
      <Button variant="danger" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
