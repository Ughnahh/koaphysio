import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { ArrowRight } from "./icons";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-sand-50 hover:bg-ink-soft",
  secondary: "border border-ink/80 text-ink hover:bg-ink hover:text-sand-50",
  ghost: "text-ink hover:bg-sand-200",
  danger: "border border-danger/40 text-danger hover:bg-danger-bg",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-8 py-4 text-base sm:text-lg",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant,
  size,
  arrow,
  className = "",
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
      {arrow ? <ArrowRight className="size-5 shrink-0" /> : null}
    </Link>
  );
}

export function Button({
  variant,
  size,
  arrow,
  className = "",
  children,
  type = "button",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      {children}
      {arrow ? <ArrowRight className="size-5 shrink-0" /> : null}
    </button>
  );
}
