"use client";

import type { ReactNode } from "react";
import { Check } from "@/components/ui/icons";

/** A native radio input presented as a selectable card. */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  meta,
  icon,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={`relative flex cursor-pointer gap-4 rounded-2xl border bg-white p-5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
        checked ? "border-ink ring-1 ring-ink" : "border-sand-300 hover:border-sand-400"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        {description ? <span className="mt-1 block text-sm text-muted">{description}</span> : null}
        {meta ? <span className="mt-3 block text-sm text-ink-soft">{meta}</span> : null}
      </span>
      <span
        className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-ink bg-ink text-sand-50" : "border-sand-400"
        }`}
        aria-hidden="true"
      >
        {checked ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
      </span>
    </label>
  );
}
