import Link from "next/link";

/**
 * Text wordmark approximating the reference logo.
 * PLACEHOLDER: replace with the client's SVG logo when supplied.
 */
export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link
      href="/"
      className={`group inline-flex flex-col items-start leading-none ${inverted ? "text-sand-50" : "text-ink"} ${className}`}
      aria-label="Koa Physiotherapy — home"
    >
      <span className="text-[2.6rem] font-black lowercase tracking-[-0.06em] sm:text-5xl" aria-hidden="true">
        koa
      </span>
      <span className="mt-0.5 pl-0.5 text-[0.55rem] font-medium uppercase tracking-[0.42em] sm:text-[0.6rem]" aria-hidden="true">
        Physiotherapy
      </span>
    </Link>
  );
}
