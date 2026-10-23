"use client";

import { useId } from "react";
import { Alert } from "./icons";

interface BaseProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function FieldMeta({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <Alert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </>
  );
}

function Label({ id, label, required }: { id: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={id} className="field-label">
      {label}
      {required ? (
        <span className="text-danger" aria-hidden="true">
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}

export function TextField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required,
  className = "",
  type = "text",
  autoComplete,
  inputMode,
  maxLength,
}: BaseProps & {
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
      />
      <FieldMeta id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required,
  className = "",
  rows = 4,
  maxLength,
}: BaseProps & { rows?: number; maxLength?: number }) {
  const id = useId();
  return (
    <div className={className}>
      <Label id={id} label={label} required={required} />
      <textarea
        id={id}
        name={name}
        value={value}
        rows={rows}
        maxLength={maxLength}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(e) => onChange(e.target.value)}
        className="field-input resize-y"
      />
      <FieldMeta id={id} hint={hint} error={error} />
    </div>
  );
}
