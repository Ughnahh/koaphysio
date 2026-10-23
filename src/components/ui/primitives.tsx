import type { ReactNode } from "react";
import { Alert, Info } from "./icons";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>;
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const center = align === "center";
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <Tag className="text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-[2.75rem]">{title}</Tag>
      {intro ? <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{intro}</p> : null}
    </div>
  );
}

/** Round icon badge used for services, matching the reference. */
export function IconBadge({ children, size = "md" }: { children: ReactNode; size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "size-11", md: "size-16", lg: "size-20" }[size];
  return (
    <span className={`inline-flex ${dims} shrink-0 items-center justify-center rounded-full bg-sand-200 text-ink`}>
      {children}
    </span>
  );
}

type NoticeTone = "info" | "warning" | "danger" | "success";

const toneClasses: Record<NoticeTone, string> = {
  info: "bg-info-bg text-info",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  success: "bg-success-bg text-success",
};

export function Notice({
  tone = "info",
  title,
  children,
  action,
  role,
}: {
  tone?: NoticeTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  role?: "alert" | "status";
}) {
  const IconCmp = tone === "info" || tone === "success" ? Info : Alert;
  return (
    <div role={role} className={`flex gap-3 rounded-2xl px-4 py-3.5 text-sm ${toneClasses[tone]}`}>
      <IconCmp className="mt-0.5 size-5 shrink-0" />
      <div className="flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function Spinner({ className = "size-5", label }: { className?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}
